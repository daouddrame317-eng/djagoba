// Données fictives DJAGOBA - Marché Ivoirien (FCFA / XOF)

export const VILLES_IVOIRIENNES = [
  { id: 'all', name: 'Toutes les villes' },
  { id: 'abidjan', name: 'Abidjan (Toutes communes)' },
  { id: 'bingerville', name: 'Bingerville' },
  { id: 'bouake', name: 'Bouaké' },
  { id: 'san-pedro', name: 'San-Pédro' }
];

export const CATEGORIES = [
  { id: 'tous', label: '🔥 Tout', icon: 'Sparkles' },
  { id: 'mode', label: '👗 Mode & Pagne', icon: 'Shirt' },
  { id: 'beaute', label: '✨ Beauté & Soins', icon: 'Sparkles' },
  { id: 'tech', label: '📱 Électronique', icon: 'Smartphone' },
  { id: 'bijoux', label: '💎 Bijoux & Sacs', icon: 'Gem' },
  { id: 'epices', label: '🍲 Délices & Épices', icon: 'Utensils' }
];

export const LIVES_EN_DIRECT = [
  {
    id: 'live-1',
    title: '🔥 Sape Ivoirienne & Robes de Gala Wax Soie',
    seller: {
      id: 'vendeur-1',
      name: 'La Maison du Pagne',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: 'Top Vendeur Abidjan'
    },
    city: 'Abidjan',
    commune: 'Cocody',
    viewers: 1420,
    category: 'mode',
    featuredProduct: {
      id: 'prod-1',
      title: 'Robe Pagne Wax Soie Premium Collection 2026',
      originalPrice: 25000,
      livePrice: 18500,
      currency: 'FCFA',
      discount: '-26%',
      stock: 7,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviewsCount: 128
    },
    streamPoster: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-a-yellow-dress-41551-large.mp4',
    pinnedComment: '⚡ 7 pièces restantes seulement ! Livraison express aujourd\'hui sur Abidjan.'
  },
  {
    id: 'live-2',
    title: '✨ Gamme Éclat Bio Karité & Baobab d\'Abidjan',
    seller: {
      id: 'vendeur-2',
      name: 'Natura Abidjan',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      badge: 'Certifié Bio 🌿'
    },
    city: 'Abidjan',
    commune: 'Marcory',
    viewers: 890,
    category: 'beaute',
    featuredProduct: {
      id: 'prod-2',
      title: 'Sérum Visage Anti-Taches Karité & Baobab 50ml',
      originalPrice: 12000,
      livePrice: 7500,
      currency: 'FCFA',
      discount: '-37%',
      stock: 12,
      image: 'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviewsCount: 94
    },
    streamPoster: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-applying-face-cream-in-front-of-a-mirror-42880-large.mp4',
    pinnedComment: '🌱 Offre spéciale Live : Un baume à lèvres offert pour tout achat !'
  },
  {
    id: 'live-3',
    title: '⚡ Vente Flash AirPods Pro & Smartwatches ANC',
    seller: {
      id: 'vendeur-3',
      name: 'Abidjan Tech Market',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      badge: 'Garantie 12 Mois'
    },
    city: 'Bouaké',
    commune: 'Centre',
    viewers: 2150,
    category: 'tech',
    featuredProduct: {
      id: 'prod-3',
      title: 'Écouteurs Sans Fil Pro ANC HD Sound',
      originalPrice: 22000,
      livePrice: 14000,
      currency: 'FCFA',
      discount: '-36%',
      stock: 4,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviewsCount: 310
    },
    streamPoster: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-41484-large.mp4',
    pinnedComment: '📦 Stock limité ! Plus que 4 paires en promo directe.'
  },
  {
    id: 'live-4',
    title: '💎 Collection Bijoux Filigrane Or & Sacs Cuir',
    seller: {
      id: 'vendeur-4',
      name: 'Élégance Bingerville',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      badge: 'Artisanat d\'Art'
    },
    city: 'Bingerville',
    commune: 'Quartier Résidentiel',
    viewers: 630,
    category: 'bijoux',
    featuredProduct: {
      id: 'prod-4',
      title: 'Collier Filigrane Artisanal Plaqué Or 18K',
      originalPrice: 35000,
      livePrice: 25000,
      currency: 'FCFA',
      discount: '-28%',
      stock: 5,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviewsCount: 67
    },
    streamPoster: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-jewelery-in-a-store-display-42998-large.mp4',
    pinnedComment: '✨ Livré dans un coffret cadeau avec certificat d\'authenticité.'
  },
  {
    id: 'live-5',
    title: '🍲 Pack Épices Locales & Sauce Graine Fait Maison',
    seller: {
      id: 'vendeur-5',
      name: 'Maman Akissi Délices',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
      badge: 'Saveurs du Terroir 🇨🇮'
    },
    city: 'San-Pédro',
    commune: 'Bardot',
    viewers: 1110,
    category: 'epices',
    featuredProduct: {
      id: 'prod-5',
      title: 'Pack Épices Traditionnelles & Assaisonnements 1kg',
      originalPrice: 8000,
      livePrice: 5000,
      currency: 'FCFA',
      discount: '-37%',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviewsCount: 215
    },
    streamPoster: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-food-in-a-pan-43004-large.mp4',
    pinnedComment: '🌶️ Préparé fraîchement ce matin à San-Pédro !'
  }
];

export const PROCHAINS_LIVES = [
  {
    id: 'upcoming-1',
    title: '👟 Arrivage Spécial Sneakers Babi Streetwear',
    seller: {
      name: 'Streetwear Babi',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    date: 'Aujourd\'hui',
    time: '18h00 GMT',
    city: 'Abidjan',
    category: 'mode',
    teaserProduct: 'Baskets Urban Edition Limitée 2026',
    estimatedPrice: '22.000 FCFA',
    subscribersCount: 432,
    isAlertSet: false
  },
  {
    id: 'upcoming-2',
    title: '👑 Vente Perruques HD Lace 100% Cheveux Humains',
    seller: {
      name: 'Glamour Queens',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80'
    },
    date: 'Aujourd\'hui',
    time: '20h30 GMT',
    city: 'Abidjan',
    category: 'beaute',
    teaserProduct: 'Perruque Brésilienne Undetectable 24"',
    estimatedPrice: '45.000 FCFA',
    subscribersCount: 890,
    isAlertSet: false
  },
  {
    id: 'upcoming-3',
    title: '🚗 Accessoires Auto & Caméras Embarquées HD',
    seller: {
      name: 'Auto Express San-Pédro',
      certified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    },
    date: 'Demain',
    time: '15h00 GMT',
    city: 'San-Pédro',
    category: 'tech',
    teaserProduct: 'Support Caméra Voiture & Chargeur Induction',
    estimatedPrice: '9.500 FCFA',
    subscribersCount: 215,
    isAlertSet: false
  }
];

export const BOUTIQUES_CERTIFIEES = [
  {
    id: 'boutique-1',
    name: 'La Maison du Pagne',
    owner: 'Fatou Coulibaly',
    certified: true,
    city: 'Abidjan',
    commune: 'Cocody Blockhauss',
    category: 'mode',
    rating: 4.9,
    reviewsCount: 342,
    followers: '24.5k abonnés',
    responseSpeed: 'Répond en 5 min',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    isFollowing: true,
    description: 'Boutique leader en pagnes Wax de luxe, tenues traditionnelles modernisées et créations sur mesure.'
  },
  {
    id: 'boutique-2',
    name: 'Natura Abidjan',
    owner: 'Dr. Aminata Touré',
    certified: true,
    city: 'Abidjan',
    commune: 'Marcory Zone 4',
    category: 'beaute',
    rating: 4.8,
    reviewsCount: 210,
    followers: '18.2k abonnés',
    responseSpeed: 'Répond en 10 min',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    isFollowing: false,
    description: 'Cosmétiques 100% naturels fabriqués en Côte d\'Ivoire à partir d\'ingrédients bio du terroir.'
  },
  {
    id: 'boutique-3',
    name: 'Abidjan Tech Market',
    owner: 'Kouadio Jean',
    certified: true,
    city: 'Bouaké',
    commune: 'Commerce',
    category: 'tech',
    rating: 4.9,
    reviewsCount: 512,
    followers: '31.0k abonnés',
    responseSpeed: 'Répond en 2 min',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    isFollowing: true,
    description: 'Électronique de pointe, accessoires high-tech certifiés avec garantie pièces et main d\'œuvre.'
  },
  {
    id: 'boutique-4',
    name: 'Élégance Bingerville',
    owner: 'Clarisse Yao',
    certified: true,
    city: 'Bingerville',
    commune: 'Résidentiel',
    category: 'bijoux',
    rating: 5.0,
    reviewsCount: 180,
    followers: '12.8k abonnés',
    responseSpeed: 'Répond en 15 min',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    isFollowing: false,
    description: 'Joaillerie fine, bijoux en or et argent faits main et maroquinerie haut de gamme.'
  }
];

export const COMMANDES_UTILISATEUR = [
  {
    id: 'DJ-89241',
    date: '5 Septembre 2026, 14:10',
    status: 'en_cours',
    statusLabel: 'En cours de livraison 🛵',
    statusStep: 3, // 1: Validé, 2: Préparation, 3: En livraison, 4: Livré
    seller: 'La Maison du Pagne',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    driver: {
      name: 'Koffi Emmanuel',
      vehicle: 'Moto Express Djagoba #42',
      phone: '+225 07 08 99 12 34',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    },
    items: [
      {
        name: 'Robe Pagne Wax Soie Premium',
        price: 18500,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
      }
    ],
    deliveryFee: 1500,
    total: 20000,
    currency: 'FCFA',
    address: 'Abidjan, Cocody Riviera 3 (Carrefour Lycée Américain)',
    estimatedDeliveryTime: 'Dans 15 minutes'
  },
  {
    id: 'DJ-77102',
    date: '3 Septembre 2026, 11:45',
    status: 'livre',
    statusLabel: 'Livré avec succès ✅',
    statusStep: 4,
    seller: 'Natura Abidjan',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    driver: {
      name: 'Yao Bernard',
      vehicle: 'Tricycle Djagoba #18',
      phone: '+225 05 44 22 11 00',
      rating: 4.8,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
    },
    items: [
      {
        name: 'Sérum Visage Anti-Taches Karité & Baobab',
        price: 7500,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=800&q=80'
      }
    ],
    deliveryFee: 1000,
    total: 8500,
    currency: 'FCFA',
    address: 'Abidjan, Marcory Zone 4 (Près du Cap Sud)',
    estimatedDeliveryTime: 'Livré le 03/09 à 12h15'
  }
];

export const CHAT_COMMENTS_SIMULATED = [
  { id: 1, user: 'Marie-Claire K.', text: 'Coucou ! Est-ce que la taille L est encore disponible ? 😍', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 2, user: 'Kouassi Jean', text: 'J\'ai déjà commandé en 1-Clic ! Livraison Riviera 3 SVP ! 🔥', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 3, user: 'Awa Traoré', text: 'Le tissu wax est trop magnifique en direct ! 🧡', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
  { id: 4, user: 'Yao Serge', text: 'Est-ce qu\'on peut payer par Wave ou Orange Money à la livraison ?', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { id: 5, user: 'Sarra B.', text: 'Super promo ! Je prends 2 robes tout de suite ! 🛍️', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }
];
