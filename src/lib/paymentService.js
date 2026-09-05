// Service d'intégration des paiements Mobile Money Côte d'Ivoire (Wave, OM, MTN, Moov)

export const PAYMENT_METHODS = [
  {
    id: 'wave',
    name: 'Wave Mobile Money 🌊',
    shortName: 'Wave',
    icon: '🌊',
    color: 'bg-cyan-500',
    feePct: 0,
    description: 'Paiement instantané sans frais via l\'application Wave'
  },
  {
    id: 'orange_money',
    name: 'Orange Money 🟧',
    shortName: 'Orange Money',
    icon: '🟧',
    color: 'bg-orange-500',
    feePct: 1.0,
    description: 'Paiement sécurisé par validation USSD ou l\'app Max it'
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money 🟡',
    shortName: 'MTN MoMo',
    icon: '🟡',
    color: 'bg-yellow-400',
    feePct: 1.0,
    description: 'Validation rapide par notification Push MoMo'
  },
  {
    id: 'moov',
    name: 'Moov Money 🔵',
    shortName: 'Moov Money',
    icon: '🔵',
    color: 'bg-blue-600',
    feePct: 1.0,
    description: 'Paiement direct via compte Moov Money CI'
  }
];

/**
 * Initialiser une transaction Mobile Money
 */
export async function initiateMobileMoneyPayment({
  orderId,
  amountXOF,
  phoneNumber,
  customerName,
  paymentMethod, // 'wave' | 'orange_money' | 'mtn' | 'moov'
}) {
  // Simuler le délai réseau de l'agrégateur de paiement (Wave API / DigitalPaye)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const formattedPhone = phoneNumber.replace(/\s+/g, '');

  if (paymentMethod === 'wave') {
    // Redirection Deep Link Wave CI (Wave Launch URL)
    const waveCheckoutUrl = `https://wave.com/pay/?amount=${amountXOF}&phone=${formattedPhone}&client_reference=${orderId}`;
    return {
      success: true,
      transactionId: `WAVE-TX-${Date.now()}`,
      actionType: 'redirect',
      redirectUrl: waveCheckoutUrl,
      message: 'Redirection vers l\'application Wave pour validation...'
    };
  } else {
    // USSD / Push Notification Prompt (Orange Money, MTN, Moov)
    return {
      success: true,
      transactionId: `MOMO-TX-${Date.now()}`,
      actionType: 'prompt',
      message: `Une demande de confirmation de ${amountXOF.toLocaleString('fr-FR')} FCFA a été envoyée sur le numéro ${formattedPhone}. Entrez votre code secret pour valider.`
    };
  }
}
