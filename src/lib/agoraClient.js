import AgoraRTC from 'agora-rtc-sdk-ng';

// Mode de débogage et niveau de logs Agora
AgoraRTC.setLogLevel(1);

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'ACo631e6bbbcbd74d849096da10469a4a0f';

/**
 * Créer une instance de client Agora RTC
 */
export function createAgoraClient(role = 'audience') {
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  client.setClientRole(role);
  return client;
}

/**
 * Service HÔTE / VENDEUR : Initialiser la caméra (avant/arrière) et le micro puis publier le flux WebRTC
 */
export async function startHostBroadcast({ appId, channel, token = null, uid = null, containerId, initialFacingMode = 'user' }) {
  const client = createAgoraClient('host');
  let localAudioTrack = null;
  let localVideoTrack = null;
  let cameras = [];

  try {
    // 1. Activer le mode DualStream pour l'adaptation réseau dynamique (3G/4G)
    try {
      await client.enableDualStream();
    } catch (e) {
      console.warn('Dual stream initialization info:', e);
    }

    // 2. Création de la piste microphone avec réduction de bruit
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: 'speech_standard',
      AEC: true, // Echo cancellation
      ANS: true, // Noise suppression
    });

    // 3. Création de la piste vidéo avec gestion dynamique de la caméra (facingMode: 'user' ou 'environment')
    try {
      localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_1', // Adaptatif pour le réseau mobile 3G/4G
        facingMode: initialFacingMode,
      });
    } catch (camErr) {
      console.warn('Erreur création vidéo avec facingMode, fallback générique:', camErr);
      localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '360p_1',
      });
    }

    // 4. Rejoindre le canal Agora RTC
    const assignedUid = await client.join(appId || AGORA_APP_ID, channel, token, uid);

    // 5. Afficher la vidéo locale dans l'élément DOM du Studio Vendeur
    if (containerId) {
      setTimeout(() => {
        const container = document.getElementById(containerId);
        if (container && localVideoTrack) {
          container.innerHTML = '';
          localVideoTrack.play(containerId, { fit: 'cover' });
        }
      }, 100);
    }

    // 6. Publier les flux audio et vidéo sur le réseau Agora
    await client.publish([localAudioTrack, localVideoTrack]);

    // 7. Récupérer la liste des caméras disponibles pour la bascule (Front/Back)
    cameras = await AgoraRTC.getCameras();

    return {
      client,
      localAudioTrack,
      localVideoTrack,
      assignedUid,
      cameras,
      facingMode: initialFacingMode,
      error: null
    };
  } catch (error) {
    console.error('Erreur initialisation Studio Vendeur Agora:', error);
    
    let userFriendlyErrorMessage = 'Erreur lors de l\'accès à la caméra ou au microphone.';
    if (error.code === 'PERMISSION_DENIED' || error.name === 'NotAllowedError') {
      userFriendlyErrorMessage = 'Permission caméra/micro refusée. Veuillez autoriser l\'accès dans le navigateur.';
    } else if (error.code === 'DEVICE_NOT_FOUND' || error.name === 'NotFoundError') {
      userFriendlyErrorMessage = 'Aucune caméra ou microphone détecté sur cet appareil.';
    }

    return {
      client: null,
      localAudioTrack: null,
      localVideoTrack: null,
      assignedUid: null,
      cameras: [],
      error: userFriendlyErrorMessage
    };
  }
}

/**
 * Service ACHETEUR / PLAYER : Rejoindre le canal et lire automatiquement le flux WebRTC du Vendeur
 */
export async function startAudiencePlayer({ appId, channel, token = null, uid = null, containerId, onUserPublished, onUserUnpublished }) {
  const client = createAgoraClient('audience');

  try {
    // Écouter l'événement user-published pour s'abonner automatiquement dès la publication du vendeur
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        setTimeout(() => {
          const container = document.getElementById(containerId);
          if (container && remoteVideoTrack) {
            container.innerHTML = '';
            remoteVideoTrack.play(containerId, { fit: 'cover' });
          }
        }, 100);
      }

      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }

      if (onUserPublished) onUserPublished(user, mediaType);
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (onUserUnpublished) onUserUnpublished(user, mediaType);
    });

    // Rejoindre le canal Agora RTC en mode spectateur
    await client.join(appId || AGORA_APP_ID, channel, token, uid);

    // Si le vendeur était DÉJÀ en train de diffuser avant la connexion de l'acheteur, s'abonner immédiatement !
    for (const remoteUser of client.remoteUsers) {
      if (remoteUser.hasVideo) {
        await client.subscribe(remoteUser, 'video');
        setTimeout(() => {
          const container = document.getElementById(containerId);
          if (container && remoteUser.videoTrack) {
            container.innerHTML = '';
            remoteUser.videoTrack.play(containerId, { fit: 'cover' });
          }
        }, 100);
      }
      if (remoteUser.hasAudio) {
        await client.subscribe(remoteUser, 'audio');
        remoteUser.audioTrack?.play();
      }
    }

    return { client, error: null };
  } catch (error) {
    console.error('Erreur connexion Player Acheteur Agora:', error);
    return { client: null, error: 'Impossible de se connecter au direct vidéo Agora.' };
  }
}

/**
 * Permutation dynamique de caméra (Avant / Arrière)
 */
export async function toggleCameraFacingMode(videoTrack, currentFacingMode) {
  if (!videoTrack) return currentFacingMode;

  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

  try {
    if (typeof videoTrack.setFacingMode === 'function') {
      await videoTrack.setFacingMode(newFacingMode);
      return newFacingMode;
    }

    // En cas d'indisponibilité de setFacingMode, utiliser setDevice avec la liste des caméras
    const cameras = await AgoraRTC.getCameras();
    if (cameras.length > 1) {
      const activeLabel = videoTrack.getTrackLabel();
      const targetCam = cameras.find(c => c.label !== activeLabel) || cameras[1];
      if (targetCam) {
        await videoTrack.setDevice(targetCam.deviceId);
      }
    }
    return newFacingMode;
  } catch (err) {
    console.error('Erreur permutation de caméra:', err);
    return currentFacingMode;
  }
}
