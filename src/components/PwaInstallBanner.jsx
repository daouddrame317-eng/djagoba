import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show simulated banner for demo purposes if not installed
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Simulation toast for standard browser
      alert('⚡ DJAGOBA est prêt à être installé ! Ajoutez cette application à votre écran d\'accueil mobile (Options du navigateur > Ajouter à l\'écran d\'accueil).');
      setShowBanner(false);
    }
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-30 max-w-md mx-auto px-4 pointer-events-none animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 text-white rounded-2xl p-3 shadow-xl border border-gray-700/60 flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FF003C] flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold">Installer l'App DJAGOBA</h4>
              <span className="text-[9px] bg-[#00C853] text-white px-1.5 py-0.2 rounded-md font-extrabold">PWA</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">Accès rapide, hors-ligne & notifications directes</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="bg-[#FF6B00] hover:bg-[#E05E00] active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Installer
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
