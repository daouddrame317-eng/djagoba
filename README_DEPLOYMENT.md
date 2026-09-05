# 🚀 Guide de Déploiement & CI/CD DJAGOBA PWA (Vercel & Supabase 100% Gratuit)

Ce guide détaille la mise en ligne automatique et la configuration Progressive Web App (PWA) de l'application **DJAGOBA** sur **Vercel** avec intégration GitHub CI/CD.

---

## 📋 1. Prérequis & Clés API Gratuites

Avant de commencer le déploiement, assurez-vous de disposer des comptes gratuits suivants :
1. **Compte GitHub** (Pour héberger le dépôt du code source).
2. **Compte Vercel** (Hébergement web frontend PWA gratuit - Tier Hobby).
3. **Compte Supabase** (Base de données PostgreSQL + Auth + Realtime gratuits).
4. **Compte Agora.io** (10 000 minutes gratuites par mois de Live Streaming WebRTC).
5. **Compte OneSignal** (Notifications push Web/PWA illimitées gratuites).

---

## ⚙️ 2. Variables d'Environnement à Configurer

Dans le tableau de bord Vercel (**Project Settings > Environment Variables**), ajoutez les clés ci-dessous :

| Nom de la variable | Description / Exemple |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL de votre projet Supabase (ex: `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme publique Supabase (`eyJhbGci...`) |
| `VITE_AGORA_APP_ID` | Identifiant App ID de votre console Agora.io |
| `VITE_ONESIGNAL_APP_ID` | App ID de votre application OneSignal Web |
| `PAYMENT_WEBHOOK_SECRET` | Clé secrète HMAC pour la validation des paiements Mobile Money |

---

## 🛠️ 3. Déploiement Automatique via GitHub & Vercel (CI/CD)

### Étape A : Publier le code sur GitHub
Exécutez les commandes suivantes dans votre terminal :
```bash
git init
git add .
git commit -m "feat: Initialisation DJAGOBA PWA Live Shopping CI 🇨🇮"
git branch -M main
git remote add origin https://github.com/votre-utilisateur/djagoba-pwa.git
git push -u origin main
```

### Étape B : Relier le Dépôt GitHub à Vercel
1. Connectez-vous sur [Vercel.com](https://vercel.com).
2. Cliquez sur **"Add New Project"** -> Sélectionnez **GitHub**.
3. Choisissez le dépôt `djagoba-pwa`.
4. Vercel détectera automatiquement le framework **Vite**.
5. Renseignez les **Environment Variables** (voir tableau ci-dessus).
6. Cliquez sur **"Deploy"**.

En 30 secondes, votre application DJAGOBA sera déployée avec un nom de domaine sécurisé HTTPS (ex: `https://djagoba.vercel.app`). Chaque nouveau `git push` déclenchera un déploiement automatique en production !

---

## 📱 4. Test d'Installation PWA sur Smartphone

### Android (Google Chrome / Edge)
1. Ouvrez l'URL `https://djagoba.vercel.app` sur votre smartphone.
2. Une bannière ou popup apparaitra automatiquement : **"Installer l'application DJAGOBA sur votre écran d'accueil"**.
3. Cliquez sur **Installer**. L'application s'ouvrira en plein écran sans barre d'adresse de navigateur (Mode Standalone).

### iOS (Apple Safari)
1. Ouvrez l'URL sur Safari.
2. Appuyez sur l'icône de partage ⎋ (en bas au centre).
3. Sélectionnez **"Sur l'écran d'accueil"** (Add to Home Screen).

---

## ⚡ 5. Déploiement de la Supabase Edge Function (`payment-webhook`)

Pour déployer la fonction Webhook de paiement sur Supabase :
```bash
npx supabase login
npx supabase link --project-ref <votre-project-ref-supabase>
npx supabase functions deploy payment-webhook --no-verify-jwt
```
L'URL de votre Webhook sera :
`https://<votre-project-ref>.supabase.co/functions/v1/payment-webhook`
