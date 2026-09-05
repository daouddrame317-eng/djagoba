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
import { LIVES_EN_DIRECT, PROCHAINS_LIVES } from './data/mockData';
import { Bell, X, CheckCircle, Info } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('accueil');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [lives, setLives] = useState(LIVES_EN_DIRECT);
  const [upcomingLives, setUpcomingLives] = useState(PROCHAINS_LIVES);
  const [userOrders, setUserOrders] = useState([]);
  
  // UI Modal states
  const [activeLiveModal, setActiveLiveModal] = useState(null);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleUpcomingAlert = (id) => {
    setUpcomingLives((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isAlertSet;
          showToast(
            nextState
              ? `🔔 Rappel activé pour "${item.title}". Vous recevrez une notification PWA au lancement du direct !`
              : `🔕 Rappel désactivé pour "${item.title}".`
          );
          return { ...item, isAlertSet: nextState };
        }
        return item;
      })
    );
  };

  const handlePlaceOrderFromLive = (newOrder) => {
    setUserOrders((prev) => [newOrder, ...prev]);
    showToast(`🎉 Commande ${newOrder.id} enregistrée ! Redirection vers le suivi de livraison...`);
    setTimeout(() => {
      setActiveTab('commandes');
    }, 1600);
  };

  const handleStartNewLive = (newLive) => {
    setLives((prev) => [newLive, ...prev]);
    setActiveLiveModal(newLive);
    showToast(`🔴 Votre Direct Video "${newLive.title}" est maintenant en ligne !`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans antialiased selection:bg-[#FF6B00] selection:text-white">
      
      {/* PWA Floating Installation Prompt */}
      <PwaInstallBanner />

      {/* Top Header */}
      <Header
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadNotifications={upcomingLives.filter(u => u.isAlertSet).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Dynamic Tab Views Content */}
      <main className="transition-all duration-300">
        {activeTab === 'accueil' && (
          <AccueilTab
            lives={lives}
            upcomingLives={upcomingLives}
            selectedCity={selectedCity}
            searchQuery={searchQuery}
            onOpenLive={(live) => setActiveLiveModal(live)}
            onToggleUpcomingAlert={handleToggleUpcomingAlert}
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
            userOrders={userOrders}
          />
        )}

        {activeTab === 'compte' && (
          <MonCompteTab
            isSellerMode={isSellerMode}
            setIsSellerMode={setIsSellerMode}
            onStartNewLive={handleStartNewLive}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeOrdersCount={userOrders.length}
        isSellerMode={isSellerMode}
      />

      {/* LIVE STREAM INTERACTIVE ROOM MODAL (AGORA WEBRTC PLAYER) */}
      {activeLiveModal && (
        <AgoraLivePlayer
          live={activeLiveModal}
          onClose={() => setActiveLiveModal(null)}
          onPlaceOrder={handlePlaceOrderFromLive}
        />
      )}


      {/* GLOBAL TOAST NOTIFICATION PROMPT */}
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

            <div className="space-y-2">
              {upcomingLives.filter(u => u.isAlertSet).length > 0 ? (
                upcomingLives.filter(u => u.isAlertSet).map((u) => (
                  <div key={u.id} className="p-3 bg-[#FF6B00]/10 rounded-xl border border-[#FF6B00]/20 space-y-1">
                    <span className="text-[10px] font-bold text-[#FF6B00]">Alerte Active</span>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{u.title}</h4>
                    <p className="text-[11px] text-gray-500">{u.date} à {u.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Aucune alerte configurée.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
