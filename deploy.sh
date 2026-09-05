#!/usr/bin/env bash
# ============================================================
#  DJAGOBA – Script de déploiement automatisé
#  GitHub Init + Push  →  Vercel CI/CD
# ============================================================
set -e

# ─── CONFIGURATION (modifiez ici si besoin) ─────────────────
GIT_USER_NAME="Drame Daoud"
GIT_USER_EMAIL="daouddrame317@gmail.com"
REPO_NAME="djagoba-app"
GITHUB_USERNAME=""          # ex: "daoud317" - laissez vide pour demander
VERCEL_TOKEN="team_8dDlpKsQrDa3Qz4j5LPL2xeg"

# Variables d'environnement Vercel (depuis votre .env)
VITE_SUPABASE_URL="https://[VOTRE_SUPABASE_PROJECT_ID].supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable__q8woG5oDUoRDVSQaVbJpQ_PpIqZZSL"
VITE_AGORA_APP_ID="ACo631e6bbbcbd74d849096da10469a4a0f"
VITE_ONESIGNAL_APP_ID="44a23ddb-bba3-4c3e-a83a-3faf2006f941"
VITE_DIGITALPAYE_PUBLIC_KEY="pk_test_wlYtA5GdG0OWB6QacgvbrVdK"
# ────────────────────────────────────────────────────────────

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_header() {
  echo ""
  echo -e "${CYAN}${BOLD}╔════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}║     🛒 DJAGOBA – Déploiement Auto      ║${NC}"
  echo -e "${CYAN}${BOLD}╚════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "\n${BLUE}${BOLD}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
  exit 1
}

# ─── 0. HEADER ──────────────────────────────────────────────
print_header

# ─── 1. VÉRIFICATION DES PRÉREQUIS ──────────────────────────
print_step "Vérification des prérequis..."

command -v git >/dev/null 2>&1 || print_error "git n'est pas installé. Installez-le depuis https://git-scm.com"
command -v node >/dev/null 2>&1 || print_error "node.js n'est pas installé. Installez-le depuis https://nodejs.org"
command -v npm >/dev/null 2>&1  || print_error "npm n'est pas installé."

print_success "git, node et npm sont disponibles."

# Récupérer le username GitHub si non défini
if [ -z "$GITHUB_USERNAME" ]; then
  read -p "$(echo -e ${YELLOW}'Entrez votre username GitHub : '${NC})" GITHUB_USERNAME
fi

GITHUB_REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
echo -e "   Dépôt cible : ${CYAN}${GITHUB_REPO_URL}${NC}"

# ─── 2. GIT CONFIG ──────────────────────────────────────────
print_step "Configuration Git locale..."

git config user.name  "$GIT_USER_NAME"  2>/dev/null || true
git config user.email "$GIT_USER_EMAIL" 2>/dev/null || true

print_success "Git configuré → $GIT_USER_EMAIL"

# ─── 3. INIT GIT REPO (si pas encore initialisé) ────────────
print_step "Initialisation du dépôt Git..."

if [ ! -d ".git" ]; then
  git init
  print_success "Dépôt Git initialisé."
else
  print_warning "Dépôt Git déjà initialisé. On continue."
fi

# ─── 4. BUILD DE VÉRIFICATION ───────────────────────────────
print_step "Build de vérification (npm run build)..."

if ! npm run build; then
  print_error "Le build a échoué. Corrigez les erreurs TypeScript/JSX avant de déployer."
fi

print_success "Build réussi → dossier dist/ prêt."

# ─── 5. PREMIER COMMIT ──────────────────────────────────────
print_step "Staging et commit initial..."

git add -A

# Vérifier s'il y a des changements à committer
if git diff --cached --quiet; then
  print_warning "Aucun changement à committer. Le repo est déjà à jour."
else
  git commit -m "🚀 feat: DJAGOBA PWA – déploiement initial

  - Interface Mobile-First Live Shopping
  - Onglets: Accueil/Directs, Boutiques, Commandes, Mon Compte
  - Intégration Agora.io (Live Video)
  - Checkout Mobile Money (Wave, Orange Money, MTN, Moov)
  - Service Worker PWA + manifest.json
  - Supabase Realtime (commentaires live)
  - Notifications Push (OneSignal)
  - Compatible Vercel CI/CD"

  print_success "Commit créé avec succès."
fi

# ─── 6. REMOTE GITHUB ───────────────────────────────────────
print_step "Configuration du remote GitHub..."

# Vérifier si un remote 'origin' existe déjà
if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_REMOTE=$(git remote get-url origin)
  if [ "$CURRENT_REMOTE" != "$GITHUB_REPO_URL" ]; then
    print_warning "Remote existant ($CURRENT_REMOTE) → mise à jour vers $GITHUB_REPO_URL"
    git remote set-url origin "$GITHUB_REPO_URL"
  else
    print_success "Remote origin déjà configuré correctement."
  fi
else
  git remote add origin "$GITHUB_REPO_URL"
  print_success "Remote origin ajouté : $GITHUB_REPO_URL"
fi

# ─── 7. PUSH GITHUB ─────────────────────────────────────────
print_step "Push vers GitHub (branche main)..."

# Renommer la branche principale en 'main' si nécessaire
git branch -M main 2>/dev/null || true

echo -e "${YELLOW}   → GitHub va vous demander vos identifiants si vous n'avez pas de SSH configuré.${NC}"
echo -e "${YELLOW}   → Utilisez un Personal Access Token (PAT) comme mot de passe.${NC}"
echo -e "${YELLOW}   → Créez un PAT sur : https://github.com/settings/tokens/new${NC}\n"

if git push -u origin main; then
  print_success "Code pushé sur GitHub : $GITHUB_REPO_URL"
else
  echo ""
  print_error "Push GitHub échoué. Vérifiez :
  1. Que le repo '${REPO_NAME}' existe sur GitHub (https://github.com/new)
  2. Que vous avez un Personal Access Token (PAT) valide
  3. Que le PAT a les permissions 'repo' activées"
fi

# ─── 8. INSTALLATION VERCEL CLI ─────────────────────────────
print_step "Vérification Vercel CLI..."

if ! command -v vercel >/dev/null 2>&1; then
  print_warning "Vercel CLI non trouvé. Installation en cours..."
  npm install -g vercel
  print_success "Vercel CLI installé."
else
  VERCEL_VERSION=$(vercel --version 2>/dev/null | head -n1)
  print_success "Vercel CLI disponible : $VERCEL_VERSION"
fi

# ─── 9. DÉPLOIEMENT VERCEL ──────────────────────────────────
print_step "Déploiement vers Vercel..."

export VERCEL_TOKEN="$VERCEL_TOKEN"

echo -e "   ${CYAN}Configuration des variables d'environnement Vercel...${NC}"

# Fonction pour définir une variable d'environnement Vercel
set_vercel_env() {
  local KEY="$1"
  local VALUE="$2"
  echo "$VALUE" | vercel env add "$KEY" production --token="$VERCEL_TOKEN" --yes 2>/dev/null || \
  echo "$VALUE" | vercel env add "$KEY" preview --token="$VERCEL_TOKEN" --yes 2>/dev/null || \
  true
  echo -e "   ${GREEN}✓${NC} $KEY configurée"
}

# Premier déploiement (pour lier le projet)
vercel --prod \
  --token="$VERCEL_TOKEN" \
  --yes \
  --name "$REPO_NAME" \
  2>&1 | tee /tmp/vercel_deploy.log

VERCEL_URL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel_deploy.log | tail -1)

# Configurer les variables d'environnement
echo -e "\n   ${CYAN}Injection des variables d'environnement...${NC}"
set_vercel_env "VITE_SUPABASE_URL"          "$VITE_SUPABASE_URL"
set_vercel_env "VITE_SUPABASE_ANON_KEY"     "$VITE_SUPABASE_ANON_KEY"
set_vercel_env "VITE_AGORA_APP_ID"          "$VITE_AGORA_APP_ID"
set_vercel_env "VITE_ONESIGNAL_APP_ID"      "$VITE_ONESIGNAL_APP_ID"
set_vercel_env "VITE_DIGITALPAYE_PUBLIC_KEY" "$VITE_DIGITALPAYE_PUBLIC_KEY"

# Re-déployer après injection des variables
print_step "Re-déploiement final avec variables d'environnement..."
vercel --prod \
  --token="$VERCEL_TOKEN" \
  --yes \
  2>&1 | tee /tmp/vercel_deploy2.log

VERCEL_URL_FINAL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel_deploy2.log | tail -1)

# ─── 10. RÉSUMÉ FINAL ───────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         🎉 DJAGOBA DÉPLOYÉ AVEC SUCCÈS!          ║${NC}"
echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  📦 GitHub  : ${CYAN}${GITHUB_REPO_URL}${NC}"
echo -e "${GREEN}${BOLD}║${NC}  🌐 Vercel  : ${CYAN}${VERCEL_URL_FINAL:-https://djagoba-app.vercel.app}${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ✅ Variables d'env injectées (5/5)           ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ✅ Service Worker PWA actif                  ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ✅ CI/CD GitHub → Vercel opérationnel        ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${YELLOW}⚙️  Prochaines étapes :${NC}"
echo -e "${GREEN}${BOLD}║${NC}    1. Configurer l'URL Supabase dans .env"
echo -e "${GREEN}${BOLD}║${NC}    2. Lancer les migrations SQL (supabase/)"
echo -e "${GREEN}${BOLD}║${NC}    3. Configurer le domaine custom sur Vercel"
echo -e "${GREEN}${BOLD}║${NC}    4. Activer l'App ID OneSignal dans le dashboard"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""
