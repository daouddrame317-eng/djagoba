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
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Sparkle
} from 'lucide-react';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  signInWithGoogle,
  sendPhoneOtp,
  verifyPhoneOtp,
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
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState('seller'); // 'buyer' | 'seller' | 'courier'
  const [authCity, setAuthCity] = useState('Bingerville');
  const [authLoading, setAuthLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');

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

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    const { user, error } = await signInWithGoogle();
    setAuthLoading(false);
    if (error) {
      showToast(`❌ ${error}`);
    } else if (user) {
      setCurrentUser(user);
      if (user.role === 'seller') setIsSellerMode(true);
      setIsAuthModalOpen(false);
      showToast(`🌐 Connecté avec Google : ${user.full_name || user.email}`);
    }
  };

  // Handle Send Phone OTP SMS (+225)
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!authPhone.trim()) {
      showToast('❌ Veuillez renseigner votre numéro de téléphone (+225).');
      return;
    }
    setAuthLoading(true);
    const res = await sendPhoneOtp(authPhone);
    setAuthLoading(false);
    if (res.success) {
      setOtpSent(true);
      showToast(`📲 Code SMS envoyé au ${res.formattedPhone} ! (Code démo : 123456)`);
    } else {
      showToast(`❌ ${res.message || 'Erreur envoi SMS'}`);
    }
  };

  // Handle Verify Phone OTP SMS
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otpToken.trim()) {
      showToast('❌ Veuillez saisir le code SMS à 6 chiffres.');
      return;
    }
    setAuthLoading(true);
    const { user, error } = await verifyPhoneOtp(authPhone, otpToken, authRole, authFullName);
    setAuthLoading(false);
    if (error) {
      showToast(`❌ ${error}`);
    } else {
      setCurrentUser(user);
      if (user.role === 'seller') setIsSellerMode(true);
      setIsAuthModalOpen(false);
      showToast(`🎉 Connexion SMS réussie ! Bienvenue ${user.full_name}`);
    }
  };

  // Handle Auth Submit Email/Password
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    const cleanPhone = (authPhone || '').trim();
    const cleanEmail = (authEmail || '').trim() || (cleanPhone ? `user_${cleanPhone.replace(/\D/g, '')}@djagoba.ci` : 'user@djagoba.ci');
    const cleanName = (authFullName || '').trim() || (authRole === 'seller' ? 'Ma Boutique Djagoba' : 'Utilisateur DJAGOBA');

    if (authMode === 'signup') {
      const { user, error } = await signUpUser({
        email: cleanEmail,
        password: authPassword || '12345678',
        phone: cleanPhone,
        fullName: cleanName,
        role: authRole,
        city: authCity,
      });

      setAuthLoading(false);

      if (error) {
        showToast(`❌ ${error}`);
      } else {
        const loggedUser = user || {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          phone: cleanPhone,
          full_name: cleanName,
          role: authRole,
          city: authCity,
          avatar_url: authRole === 'seller' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        };

        setCurrentUser(loggedUser);
        if (authRole === 'seller') setIsSellerMode(true);
        setIsAuthModalOpen(false);
        showToast(`🎉 Bienvenue ${cleanName} ! Compte ${authRole.toUpperCase()} activé.`);
      }
    } else {
      const { user, error } = await signInUser({
        email: cleanEmail,
        password: authPassword || '12345678',
      });

      setAuthLoading(false);

      if (error) {
        showToast(`❌ ${error}`);
      } else {
        const loggedUser = user || {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0] || 'Utilisateur DJAGOBA',
          role: authRole || 'buyer',
          city: authCity,
        };

        setCurrentUser(loggedUser);
        if (loggedUser.role === 'seller') setIsSellerMode(true);
        setIsAuthModalOpen(false);
        showToast('✅ Connexion réussie !');
      }
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsSellerMode(false);
    showToast('Déconnexion effectuée.');
  };

  // Switch role dynamically for testing
  const handleRoleChange = async (newRole) => {
    if (currentUser?.id) {
      await updateUserRole(currentUser.id, newRole);
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    } else {
      setCurrentUser({
        id: `usr-${newRole}-${Date.now()}`,
        full_name: newRole === 'seller' ? 'Ma Boutique Certifiée' : newRole === 'courier' ? 'Livreur Express CI' : 'Acheteur DJAGOBA',
        role: newRole,
        city: 'Bingerville',
      });
    }

    if (newRole === 'seller') setIsSellerMode(true);
    showToast(`Rôle basculé vers : ${newRole.toUpperCase()}`);
  };

  // Launch Live Stream Session
  const handleLaunchLive = async (e) => {
    e.preventDefault();
    if (!liveTitleInput.trim() || !liveProductTitle.trim()) {
      alert('Veuillez renseigner le titre du direct et le produit vedette.');
      return;
    }

    const sellerId = currentUser?.id || `seller-${Date.now()}`;
    
    // 1. Créer le produit dans Supabase
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
    const { data: createdLive } = await createLiveInSupabase({
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
      
      {/* HEADER DE COMPTE STITCH STYLE */}
      <div className="bg-gradient-to-r from-[#1A1A1A] via-gray-900 to-[#2A1B00] text-white rounded-3xl p-4 shadow-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white">Mon Profil & Rôle</h3>
              <p className="text-[11px] text-gray-300 font-medium">
                {currentUser ? currentUser.full_name : 'Invité(e)'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <button 
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold rounded-xl flex items-center gap-1 border border-red-500/30 transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              S'inscrire / Se connecter
            </button>
          )}
        </div>

        {/* 3 ROLES SELECTOR PILLS */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={() => handleRoleChange('buyer')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border ${
              activeRole === 'buyer'
                ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-orange-500/30'
                : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Acheteur
          </button>

          <button
            onClick={() => handleRoleChange('seller')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border ${
              activeRole === 'seller'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Vendeur
          </button>

          <button
            onClick={() => handleRoleChange('courier')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border ${
              activeRole === 'courier'
                ? 'bg-[#00C853] text-white border-[#00C853] shadow-md shadow-green-600/30'
                : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700'
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
                className="w-14 h-14 rounded-full border-2 border-purple-600 object-cover shadow-sm bg-white"
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
                className="w-14 h-14 rounded-full border-2 border-[#FF6B00] object-cover shadow-sm bg-white"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A]">{currentUser?.full_name || "Acheteur DJAGOBA"}</h3>
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

      {/* AUTHENTICATION MODAL (SUPABASE OAUTH + SMS OTP + EMAIL) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 border border-gray-100 overflow-hidden relative">
            
            {/* Modal Top Banner */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1A1A]">
                    {authMode === 'signup' ? 'Créer un Compte DJAGOBA 🇨🇮' : 'Se Connecter'}
                  </h3>
                  <p className="text-[11px] text-gray-400">PWA Live Shopping Côte d'Ivoire</p>
                </div>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GOOGLE OAUTH FAST LOGIN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs py-3 rounded-2xl border border-gray-300 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuer avec Google (Gmail) 🌐</span>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Ou avec numéro / email</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* AUTH METHOD SELECTOR */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setOtpSent(false); }}
                className={`py-1.5 rounded-xl transition-all ${authMethod === 'email' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-gray-500'}`}
              >
                Email / Mot de passe
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`py-1.5 rounded-xl transition-all ${authMethod === 'phone' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-gray-500'}`}
              >
                SMS OTP (+225) 📲
              </button>
            </div>

            {authMethod === 'phone' ? (
              /* ================= FORM SMS OTP (+225) ================= */
              <div className="space-y-3 text-xs">
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Numéro Téléphone Côte d'Ivoire (+225)</label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="+225 0595610982"
                          className="w-full p-3 pl-10 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {authLoading ? 'Envoi du SMS...' : 'Recevoir le Code SMS (OTP)'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded-2xl border border-orange-200 text-[11px] text-orange-900">
                      📲 Un code à 6 chiffres a été envoyé au <strong>{authPhone}</strong> (Code démo : <strong>123456</strong>)
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Entrez le code OTP reçu par SMS</label>
                      <input
                        type="text"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full p-3 text-center tracking-widest text-lg font-black bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-[#00C853] hover:bg-[#00B048] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {authLoading ? 'Vérification...' : 'Valider et Se Connecter ✅'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* ================= FORM EMAIL / PASSWORD ================= */
              <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                
                {/* SÉLECTEUR VISUEL DE RÔLE SI INSCRIPTION */}
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-gray-700 block">Choisissez votre Rôle Utilisateur :</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthRole('buyer')}
                        className={`p-2 rounded-2xl border text-center transition-all ${
                          authRole === 'buyer' 
                            ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] font-black ring-2 ring-[#FF6B00]/20' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base block">🛍️</span>
                        <span className="text-[10px] font-bold block mt-0.5">Acheteur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthRole('seller')}
                        className={`p-2 rounded-2xl border text-center transition-all ${
                          authRole === 'seller' 
                            ? 'border-purple-600 bg-purple-50 text-purple-600 font-black ring-2 ring-purple-600/20' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base block">🏪</span>
                        <span className="text-[10px] font-bold block mt-0.5">Vendeur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthRole('courier')}
                        className={`p-2 rounded-2xl border text-center transition-all ${
                          authRole === 'courier' 
                            ? 'border-[#00C853] bg-[#00C853]/10 text-[#00C853] font-black ring-2 ring-[#00C853]/20' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base block">🛵</span>
                        <span className="text-[10px] font-bold block mt-0.5">Livreur</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CHAMPS INSCRIPTION */}
                {authMode === 'signup' && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nom Complet / Nom de Boutique</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="ex: Daoud Daoud"
                        className="w-full p-2.5 pl-10 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Téléphone CI</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+225 0595610982"
                        className="w-full p-2.5 pl-9 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Commune / Ville</label>
                    <select
                      value={authCity}
                      onChange={(e) => setAuthCity(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                    >
                      {COMMUNES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Adresse Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="daoudd174@gmail.com"
                      className="w-full p-2.5 pl-10 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mot de Passe</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 pl-10 pr-10 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E05E00] hover:to-[#FF6B00] text-white font-black text-sm py-3 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all mt-1"
                >
                  {authLoading ? (
                    <span>Validation du compte...</span>
                  ) : (
                    <span>{authMode === 'signup' ? 'Créer mon Compte DJAGOBA 🚀' : 'Se Connecter à mon Compte'}</span>
                  )}
                </button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                    className="text-xs font-bold text-gray-500 hover:text-[#FF6B00]"
                  >
                    {authMode === 'signup' ? 'Déjà inscrit ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous gratuitement'}
                  </button>
                </div>
              </form>
            )}
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
