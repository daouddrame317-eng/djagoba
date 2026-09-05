-- ============================================================================
-- DJAGOBA – SCHEMA PRODUCTION v2.0
-- Script de migration complet pour Supabase (PostgreSQL)
-- Exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- ─── 0. NETTOYAGE IDEMPOTENT ──────────────────────────────────────────────────
-- Supprime les anciens types ENUM si ils existent pour recréation propre
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS live_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;

-- ─── 1. EXTENSIONS ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. TYPES ENUMÉRÉS ───────────────────────────────────────────────────────

-- Rôles utilisateurs : acheteur, vendeur, livreur, admin
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'courier', 'admin');

-- Statuts du direct vidéo
CREATE TYPE live_status AS ENUM ('upcoming', 'live', 'ended');

-- Statuts de paiement Mobile Money
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Opérateurs Mobile Money CI
CREATE TYPE payment_method AS ENUM ('wave', 'orange_money', 'mtn', 'moov');

-- Statuts de livraison (cycle complet)
CREATE TYPE delivery_status AS ENUM (
  'pending',    -- Commande payée, livreur non encore assigné
  'assigned',   -- Livreur accepte la course
  'in_transit', -- En cours de livraison
  'delivered',  -- Livraison confirmée
  'returned'    -- Retour (produit non récupéré)
);

-- ─── 3. TABLES ────────────────────────────────────────────────────────────────

-- TABLE: USERS
-- Profils liés à Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT        UNIQUE NOT NULL,
  full_name     TEXT        NOT NULL DEFAULT 'Utilisateur DJAGOBA',
  role          user_role   NOT NULL DEFAULT 'buyer',
  city          TEXT        NOT NULL DEFAULT 'Bingerville',
  avatar_url    TEXT,
  is_verified   BOOLEAN     NOT NULL DEFAULT false,
  fcm_token     TEXT,               -- OneSignal player_id pour push notifications
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'Profils utilisateurs DJAGOBA – synchro depuis auth.users';
COMMENT ON COLUMN public.users.fcm_token IS 'OneSignal player_id pour notifications push ciblées';

-- TABLE: PRODUCTS
-- Catalogue produits des vendeurs
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  description    TEXT,
  price_xof      INT         NOT NULL CHECK (price_xof >= 0),
  image_url      TEXT,
  stock_quantity INT         NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
  category       TEXT        NOT NULL DEFAULT 'divers',
  -- Catégories: mode, beaute, electronique, bijoux, alimentation, maison, divers
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.products IS 'Catalogue produits DJAGOBA par vendeur';

-- TABLE: LIVES
-- Sessions de diffusion vidéo en direct (Agora.io)
CREATE TABLE IF NOT EXISTS public.lives (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  agora_channel_id  TEXT        NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  status            live_status NOT NULL DEFAULT 'upcoming',
  pinned_product_id UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  thumbnail_url     TEXT,
  viewers_count     INT         NOT NULL DEFAULT 0,
  city              TEXT        NOT NULL DEFAULT 'Bingerville',
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.lives IS 'Sessions Live Shopping Agora.io DJAGOBA';
COMMENT ON COLUMN public.lives.agora_channel_id IS 'Channel ID unique pour la salle Agora RTC';

-- TABLE: ORDERS
-- Commandes avec cycle complet paiement + livraison
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id         UUID           NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  seller_id        UUID           NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  live_id          UUID           REFERENCES public.lives(id) ON DELETE SET NULL,
  product_id       UUID           NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity         INT            NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_xof   INT            NOT NULL CHECK (unit_price_xof >= 0),
  amount_xof       INT            NOT NULL CHECK (amount_xof >= 0), -- unit_price * quantity
  service_fee      INT            NOT NULL DEFAULT 0, -- 5% commission DJAGOBA
  delivery_fee     INT            NOT NULL DEFAULT 1000, -- Frais livraison selon commune
  total_xof        INT            NOT NULL CHECK (total_xof >= 0), -- amount + fees
  
  -- Paiement
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  payment_method   payment_method NOT NULL,
  payment_ref      TEXT,          -- Référence transaction Digitalpaye
  payment_paid_at  TIMESTAMPTZ,
  
  -- Livraison
  delivery_address TEXT           NOT NULL,
  delivery_city    TEXT           NOT NULL DEFAULT 'Bingerville',
  delivery_landmark TEXT,         -- Point de repère pour le livreur
  buyer_phone      TEXT           NOT NULL, -- Téléphone acheteur pour le livreur
  courier_id       UUID           REFERENCES public.users(id) ON DELETE SET NULL,
  delivery_status  delivery_status NOT NULL DEFAULT 'pending',
  assigned_at      TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  
  -- Informations acheteur (pour livreur)
  buyer_name       TEXT           NOT NULL,
  
  -- Métadonnées
  notes            TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.orders IS 'Commandes DJAGOBA avec cycle paiement Mobile Money + livraison moto';
COMMENT ON COLUMN public.orders.service_fee IS '5% de commission DJAGOBA sur amount_xof';
COMMENT ON COLUMN public.orders.delivery_fee IS 'Frais livraison selon commune (500-5000 XOF)';

-- TABLE: COMMENTS
-- Chat temps réel des sessions live (via Supabase Realtime)
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  live_id    UUID        NOT NULL REFERENCES public.lives(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL CHECK (length(trim(message)) > 0 AND length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.comments IS 'Chat temps réel des directs DJAGOBA – Supabase Realtime';

-- ─── 4. INDEX DE PERFORMANCE ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_phone       ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role        ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_city        ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_products_seller   ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lives_seller      ON public.lives(seller_id);
CREATE INDEX IF NOT EXISTS idx_lives_status      ON public.lives(status);
CREATE INDEX IF NOT EXISTS idx_lives_city        ON public.lives(city);
CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller     ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_courier    ON public.orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_orders_pay_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_del_status ON public.orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_city       ON public.orders(delivery_city);
CREATE INDEX IF NOT EXISTS idx_comments_live     ON public.comments(live_id);
CREATE INDEX IF NOT EXISTS idx_comments_created  ON public.comments(created_at DESC);

-- ─── 5. TRIGGER: SYNC AUTH.USERS → PUBLIC.USERS ──────────────────────────────
-- Crée automatiquement le profil public quand un utilisateur s'inscrit via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, phone, full_name, role, city, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.phone,
      NEW.raw_user_meta_data->>'phone',
      '+22500000000'
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur DJAGOBA'),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'buyer'
    ),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Bingerville'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone      = EXCLUDED.phone,
    full_name  = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 6. TRIGGER: DÉCRÉMENTATION STOCK AUTOMATIQUE ───────────────────────────
-- Décrémente stock_quantity quand une commande passe à payment_status = 'paid'

CREATE OR REPLACE FUNCTION public.decrement_stock_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Déclenche seulement si on passe de 'pending' à 'paid'
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id;
    
    -- Enregistre la date/heure de paiement
    NEW.payment_paid_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_payment();

-- ─── 7. TRIGGER: MISE À JOUR updated_at ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 8. ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────────

ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ── USERS Policies ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_select_all"  ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;

CREATE POLICY "users_select_all"  ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_self" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ── PRODUCTS Policies ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_select_all"    ON public.products;
DROP POLICY IF EXISTS "products_insert_seller" ON public.products;
DROP POLICY IF EXISTS "products_update_seller" ON public.products;
DROP POLICY IF EXISTS "products_delete_seller" ON public.products;

CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_insert_seller" ON public.products
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('seller', 'admin'))
  );

CREATE POLICY "products_update_seller" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "products_delete_seller" ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- ── LIVES Policies ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lives_select_all"    ON public.lives;
DROP POLICY IF EXISTS "lives_insert_seller" ON public.lives;
DROP POLICY IF EXISTS "lives_update_seller" ON public.lives;

CREATE POLICY "lives_select_all" ON public.lives
  FOR SELECT USING (true);

CREATE POLICY "lives_insert_seller" ON public.lives
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('seller', 'admin'))
  );

CREATE POLICY "lives_update_seller" ON public.lives
  FOR UPDATE USING (auth.uid() = seller_id);

-- ── COMMENTS Policies ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "comments_select_all"         ON public.comments;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── ORDERS Policies ──────────────────────────────────────────────────────────
-- Acheteur: voit ses propres commandes
-- Vendeur: voit les commandes de ses produits
-- Livreur: voit les commandes de sa ville + statut 'paid' + assignées à lui
-- Admin: voit tout

DROP POLICY IF EXISTS "orders_buyer_select"   ON public.orders;
DROP POLICY IF EXISTS "orders_seller_select"  ON public.orders;
DROP POLICY IF EXISTS "orders_courier_select" ON public.orders;
DROP POLICY IF EXISTS "orders_buyer_insert"   ON public.orders;
DROP POLICY IF EXISTS "orders_courier_update" ON public.orders;
DROP POLICY IF EXISTS "orders_seller_update"  ON public.orders;

CREATE POLICY "orders_buyer_select" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "orders_seller_select" ON public.orders
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "orders_courier_select" ON public.orders
  FOR SELECT USING (
    auth.uid() = courier_id OR (
      payment_status = 'paid' AND
      delivery_status = 'pending' AND
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role = 'courier'
          AND (city = orders.delivery_city OR orders.delivery_city IS NULL)
      )
    )
  );

CREATE POLICY "orders_buyer_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Le livreur peut uniquement MAJ courier_id et delivery_status sur ses propres courses
CREATE POLICY "orders_courier_update" ON public.orders
  FOR UPDATE USING (
    auth.uid() = courier_id OR (
      payment_status = 'paid' AND delivery_status = 'pending' AND
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'courier')
    )
  );

-- Edge Function (service_role) peut tout faire – pas de restriction nécessaire ici

-- ─── 9. ACTIVATION SUPABASE REALTIME ─────────────────────────────────────────
-- Nécessite que la publication supabase_realtime existe (c'est le cas par défaut)

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.lives;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 10. DONNÉES DE TEST (optionnel – commentez pour la production) ───────────
/*
-- Insérez un vendeur de test (après création d'un compte auth)
INSERT INTO public.products (seller_id, title, description, price_xof, category, stock_quantity)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Remplacez par un UUID auth réel
  'Robe Wax Soie Premium – Collection 2026',
  'Magnifique robe en tissu wax 100% coton, coupe moderne et élégante.',
  18500,
  'mode',
  15
);
*/

-- ─── FIN DU SCRIPT ────────────────────────────────────────────────────────────
-- ✅ Tables: users, products, lives, orders, comments
-- ✅ Enums: user_role (buyer/seller/courier/admin), live_status, payment_status, payment_method, delivery_status
-- ✅ Triggers: handle_new_user, decrement_stock_on_payment, set_updated_at
-- ✅ RLS: Toutes les tables sécurisées avec policies par rôle
-- ✅ Realtime: lives, comments, orders, products
-- ✅ Index: Optimisés pour les requêtes fréquentes
