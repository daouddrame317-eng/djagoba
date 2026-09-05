import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  Eye, 
  ShoppingBag, 
  Share2, 
  ShieldCheck, 
  CheckCircle, 
  MessageCircle, 
  Truck, 
  Sparkles,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CHAT_COMMENTS_SIMULATED } from '../data/mockData';

export default function LiveStreamModal({ live, onClose, onPlaceOrder }) {
  const [comments, setComments] = useState(CHAT_COMMENTS_SIMULATED);
  const [inputComment, setInputComment] = useState('');
  const [viewersCount, setViewersCount] = useState(live.viewers);
  const [hearts, setHearts] = useState([]);
  const [heartsCount, setHeartsCount] = useState(3840);
  const [isBuyDrawerOpen, setIsBuyDrawerOpen] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState('Cocody');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const chatContainerRef = useRef(null);

  // Fluctuating live viewer count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
      setViewersCount((prev) => Math.max(100, prev + delta));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Simulate automated incoming comments every few seconds
  useEffect(() => {
    const newSimulatedUserComments = [
      "Disponible en livraison express aujourd'hui ?",
      "J'adore la couleur !! 😍",
      "Le prix est vraiment de 18.500 FCFA ?",
      "Mettez 1 pièce de côté pour moi à Marcory !",
      "Est-ce que le paiement se fait après réception ?"
    ];

    const timer = setInterval(() => {
      const randomText = newSimulatedUserComments[Math.floor(Math.random() * newSimulatedUserComments.length)];
      const randomUser = `Acheteur ${Math.floor(Math.random() * 90) + 10}`;
      
      setComments((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now(),
          user: randomUser,
          text: randomText,
          avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=100`
        }
      ]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Handle adding user comment
  const handleSendComment = (e) => {
    e.preventDefault();
    if (!inputComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Vous (Spectateur)',
        text: inputComment,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      }
    ]);
    setInputComment('');
  };

  // Floating heart reaction spawn animation
  const handleAddHeart = () => {
    setHeartsCount((prev) => prev + 1);
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.floor(Math.random() * 40) + 50, // 50% to 90%
      size: Math.floor(Math.random() * 16) + 20
    };
    setHearts((prev) => [...prev.slice(-10), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const handleConfirmOrder = () => {
    setIsOrderSuccess(true);
    setTimeout(() => {
      onPlaceOrder({
        id: `DJ-${Math.floor(Math.random() * 89999) + 10000}`,
        seller: live.seller.name,
        sellerAvatar: live.seller.avatar,
        item: live.featuredProduct.title,
        price: live.featuredProduct.livePrice,
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
      
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-md h-full bg-black flex flex-col justify-between overflow-hidden">
        
        {/* VIDEO / STREAM BACKGROUND SIMULATOR */}
        <div className="absolute inset-0 z-0">
          <video
            src={live.videoUrl}
            poster={live.streamPoster}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Ambient Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* FLOATING HEARTS LAYER */}
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

        {/* HEADER OVERLAY: Seller Info, Live Badge, Spectators, Mute & Close */}
        <div className="relative z-20 p-4 flex items-center justify-between gap-2 pt-6">
          
          {/* Seller Avatar & Live Badge */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
            <img
              src={live.seller.avatar}
              alt={live.seller.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#FF6B00]"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                  {live.seller.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
              </div>
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#FF003C] rounded-full animate-ping" />
                {live.city}
              </span>
            </div>

            {/* LIVE Badge */}
            <div className="ml-1 bg-[#FF003C] text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-live-pulse">
              LIVE
            </div>
          </div>

          {/* Right Top Actions: Spectators, Mute, Close */}
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

        {/* CENTER CONTENT / PINNED ANNOUNCEMENT */}
        <div className="relative z-20 px-4 space-y-2">
          {live.pinnedComment && (
            <div className="bg-[#FF6B00]/90 backdrop-blur-md text-white rounded-xl p-2.5 text-xs font-bold border border-white/20 shadow-lg flex items-center gap-2 animate-bounce">
              <Zap className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>{live.pinnedComment}</span>
            </div>
          )}
        </div>

        {/* BOTTOM CONTAINER: Chat Feed, Product Floating Card & Action Bar */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* SIMULATED LIVE CHAT FEED */}
          <div 
            ref={chatContainerRef}
            className="max-h-44 overflow-y-auto no-scrollbar space-y-2 pr-2 scroll-smooth"
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

          {/* FEATURED PRODUCT FLOATING CARD (BUY CTA) */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gray-200 shadow-2xl flex items-center justify-between gap-3">
            <img
              src={live.featuredProduct.image}
              alt={live.featuredProduct.title}
              className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#FF003C] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                  Offre Live
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Stock: {live.featuredProduct.stock} restants</span>
              </div>
              <h4 className="text-xs font-bold text-[#1A1A1A] truncate mt-0.5">
                {live.featuredProduct.title}
              </h4>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-black text-[#FF6B00]">
                  {live.featuredProduct.livePrice.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-[10px] text-gray-400 line-through">
                  {live.featuredProduct.originalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBuyDrawerOpen(true)}
              className="bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-green-600/30 flex items-center gap-1.5 shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              1-Clic
            </button>
          </div>

          {/* CHAT INPUT BAR & HEART REACTION BUTTON */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center relative">
              <input
                type="text"
                value={inputComment}
                onChange={(e) => setInputComment(e.target.value)}
                placeholder="Posez une question au vendeur en direct..."
                className="w-full bg-black/60 backdrop-blur-md text-xs text-white placeholder-gray-400 pl-3.5 pr-9 py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                type="submit"
                className="absolute right-2 p-1.5 text-[#FF6B00] hover:text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Heart Reaction Tap Button */}
            <button
              onClick={handleAddHeart}
              className="relative bg-gradient-to-tr from-[#FF003C] to-[#FF6B00] text-white p-2.5 rounded-full shadow-lg shadow-red-600/40 active:scale-90 transition-transform flex items-center justify-center shrink-0"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span className="absolute -top-1 -right-1 bg-white text-[#FF003C] text-[8px] font-black px-1 rounded-full border border-[#FF003C]">
                {heartsCount}
              </span>
            </button>
          </div>
        </div>

        {/* 1-CLIC BUY DRAWER MODAL */}
        {isBuyDrawerOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#00C853] rounded-full animate-pulse" />
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">Achat Rapide en 1-Clic</h3>
                </div>
                <button onClick={() => setIsBuyDrawerOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isOrderSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle className="w-14 h-14 text-[#00C853] mx-auto animate-bounce" />
                  <h4 className="text-base font-extrabold text-[#1A1A1A]">Commande Validée ! 🎉</h4>
                  <p className="text-xs text-gray-500">Un livreur Moto Djagoba prépare votre commande pour livraison à {selectedCommune}.</p>
                </div>
              ) : (
                <>
                  {/* Item Recap */}
                  <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
                    <img
                      src={live.featuredProduct.image}
                      alt={live.featuredProduct.title}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                    />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1">
                        {live.featuredProduct.title}
                      </h4>
                      <p className="text-[11px] text-gray-500">Vendeur : {live.seller.name}</p>
                      <span className="text-sm font-black text-[#FF6B00] block">
                        {live.featuredProduct.livePrice.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Delivery Location Selection (Ivory Coast Communes) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Lieu de Livraison Express (Abidjan)
                    </label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full bg-[#F8F9FA] text-xs font-semibold text-[#1A1A1A] p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Cocody Riviera 3">Cocody (Riviera, Angré, II Plateaux)</option>
                      <option value="Marcory Zone 4">Marcory (Zone 4, Biétry)</option>
                      <option value="Yopougon">Yopougon (Siporex, Maroc)</option>
                      <option value="Plateau">Plateau (Centre des Affaires)</option>
                      <option value="Koumassi">Koumassi / Treichville</option>
                    </select>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-[#00C853]">
                    <span>Mode de paiement :</span>
                    <span>Paiement à la Livraison (Cash / Wave / OM)</span>
                  </div>

                  {/* Pricing Total Breakdown */}
                  <div className="space-y-1 pt-1 text-xs border-t border-gray-100">
                    <div className="flex justify-between text-gray-500">
                      <span>Prix Article Live</span>
                      <span>{live.featuredProduct.livePrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Frais Livraison Moto</span>
                      <span>1 500 FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#1A1A1A] pt-1">
                      <span>Total à payer</span>
                      <span className="text-[#FF6B00]">
                        {(live.featuredProduct.livePrice + 1500).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Final Submit Order Button */}
                  <button
                    onClick={handleConfirmOrder}
                    className="w-full bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmer la Commande Express
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
