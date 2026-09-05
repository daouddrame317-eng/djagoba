/**
 * DJAGOBA – Configuration centralisée
 * Toutes les variables d'environnement et constantes métier en un seul endroit.
 * Bascule automatique TEST ↔ PRODUCTION via import.meta.env.MODE
 */

// ─── DÉTECTION ENVIRONNEMENT ─────────────────────────────────────────────────
export const IS_PRODUCTION = import.meta.env.MODE === 'production';
export const IS_DEV        = import.meta.env.DEV === true;

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Détecte si la config Supabase est un placeholder (mode démo)
export const IS_SUPABASE_CONFIGURED =
  rawSupabaseUrl.length > 0 &&
  !rawSupabaseUrl.includes('[VOTRE_SUPABASE_PROJECT_ID]') &&
  rawSupabaseUrl.startsWith('https://');

export const SUPABASE_URL     = rawSupabaseUrl;
export const SUPABASE_ANON_KEY = rawSupabaseKey;

// ─── AGORA.IO ─────────────────────────────────────────────────────────────────
export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'ACo631e6bbbcbd74d849096da10469a4a0f';
export const IS_AGORA_CONFIGURED = AGORA_APP_ID.length > 0;

// ─── ONESIGNAL ────────────────────────────────────────────────────────────────
export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '44a23ddb-bba3-4c3e-a83a-3faf2006f941';

// ─── DIGITALPAYE ─────────────────────────────────────────────────────────────
export const DIGITALPAYE_PUBLIC_KEY = import.meta.env.VITE_DIGITALPAYE_PUBLIC_KEY || '';
export const IS_PAYMENT_TEST_MODE   = DIGITALPAYE_PUBLIC_KEY.startsWith('pk_test_');

// ─── CONSTANTES MÉTIER ────────────────────────────────────────────────────────

/** Commission DJAGOBA prélevée sur chaque vente (5%) */
export const SERVICE_FEE_PCT = 0.05;

/** Frais de livraison par commune (XOF) */
export const DELIVERY_FEES = {
  // Abidjan – Communes
  'Plateau':           500,
  'Adjamé':            800,
  'Cocody':           1000,
  'Cocody Riviera':   1000,
  'Cocody Angré':     1000,
  'Marcory':          1000,
  'Zone 4':           1000,
  'Treichville':       800,
  'Port-Bouet':       1200,
  'Koumassi':         1200,
  'Yopougon':         1500,
  'Abobo':            1500,
  'Anyama':           2000,
  // Hors Abidjan
  'Bingerville':      2000,
  'Grand-Bassam':     3000,
  'Bouaké':           5000,
  'San-Pédro':        7000,
  'Daloa':            6000,
  'Yamoussoukro':     5500,
  // Défaut
  'default':          1500,
};

/**
 * Calcule les frais de livraison pour une commune donnée
 * @param {string} commune - Nom de la commune
 * @returns {number} Frais en XOF
 */
export function getDeliveryFee(commune) {
  if (!commune) return DELIVERY_FEES['default'];
  const found = Object.keys(DELIVERY_FEES).find(
    key => commune.toLowerCase().includes(key.toLowerCase())
  );
  return found ? DELIVERY_FEES[found] : DELIVERY_FEES['default'];
}

/**
 * Calcule les frais de service DJAGOBA (5% du montant)
 * @param {number} amountXOF - Montant en XOF
 * @returns {number} Commission en XOF (arrondi au 10 supérieur)
 */
export function calculateServiceFee(amountXOF) {
  return Math.ceil((amountXOF * SERVICE_FEE_PCT) / 10) * 10;
}

/** Communes disponibles avec frais de livraison */
export const COMMUNES = [
  { id: 'Plateau',       name: 'Plateau (Centre)', fee: 500 },
  { id: 'Cocody',        name: 'Cocody / Riviera / Angré', fee: 1000 },
  { id: 'Marcory',       name: 'Marcory / Zone 4', fee: 1000 },
  { id: 'Treichville',   name: 'Treichville', fee: 800 },
  { id: 'Yopougon',      name: 'Yopougon (Maroc, Siporex)', fee: 1500 },
  { id: 'Abobo',         name: 'Abobo / Anyama', fee: 1500 },
  { id: 'Koumassi',      name: 'Koumassi / Port-Bouet', fee: 1200 },
  { id: 'Adjamé',        name: 'Adjamé / Attécoubé', fee: 800 },
  { id: 'Bingerville',   name: 'Bingerville', fee: 2000 },
  { id: 'Grand-Bassam',  name: 'Grand-Bassam', fee: 3000 },
  { id: 'Bouaké',        name: 'Bouaké', fee: 5000 },
  { id: 'Yamoussoukro',  name: 'Yamoussoukro', fee: 5500 },
  { id: 'San-Pédro',     name: 'San-Pédro', fee: 7000 },
];

/** Villes pour le filtre de la page Accueil */
export const VILLES_FILTRE = [
  { id: 'all',           name: '🌍 Toutes les villes' },
  { id: 'Abidjan',       name: '🏙️ Abidjan' },
  { id: 'Bingerville',   name: '🌿 Bingerville' },
  { id: 'Bouaké',        name: '🏘️ Bouaké' },
  { id: 'San-Pédro',     name: '⚓ San-Pédro' },
  { id: 'Yamoussoukro',  name: '🕌 Yamoussoukro' },
];

/** Catégories de produits */
export const CATEGORIES_PRODUITS = [
  { id: 'mode',          name: 'Mode & Pagne',       icon: '👗' },
  { id: 'beaute',        name: 'Beauté & Soins',     icon: '💄' },
  { id: 'electronique',  name: 'Électronique',        icon: '📱' },
  { id: 'bijoux',        name: 'Bijoux & Sacs',       icon: '💍' },
  { id: 'alimentation',  name: 'Alimentation',        icon: '🥘' },
  { id: 'maison',        name: 'Maison & Déco',       icon: '🏠' },
  { id: 'divers',        name: 'Divers',              icon: '🛍️' },
];
