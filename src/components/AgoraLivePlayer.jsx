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
  Phone,
  CreditCard
} from 'lucide-react';
import { startAudiencePlayer } from '../lib/agoraClient';
import { subscribeToLiveComments, subscribeToLivePinnedProduct, sendLiveComment } from '../lib/supabaseClient';
import { initiateMobileMoneyPayment, PAYMENT_METHODS } from '../lib/paymentService';
import { COMMUNES } from '../lib/config';

export default function AgoraLivePlayer({ live, currentUser, onClose, onPlaceOrder }) {
  const [comments, setComments] = useState([]);
  const [inputComment, setInputComment] = useState('');
  const [viewersCount, setViewersCount] = useState(live?.viewers_count || 1);
  const [pinnedProduct, setPinnedProduct] = useState(live?.pinnedProduct);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isBuyDrawerOpen, setIsBuyDrawerOpen] = useState(false);
  const [selectedProductToBuy, setSelectedProductToBuy] = useState(null);
  
  // Checkout Form State
  const [selectedCommune, setSelectedCommune] = useState(currentUser?.city || 'Cocody');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wave');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerName, setCustomerName] = useState(currentUser?.full_name || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(null);

  // Agora State
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [agoraError, setAgoraError] = useState(null);
  const [agoraTimedOut, setAgoraTimedOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [heartsCount, setHeartsCount] = useState(128);
  const agoraTimeoutRef = useRef(null);

  const chatContainerRef = useRef(null);

  // 1. Initialisation Agora RTC Audience Player avec timeout 8 secondes
  useEffect(() => {
    let agoraClientInstance = null;

    async function initPlayer() {
      const channelName = live?.agora_channel_id || `channel_${live?.id}`;

      // Timeout 8s : si la vidéo ne s'établit pas, afficher un message d'erreur clair
      agoraTimeoutRef.current = setTimeout(() => {
        if (!agoraConnected) {
          setAgoraTimedOut(true);
        }
      }, 8000);

      const { client, error } = await startAudiencePlayer({
        channel: channelName,
        containerId: 'agora-remote-player-container',
        onUserPublished: (user, mediaType) => {
          clearTimeout(agoraTimeoutRef.current);
          setAgoraTimedOut(false);
          setAgoraConnected(true);
        },
        onUserUnpublished: () => {
          setAgoraConnected(false);
        }
      });

      if (error) {
        clearTimeout(agoraTimeoutRef.current);
        setAgoraError(error);
      } else {
        agoraClientInstance = client;
      }
    }

    if (live?.agora_channel_id || live?.id) {
      initPlayer();
    }

    return () => {
      clearTimeout(agoraTimeoutRef.current);
      if (agoraClientInstance) {
        agoraClientInstance.leave();
      }
    };
  }, [live]);

  // 2. Supabase Realtime - S'abonner aux nouveaux commentaires
  useEffect(() => {
    if (!live?.id) return;
    const unsubscribe = subscribeToLiveComments(live.id, (newComment) => {
      setComments((prev) => [
        ...prev,
        {
          id: newComment.id || Date.now(),
          user: newComment.user_name || 'Spectateur',
          text: newComment.message,
        }
      ]);
    });

    return () => unsubscribe();
  }, [live?.id]);

  // 3. Supabase Realtime - Écouter le changement de produit épinglé
  useEffect(() => {
    if (!live?.id) return;
    const unsubscribe = subscribeToLivePinnedProduct(live.id, (newPinnedId) => {
      if (newPinnedId) {
        setPinnedProduct(prev => prev ? { ...prev, id: newPinnedId } : null);
      }
    });

    return () => unsubscribe();
  }, [live?.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Envoi de message réel dans Supabase
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!inputComment.trim()) return;

    const messageText = inputComment;
    setInputComment('');

    // Ajout optimiste
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: currentUser?.full_name || 'Vous',
        text: messageText,
      }
    ]);

    if (live?.id && currentUser?.id) {
      await sendLiveComment({
        liveId: live.id,
        userId: currentUser.id,
        message: messageText,
      });
    }
  };

  // Cœur animé
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
    setSelectedProductToBuy(product || pinnedProduct || live?.pinnedProduct);
    setIsBuyDrawerOpen(true);
    setIsBottomSheetOpen(false);
  };

  // Traitement du Paiement Mobile Money Réel Digitalpaye
  const handleConfirmMobileMoneyPayment = async (e) => {
    e.preventDefault();
    if (!customerPhone || !customerName) {
      alert('Veuillez renseigner votre téléphone et votre nom.');
      return;
    }

    setIsProcessingPayment(true);

    const productToBuy = selectedProductToBuy || live?.pinnedProduct;
    const unitPrice = productToBuy?.price_xof || 15000;
    const deliveryFee = 1000;
    const totalXOF = unitPrice + deliveryFee;

    const paymentResult = await initiateMobileMoneyPayment({
      buyerId: currentUser?.id || '00000000-0000-0000-0000-000000000002',
      sellerId: live?.seller_id || live?.seller?.id || '00000000-0000-0000-0000-000000000001',
      productId: productToBuy?.id || '00000000-0000-0000-0000-000000000003',
      liveId: live?.id || null,
      unitPriceXOF: unitPrice,
      amountXOF: unitPrice,
      deliveryFee: deliveryFee,
      totalXOF: totalXOF,
      phoneNumber: customerPhone,
      customerName: customerName,
      deliveryAddress: `Abidjan, ${selectedCommune}`,
      deliveryCity: selectedCommune,
      paymentMethod: selectedPaymentMethod,
    });

    setIsProcessingPayment(false);

    if (paymentResult.success) {
      setOrderSuccessMsg(paymentResult.message);

      if (paymentResult.redirectUrl) {
        window.open(paymentResult.redirectUrl, '_blank');
      }

      setTimeout(() => {
        onPlaceOrder && onPlaceOrder(paymentResult.order);
        setIsBuyDrawerOpen(false);
        setOrderSuccessMsg(null);
      }, 2500);
    } else {
      alert(paymentResult.error || 'Erreur lors du paiement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex justify-center items-center overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-black flex flex-col justify-between overflow-hidden">
        
        {/* LECTEUR VIDÉO AGORA WEBRTC */}
        <div id="agora-remote-player-container" className="absolute inset-0 z-0 bg-gray-900">
          {/* Erreur définitive (SDK error ou timeout 8s) */}
          {(agoraError || agoraTimedOut) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center z-10 space-y-3">
              <img
                src={live?.thumbnail_url || live?.seller?.avatar_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'}
                alt="Direct"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10 bg-black/80 backdrop-blur-md p-5 rounded-2xl space-y-2 max-w-xs">
                <span className="text-3xl">📵</span>
                <h4 className="text-sm font-extrabold">Impossible d'accéder à la caméra</h4>
                <p className="text-[11px] text-gray-300">
                  {agoraError || 'Vérifiez les autorisations de votre navigateur ou réessayez.'}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#FF6B00] text-white text-xs font-bold px-4 py-2 rounded-xl w-full"
                >
                  Fermer le Direct
                </button>
              </div>
            </div>
          )}

          {/* Overlay de connexion (visible seulement tant que pas connecté ET pas de timeout) */}
          {!agoraConnected && !agoraTimedOut && !agoraError && (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white p-6">
              <img
                src={live?.thumbnail_url || live?.seller?.avatar_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'}
                alt="Direct"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute bg-black/70 backdrop-blur-md p-4 rounded-2xl text-center space-y-2">
                <span className="w-3 h-3 bg-[#FF003C] rounded-full animate-ping mx-auto block" />
                <h4 className="text-xs font-black">Connexion au Direct Agora.io...</h4>
                <p className="text-[11px] text-gray-300">Salle RTC : {live?.agora_channel_id || live?.id}</p>
                <p className="text-[10px] text-gray-400">Expiration dans 8s si pas de réponse</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* CŒURS ANIMÉS */}
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

        {/* HEADER SUPERPOSITION */}
        <div className="relative z-20 p-4 flex items-center justify-between gap-2 pt-6">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
            <img
              src={live?.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={live?.seller?.full_name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#FF6B00]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white max-w-[110px] truncate">
                {live?.seller?.full_name || 'Vendeur Certifié'}
              </span>
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#FF003C] rounded-full animate-ping" />
                {live?.city || 'Abidjan'}
              </span>
            </div>
            <div className="ml-1 bg-[#FF003C] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              LIVE
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/20">
              <Eye className="w-3.5 h-3.5 text-[#00C853]" />
              <span>{(live?.viewers_count || 1).toLocaleString('fr-FR')}</span>
            </div>

            <button onClick={onClose} className="bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM SUPERPOSITION : CHAT & PRODUIT ÉPINGLÉ */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* CHAT MESSAGES */}
          <div ref={chatContainerRef} className="max-h-40 overflow-y-auto no-scrollbar space-y-2 pr-2 scroll-smooth">
            {comments.map((c) => (
              <div key={c.id} className="bg-black/60 backdrop-blur-md rounded-2xl px-3 py-1.5 text-xs text-white max-w-[85%] w-fit border border-white/10">
                <span className="font-bold text-[#FF6B00] mr-1.5">{c.user} :</span>
                <span className="text-gray-100">{c.text}</span>
              </div>
            ))}
          </div>

          {/* PINNED PRODUCT CARD */}
          {(pinnedProduct || live?.pinnedProduct) && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gray-200 shadow-2xl flex items-center justify-between gap-3">
              <img
                src={(pinnedProduct || live?.pinnedProduct)?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                alt={(pinnedProduct || live?.pinnedProduct)?.title}
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="bg-[#FF003C] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                  📌 Épinglé en Direct
                </span>
                <h4 className="text-xs font-bold text-[#1A1A1A] truncate mt-0.5">
                  {(pinnedProduct || live?.pinnedProduct)?.title}
                </h4>
                <span className="text-sm font-black text-[#FF6B00]">
                  {(pinnedProduct || live?.pinnedProduct)?.price_xof?.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <button
                onClick={() => handleOpenBuyModal(pinnedProduct || live?.pinnedProduct)}
                className="bg-[#00C853] hover:bg-[#00B048] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Acheter
              </button>
            </div>
          )}

          {/* CHAT INPUT BAR */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center relative">
              <input
                type="text"
                value={inputComment}
                onChange={(e) => setInputComment(e.target.value)}
                placeholder="Message en direct au vendeur..."
                className="w-full bg-black/60 text-xs text-white placeholder-gray-400 pl-3.5 pr-9 py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-[#FF6B00]"
              />
              <button type="submit" className="absolute right-2 p-1.5 text-[#FF6B00]">
                <Send className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={handleAddHeart}
              className="bg-gradient-to-tr from-[#FF003C] to-[#FF6B00] text-white p-2.5 rounded-full shadow-lg active:scale-90 flex items-center justify-center shrink-0"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          </div>
        </div>

        {/* 1-CLIC MOBILE MONEY PAYMODAL (DIGITALPAYE) */}
        {isBuyDrawerOpen && selectedProductToBuy && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">Paiement Mobile Money (Digitalpaye API)</h3>
                </div>
                <button onClick={() => setIsBuyDrawerOpen(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderSuccessMsg ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle className="w-14 h-14 text-[#00C853] mx-auto animate-bounce" />
                  <h4 className="text-base font-extrabold text-[#1A1A1A]">Paiement Mobile Money Initié ! 🎉</h4>
                  <p className="text-xs text-gray-600">{orderSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmMobileMoneyPayment} className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
                    <img src={selectedProductToBuy.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80'} alt={selectedProductToBuy.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{selectedProductToBuy.title}</h4>
                      <span className="text-sm font-black text-[#FF6B00]">
                        {selectedProductToBuy.price_xof?.toLocaleString('fr-FR')} FCFA (+1 000 FCFA livraison)
                      </span>
                    </div>
                  </div>

                  {/* OPERATEURS MOBILE MONEY */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Choisissez l'Opérateur Mobile Money</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(pm.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                            selectedPaymentMethod === pm.id
                              ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] shadow-sm'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{pm.icon}</span>
                          <span className="truncate">{pm.shortName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Votre Numéro Mobile Money</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0708991234"
                        className="w-full p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Nom Destinataire</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nom et Prénom"
                        className="w-full p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-gray-700 block">Commune de Livraison Express</label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200"
                    >
                      {COMMUNES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full bg-[#00C853] hover:bg-[#00B048] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isProcessingPayment ? 'Initialisation Digitalpaye...' : 'Valider le Paiement Mobile Money'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
