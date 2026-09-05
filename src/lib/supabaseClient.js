import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement Vite / Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon-publique';

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
// HELPER FUNCTIONS FOR SUPABASE REALTIME & DATA OPERATIONS
// ============================================================================

/**
 * S'abonner en temps réel aux commentaires d'un Direct spécifique
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
 * S'abonner en temps réel à l'évolution des Directs (nouveaux lives, changement de statut, pinned product)
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
 * S'abonner aux mises à jour des commandes en direct pour les acheteurs ou vendeurs
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
        filter: `buyer_id=eq.${userId}`,
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
