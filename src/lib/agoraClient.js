import AgoraRTC from 'agora-rtc-sdk-ng';

// Mode de débogage et niveau de logs Agora
AgoraRTC.setLogLevel(1);

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'demo_agora_app_id_djagoba';

/**
 * Créer une instance de client Agora RTC pour le Live Streaming WebRTC
 */
export function createAgoraClient(role = 'audience') {
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  client.setClientRole(role);
  return client;
}

/**
 * Service HÔTE / VENDEUR : Initialiser la caméra et le micro puis publier le flux WebRTC
 */
export async function startHostBroadcast({ appId, channel, token = null, uid = null, containerId }) {
  const client = createAgoraClient('host');
  let localAudioTrack = null;
  let localVideoTrack = null;
  let cameras = [];

  try {
    // 1. Demande de permissions et création des tracks audio/vidéo
    [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
      { encoderConfig: 'speech_standard' },
      { encoderConfig: '360p_1' } // Optimisé pour mobile 3G/4G
    );

    // 2. Rejoindre le canal Agora
    const assignedUid = await client.join(appId || AGORA_APP_ID, channel, token, uid);

    // 3. Afficher la vidéo locale dans l'élément DOM du Studio
    if (containerId && document.getElementById(containerId)) {
      localVideoTrack.play(containerId, { fit: 'cover' });
    }

    // 4. Publier les flux sur le réseau Agora
    await client.publish([localAudioTrack, localVideoTrack]);

    // 5. Récupérer la liste des caméras disponibles pour le basculement (Front/Back)
    cameras = await AgoraRTC.getCameras();

    return {
      client,
      localAudioTrack,
      localVideoTrack,
      assignedUid,
      cameras,
      error: null
    };
  } catch (error) {
    console.error('Erreur initialisation Studio Vendeur Agora:', error);
    
    let userFriendlyErrorMessage = 'Erreur lors de l\'accès à la caméra ou au microphone.';
    if (error.code === 'PERMISSION_DENIED' || error.name === 'NotAllowedError') {
      userFriendlyErrorMessage = 'Permission caméra/micro refusée. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
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
 * Service ACHETEUR / PLAYER : Rejoindre le canal et lire le flux WebRTC du Vendeur
 */
export async function startAudiencePlayer({ appId, channel, token = null, uid = null, containerId, onUserPublished, onUserUnpublished }) {
  const client = createAgoraClient('audience');

  try {
    // Callback quand le vendeur publie son flux vidéo/audio
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        if (containerId && document.getElementById(containerId)) {
          remoteVideoTrack.play(containerId, { fit: 'cover' });
        }
      }
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
      if (onUserPublished) onUserPublished(user, mediaType);
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (onUserUnpublished) onUserUnpublished(user, mediaType);
    });

    // Rejoindre le canal en mode spectateur
    await client.join(appId || AGORA_APP_ID, channel, token, uid);

    return { client, error: null };
  } catch (error) {
    console.error('Erreur connexion Player Acheteur Agora:', error);
    return { client: null, error: 'Impossible de se connecter au direct vidéo Agora.' };
  }
}

/**
 * Basculer entre caméra frontale et caméra arrière
 */
export async function switchCameraTrack(videoTrack, targetDeviceId) {
  if (!videoTrack || !targetDeviceId) return;
  try {
    await videoTrack.setDevice(targetDeviceId);
  } catch (err) {
    console.error('Erreur changement de caméra:', err);
  }
}
