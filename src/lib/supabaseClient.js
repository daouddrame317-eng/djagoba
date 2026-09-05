import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement Vite / Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon-publique';

export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('[VOTRE_SUPABASE_PROJECT_ID]');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ============================================================================
// 1. SUPABASE AUTHENTICATION & ROLE MANAGEMENT (buyer, seller, courier)
// ============================================================================

/**
 * Inscription d'un nouvel utilisateur avec rôle
 */
export async function signUpUser({ email, password, phone, fullName, role = 'buyer', city = 'Bingerville' }) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone || '',
          full_name: fullName || 'Utilisateur DJAGOBA',
          role: role, // 'buyer' | 'seller' | 'courier'
          city: city,
        },
      },
    });

    if (authError) throw authError;

    if (authData?.user) {
      // Insertion ou mise à jour directe dans la table public.users
      const { error: profileError } = await supabase.from('users').upsert({
        id: authData.user.id,
        phone: phone || authData.user.email,
        full_name: fullName || 'Utilisateur DJAGOBA',
        role: role,
        city: city,
        updated_at: new Date().toISOString(),
      });
      if (profileError) console.error('Erreur sync profil public.users:', profileError);
    }

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Erreur signUpUser:', error);
    return { user: null, error: error.message || 'Erreur lors de l\'inscription.' };
  }
}

/**
 * Connexion par email / mot de passe
 */
export async function signInUser({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { session: data.session, user: data.user, error: null };
  } catch (error) {
    console.error('Erreur signInUser:', error);
    return { session: null, user: null, error: error.message || 'Erreur de connexion.' };
  }
}

/**
 * Déconnexion
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Erreur signOutUser:', err);
  }
}

/**
 * Récupérer le profil public d'un utilisateur
 */
export async function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erreur getUserProfile:', err);
    return null;
  }
}

/**
 * Mettre à jour le rôle ou profil de l'utilisateur connecté
 */
export async function updateUserRole(userId, newRole) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur updateUserRole:', err);
    return { data: null, error: err.message };
  }
}

// ============================================================================
// 2. SUPABASE DIRECTS (LIVES) & REALTIME QUERY HELPERS
// ============================================================================

/**
 * Récupérer tous les direct vidéo actifs (status = 'live')
 */
export async function fetchActiveLives() {
  try {
    const { data, error } = await supabase
      .from('lives')
      .select(`
        *,
        seller:seller_id (id, full_name, city, avatar_url, is_verified, phone),
        pinnedProduct:pinned_product_id (*)
      `)
      .eq('status', 'live')
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchActiveLives:', err);
    return [];
  }
}

/**
 * Récupérer tous les prochains directs (status = 'upcoming')
 */
export async function fetchUpcomingLives() {
  try {
    const { data, error } = await supabase
      .from('lives')
      .select(`
        *,
        seller:seller_id (id, full_name, city, avatar_url, is_verified),
        pinnedProduct:pinned_product_id (*)
      `)
      .eq('status', 'upcoming')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchUpcomingLives:', err);
    return [];
  }
}

/**
 * Créer un nouveau direct dans Supabase
 */
export async function createLiveInSupabase(liveData) {
  try {
    const { data, error } = await supabase
      .from('lives')
      .insert([liveData])
      .select(`
        *,
        seller:seller_id (id, full_name, city, avatar_url, is_verified),
        pinnedProduct:pinned_product_id (*)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur createLiveInSupabase:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Mettre à jour le statut d'un direct (live ↔ ended)
 */
export async function updateLiveStatus(liveId, status) {
  try {
    const payload = { status };
    if (status === 'live') payload.started_at = new Date().toISOString();
    if (status === 'ended') payload.ended_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('lives')
      .update(payload)
      .eq('id', liveId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur updateLiveStatus:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Épingler un produit pendant un direct (realtime sync)
 */
export async function updateLivePinnedProduct(liveId, productId) {
  try {
    const { data, error } = await supabase
      .from('lives')
      .update({ pinned_product_id: productId })
      .eq('id', liveId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur updateLivePinnedProduct:', err);
    return { data: null, error: err.message };
  }
}

// ============================================================================
// 3. BOUTIQUES & PRODUITS
// ============================================================================

/**
 * Récupérer la liste des vendeurs certifiés / boutiques
 */
export async function fetchBoutiques() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'seller')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchBoutiques:', err);
    return [];
  }
}

/**
 * Récupérer les produits d'un vendeur
 */
export async function fetchProductsBySeller(sellerId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchProductsBySeller:', err);
    return [];
  }
}

/**
 * Créer un produit dans le catalogue d'un vendeur
 */
export async function createProductInSupabase(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur createProductInSupabase:', err);
    return { data: null, error: err.message };
  }
}

// ============================================================================
// 4. COMMANDES & ESPACE LIVREUR (COURIER DASHBOARD)
// ============================================================================

/**
 * Récupérer les commandes d'un acheteur
 */
export async function fetchUserOrders(buyerId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:product_id (*),
        seller:seller_id (id, full_name, avatar_url, phone),
        courier:courier_id (id, full_name, phone, city)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchUserOrders:', err);
    return [];
  }
}

/**
 * Récupérer les commandes payées en attente pour les livreurs (payment_status = 'paid' & delivery_status = 'pending')
 */
export async function fetchPendingCourierOrders(courierCity = null) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        product:product_id (*),
        seller:seller_id (id, full_name, phone, city),
        buyer:buyer_id (id, full_name, phone, city)
      `)
      .eq('payment_status', 'paid')
      .eq('delivery_status', 'pending');

    if (courierCity && courierCity !== 'all') {
      query = query.eq('delivery_city', courierCity);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchPendingCourierOrders:', err);
    return [];
  }
}

/**
 * Récupérer les courses assignées au livreur connecté
 */
export async function fetchAssignedCourierOrders(courierId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:product_id (*),
        seller:seller_id (id, full_name, phone, city),
        buyer:buyer_id (id, full_name, phone, city)
      `)
      .eq('courier_id', courierId)
      .in('delivery_status', ['assigned', 'in_transit'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur fetchAssignedCourierOrders:', err);
    return [];
  }
}

/**
 * Accepter une livraison (Livreur)
 */
export async function acceptCourierDelivery(orderId, courierId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        courier_id: courierId,
        delivery_status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur acceptCourierDelivery:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Mettre à jour le statut de livraison (ex: 'in_transit' ou 'delivered')
 */
export async function updateDeliveryStatus(orderId, status) {
  try {
    const payload = { delivery_status: status };
    if (status === 'delivered') {
      payload.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur updateDeliveryStatus:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Créer une vraie commande dans la table orders
 */
export async function createOrderInSupabase(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur createOrderInSupabase:', err);
    return { data: null, error: err.message };
  }
}

// ============================================================================
// 5. SUPABASE REALTIME SUBSCRIPTIONS
// ============================================================================

/**
 * S'abonner aux commentaires d'un direct en temps réel
 */
export function subscribeToLiveComments(liveId, onNewComment) {
  const channel = supabase
    .channel(`live-comments-${liveId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `live_id=eq.${liveId}`,
      },
      (payload) => {
        onNewComment(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * S'abonner au produit épinglé d'un direct en temps réel
 */
export function subscribeToLivePinnedProduct(liveId, onPinnedChange) {
  const channel = supabase
    .channel(`live-pinned-${liveId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lives',
        filter: `id=eq.${liveId}`,
      },
      (payload) => {
        if (payload.new && payload.new.pinned_product_id !== undefined) {
          onPinnedChange(payload.new.pinned_product_id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * S'abonner aux lives en temps réel (nouveaux, changements de statut)
 */
export function subscribeToLives(onLiveUpdate) {
  const channel = supabase
    .channel('public-lives')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lives',
      },
      (payload) => {
        onLiveUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * S'abonner aux commandes en temps réel (pour acheteur, vendeur ou livreur)
 */
export function subscribeToOrders(userId, onOrderChange) {
  const channel = supabase
    .channel(`orders-user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        onOrderChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Envoyer un commentaire réel dans un live
 */
export async function sendLiveComment({ liveId, userId, message }) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          live_id: liveId,
          user_id: userId,
          message: message,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Erreur sendLiveComment:', err);
    return { data: null, error: err.message };
  }
}
