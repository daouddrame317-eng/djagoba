import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Package, 
  Clock, 
  Check, 
  Navigation, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { 
  fetchPendingCourierOrders, 
  fetchAssignedCourierOrders, 
  acceptCourierDelivery, 
  updateDeliveryStatus,
  subscribeToOrders
} from '../lib/supabaseClient';
import { COMMUNES } from '../lib/config';

export default function CourierDashboard({ currentUser, showToast }) {
  const [selectedCity, setSelectedCity] = useState(currentUser?.city || 'all');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les courses en attente et assignées
  const loadOrders = async () => {
    setIsLoading(true);
    const pending = await fetchPendingCourierOrders(selectedCity);
    setPendingOrders(pending);

    if (currentUser?.id) {
      const assigned = await fetchAssignedCourierOrders(currentUser.id);
      setActiveDeliveries(assigned);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    // S'abonner aux changements des commandes en temps réel
    if (currentUser?.id) {
      const unsubscribe = subscribeToOrders(currentUser.id, () => {
        loadOrders();
      });
      return () => unsubscribe();
    }
  }, [selectedCity, currentUser?.id]);

  // Accepter une livraison
  const handleAcceptDelivery = async (orderId) => {
    if (!currentUser?.id) {
      alert('Veuillez vous connecter en tant que Livreur.');
      return;
    }

    const { error } = await acceptCourierDelivery(orderId, currentUser.id);
    if (error) {
      showToast(`❌ ${error}`);
    } else {
      showToast('🛵 Course acceptée ! Elle apparaît désormais dans vos livraisons en cours.');
      loadOrders();
    }
  };

  // Passer en transit ou Valider la livraison
  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await updateDeliveryStatus(orderId, newStatus);
    if (error) {
      showToast(`❌ ${error}`);
    } else {
      if (newStatus === 'delivered') {
        showToast('✅ Livraison validée avec succès ! Statut mis à jour.');
      } else {
        showToast('🛵 Course marquée en cours de livraison.');
      }
      loadOrders();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* Header Livreur */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-gray-900 text-white rounded-3xl p-4 shadow-xl space-y-2 border border-emerald-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00C853] text-white flex items-center justify-center shadow-lg shadow-green-600/30">
              <Bike className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black">Espace Livreur Djagoba Express 🇨🇮</h2>
                <span className="bg-[#00C853] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                  EN SERVICE 🛵
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                {currentUser?.full_name || 'Livreur Partenaire'} • {currentUser?.city || 'Abidjan'}
              </p>
            </div>
          </div>

          <button 
            onClick={loadOrders}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95"
            title="Rafraîchir les courses"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Commune filter selector */}
        <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-200">Zone de livraison :</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-black/40 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 focus:outline-none"
          >
            <option value="all">🌍 Toutes les communes</option>
            {COMMUNES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 1: 🛵 MES LIVRAISONS EN COURS (ASSIGNÉES) */}
      {activeDeliveries.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#FF6B00]" />
              Mes Courses en Cours ({activeDeliveries.length})
            </h3>
          </div>

          <div className="space-y-3">
            {activeDeliveries.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white rounded-3xl p-4 border-2 border-[#FF6B00] shadow-lg space-y-3.5 relative overflow-hidden"
              >
                {/* Badge Status */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-black text-[#FF6B00]">N° {ord.id.slice(0, 8)}</span>
                  <span className="bg-[#FF6B00]/15 text-[#FF6B00] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                    {ord.delivery_status === 'in_transit' ? '🛵 En route vers le client' : '⏳ Acceptée (À récupérer)'}
                  </span>
                </div>

                {/* Client Info & Address */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase block">Destinataire</span>
                      <span className="font-extrabold text-[#1A1A1A] text-sm">{ord.buyer_name || 'Client Djagoba'}</span>
                    </div>
                    <a
                      href={`tel:${ord.buyer_phone}`}
                      className="bg-[#00C853] text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md hover:bg-[#00B048] active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Appeler
                    </a>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-2xl space-y-1 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                      <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                      <span>{ord.delivery_address} ({ord.delivery_city})</span>
                    </div>
                    {ord.delivery_landmark && (
                      <p className="text-[11px] text-gray-500 pl-5">Repère : {ord.delivery_landmark}</p>
                    )}
                  </div>
                </div>

                {/* Product Summary & Total */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Produit</span>
                    <span className="font-bold text-[#1A1A1A]">{ord.product?.title || 'Article commande'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Total Réglé (Frais incl.)</span>
                    <span className="font-black text-[#00C853] text-sm">{ord.total_xof?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {/* Escrow Notice */}
                <div className="bg-emerald-50 rounded-2xl p-2 border border-emerald-200 text-[10px] text-emerald-900 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                  <span>🔒 Séquestre Djagoba : Valider la livraison débloquera automatiquement le paiement vers le vendeur.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {ord.delivery_status !== 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'in_transit')}
                      className="flex-1 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Bike className="w-4 h-4" />
                      Démarrer le Trajet
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                    className="flex-1 bg-[#00C853] hover:bg-[#00B048] text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider la Livraison (Libérer Séquestre)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: 📦 COURSES PAYÉES EN ATTENTE D'UN LIVREUR */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#00C853]" />
            Commandes Payées Disponibles ({pendingOrders.length})
          </h3>
          <span className="text-[10px] text-gray-400 font-bold">Paiement Mobile Money Validé</span>
        </div>

        {pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">N° Commande</span>
                    <span className="text-xs font-black text-[#1A1A1A]">{ord.id.slice(0, 8)}</span>
                  </div>
                  <span className="bg-[#00C853]/15 text-[#00C853] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                    💳 PAYÉ (Via {ord.payment_method?.toUpperCase()})
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1A1A1A]">{ord.buyer_name}</span>
                    <span className="text-gray-500">{ord.buyer_phone}</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-gray-600 bg-gray-50 p-2 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span className="font-semibold">{ord.delivery_address} ({ord.delivery_city})</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500 pt-1">
                    <span>Course rémunérée : <strong className="text-[#00C853] font-black">{ord.delivery_fee} FCFA</strong></span>
                    <span>Montant colis: {ord.amount_xof?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptDelivery(ord.id)}
                  className="w-full bg-gradient-to-r from-[#00C853] to-[#00E676] hover:from-[#00B048] hover:to-[#00C853] text-white font-extrabold text-xs py-3 rounded-2xl shadow-md shadow-green-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Bike className="w-4 h-4" />
                  Accepter la livraison (Attribuer à ma moto)
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-2">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-xs font-bold text-gray-700">Aucune commande en attente dans cette zone</h4>
            <p className="text-[11px] text-gray-400">
              Toutes les commandes payées dans {selectedCity === 'all' ? 'les communes' : selectedCity} sont actuellement attribuées.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
