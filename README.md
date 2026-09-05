# 🛒 DJAGOBA – Plateforme Live Shopping & PWA (Côte d'Ivoire 🇨🇮)

DJAGOBA est une Progressive Web App (PWA) de **Live Shopping** optimisée pour le marché ivoirien.

## 🚀 Stack Technique & Services de Production

- **Frontend & PWA** : React 19 + Vite + TailwindCSS (Mobile-First, Offline PWA Service Worker).
- **Backend & Database** : Supabase (PostgreSQL, Row Level Security, Supabase Auth avec 3 rôles : `buyer`, `seller`, `courier`).
- **Realtime** : Supabase Realtime (Abonnements en temps réel sur `comments`, `lives`, `orders`).
- **Video Live Streaming** : Agora.io RTC Web SDK (`VITE_AGORA_APP_ID`).
- **Paiement Mobile Money** : Digitalpaye & Wave API (`VITE_DIGITALPAYE_PUBLIC_KEY` - Wave, Orange Money, MTN, Moov) + Edge Function (`payment-webhook`).
- **Notifications Push** : OneSignal Web Push SDK (`VITE_ONESIGNAL_APP_ID`).
- **Hébergement & CI/CD** : Vercel (`https://djagoba.vercel.app/`).

## 🛠️ Installation & Lancement Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Compilation pour la production
npm run build
```

## 🌐 Déploiement

- **GitHub** : `https://github.com/daouddrame317-eng/djagoba.git`
- **Vercel** : `https://djagoba.vercel.app/`
