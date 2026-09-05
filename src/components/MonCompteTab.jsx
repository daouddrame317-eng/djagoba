import React, { useState } from 'react';
import AgoraSellerStudio from './AgoraSellerStudio';
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
  BarChart3
} from 'lucide-react';

export default function MonCompteTab({ isSellerMode, setIsSellerMode, onStartNewLive }) {
  const [isLiveSetupOpen, setIsLiveSetupOpen] = useState(false);
  const [activeSellerSession, setActiveSellerSession] = useState(null);
  const [liveTitleInput, setLiveTitleInput] = useState('');
  const [liveCategoryInput, setLiveCategoryInput] = useState('mode');
  const [livePriceInput, setLivePriceInput] = useState('15000');
  const [liveProductTitle, setLiveProductTitle] = useState('');


  const handleLaunchLive = (e) => {
    e.preventDefault();
    if (!liveTitleInput.trim() || !liveProductTitle.trim()) {
      alert('Veuillez renseigner le titre du direct et le produit vedette.');
      return;
    }

    const createdLive = {
      id: `live-seller-${Date.now()}`,
      title: liveTitleInput,
      seller: {
        id: 'seller-user',
        name: 'Boutique Awa Traoré (Vous)',
        certified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        badge: 'Direct Studio Pro'
      },
      city: 'Abidjan',
      commune: 'Cocody',
      viewers: 1,
      category: liveCategoryInput,
      featuredProduct: {
        id: `prod-seller-${Date.now()}`,
        title: liveProductTitle,
        originalPrice: parseInt(livePriceInput) * 1.25,
        livePrice: parseInt(livePriceInput),
        currency: 'FCFA',
        discount: '-20%',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        reviewsCount: 1
      },
      streamPoster: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-a-yellow-dress-41551-large.mp4',
      pinnedComment: '🔴 Bienvenue dans notre Direct Studio ! Posez vos questions ici.'
    };

    onStartNewLive(createdLive);
    setActiveSellerSession(createdLive);
    setIsLiveSetupOpen(false);
  };


  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* BASCULE VENDEUR TOGGLE BAR */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 text-white rounded-3xl p-4 shadow-xl border border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
            isSellerMode ? 'bg-[#FF6B00] text-white shadow-md' : 'bg-gray-800 text-gray-400'
          }`}>
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black">Mode Vendeur / Studio</h3>
              {isSellerMode && (
                <span className="bg-[#00C853] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                  ACTIF 🔴
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              {isSellerMode ? 'Gestion de votre boutique & Directs' : 'Basculez pour vendre en direct'}
            </p>
          </div>
        </div>

        {/* Toggle Switch Button */}
        <button
          onClick={() => setIsSellerMode(!isSellerMode)}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${
            isSellerMode ? 'bg-[#FF6B00]' : 'bg-gray-700'
          }`}
        >
          <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
            isSellerMode ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* CONDITIONAL DISPLAY: SELLER MODE VS BUYER MODE */}
      {isSellerMode ? (
        /* ==================== SELLER STUDIO DASHBOARD ==================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Studio Seller Header */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Boutique Awa Traoré"
                className="w-14 h-14 rounded-full border-2 border-[#FF6B00] object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">La Maison d'Awa</h3>
                  <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                </div>
                <p className="text-xs text-gray-500">Vendeuse Certifiée • Abidjan Cocody</p>
                <span className="text-[10px] text-[#FF6B00] font-bold bg-[#FF6B00]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ⭐ 4.9 (184 avis)
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
            <span>🔴 LANCER UN DIRECT VIDEO</span>
          </button>

          {/* Sales Analytics Overview */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Chiffre d'Affaires</span>
              <span className="text-xs font-black text-[#00C853] block">1.85M FCFA</span>
              <span className="text-[9px] text-gray-400">+18% ce mois</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Spectateurs</span>
              <span className="text-xs font-black text-[#FF6B00] block">14.2K</span>
              <span className="text-[9px] text-gray-400">18 Directs</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Ventes Direct</span>
              <span className="text-xs font-black text-purple-600 block">142</span>
              <span className="text-[9px] text-gray-400">Taux: 8.4%</span>
            </div>
          </div>

          {/* Seller Catalog Management Preview */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#1A1A1A]">Articles Vedette pour le Direct</h4>
              <span className="text-[11px] text-[#FF6B00] font-bold cursor-pointer">+ Ajouter</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80"
                    alt="Robe Wax"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">Robe Wax Soie Premium</span>
                    <span className="text-[10px] text-gray-400">Stock: 7 pièces</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#FF6B00]">18.500 FCFA</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ==================== BUYER PROFILE DASHBOARD ==================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Awa Traoré"
                className="w-14 h-14 rounded-full border-2 border-[#FF6B00] object-cover shadow-sm"
              />
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A]">Awa Traoré</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6B00]" />
                  Abidjan, Cocody Riviera 3
                </p>
                <span className="text-[10px] text-[#00C853] font-bold bg-[#00C853]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Membre Vérifiée DJAGOBA 🇨🇮
                </span>
              </div>
            </div>
          </div>

          {/* Loyalty Points Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-[#FF6B00] text-white rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                Programme Fidélité
              </span>
              <h4 className="text-base font-black">1 450 Points Djagoba 🏆</h4>
              <p className="text-[11px] text-amber-100">Prochaine réduction de 5 000 FCFA dans 50 pts</p>
            </div>
            <Award className="w-10 h-10 text-yellow-200 shrink-0" />
          </div>

          {/* Options Menu */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            <button className="w-full p-3.5 text-left text-xs font-bold text-[#1A1A1A] flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-[#FF003C]" />
                <span>Mes Vendeurs Favoris & Abonnements</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full p-3.5 text-left text-xs font-bold text-[#1A1A1A] flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-600" />
                <span>Paramètres de l'Application PWA & Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
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
              <button onClick={() => setIsLiveSetupOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
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
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Catégorie</label>
                  <select
                    value={liveCategoryInput}
                    onChange={(e) => setLiveCategoryInput(e.target.value)}
                    className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
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
                    className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
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
                  className="w-full p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                  required
                />
              </div>

              <div className="bg-[#FF6B00]/10 p-3 rounded-xl border border-[#FF6B00]/20 flex items-center gap-2 text-[11px] text-[#FF6B00] font-bold">
                <Camera className="w-4 h-4 shrink-0" />
                <span>Votre caméra mobile s'activera au lancement du direct.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF003C] to-[#FF6B00] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                Démarrer le Direct Maintenant
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


