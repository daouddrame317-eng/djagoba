import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw,
  Bike
} from 'lucide-react';
import { fetchUserOrders, subscribeToOrders } from '../lib/supabaseClient';

export default function CommandesTab({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    setIsLoading(true);
    const data = await fetchUserOrders(currentUser.id);
    setOrders(data);
    if (data.length > 0) {
      setSelectedOrder(data[0]);
    } else {
      setSelectedOrder(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    if (currentUser?.id) {
      const unsubscribe = subscribeToOrders(currentUser.id, () => {
        loadOrders();
      });
      return () => unsubscribe();
    }
  }, [currentUser?.id]);

  const getStepNumber = (delStatus) => {
    switch (delStatus) {
      case 'pending': return 2;
      case 'assigned': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const getStatusLabel = (delStatus) => {
    switch (delStatus) {
      case 'pending': return 'Paiement Validé - En recherche de livreur ⌛';
      case 'assigned': return 'Livreur attribué 🛵';
      case 'in_transit': return 'En cours de livraison 🛵';
      case 'delivered': return 'Livré avec succès ✅';
      default: return 'Commande enregistrée';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">Suivi des Achats</h2>
            <p className="text-[11px] text-gray-500">Livraisons en direct par Moto Express Djagoba</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadOrders} className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="bg-[#FF6B00] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
            {orders.length} Commande{orders.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ACTIVE TRACKED ORDER FEATURED CARD */}
      {selectedOrder ? (
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-md space-y-4">
          
          {/* Order Header: ID & Status */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">N° Commande</span>
              <span className="text-xs font-black text-[#1A1A1A]">{selectedOrder.id.slice(0, 13)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Statut Actuel</span>
              <span className="text-[10px] font-extrabold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded-full inline-block">
                {getStatusLabel(selectedOrder.delivery_status)}
              </span>
            </div>
          </div>

          {/* ESCROW BADGE (Séquestre de Paiement) */}
          <div className="bg-amber-50 rounded-2xl p-2.5 border border-amber-200/80 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-amber-900">
                {selectedOrder.escrow_status === 'released' 
                  ? '💰 Séquestre libéré : Fonds transférés au vendeur.' 
                  : '🔒 Séquestre de Paiement Djagoba : Fonds bloqués en sécurité jusqu\'à la livraison.'}
              </span>
            </div>
            <span className="text-[9px] font-black uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md shrink-0">
              {selectedOrder.escrow_status === 'released' ? 'Libéré' : 'Verrouillé'}
            </span>
          </div>

          {/* REAL-TIME DELIVERY TIMELINE (4 STEPS) */}
          <div className="space-y-2 py-1">
            <span className="text-xs font-bold text-gray-700 block">Progression de Livraison</span>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-200 -translate-y-1/2 z-0">
                <div 
                  className="h-full bg-[#00C853] transition-all duration-500" 
                  style={{ width: `${(getStepNumber(selectedOrder.delivery_status) - 1) * 33.33}%` }} 
                />
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#00C853] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  ✓
                </div>
                <span className="text-[9px] font-bold text-gray-700">Payée</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  getStepNumber(selectedOrder.delivery_status) >= 2 ? 'bg-[#00C853] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {getStepNumber(selectedOrder.delivery_status) >= 2 ? '✓' : '2'}
                </div>
                <span className="text-[9px] font-bold text-gray-700">Livreur</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  getStepNumber(selectedOrder.delivery_status) >= 3 ? 'bg-[#FF6B00] text-white animate-pulse' : 'bg-gray-200 text-gray-400'
                }`}>
                  🛵
                </div>
                <span className="text-[9px] font-bold text-[#FF6B00]">En Route</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedOrder.delivery_status === 'delivered' ? 'bg-[#00C853] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {selectedOrder.delivery_status === 'delivered' ? '✓' : '4'}
                </div>
                <span className="text-[9px] font-medium text-gray-400">Livrée</span>
              </div>
            </div>
          </div>

          {/* DRIVER INFO CARD (If courier assigned) */}
          {selectedOrder.courier ? (
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold">
                  🛵
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{selectedOrder.courier.full_name}</h4>
                    <span className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00] font-extrabold px-1.5 py-0.2 rounded-md">
                      Livreur Djagoba
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{selectedOrder.courier.phone}</p>
                </div>
              </div>

              <a
                href={`tel:${selectedOrder.courier.phone}`}
                className="p-3 bg-[#00C853] hover:bg-[#00B048] text-white rounded-xl shadow-md flex items-center justify-center transition-all"
                title="Appeler le livreur"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="bg-[#F8F9FA] rounded-2xl p-3 text-center text-xs text-gray-500 border border-gray-100">
              🛵 Un livreur de la commune ({selectedOrder.delivery_city}) va bientôt prendre en charge votre course.
            </div>
          )}

          {/* Ordered Item Summary */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 block">Détails de l'article</span>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedOrder.product?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedOrder.product?.title}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                />
                <div>
                  <span className="font-bold text-[#1A1A1A] block">{selectedOrder.product?.title || 'Article commande'}</span>
                  <span className="text-[11px] text-gray-400">Qté: {selectedOrder.quantity || 1}</span>
                </div>
              </div>
              <span className="font-black text-[#FF6B00]">
                {selectedOrder.total_xof?.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
            <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <span className="truncate">{selectedOrder.delivery_address} ({selectedOrder.delivery_city})</span>
          </div>

        </div>
      ) : (
        /* ÉTAT VIDE ÉLÉGANT COMMANDES */
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-[#1A1A1A]">Vous n'avez pas encore passé de commande</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Rejoignez un direct vidéo sur l'accueil et profitez du paiement Mobile Money 1-Clic pour commander !
          </p>
        </div>
      )}

      {/* ALL PAST ORDERS LIST */}
      {orders.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique de vos achats ({orders.length})</h3>
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => setSelectedOrder(ord)}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedOrder?.id === ord.id
                  ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-md'
                  : 'border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={ord.product?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80'}
                  alt={ord.product?.title}
                  className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#1A1A1A]">N° {ord.id.slice(0, 8)}</span>
                    <span className="text-[10px] text-gray-400">{new Date(ord.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-700 truncate">{ord.product?.title || 'Article Djagoba'}</p>
                  <span className="text-xs font-black text-[#FF6B00] block">
                    {ord.total_xof?.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
