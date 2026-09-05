// Service de gestion des Notifications Push (OneSignal Web SDK & Web Push API)
import { ONESIGNAL_APP_ID } from './config';

/**
 * Initialiser OneSignal et demander la permission lors de la première visite
 */
export async function initPushNotifications() {
  if (typeof window === 'undefined') return;

  // 1. Demande de permission native de la navigateur/PWA
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

  // 2. Initialisation du SDK OneSignal Web
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
 * Déclencher une notification Push OneSignal lorsqu'un vendeur lance son statut à `live`
 */
export async function triggerSellerLivePushNotification({ sellerName, liveTitle, liveId }) {
  // 1. Notification locale PWA immédiate
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(`🔴 ${sellerName} est EN DIRECT !`, {
        body: `Nouveau direct : "${liveTitle}". Cliquez pour rejoindre la vente en direct sur DJAGOBA !`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        tag: `live-${liveId || Date.now()}`,
        data: { url: `/?liveId=${liveId}` }
      });
    } catch (err) {
      console.log('Push local error:', err);
    }
  }

  // 2. Appel REST API OneSignal v1/notifications si la clé APP ID est configurée
  if (ONESIGNAL_APP_ID) {
    try {
      await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ['Subscribed Users'],
          headings: { fr: `🔴 ${sellerName} est EN DIRECT !`, en: `🔴 ${sellerName} is LIVE!` },
          contents: { fr: `Nouveau direct : "${liveTitle}". Cliquez pour acheter en direct !`, en: `New live: "${liveTitle}".` },
          data: { liveId: liveId },
        }),
      });
      console.log(`[OneSignal Push OK] Notification envoyée aux abonnés pour le live "${liveTitle}"`);
    } catch (err) {
      console.warn('OneSignal REST Push Call warning:', err);
    }
  }
}
