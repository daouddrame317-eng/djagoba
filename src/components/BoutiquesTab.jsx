import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Star, Users, MapPin, RefreshCw, ShoppingBag } from 'lucide-react';
import { fetchBoutiques } from '../lib/supabaseClient';

export default function BoutiquesTab({ selectedCity, searchQuery }) {
  const [boutiques, setBoutiques] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  const loadBoutiques = async () => {
    setIsLoading(true);
    const data = await fetchBoutiques();
    setBoutiques(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBoutiques();
  }, []);

  const toggleFollow = (id) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBoutiques = boutiques.filter((b) => {
    const city = b.city || 'Abidjan';
    const matchesCity = selectedCity === 'all' || city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch = searchQuery === '' ||
      (b.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* Header Banner for Certified Shops */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white rounded-2xl p-4 shadow-md space-y-1.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#00C853]" />
            <h2 className="text-sm font-black tracking-tight">Vendeurs Certifiés DJAGOBA 🇨🇮</h2>
          </div>
          <p className="text-xs text-gray-300">
            Boutiques vérifiées avec livraison express garantie à Abidjan & villes de CI.
          </p>
        </div>

        <button onClick={loadBoutiques} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sellers List */}
      {filteredBoutiques.length > 0 ? (
        <div className="space-y-4">
          {filteredBoutiques.map((b) => {
            const isFollowing = Boolean(followingMap[b.id]);
            const avatar = b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
            const coverImage = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all space-y-3"
              >
                {/* Seller Cover Image Header */}
                <div className="relative h-28 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={b.full_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* City Tag */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <MapPin className="w-3 h-3 text-[#FF6B00]" />
                    {b.city || 'Abidjan'}
                  </div>
                </div>

                {/* Seller Profile Info */}
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-end justify-between -mt-8 relative z-10">
                    <div className="flex items-end gap-3">
                      <img
                        src={avatar}
                        alt={b.full_name}
                        className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                      />
                      <div className="mb-0.5 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-extrabold text-[#1A1A1A]">{b.full_name}</h3>
                          <ShieldCheck className="w-4 h-4 text-[#00C853] shrink-0" />
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">Boutique Vendeur DJAGOBA</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(b.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 border ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm shadow-orange-500/20'
                      }`}
                    >
                      {isFollowing ? 'Abonné(e)' : '+ Suivre'}
                    </button>
                  </div>

                  {/* Rating & Contact */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>4.9</span>
                      <span className="text-gray-400 font-normal">(Top Vendeur)</span>
                    </div>

                    <span className="text-[10px] bg-[#00C853]/10 text-[#00C853] font-bold px-2 py-0.5 rounded-md">
                      Boutique Vérifiée 🇨🇮
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ÉTAT VIDE ÉLÉGANT BOUTIQUES */
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3 shadow-xs">
          <Store className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-[#1A1A1A]">Aucune boutique enregistrée pour le moment</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Inscrivez-vous en tant que Vendeur dans l'onglet Mon Compte pour créer votre boutique et diffuser vos produits en direct !
          </p>
        </div>
      )}

    </div>
  );
}
