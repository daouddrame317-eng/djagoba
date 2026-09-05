// Service de gestion des Notifications Push (OneSignal Web SDK & Web Push API)

export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'demo-onesignal-app-id-djagoba';

/**
 * Initialiser OneSignal et demander la permission lors de la première visite
 */
export async function initPushNotifications() {
  if (typeof window === 'undefined') return;

  // 1. Demande de permission native de la navigateur/PWA si OneSignal n'est pas encore chargé
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Permission de notification PWA accordée !');
        }
      } catch (err) {
        console.error('Erreur demande permission notification:', err);
      }
    }
  }

  // 2. Chargement du SDK OneSignal Web si présent
  if (window.OneSignal) {
    window.OneSignal.push(function () {
      window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: "web.onesignal.auto.djagoba",
        notifyButton: {
          enable: false,
        },
        allowLocalhostAsSecureOrigin: true,
      });
    });
  }
}

/**
 * Déclencher une notification Push lorsqu'un vendeur suivi lance un direct
 */
export async function triggerSellerLivePushNotification({ sellerName, liveTitle, liveId }) {
  // Notification locale immédiate si la permission est accordée
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(`🔴 ${sellerName} est EN DIRECT !`, {
      body: `Nouveau direct : "${liveTitle}". Cliquez pour rejoindre la vente en direct sur DJAGOBA !`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      tag: `live-${liveId || Date.now()}`,
      data: { url: `/?liveId=${liveId || 'live-1'}` }
    });
  }

  // Simulation de l'appel REST à l'API OneSignal Backend
  console.log(`[OneSignal Push Trigger] Direct notifié pour le vendeur ${sellerName}: "${liveTitle}"`);
}
