import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  Mic, 
  MicOff, 
  SwitchCamera, 
  Pin, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Radio,
  ShoppingBag
} from 'lucide-react';
import { startHostBroadcast, toggleCameraFacingMode } from '../lib/agoraClient';
import { updateLivePinnedProduct, updateLiveStatus, fetchProductsBySeller } from '../lib/supabaseClient';

export default function AgoraSellerStudio({ liveSession, onClose }) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [agoraState, setAgoraState] = useState({
    client: null,
    audioTrack: null,
    videoTrack: null,
    cameras: [],
  });
  const [facingMode, setFacingMode] = useState('user'); // 'user' (Avant) | 'environment' (Arrière)
  const [cameraError, setCameraError] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [spectatorsCount, setSpectatorsCount] = useState(1);
  const [pinnedProductId, setPinnedProductId] = useState(liveSession?.pinned_product_id || liveSession?.pinnedProduct?.id || null);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Initialiser la liste des produits du vendeur
  useEffect(() => {
    if (liveSession?.seller_id) {
      fetchProductsBySeller(liveSession.seller_id).then((prods) => {
        if (prods.length > 0) {
          setCatalogProducts(prods);
        } else if (liveSession.pinnedProduct) {
          setCatalogProducts([liveSession.pinnedProduct]);
        }
      });
    }
  }, [liveSession]);

  // Initialisation du Studio de Diffusion Agora Host
  useEffect(() => {
    let hostSession = null;

    async function launchPublisherStudio() {
      const channelName = liveSession?.agora_channel_id || `agora_studio_${liveSession?.id || Date.now()}`;

      const result = await startHostBroadcast({
        channel: channelName,
        containerId: 'agora-local-publisher-container',
        initialFacingMode: facingMode,
      });

      if (result.error) {
        setCameraError(result.error);
      } else {
        hostSession = result;
        setAgoraState({
          client: result.client,
          audioTrack: result.localAudioTrack,
          videoTrack: result.localVideoTrack,
          cameras: result.cameras || [],
        });
        setIsBroadcasting(true);

        // Mettre à jour le statut dans Supabase à `live`
        if (liveSession?.id) {
          updateLiveStatus(liveSession.id, 'live');
        }
      }
    }

    launchPublisherStudio();

    return () => {
      if (hostSession?.client) {
        if (hostSession.localAudioTrack) hostSession.localAudioTrack.close();
        if (hostSession.localVideoTrack) hostSession.localVideoTrack.close();
        hostSession.client.leave();
      }
      if (liveSession?.id) {
        updateLiveStatus(liveSession.id, 'ended');
      }
    };
  }, [liveSession]);

  // Basculer Caméra (Avant / Arrière)
  const handleToggleCamera = async () => {
    if (agoraState.videoTrack) {
      const nextMode = await toggleCameraFacingMode(agoraState.videoTrack, facingMode);
      setFacingMode(nextMode);
    }
  };

  // Mute / Unmute Micro
  const handleToggleMic = () => {
    if (agoraState.audioTrack) {
      agoraState.audioTrack.setEnabled(isMicMuted);
      setIsMicMuted(!isMicMuted);
    }
  };

  // ÉPINGLER CE PRODUIT (Supabase Realtime update lives.pinned_product_id)
  const handlePinProduct = async (productId) => {
    setPinnedProductId(productId);
    if (liveSession?.id) {
      await updateLivePinnedProduct(liveSession.id, productId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex justify-center items-center overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-black flex flex-col justify-between overflow-hidden">
        
        {/* WEBRTC AGORA PUBLISHER CAMERA CONTAINER */}
        <div id="agora-local-publisher-container" className="absolute inset-0 z-0 bg-gray-900">
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-950 text-white space-y-3 z-20">
              <AlertCircle className="w-12 h-12 text-[#FF003C] animate-bounce" />
              <h3 className="text-sm font-bold">Accès Caméra/Micro</h3>
              <p className="text-xs text-gray-400 max-w-xs">{cameraError}</p>
              <button onClick={onClose} className="bg-[#FF6B00] text-white font-bold text-xs px-4 py-2 rounded-xl">
                Fermer le Studio
              </button>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* HEADER STUDIO : STATUT LIVE & SPECTATEURS */}
        <div className="relative z-20 p-4 flex items-center justify-between gap-2 pt-6">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
            <span className="w-3 h-3 bg-[#FF003C] rounded-full animate-ping ml-1" />
            <span className="text-xs font-black text-white uppercase tracking-wider">STUDIO LIVE</span>
            <span className="bg-[#00C853] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">EN DIRECT</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/20">
              <Eye className="w-3.5 h-3.5 text-[#00C853]" />
              <span>{spectatorsCount}</span>
            </div>

            <button onClick={onClose} className="bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM ACTION BAR : ÉPINGLER UN PRODUIT & CONTRÔLES WEBRTC */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* CATALOGUE PRODUITS DU VENDEUR */}
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#FF6B00] uppercase tracking-wider flex items-center gap-1">
                <Pin className="w-3.5 h-3.5" />
                Épingler un Produit en Direct
              </span>
              <span className="text-[10px] text-gray-300">Synchro Supabase Realtime</span>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {catalogProducts.map((prod) => {
                const isPinned = pinnedProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handlePinProduct(prod.id)}
                    className={`w-36 shrink-0 p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      isPinned 
                        ? 'bg-[#FF6B00] border-white text-white shadow-lg' 
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    <img src={prod.image_url} alt={prod.title} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10px] font-bold truncate">{prod.title}</h4>
                      <span className="text-[10px] font-black">{prod.price_xof?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {isPinned && <Check className="w-4 h-4 text-white shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTRÔLES WEBRTC : CAMÉRA, MICRO, CHANGER CAMÉRA (AVANT / ARRIÈRE) */}
          <div className="flex items-center justify-around bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <button
              onClick={handleToggleMic}
              className={`p-3 rounded-full border transition-all active:scale-95 ${
                isMicMuted ? 'bg-[#FF003C] text-white border-[#FF003C]' : 'bg-white/20 text-white border-white/30'
              }`}
              title={isMicMuted ? 'Activer le micro' : 'Couper le micro'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#00C853]" />}
            </button>

            <button
              onClick={handleToggleCamera}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 active:scale-95 transition-all flex items-center gap-1"
              title={`Basculer caméra (actuelle: ${facingMode === 'user' ? 'Avant 🤳' : 'Arrière 📷'})`}
            >
              <SwitchCamera className="w-5 h-5 text-[#FF6B00]" />
              <span className="text-[10px] font-bold uppercase">{facingMode === 'user' ? 'Avant' : 'Arrière'}</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#FF003C] hover:bg-[#E00034] text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              ARRÊTER LE DIRECT
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
