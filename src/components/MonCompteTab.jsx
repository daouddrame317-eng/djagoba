import React, { useState, useEffect } from 'react';
import AgoraSellerStudio from './AgoraSellerStudio';
import CourierDashboard from './CourierDashboard';
import { 
  User, 
  Store, 
  Radio, 
  TrendingUp, 
  Award, 
  Settings, 
  Heart, 
  ShieldCheck, 
  ChevronRight, 
  Video, 
  Plus, 
  DollarSign, 
  Sparkles, 
  X, 
  CheckCircle2, 
  MapPin, 
  Camera,
  Layers,
  Bike,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  createLiveInSupabase, 
  createProductInSupabase, 
  fetchProductsBySeller,
  updateUserRole 
} from '../lib/supabaseClient';
import { triggerSellerLivePushNotification } from '../lib/pushNotifications';
import { COMMUNES } from '../lib/config';

export default function MonCompteTab({ 
  currentUser, 
  setCurrentUser, 
  isSellerMode, 
  setIsSellerMode, 
  onStartNewLive,
  showToast 
}) {
  // Auth Form State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState('buyer'); // 'buyer' | 'seller' | 'courier'
  const [authCity, setAuthCity] = useState('Bingerville');
  const [authLoading, setAuthLoading] = useState(false);

  // Live Studio Setup State
  const [isLiveSetupOpen, setIsLiveSetupOpen] = useState(false);
  const [activeSellerSession, setActiveSellerSession] = useState(null);
  const [liveTitleInput, setLiveTitleInput] = useState('');
  const [liveCategoryInput, setLiveCategoryInput] = useState('mode');
  const [livePriceInput, setLivePriceInput] = useState('15000');
  const [liveProductTitle, setLiveProductTitle] = useState('');
  const [sellerProducts, setSellerProducts] = useState([]);

  // Active Role View ('buyer' | 'seller' | 'courier')
  const activeRole = currentUser?.role || authRole;

  useEffect(() => {
    if (currentUser?.id && currentUser?.role === 'seller') {
      fetchProductsBySeller(currentUser.id).then(setSellerProducts);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Handle Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    if (authMode === 'signup') {
      const { user, error } = await signUpUser({
        email: authEmail,
        password: authPassword,
        phone: authPhone,
        fullName: authFullName,
        role: authRole,
        city: authCity,
      });

      if (error) {
        showToast(`❌ ${error}`);
      } else {
        showToast(`🎉 Bienvenue sur DJAGOBA ! Compte ${authRole.toUpperCase()} créé.`);
        setCurrentUser({
          id: user?.id || `user-${Date.now()}`,
          email: authEmail,
          phone: authPhone,
          full_name: authFullName || 'Utilisateur DJAGOBA',
          role: authRole,
          city: authCity,
        });
        setIsAuthModalOpen(false);
      }
    } else {
      const { user, error } = await signInUser({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        showToast(`❌ ${error}`);
      } else {
        showToast('✅ Connexion réussie !');
        setCurrentUser({
          id: user?.id || `user-${Date.now()}`,
          email: authEmail,
          full_name: user?.user_metadata?.full_name || 'Utilisateur DJAGOBA',
          role: user?.user_metadata?.role || 'buyer',
          city: user?.user_metadata?.city || 'Bingerville',
        });
        setIsAuthModalOpen(false);
      }
    }
    setAuthLoading(false);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    showToast('Déconnexion effectuée.');
  };

  // Switch role dynamically for testing
  const handleRoleChange = async (newRole) => {
    if (currentUser?.id) {
      await updateUserRole(currentUser.id, newRole);
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    } else {
      setCurrentUser({
        id: `demo-${newRole}`,
        full_name: newRole === 'seller' ? 'Boutique Awa (Vendeur)' : newRole === 'courier' ? 'Koffi Express (Livreur)' : 'Awa Traoré (Acheteur)',
        role: newRole,
        city: 'Bingerville',
      });
    }
    showToast(`Rôle basculé vers : ${newRole.toUpperCase()}`);
  };

  // Launch Live Stream Session in Supabase
  const handleLaunchLive = async (e) => {
    e.preventDefault();
    if (!liveTitleInput.trim() || !liveProductTitle.trim()) {
      alert('Veuillez renseigner le titre du direct et le produit vedette.');
      return;
    }

    const sellerId = currentUser?.id || '00000000-0000-0000-0000-000000000001';
    
    // 1. Créer le produit dans Supabase si nécessaire
    const { data: createdProduct } = await createProductInSupabase({
      seller_id: sellerId,
      title: liveProductTitle,
      description: `Produit en vedette du direct "${liveTitleInput}"`,
      price_xof: parseInt(livePriceInput) || 15000,
      stock_quantity: 10,
      category: liveCategoryInput,
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    });

    // 2. Créer le Live dans Supabase avec statut `live`
    const { data: createdLive, error } = await createLiveInSupabase({
      seller_id: sellerId,
      title: liveTitleInput,
      agora_channel_id: `agora_channel_${Date.now()}`,
      status: 'live',
      pinned_product_id: createdProduct?.id || null,
      thumbnail_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      city: currentUser?.city || 'Bingerville',
      started_at: new Date().toISOString(),
    });

    const liveSessionObj = createdLive || {
      id: `live-${Date.now()}`,
      title: liveTitleInput,
      agora_channel_id: `agora_channel_${Date.now()}`,
      seller: {
        id: sellerId,
        full_name: currentUser?.full_name || 'Votre Boutique',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      pinnedProduct: createdProduct,
    };

    // 3. Trigger Notification Push OneSignal
    triggerSellerLivePushNotification({
      sellerName: currentUser?.full_name || 'Vendeur Certifié',
      liveTitle: liveTitleInput,
      liveId: liveSessionObj.id,
    });

    onStartNewLive && onStartNewLive(liveSessionObj);
    setActiveSellerSession(liveSessionObj);
    setIsLiveSetupOpen(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* SELECTION DU RÔLE RAPIDE (ACHETEUR / VENDEUR / LIVREUR) */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 text-white rounded-3xl p-4 shadow-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h3 className="text-xs font-black">Mon Profil & Rôle</h3>
              <p className="text-[11px] text-gray-400">
                {currentUser ? `Connecté : ${currentUser.full_name}` : 'Non connecté'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <button 
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold rounded-xl flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-md active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Connexion / Inscription
            </button>
          )}
        </div>

        {/* 3 ROLES SELECTOR PILLS */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-800">
          <button
            onClick={() => handleRoleChange('buyer')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
              activeRole === 'buyer'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Acheteur
          </button>

          <button
            onClick={() => handleRoleChange('seller')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
              activeRole === 'seller'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Vendeur
          </button>

          <button
            onClick={() => handleRoleChange('courier')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
              activeRole === 'courier'
                ? 'bg-[#00C853] text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Livreur
          </button>
        </div>
      </div>

      {/* VIEW ACCORDING TO USER ROLE */}
      {activeRole === 'courier' ? (
        /* ==================== 1. COURIER DASHBOARD ==================== */
        <CourierDashboard currentUser={currentUser} showToast={showToast} />
      ) : activeRole === 'seller' ? (
        /* ==================== 2. SELLER STUDIO DASHBOARD ==================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt="Boutique"
                className="w-14 h-14 rounded-full border-2 border-purple-600 object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                    {currentUser?.full_name || "Votre Boutique Vendeur"}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                </div>
                <p className="text-xs text-gray-500">Vendeur Certifié • {currentUser?.city || 'Bingerville'}</p>
                <span className="text-[10px] text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ⭐ 5.0 (Vendeur Actif)
                </span>
              </div>
            </div>
          </div>

          {/* LAUNCH LIVE CTA BUTTON */}
          <button
            onClick={() => setIsLiveSetupOpen(true)}
            className="w-full bg-gradient-to-r from-[#FF003C] via-[#FF6B00] to-[#FF8533] hover:from-[#E00034] hover:to-[#FF6B00] text-white font-extrabold text-sm py-4 rounded-3xl shadow-xl shadow-red-600/25 flex items-center justify-center gap-2.5 transform active:scale-98 transition-all"
          >
            <Video className="w-5 h-5 animate-pulse" />
            <span>🔴 LANCER UN DIRECT VIDEO (AGORA RTC)</span>
          </button>

          {/* Catalog Management Preview */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#1A1A1A]">Catalogue d'Articles Vedettes</h4>
              <button 
                onClick={() => setIsLiveSetupOpen(true)}
                className="text-[11px] text-[#FF6B00] font-bold"
              >
                + Ajouter Produit
              </button>
            </div>

            <div className="space-y-2">
              {sellerProducts.length > 0 ? (
                sellerProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-[#1A1A1A] block">{p.title}</span>
                        <span className="text-[10px] text-gray-400">Stock: {p.stock_quantity} restants</span>
                      </div>
                    </div>
                    <span className="font-black text-[#FF6B00]">{p.price_xof?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                  Aucun produit dans le catalogue. Cliquez sur "Lancer un Direct" pour ajouter votre premier article !
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==================== 3. BUYER DASHBOARD ==================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt="Profil"
                className="w-14 h-14 rounded-full border-2 border-[#FF6B00] object-cover shadow-sm"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A]">{currentUser?.full_name || "Awa Traoré"}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6B00]" />
                  {currentUser?.city || 'Bingerville'}, Côte d'Ivoire
                </p>
                <span className="text-[10px] text-[#00C853] font-bold bg-[#00C853]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Membre Acheteur DJAGOBA 🇨🇮
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-[#FF6B00] text-white rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                Programme Fidélité
              </span>
              <h4 className="text-base font-black">1 450 Points Djagoba 🏆</h4>
              <p className="text-[11px] text-amber-100">Réductions automatiques sur vos achats en Direct</p>
            </div>
            <Award className="w-10 h-10 text-yellow-200 shrink-0" />
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL (Supabase Auth - Phone/Email + 3 Roles) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                {authMode === 'signup' ? 'Créer un Compte DJAGOBA 🇨🇮' : 'Se Connecter'}
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nom Complet / Nom de Boutique</label>
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="ex: Fatou Coulibaly"
                      className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Votre Rôle Utilisateur</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value)}
                      className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 font-bold text-[#FF6B00]"
                    >
                      <option value="buyer">🛍️ Acheteur (Rejoindre les directs & commander)</option>
                      <option value="seller">🏪 Vendeur (Diffuser en direct & vendre)</option>
                      <option value="courier">🛵 Livreur (Recevoir & livrer les commandes)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Téléphone CI</label>
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+225 0700000000"
                        className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Commune / Ville</label>
                      <select
                        value={authCity}
                        onChange={(e) => setAuthCity(e.target.value)}
                        className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                      >
                        {COMMUNES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="votreemail@example.com"
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mot de Passe</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                {authLoading ? 'Chargement Supabase Auth...' : authMode === 'signup' ? 'Créer mon Compte' : 'Se Connecter'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                  className="text-xs font-bold text-gray-500 hover:text-[#FF6B00]"
                >
                  {authMode === 'signup' ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDIO LIVE SETUP MODAL */}
      {isLiveSetupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FF003C]" />
                <h3 className="text-sm font-extrabold text-[#1A1A1A]">Studio Vendeur : Programmer un Direct</h3>
              </div>
              <button onClick={() => setIsLiveSetupOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchLive} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Titre de votre Direct Video</label>
                <input
                  type="text"
                  value={liveTitleInput}
                  onChange={(e) => setLiveTitleInput(e.target.value)}
                  placeholder="ex: 🔥 Grand Arrivage Robes Wax & Accessoires"
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Catégorie</label>
                  <select
                    value={liveCategoryInput}
                    onChange={(e) => setLiveCategoryInput(e.target.value)}
                    className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                  >
                    <option value="mode">Mode & Pagne</option>
                    <option value="beaute">Beauté & Soins</option>
                    <option value="tech">Électronique</option>
                    <option value="bijoux">Bijoux & Sacs</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Prix Promo Live (FCFA)</label>
                  <input
                    type="number"
                    value={livePriceInput}
                    onChange={(e) => setLivePriceInput(e.target.value)}
                    placeholder="15000"
                    className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Produit Vedette</label>
                <input
                  type="text"
                  value={liveProductTitle}
                  onChange={(e) => setLiveProductTitle(e.target.value)}
                  placeholder="ex: Robe Soie Wax Collection 2026"
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF003C] to-[#FF6B00] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                Démarrer le Direct Maintenant (Agora RTC)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AGORA WEBRTC SELLER STUDIO MODAL */}
      {activeSellerSession && (
        <AgoraSellerStudio
          liveSession={activeSellerSession}
          onClose={() => setActiveSellerSession(null)}
        />
      )}

    </div>
  );
}
