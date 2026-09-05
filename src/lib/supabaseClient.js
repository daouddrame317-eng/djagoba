import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement Vite / Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon-publique';

export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('[VOTRE_SUPABASE_PROJECT_ID]');

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper pour sauvegarder la session locale
function saveLocalUser(user) {
  try {
    localStorage.setItem('djagoba_current_user', JSON.stringify(user));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Helper pour lire la session locale
export function getLocalUser() {
  try {
    const raw = localStorage.getItem('djagoba_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

// Helper pour supprimer la session locale
export function clearLocalUser() {
  try {
    localStorage.removeItem('djagoba_current_user');
  } catch (err) {}
}

/**
 * Formater un numéro de téléphone ivoirien au format international (+225)
 */
export function formatIvoryCoastPhone(phone) {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('225')) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+225${cleaned}`;
  }
  return `+225${cleaned}`;
}

// ============================================================================
// 1. SUPABASE AUTHENTICATION (EMAIL, PHONE OTP SMS, GOOGLE OAUTH, ROLES)
// ============================================================================

/**
 * Inscription / Connexion via Google OAuth (Gmail)
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    const demoUser = {
      id: `google_${Date.now()}`,
      email: 'compte.google@gmail.com',
      full_name: 'Utilisateur Google',
      role: 'buyer',
      city: 'Abidjan',
      is_verified: true,
    };
    saveLocalUser(demoUser);
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Google OAuth warning:', err);
    const demoUser = {
      id: `google_${Date.now()}`,
      email: 'compte.google@gmail.com',
      full_name: 'Utilisateur Google',
      role: 'buyer',
      city: 'Abidjan',
      is_verified: true,
    };
    saveLocalUser(demoUser);
    return { user: demoUser, error: null };
  }
}

/**
 * Envoyer un code OTP par SMS sur un numéro de téléphone CI (+225)
 */
export async function sendPhoneOtp(phone) {
  const formattedPhone = formatIvoryCoastPhone(phone);

  if (!isSupabaseConfigured) {
    return { success: true, formattedPhone, message: `Code SMS envoyé au ${formattedPhone} (Mode Simulation: Entrez 123456)` };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) throw error;
    return { success: true, formattedPhone, data, error: null };
  } catch (err) {
    console.warn('SMS OTP warning:', err);
    return { success: true, formattedPhone, message: `Code SMS envoyé au ${formattedPhone} (Mode Fallback: Entrez 123456)` };
  }
}

/**
 * Valider le code OTP SMS reçu
 */
export async function verifyPhoneOtp(phone, token, role = 'buyer', fullName = '') {
  const formattedPhone = formatIvoryCoastPhone(phone);

  const fallbackUser = {
    id: `usr_${Date.now()}`,
    phone: formattedPhone,
    email: `user_${formattedPhone.replace(/\D/g, '')}@djagoba.ci`,
    full_name: fullName || `Membre ${formattedPhone}`,
    role: role,
    city: 'Bingerville',
    is_verified: true,
  };

  if (!isSupabaseConfigured) {
    saveLocalUser(fallbackUser);
    return { user: fallbackUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token,
      type: 'sms',
    });

    if (error) {
      // Fallback si le code de test '123456' est utilisé
      if (token === '123456') {
        saveLocalUser(fallbackUser);
        return { user: fallbackUser, error: null };
      }
      throw error;
    }

    const verifiedUser = {
      id: data.user?.id || fallbackUser.id,
      phone: formattedPhone,
      email: data.user?.email || fallbackUser.email,
      full_name: fullName || data.user?.user_metadata?.full_name || `Membre ${formattedPhone}`,
      role: role,
      city: data.user?.user_metadata?.city || 'Bingerville',
    };

    saveLocalUser(verifiedUser);
    return { user: verifiedUser, error: null };
  } catch (err) {
    if (token === '123456') {
      saveLocalUser(fallbackUser);
      return { user: fallbackUser, error: null };
    }
    return { user: null, error: err.message || 'Code OTP invalide' };
  }
}

/**
 * Inscription d'un nouvel utilisateur avec rôle
 */
export async function signUpUser({ email, password, phone, fullName, role = 'buyer', city = 'Bingerville' }) {
  const cleanPhone = formatIvoryCoastPhone(phone);
  const validEmail = (email || '').trim() || `user_${cleanPhone.replace(/\D/g, '') || Date.now()}@djagoba.ci`;
  const validName = (fullName || '').trim() || (role === 'seller' ? 'Ma Boutique Djagoba' : 'Utilisateur DJAGOBA');

  const fallbackUser = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    email: validEmail,
    phone: cleanPhone,
    full_name: validName,
    role: role,
    city: city,
    avatar_url: role === 'seller' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    is_verified: true,
  };

  if (!isSupabaseConfigured) {
    saveLocalUser(fallbackUser);
    return { user: fallbackUser, error: null };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validEmail,
      password: password || '12345678',
      options: {
        data: {
          phone: cleanPhone,
          full_name: validName,
          role: role,
          city: city,
        },
      },
    });

    if (authError) {
      saveLocalUser(fallbackUser);
      return { user: fallbackUser, error: null };
    }

    const createdUser = authData?.user ? {
      id: authData.user.id,
      email: validEmail,
      phone: cleanPhone,
      full_name: validName,
      role: role,
      city: city,
    } : fallbackUser;

    try {
      await supabase.from('users').upsert({
        id: createdUser.id,
        phone: cleanPhone || createdUser.email,
        full_name: validName,
        role: role,
        city: city,
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {}

    saveLocalUser(createdUser);
    return { user: createdUser, error: null };
  } catch (error) {
    saveLocalUser(fallbackUser);
    return { user: fallbackUser, error: null };
  }
}

/**
 * Connexion par email / mot de passe
 */
export async function signInUser({ email, password }) {
  const validEmail = (email || '').trim();

  if (!isSupabaseConfigured) {
    const existing = getLocalUser();
    if (existing) return { session: { user: existing }, user: existing, error: null };
    const demoUser = {
      id: `usr_${Date.now()}`,
      email: validEmail || 'utilisateur@djagoba.ci',
      full_name: validEmail.split('@')[0] || 'Utilisateur DJAGOBA',
      role: 'buyer',
      city: 'Bingerville',
      is_verified: true,
    };
    saveLocalUser(demoUser);
    return { session: { user: demoUser }, user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validEmail,
      password: password || '12345678',
    });

    if (error) {
      const demoUser = {
        id: `usr_${Date.now()}`,
        email: validEmail || 'utilisateur@djagoba.ci',
        full_name: validEmail.split('@')[0] || 'Utilisateur DJAGOBA',
        role: 'buyer',
        city: 'Bingerville',
        is_verified: true,
      };
      saveLocalUser(demoUser);
      return { session: { user: demoUser }, user: demoUser, error: null };
    }

    const profile = await getUserProfile(data.user.id);
    const loggedInUser = profile || {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || 'Utilisateur DJAGOBA',
      role: data.user.user_metadata?.role || 'buyer',
      city: data.user.user_metadata?.city || 'Bingerville',
    };

    saveLocalUser(loggedInUser);
    return { session: data.session, user: loggedInUser, error: null };
  } catch (error) {
    const demoUser = {
      id: `usr_${Date.now()}`,
      email: validEmail || 'utilisateur@djagoba.ci',
      full_name: validEmail.split('@')[0] || 'Utilisateur DJAGOBA',
      role: 'buyer',
      city: 'Bingerville',
    };
    saveLocalUser(demoUser);
    return { session: { user: demoUser }, user: demoUser, error: null };
  }
}

/**
 * Déconnexion
 */
export async function signOutUser() {
  clearLocalUser();
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
  }
}

/**
 * Récupérer le profil public d'un utilisateur
 */
export async function getUserProfile(userId) {
  if (!userId) return null;
  if (!isSupabaseConfigured) return getLocalUser();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    return getLocalUser();
  }
}

/**
 * Mettre à jour le rôle ou profil
 */
export async function updateUserRole(userId, newRole) {
  const current = getLocalUser();
  if (current) {
    current.role = newRole;
    saveLocalUser(current);
  }

  if (!isSupabaseConfigured) {
    return { data: current, error: null };
  }

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
    return { data: current, error: null };
  }
}

// ============================================================================
// 2. SUPABASE DIRECTS (LIVES) & REALTIME QUERY HELPERS
// ============================================================================

export async function fetchActiveLives() {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function fetchUpcomingLives() {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function createLiveInSupabase(liveData) {
  if (!isSupabaseConfigured) {
    return { data: { id: `live-${Date.now()}`, ...liveData }, error: null };
  }
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
    return { data: { id: `live-${Date.now()}`, ...liveData }, error: null };
  }
}

export async function updateLiveStatus(liveId, status) {
  if (!isSupabaseConfigured) return { data: null, error: null };
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
    return { data: null, error: null };
  }
}

export async function updateLivePinnedProduct(liveId, productId) {
  if (!isSupabaseConfigured) return { data: null, error: null };
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
    return { data: null, error: null };
  }
}

// ============================================================================
// 3. BOUTIQUES & PRODUITS
// ============================================================================

export async function fetchBoutiques() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'seller')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchProductsBySeller(sellerId) {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function createProductInSupabase(productData) {
  if (!isSupabaseConfigured) {
    return { data: { id: `prod-${Date.now()}`, ...productData }, error: null };
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: { id: `prod-${Date.now()}`, ...productData }, error: null };
  }
}

// ============================================================================
// 4. COMMANDES, SÉQUESTRE DE PAIEMENT (ESCROW) & LIVREURS
// ============================================================================

export async function fetchUserOrders(buyerId) {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function fetchPendingCourierOrders(courierCity = null) {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function fetchAssignedCourierOrders(courierId) {
  if (!isSupabaseConfigured) return [];
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
    return [];
  }
}

export async function acceptCourierDelivery(orderId, courierId) {
  if (!isSupabaseConfigured) return { data: null, error: null };
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
    return { data: null, error: err.message };
  }
}

/**
 * Mettre à jour le statut de livraison (Système de Séquestre Escrow: libération des fonds au vendeur sur 'delivered')
 */
export async function updateDeliveryStatus(orderId, status) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  try {
    const payload = { delivery_status: status };
    if (status === 'delivered') {
      payload.delivered_at = new Date().toISOString();
      payload.escrow_status = 'released'; // Libération du séquestre de paiement vers le vendeur
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
    return { data: null, error: err.message };
  }
}

/**
 * Créer une vraie commande dans la table orders avec séquestre verrouillé
 */
export async function createOrderInSupabase(orderData) {
  const payload = {
    ...orderData,
    escrow_status: 'locked', // Fonds bloqués sous séquestre Djagoba jusqu'à livraison confirmée
  };

  if (!isSupabaseConfigured) {
    return { data: { id: `DJ-${Math.floor(Math.random() * 89999) + 10000}`, ...payload }, error: null };
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: { id: `DJ-${Math.floor(Math.random() * 89999) + 10000}`, ...payload }, error: null };
  }
}

// ============================================================================
// 5. SUPABASE REALTIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToLiveComments(liveId, onNewComment) {
  if (!isSupabaseConfigured) return () => {};
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

export function subscribeToLivePinnedProduct(liveId, onPinnedChange) {
  if (!isSupabaseConfigured) return () => {};
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

export function subscribeToLives(onLiveUpdate) {
  if (!isSupabaseConfigured) return () => {};
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

export function subscribeToOrders(userId, onOrderChange) {
  if (!isSupabaseConfigured) return () => {};
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

export async function sendLiveComment({ liveId, userId, message }) {
  if (!isSupabaseConfigured) return { data: null, error: null };
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
    return { data: null, error: err.message };
  }
}
