import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Calendar, 
  Bell, 
  CheckCircle, 
  Eye, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { fetchActiveLives, fetchUpcomingLives, subscribeToLives } from '../lib/supabaseClient';

export default function AccueilTab({ 
  selectedCity, 
  searchQuery,
  onOpenLive,
  onToggleUpcomingAlert
}) {
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [lives, setLives] = useState([]);
  const [upcomingLives, setUpcomingLives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données réelles depuis Supabase
  const loadData = async () => {
    setIsLoading(true);
    const active = await fetchActiveLives();
    const upcoming = await fetchUpcomingLives();
    setLives(active);
    setUpcomingLives(upcoming);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // Abonnement Temps Réel aux changements de la table lives
    const unsubscribe = subscribeToLives(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  // Filter lives based on City, Category, Search Query
  const filteredLives = lives.filter((live) => {
    const liveCity = live.city || live.seller?.city || 'Abidjan';
    const matchesCity = selectedCity === 'all' || liveCity.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCategory = selectedCategory === 'tous' || live.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      (live.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (live.seller?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (live.pinnedProduct?.title || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  const filteredUpcoming = upcomingLives.filter((item) => {
    const itemCity = item.city || item.seller?.city || 'Abidjan';
    const matchesCity = selectedCity === 'all' || itemCity.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCategory = selectedCategory === 'tous' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.seller?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

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
          <button onClick={loadData} className="text-gray-400 p-1 hover:text-gray-600">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Live Video Cards Carousel */}
        {filteredLives.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {filteredLives.map((live) => {
              const sellerName = live.seller?.full_name || 'Vendeur Certifié';
              const sellerAvatar = live.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
              const livePoster = live.thumbnail_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80';
              const pinnedProd = live.pinnedProduct;

              return (
                <div
                  key={live.id}
                  onClick={() => onOpenLive(live)}
                  className="w-[280px] shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 snap-start cursor-pointer group active:scale-[0.98]"
                >
                  {/* Live Card Header */}
                  <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                    <img
                      src={livePoster}
                      alt={live.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                    {/* Top Overlay: LIVE Badge & Spectators */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <div className="bg-[#FF003C] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/50 animate-live-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        LIVE
                      </div>

                      <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <Eye className="w-3.5 h-3.5 text-[#00C853]" />
                        <span>{(live.viewers_count || 1).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Bottom Overlay: Seller Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
                      <img
                        src={sellerAvatar}
                        alt={sellerName}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-md"
                      />
                      <div className="flex flex-col text-white">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold truncate max-w-[150px]">
                            {sellerName}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                        </div>
                        <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#FF6B00]" />
                          {live.city || 'Abidjan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Card Content */}
                  <div className="p-3.5 space-y-2.5 bg-white">
                    <h3 className="text-xs font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#FF6B00] transition-colors">
                      {live.title}
                    </h3>

                    {/* Featured Product Highlight Box */}
                    {pinnedProd ? (
                      <div className="bg-[#F8F9FA] rounded-xl p-2 flex items-center gap-2.5 border border-gray-100">
                        <img
                          src={pinnedProd.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                          alt={pinnedProd.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block truncate">
                            Vedette : {pinnedProd.title}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-[#FF6B00]">
                              {pinnedProd.price_xof?.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#F8F9FA] rounded-xl p-2 text-center text-[11px] text-gray-400 border border-gray-100">
                        Regardez la présentation des articles en direct !
                      </div>
                    )}

                    <button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#E05E00] hover:to-[#FF6B00] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      Rejoindre le Direct
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ÉTAT VIDE ÉLÉGANT POUR LES LIVES */
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200/80 space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FF003C]/10 text-[#FF003C] flex items-center justify-center mx-auto">
              <Radio className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">Aucun live en cours pour le moment 📺</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Les vendeurs préparent leurs prochains directs vidéo. Revenez d'ici quelques minutes ou soyez le premier à lancer une vente en direct !
              </p>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: 📅 Prochains Lives Programmés */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
            📅 Prochains Lives
          </h2>
          <span className="text-xs text-gray-500 font-medium">Rappels PWA</span>
        </div>

        {filteredUpcoming.length > 0 ? (
          <div className="space-y-3">
            {filteredUpcoming.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={item.seller?.full_name}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#1A1A1A] truncate">
                        {item.seller?.full_name || 'Vendeur Certifié'}
                      </span>
                      <span className="bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        Programmé
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => onToggleUpcomingAlert && onToggleUpcomingAlert(item.id)}
                  className="shrink-0 p-2.5 rounded-xl font-bold text-xs bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 hover:bg-[#FF6B00]/20 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Bell className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-[9px] uppercase tracking-wider">M'alerter</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ÉTAT VIDE ÉLÉGANT POUR PROCHAINS LIVES */
          <div className="bg-white rounded-3xl p-6 text-center border border-gray-200/80 space-y-2 shadow-xs">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">Aucun direct programmé à venir</p>
            <p className="text-[11px] text-gray-400">Restez connectés, de nouvelles sessions seront bientôt ajoutées par les boutiques.</p>
          </div>
        )}
      </section>

      {/* Market Info Banner / Ivorian Trust Badge */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase bg-[#00C853] text-white px-2 py-0.5 rounded-md tracking-wider">
            Garantie Djagoba 🇨🇮
          </span>
          <h4 className="text-xs font-bold">Paiement Mobile Money & Livraison par Moto Express</h4>
          <p className="text-[11px] text-emerald-100">Commandez en direct et recevez votre colis par livreur à Abidjan & villes de CI.</p>
        </div>
        <ShieldCheck className="w-10 h-10 text-[#00C853] shrink-0 opacity-90" />
      </div>

    </div>
  );
}
