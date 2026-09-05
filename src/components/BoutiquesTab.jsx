import React, { useState } from 'react';
import { Store, ShieldCheck, Star, Users, MapPin, Search, CheckCircle2, MessageCircle, ChevronRight } from 'lucide-react';
import { BOUTIQUES_CERTIFIEES } from '../data/mockData';

export default function BoutiquesTab({ selectedCity, searchQuery }) {
  const [boutiquesState, setBoutiquesState] = useState(BOUTIQUES_CERTIFIEES);
  const [selectedBoutique, setSelectedBoutique] = useState(null);

  const toggleFollow = (id) => {
    setBoutiquesState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFollowing: !b.isFollowing } : b))
    );
  };

  const filteredBoutiques = boutiquesState.filter((b) => {
    const matchesCity = selectedCity === 'all' || b.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* Header Banner for Certified Shops */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white rounded-2xl p-4 shadow-md space-y-1.5">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#00C853]" />
          <h2 className="text-sm font-black tracking-tight">Vendeurs Certifiés DJAGOBA 🇨🇮</h2>
        </div>
        <p className="text-xs text-gray-300">
          Toutes les boutiques ci-dessous possèdent un identifiant vérifié, une garantie de qualité et un service de livraison rapide.
        </p>
      </div>

      {/* Sellers List */}
      <div className="space-y-4">
        {filteredBoutiques.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all space-y-3"
          >
            {/* Seller Cover Image Header */}
            <div className="relative h-28 w-full bg-gray-100 overflow-hidden">
              <img
                src={b.coverImage}
                alt={b.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* City Tag on Cover */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                <MapPin className="w-3 h-3 text-[#FF6B00]" />
                {b.city} ({b.commune})
              </div>
            </div>

            {/* Seller Profile & Info Row */}
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-end justify-between -mt-8 relative z-10">
                <div className="flex items-end gap-3">
                  <img
                    src={b.avatar}
                    alt={b.name}
                    className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                  />
                  <div className="mb-0.5 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-[#1A1A1A]">{b.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-[#00C853] shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Fondateur : {b.owner}</p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => toggleFollow(b.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 border ${
                    b.isFollowing
                      ? 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm shadow-orange-500/20'
                  }`}
                >
                  {b.isFollowing ? 'Abonné(e)' : '+ Suivre'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {b.description}
              </p>

              {/* Metrics & Ratings */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{b.rating}</span>
                  <span className="text-gray-400 font-normal">({b.reviewsCount})</span>
                </div>

                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>{b.followers}</span>
                </div>

                <span className="text-[10px] bg-[#00C853]/10 text-[#00C853] font-bold px-2 py-0.5 rounded-md">
                  {b.responseSpeed}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
