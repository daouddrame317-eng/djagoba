// CONSTANTES MÉTIER DJAGOBA - Côte d'Ivoire (FCFA / XOF)
// Remarque : TOUTES les données d'objets factices (mock data) ont été intégrales purrées pour le passage en production.

export const VILLES_IVOIRIENNES = [
  { id: 'all', name: '🌍 Toutes les villes' },
  { id: 'abidjan', name: '🏙️ Abidjan (Toutes communes)' },
  { id: 'bingerville', name: '🌿 Bingerville' },
  { id: 'bouake', name: '🏘️ Bouaké' },
  { id: 'san-pedro', name: '⚓ San-Pédro' },
  { id: 'yamoussoukro', name: '🕌 Yamoussoukro' }
];

export const CATEGORIES = [
  { id: 'tous', label: '🔥 Tout', icon: 'Sparkles' },
  { id: 'mode', label: '👗 Mode & Pagne', icon: 'Shirt' },
  { id: 'beaute', label: '✨ Beauté & Soins', icon: 'Sparkles' },
  { id: 'tech', label: '📱 Électronique', icon: 'Smartphone' },
  { id: 'bijoux', label: '💎 Bijoux & Sacs', icon: 'Gem' },
  { id: 'epices', label: '🍲 Délices & Épices', icon: 'Utensils' }
];

// Les tableaux ci-dessous sont désormais vides par défaut. Les données réelles sont récupérées dynamiquement via Supabase.
export const LIVES_EN_DIRECT = [];
export const PROCHAINS_LIVES = [];
export const BOUTIQUES_CERTIFIEES = [];
export const COMMANDES_UTILISATEUR = [];
export const CHAT_COMMENTS_SIMULATED = [];
