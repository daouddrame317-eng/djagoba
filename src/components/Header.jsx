import React, { useState } from 'react';
import { Search, MapPin, Bell, Sparkles, X, Check } from 'lucide-react';
import { VILLES_IVOIRIENNES } from '../data/mockData';

export default function Header({ 
  selectedCity, 
  setSelectedCity, 
  searchQuery, 
  setSearchQuery,
  unreadNotifications,
  onOpenNotifications
}) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const activeCityName = VILLES_IVOIRIENNES.find(v => v.id === selectedCity)?.name || 'Abidjan';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Upper Bar: Logo, PWA Badge, City & Notification Bell */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        {/* Brand Logo & PWA Tag */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] via-[#FF8533] to-[#FF003C] flex items-center justify-center text-white shadow-md shadow-orange-500/20 transform active:scale-95 transition-transform">
            <span className="font-extrabold text-xl tracking-tighter">D</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#1A1A1A] leading-none">
                DJA<span className="text-[#FF6B00]">GOBA</span>
              </span>
              <span className="bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide uppercase">
                PWA
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-400 leading-tight">Live Shopping CI 🇨🇮</span>
          </div>
        </div>

        {/* City Selector & Notifications */}
        <div className="flex items-center gap-2">
          {/* City Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1 bg-[#F8F9FA] hover:bg-gray-100 border border-gray-200/80 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#1A1A1A] transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="max-w-[100px] truncate">{activeCityName.split(' ')[0]}</span>
            </button>

            {/* City Selection Modal / Dropdown */}
            {isCityDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                  onClick={() => setIsCityDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sélectionner la Ville</span>
                    <button onClick={() => setIsCityDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {VILLES_IVOIRIENNES.map((ville) => (
                      <button
                        key={ville.id}
                        onClick={() => {
                          setSelectedCity(ville.id);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedCity === ville.id 
                            ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-bold' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{ville.name}</span>
                        {selectedCity === ville.id && <Check className="w-4 h-4 text-[#FF6B00]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#F8F9FA] hover:bg-gray-100 text-gray-700 transition-all active:scale-95 border border-gray-200/60"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#1A1A1A]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF003C] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="max-w-md mx-auto px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des vendeurs, articles ou directs..."
            className="w-full bg-[#F8F9FA] text-xs text-[#1A1A1A] placeholder-gray-400 pl-10 pr-9 py-2.5 rounded-full border border-gray-200/80 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
