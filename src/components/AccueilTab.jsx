import React, { useState } from 'react';
import { 
  Radio, 
  Calendar, 
  Bell, 
  CheckCircle, 
  Eye, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  Shirt, 
  Smartphone, 
  Gem, 
  Utensils, 
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export default function AccueilTab({ 
  lives, 
  upcomingLives, 
  selectedCity, 
  searchQuery,
  onOpenLive,
  onToggleUpcomingAlert
}) {
  const [selectedCategory, setSelectedCategory] = useState('tous');

  // Filter lives based on City, Category, Search Query
  const filteredLives = lives.filter((live) => {
    const matchesCity = selectedCity === 'all' || live.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCategory = selectedCategory === 'tous' || live.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      live.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      live.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      live.featuredProduct.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  const filteredUpcoming = upcomingLives.filter((item) => {
    const matchesCity = selectedCity === 'all' || item.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCategory = selectedCategory === 'tous' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-6 animate-in fade-in duration-300">
      
      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 select-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1.5 active:scale-95 border ${
                isSelected
                  ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-orange-500/25'
                  : 'bg-white text-gray-700 border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: 🔴 En Direct Actuellement */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 bg-[#FF003C] rounded-full animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 bg-[#FF003C] rounded-full" />
            </div>
            <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
              🔴 En Direct Actuellement
            </h2>
            <span className="bg-[#FF003C]/10 text-[#FF003C] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {filteredLives.length} LIVE{filteredLives.length > 1 ? 'S' : ''}
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Glissez ➔</span>
        </div>

        {/* Live Video Cards Carousel */}
        {filteredLives.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {filteredLives.map((live) => (
              <div
                key={live.id}
                onClick={() => onOpenLive(live)}
                className="w-[280px] shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 snap-start cursor-pointer group active:scale-[0.98]"
              >
                {/* Live Card Video / Thumbnail Header */}
                <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                  <img
                    src={live.streamPoster}
                    alt={live.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                  {/* Top Overlay: Blinking Red LIVE Badge & Spectators */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    {/* Blinking Red LIVE Badge */}
                    <div className="bg-[#FF003C] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/50 animate-live-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE
                    </div>

                    {/* Spectateurs en temps réel */}
                    <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                      <Eye className="w-3.5 h-3.5 text-[#00C853]" />
                      <span>{live.viewers.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Bottom Overlay inside Thumbnail: Seller Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
                    <img
                      src={live.seller.avatar}
                      alt={live.seller.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-md"
                    />
                    <div className="flex flex-col text-white">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold truncate max-w-[150px]">
                          {live.seller.name}
                        </span>
                        {live.seller.certified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#FF6B00]" />
                        {live.city} ({live.commune})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Card Content: Title & Featured Product with Price in FCFA */}
                <div className="p-3.5 space-y-2.5 bg-white">
                  <h3 className="text-xs font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#FF6B00] transition-colors">
                    {live.title}
                  </h3>

                  {/* Featured Product Highlight Box */}
                  <div className="bg-[#F8F9FA] rounded-xl p-2 flex items-center gap-2.5 border border-gray-100">
                    <img
                      src={live.featuredProduct.image}
                      alt={live.featuredProduct.title}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block truncate">
                        Vedette : {live.featuredProduct.title}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#FF6B00]">
                          {live.featuredProduct.livePrice.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          {live.featuredProduct.originalPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#FF003C]/10 text-[#FF003C] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                      {live.featuredProduct.discount}
                    </span>
                  </div>

                  {/* Watch Live CTA */}
                  <button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E05E00] hover:to-[#FF6B00] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Rejoindre le Direct
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/80 space-y-2">
            <Radio className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-600">Aucun live ne correspond à vos filtres</p>
            <p className="text-[11px] text-gray-400">Essayez de modifier la ville ou la catégorie sélectionnée.</p>
          </div>
        )}
      </section>

      {/* SECTION 2: 📅 Prochains Lives Programmés */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
            📅 Prochains Lives
          </h2>
          <span className="text-xs text-gray-500 font-medium">Rappels automatiques</span>
        </div>

        <div className="space-y-3">
          {filteredUpcoming.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
            >
              {/* Seller & Stream Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.seller.avatar}
                  alt={item.seller.name}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#1A1A1A] truncate">
                      {item.seller.name}
                    </span>
                    <span className="bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.date} • {item.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>Produit : <strong className="text-gray-700">{item.teaserProduct}</strong></span>
                    <span>•</span>
                    <span className="text-[#00C853] font-bold">{item.estimatedPrice}</span>
                  </div>
                </div>
              </div>

              {/* M'alerter par Notification Button */}
              <button
                onClick={() => onToggleUpcomingAlert(item.id)}
                className={`shrink-0 p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  item.isAlertSet
                    ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30'
                    : 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 hover:bg-[#FF6B00]/20'
                }`}
                title="M'alerter par Notification PWA"
              >
                {item.isAlertSet ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00C853]" />
                    <span className="text-[9px] uppercase tracking-wider">Alerte OK</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-[9px] uppercase tracking-wider">M'alerter</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Market Info Banner / Ivorian Trust Badge */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase bg-[#00C853] text-white px-2 py-0.5 rounded-md tracking-wider">
            Garantie Djagoba 🇨🇮
          </span>
          <h4 className="text-xs font-bold">Paiement à la livraison & Vérification vendeur</h4>
          <p className="text-[11px] text-emerald-100">Commandez en direct et recevez votre colis par livreur Moto à Abidjan & villes de CI.</p>
        </div>
        <ShieldCheck className="w-10 h-10 text-[#00C853] shrink-0 opacity-90" />
      </div>

    </div>
  );
}
