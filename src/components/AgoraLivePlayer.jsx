import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  Eye, 
  ShoppingBag, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CheckCircle,
  Truck,
  Zap,
  AlertCircle
} from 'lucide-react';
import { startAudiencePlayer } from '../lib/agoraClient';
import { subscribeToLiveComments } from '../lib/supabaseClient';
import { CHAT_COMMENTS_SIMULATED } from '../data/mockData';

export default function AgoraLivePlayer({ live, onClose, onPlaceOrder }) {
  const [comments, setComments] = useState(CHAT_COMMENTS_SIMULATED);
  const [inputComment, setInputComment] = useState('');
  const [viewersCount, setViewersCount] = useState(live?.viewers || 1240);
  const [pinnedProduct, setPinnedProduct] = useState(live?.featuredProduct);
  const [sessionProducts, setSessionProducts] = useState([
    live?.featuredProduct,
    {
      id: 'prod-extra-1',
      title: 'Sac à Main Artisanal Cuir Véritable',
      livePrice: 15000,
      originalPrice: 22000,
      currency: 'FCFA',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
      stock: 5
    },
    {
      id: 'prod-extra-2',
      title: 'Ensemble Bijoux Or 18K Filigrane',
      livePrice: 28000,
      originalPrice: 38000,
      currency: 'FCFA',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
      stock: 3
    }
  ].filter(Boolean));

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isBuyDrawerOpen, setIsBuyDrawerOpen] = useState(false);
  const [selectedProductToBuy, setSelectedProductToBuy] = useState(null);
  const [selectedCommune, setSelectedCommune] = useState('Cocody');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [agoraError, setAgoraError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [heartsCount, setHeartsCount] = useState(4120);

  const playerContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 1. Initialisation Agora RTC Audience Player
  useEffect(() => {
    let agoraClientInstance = null;

    async function initPlayer() {
      const channelName = live?.agora_channel_id || `channel_${live?.id || 'live-1'}`;
      
      const { client, error } = await startAudiencePlayer({
        channel: channelName,
        containerId: 'agora-remote-player-container',
        onUserPublished: (user, mediaType) => {
          setAgoraConnected(true);
        },
        onUserUnpublished: () => {
          setAgoraConnected(false);
        }
      });

      if (error) {
        setAgoraError(error);
      } else {
        agoraClientInstance = client;
      }
    }

    initPlayer();

    return () => {
      if (agoraClientInstance) {
        agoraClientInstance.leave();
      }
    };
  }, [live]);

  // 2. Supabase Realtime - S'abonner aux commentaires en direct
  useEffect(() => {
    if (!live?.id) return;
    const unsubscribe = subscribeToLiveComments(live.id, (newCommentPayload) => {
      setComments((prev) => [
        ...prev,
        {
          id: newCommentPayload.id || Date.now(),
          user: newCommentPayload.user_name || 'Spectateur',
          text: newCommentPayload.message,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
        }
      ]);
    });

    return () => unsubscribe();
  }, [live?.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Envoi de message
  const handleSendComment = (e) => {
    e.preventDefault();
    if (!inputComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Vous (Awa Traoré)',
        text: inputComment,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      }
    ]);
    setInputComment('');
  };

  // Envoi de cœur animé
  const handleAddHeart = () => {
    setHeartsCount((prev) => prev + 1);
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.floor(Math.random() * 40) + 50,
    };
    setHearts((prev) => [...prev.slice(-8), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const handleOpenBuyModal = (product) => {
    setSelectedProductToBuy(product || pinnedProduct);
    setIsBuyDrawerOpen(true);
    setIsBottomSheetOpen(false);
  };

  const handleConfirmOrder = () => {
    setIsOrderSuccess(true);
    setTimeout(() => {
      onPlaceOrder({
        id: `DJ-${Math.floor(Math.random() * 89999) + 10000}`,
        seller: live?.seller?.name || 'Vendeur Certifié',
        sellerAvatar: live?.seller?.avatar,
        item: selectedProductToBuy?.title,
        price: selectedProductToBuy?.livePrice,
        deliveryFee: 1500,
        address: `Abidjan, ${selectedCommune}`,
        status: 'en_cours',
        statusLabel: 'Commande enregistrée en Direct 🔴'
      });
      setIsBuyDrawerOpen(false);
      setIsOrderSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex justify-center items-center overflow-hidden animate-in fade-in duration-200">
      
      {/* Container Mobile Player */}
      <div className="relative w-full max-w-md h-full bg-black flex flex-col justify-between overflow-hidden">
        
        {/* LECTEUR VIDÉO AGORA WEBRTC / FALLBACK */}
        <div id="agora-remote-player-container" className="absolute inset-0 z-0 bg-gray-900">
          {!agoraConnected && (
            <div className="relative w-full h-full">
              <video
                src={live?.videoUrl}
                poster={live?.streamPoster}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Badge simulation stream si Agora est en cours de fallback */}
              <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                <span className="w-2 h-2 bg-[#00C853] rounded-full animate-ping" />
                Flux WebRTC En Direct (Agora Fallback Simulator)
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* CŒURS ANIMÉS FLOTTANTS */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {hearts.map((h) => (
            <div
              key={h.id}
              style={{ left: `${h.left}%` }}
              className="absolute bottom-28 animate-float-heart"
            >
              <Heart className="w-8 h-8 text-[#FF003C] fill-[#FF003C] drop-shadow-lg" />
            </div>
          ))}
        </div>

        {/* SUPERPOSITION HAUTE (OVERLAY TRANSPARENT) */}
        <div className="relative z-20 p-4 flex items-center justify-between gap-2 pt-6">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
            <img
              src={live?.seller?.avatar}
              alt={live?.seller?.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#FF6B00]"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                  {live?.seller?.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
              </div>
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#FF003C] rounded-full animate-ping" />
                {live?.city}
              </span>
            </div>

            <div className="ml-1 bg-[#FF003C] text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-live-pulse">
              LIVE
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/20">
              <Eye className="w-3.5 h-3.5 text-[#00C853]" />
              <span>{viewersCount.toLocaleString('fr-FR')}</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-black/70"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-300" /> : <Volume2 className="w-4 h-4 text-[#FF6B00]" />}
            </button>

            <button
              onClick={onClose}
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-black/70 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUPERPOSITION BASSE : CHAT + CARTE PRODUIT ÉPINGLÉE + COMMANDES */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* FIL DE COMMENTAIRES DÉFILANT EN BAS À GAUCHE */}
          <div 
            ref={chatContainerRef}
            className="max-h-40 overflow-y-auto no-scrollbar space-y-2 pr-2 scroll-smooth"
          >
            {comments.map((c) => (
              <div 
                key={c.id}
                className="bg-black/60 backdrop-blur-md rounded-2xl px-3 py-1.5 text-xs text-white max-w-[85%] w-fit border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <span className="font-bold text-[#FF6B00] mr-1.5">{c.user} :</span>
                <span className="text-gray-100">{c.text}</span>
              </div>
            ))}
          </div>

          {/* CARTE PRODUIT ÉPINGLÉE EN TEMPS RÉEL (BOTTOM-LEFT PINNED CARD) */}
          {pinnedProduct && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gray-200 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300">
              <img
                src={pinnedProduct.image}
                alt={pinnedProduct.title}
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#FF003C] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                    📌 Épinglé en Direct
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Stock: {pinnedProduct.stock}</span>
                </div>
                <h4 className="text-xs font-bold text-[#1A1A1A] truncate mt-0.5">
                  {pinnedProduct.title}
                </h4>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-[#FF6B00]">
                    {pinnedProduct.livePrice?.toLocaleString('fr-FR')} FCFA
                  </span>
                  {pinnedProduct.originalPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {pinnedProduct.originalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => handleOpenBuyModal(pinnedProduct)}
                  className="bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Acheter
                </button>
                <button
                  onClick={() => setIsBottomSheetOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <Layers className="w-3 h-3 text-[#FF6B00]" />
                  Tous ({sessionProducts.length})
                </button>
              </div>
            </div>
          )}

          {/* BARRE D'ENVOI DE MESSAGE INSTANTANÉ & CŒURS */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center relative">
              <input
                type="text"
                value={inputComment}
                onChange={(e) => setInputComment(e.target.value)}
                placeholder="Message en direct au vendeur..."
                className="w-full bg-black/60 backdrop-blur-md text-xs text-white placeholder-gray-400 pl-3.5 pr-9 py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                type="submit"
                className="absolute right-2 p-1.5 text-[#FF6B00] hover:text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={handleAddHeart}
              className="relative bg-gradient-to-tr from-[#FF003C] to-[#FF6B00] text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform flex items-center justify-center shrink-0"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span className="absolute -top-1 -right-1 bg-white text-[#FF003C] text-[8px] font-black px-1 rounded-full border border-[#FF003C]">
                {heartsCount}
              </span>
            </button>
          </div>
        </div>

        {/* BOTTOM SHEET : LISTE DE TOUS LES ARTICLES DE LA SESSION */}
        {isBottomSheetOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[75%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF6B00]" />
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">Articles en vente dans ce Direct</h3>
                </div>
                <button onClick={() => setIsBottomSheetOpen(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {sessionProducts.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <img src={prod.image} alt={prod.title} className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{prod.title}</h4>
                      <span className="text-xs font-black text-[#FF6B00]">{prod.livePrice?.toLocaleString('fr-FR')} FCFA</span>
                      <span className="text-[10px] text-gray-400 block">Stock: {prod.stock} restants</span>
                    </div>
                    <button
                      onClick={() => handleOpenBuyModal(prod)}
                      className="bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-xs"
                    >
                      Commander
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1-CLIC BUY DRAWER MODAL */}
        {isBuyDrawerOpen && selectedProductToBuy && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1A]">Achat Rapide en 1-Clic</h3>
                <button onClick={() => setIsBuyDrawerOpen(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isOrderSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle className="w-14 h-14 text-[#00C853] mx-auto animate-bounce" />
                  <h4 className="text-base font-extrabold text-[#1A1A1A]">Commande Confirmée ! 🎉</h4>
                  <p className="text-xs text-gray-500">Livraison express enregistrée vers {selectedCommune}.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
                    <img src={selectedProductToBuy.image} alt={selectedProductToBuy.title} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{selectedProductToBuy.title}</h4>
                      <span className="text-sm font-black text-[#FF6B00]">{selectedProductToBuy.livePrice?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Commune de Livraison Express
                    </label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-3 rounded-xl border border-gray-200"
                    >
                      <option value="Cocody Riviera 3">Cocody Riviera 3</option>
                      <option value="Marcory Zone 4">Marcory Zone 4</option>
                      <option value="Yopougon">Yopougon Maroc</option>
                      <option value="Plateau">Plateau Centre</option>
                    </select>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Valider la Commande Express
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
