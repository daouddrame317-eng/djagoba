import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AccueilTab from './components/AccueilTab';
import BoutiquesTab from './components/BoutiquesTab';
import CommandesTab from './components/CommandesTab';
import MonCompteTab from './components/MonCompteTab';
import AgoraLivePlayer from './components/AgoraLivePlayer';
import AgoraSellerStudio from './components/AgoraSellerStudio';
import PwaInstallBanner from './components/PwaInstallBanner';
import { Bell, X, CheckCircle, Info } from 'lucide-react';
import { supabase, getUserProfile, getLocalUser } from './lib/supabaseClient';
import { initPushNotifications } from './lib/pushNotifications';

export default function App() {
  const [activeTab, setActiveTab] = useState('accueil');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth Global State (Restore local user session on mount)
  const [currentUser, setCurrentUser] = useState(() => getLocalUser());
  const [activeLiveModal, setActiveLiveModal] = useState(null);
  const [isSellerMode, setIsSellerMode] = useState(() => getLocalUser()?.role === 'seller');
  const [toastMessage, setToastMessage] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Initialisation Supabase Auth Session & PWA Push Notifications
  useEffect(() => {
    initPushNotifications();

    // Restoration session Supabase si active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((profile) => {
          if (profile) {
            setCurrentUser(profile);
            if (profile.role === 'seller') setIsSellerMode(true);
          }
        });
      }
    }).catch((err) => {
      console.log('Session get error ignored:', err);
    });

    // Écouter les changements de session Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((profile) => {
          if (profile) {
            setCurrentUser(profile);
            if (profile.role === 'seller') setIsSellerMode(true);
          }
        });
      }
    });

    // Service Worker PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('ServiceWorker registration info:', err);
        });
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePlaceOrderFromLive = (newOrder) => {
    showToast(`🎉 Commande N° ${newOrder.id?.toString().slice(0, 8)} enregistrée avec succès !`);
    setTimeout(() => {
      setActiveTab('commandes');
    }, 1500);
  };

  const handleStartNewLive = (newLive) => {
    setActiveLiveModal(newLive);
    showToast(`🔴 Votre Direct Video "${newLive.title}" est maintenant en ligne !`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans antialiased selection:bg-[#FF6B00] selection:text-white">
      
      {/* PWA Floating Installation Banner */}
      <PwaInstallBanner />

      {/* Top Header */}
      <Header
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadNotifications={0}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Dynamic Tab Views Content */}
      <main className="transition-all duration-300">
        {activeTab === 'accueil' && (
          <AccueilTab
            selectedCity={selectedCity}
            searchQuery={searchQuery}
            onOpenLive={(live) => setActiveLiveModal(live)}
          />
        )}

        {activeTab === 'boutiques' && (
          <BoutiquesTab
            selectedCity={selectedCity}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'commandes' && (
          <CommandesTab
            currentUser={currentUser}
          />
        )}

        {activeTab === 'compte' && (
          <MonCompteTab
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            isSellerMode={isSellerMode}
            setIsSellerMode={setIsSellerMode}
            onStartNewLive={handleStartNewLive}
            showToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserRole={currentUser?.role}
        isSellerMode={isSellerMode}
      />

      {/* LIVE STREAM INTERACTIVE ROOM MODAL (AGORA WEBRTC PLAYER) */}
      {activeLiveModal && (
        <AgoraLivePlayer
          live={activeLiveModal}
          currentUser={currentUser}
          onClose={() => setActiveLiveModal(null)}
          onPlaceOrder={handlePlaceOrderFromLive}
        />
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#1A1A1A] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-2.5 pointer-events-auto">
            <Info className="w-4 h-4 text-[#00C853] shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS DRAWER MODAL */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-4 space-y-4 shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-xs font-extrabold text-[#1A1A1A]">Rappels & Notifications</h3>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center py-8 text-xs text-gray-400">
              Aucune notification non lue.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
