import React from 'react';
import { Radio, Store, ShoppingBag, User, Bike } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, activeOrdersCount, currentUserRole, isSellerMode }) {
  const accountLabel = currentUserRole === 'courier'
    ? 'Espace Livreur'
    : currentUserRole === 'seller' || isSellerMode
    ? 'Studio Vendeur'
    : 'Mon Compte';

  const accountBadge = currentUserRole === 'courier'
    ? 'LIVREUR'
    : currentUserRole === 'seller' || isSellerMode
    ? 'PRO'
    : null;

  const accountBadgeColor = currentUserRole === 'courier'
    ? 'bg-[#00C853]'
    : 'bg-purple-600';

  const tabs = [
    {
      id: 'accueil',
      label: 'Accueil / Directs',
      shortLabel: 'Accueil',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-[#FF003C]'
    },
    {
      id: 'boutiques',
      label: 'Boutiques',
      shortLabel: 'Boutiques',
      icon: Store,
      badge: 'Certifiés',
      badgeColor: 'bg-[#00C853]'
    },
    {
      id: 'commandes',
      label: 'Commandes',
      shortLabel: 'Commandes',
      icon: ShoppingBag,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
      badgeColor: 'bg-[#FF6B00]'
    },
    {
      id: 'compte',
      label: 'Mon Compte',
      shortLabel: accountLabel,
      icon: currentUserRole === 'courier' ? Bike : User,
      badge: accountBadge,
      badgeColor: accountBadgeColor
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full px-1 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive 
                  ? 'text-[#FF6B00] font-bold' 
                  : 'text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-[#FF6B00] rounded-b-full shadow-xs shadow-orange-500/50" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative mb-0.5">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#FF6B00]' : ''}`} />
                
                {/* Badge Tag */}
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-xs ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] leading-tight tracking-tight text-center">
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
