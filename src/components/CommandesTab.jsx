import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ShieldCheck, 
  PackageCheck
} from 'lucide-react';
import { COMMANDES_UTILISATEUR } from '../data/mockData';


export default function CommandesTab({ userOrders }) {
  const allOrders = [...userOrders, ...COMMANDES_UTILISATEUR];
  const [selectedOrder, setSelectedOrder] = useState(allOrders[0]);

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
        <span className="bg-[#FF6B00] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
          {allOrders.length} Commandes
        </span>
      </div>

      {/* ACTIVE TRACKED ORDER FEATURED CARD */}
      {selectedOrder && (
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-md space-y-4">
          
          {/* Order Header: ID & Status */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">N° Commande</span>
              <span className="text-sm font-black text-[#1A1A1A]">{selectedOrder.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Statut Actuel</span>
              <span className="text-xs font-extrabold text-[#00C853] bg-[#00C853]/10 px-2.5 py-1 rounded-full flex items-center gap-1 inline-block">
                {selectedOrder.statusLabel}
              </span>
            </div>
          </div>

          {/* REAL-TIME DELIVERY TIMELINE (4 STEPS) */}
          <div className="space-y-2 py-1">
            <span className="text-xs font-bold text-gray-700 block">Progression de Livraison</span>
            <div className="flex items-center justify-between relative px-2">
              {/* Connecting Progress Line */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-200 -translate-y-1/2 z-0">
                <div 
                  className="h-full bg-[#00C853] transition-all duration-500" 
                  style={{ width: `${((selectedOrder.statusStep || 3) - 1) * 33.33}%` }} 
                />
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#00C853] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  ✓
                </div>
                <span className="text-[9px] font-bold text-gray-700">Validée</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#00C853] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  ✓
                </div>
                <span className="text-[9px] font-bold text-gray-700">Préparation</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                  selectedOrder.statusStep >= 3 ? 'bg-[#FF6B00] text-white ring-4 ring-[#FF6B00]/20 animate-pulse' : 'bg-gray-200 text-gray-500'
                }`}>
                  🛵
                </div>
                <span className="text-[9px] font-bold text-[#FF6B00]">En Route</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedOrder.statusStep === 4 ? 'bg-[#00C853] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {selectedOrder.statusStep === 4 ? '✓' : '4'}
                </div>
                <span className="text-[9px] font-medium text-gray-400">Livrée</span>
              </div>
            </div>
          </div>

          {/* DRIVER INFO CARD (If in transit) */}
          {selectedOrder.driver && (
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOrder.driver.avatar}
                  alt={selectedOrder.driver.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FF6B00] shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{selectedOrder.driver.name}</h4>
                    <span className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00] font-extrabold px-1.5 py-0.2 rounded-md">
                      Livreur Djagoba
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{selectedOrder.driver.vehicle}</p>
                  <span className="text-[10px] text-[#00C853] font-bold">⏱️ {selectedOrder.estimatedDeliveryTime}</span>
                </div>
              </div>

              <a
                href={`tel:${selectedOrder.driver.phone}`}
                className="p-3 bg-[#00C853] hover:bg-[#00B048] active:scale-95 text-white rounded-xl shadow-md flex items-center justify-center transition-all"
                title="Appeler le livreur"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Ordered Item Summary */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 block">Détails des articles</span>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <span className="font-bold text-[#1A1A1A] block">{item.name}</span>
                    <span className="text-[11px] text-gray-400">Qté: {item.qty}</span>
                  </div>
                </div>
                <span className="font-black text-[#FF6B00]">
                  {item.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}

            <div className="flex justify-between items-center text-xs font-black text-[#1A1A1A] pt-2 border-t border-gray-100">
              <span>Total Réglé (Livraison incluse)</span>
              <span className="text-base text-[#FF6B00]">
                {selectedOrder.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
            <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <span className="truncate">{selectedOrder.address}</span>
          </div>

        </div>
      )}

      {/* ALL PAST ORDERS LIST */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique de vos achats</h3>
        {allOrders.map((ord) => (
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
                src={ord.items[0]?.image || ord.sellerAvatar}
                alt={ord.seller}
                className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
              />
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#1A1A1A]">{ord.id}</span>
                  <span className="text-[10px] text-gray-400">{ord.date}</span>
                </div>
                <p className="text-xs text-gray-700 truncate">{ord.items[0]?.name}</p>
                <span className="text-xs font-black text-[#FF6B00] block">
                  {ord.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        ))}
      </div>

    </div>
  );
}
