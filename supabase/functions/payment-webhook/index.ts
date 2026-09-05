// ============================================================================
// SUPABASE EDGE FUNCTION - PAYMENT WEBHOOK (MOBILE MONEY CI: WAVE / OM / MTN / MOOV)
// Location: supabase/functions/payment-webhook/index.ts
// ============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const WEBHOOK_SECRET = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || 'secret_key_djagoba_ci_2026';

// Client Supabase avec clé Service Role (Admin) pour bypasser la RLS lors de la mise à jour système
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Vérifier la signature HMAC SHA-256 du Webhook (anti-fraude)
 */
async function verifyHmacSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  
  try {
    const keyBuffer = new TextEncoder().encode(WEBHOOK_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const dataBuffer = new TextEncoder().encode(rawBody);
    const signatureBytes = hexToBytes(signatureHeader);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBuffer
    );
  } catch (err) {
    console.error('Erreur vérification signature HMAC:', err);
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

serve(async (req: Request) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-webhook-signature') || req.headers.get('x-pay-signature');

    // 1. Contrôle Anti-Fraude : Vérification HMAC
    const isSignatureValid = await verifyHmacSignature(rawBody, signatureHeader);
    if (!isSignatureValid && Deno.env.get('ENVIRONMENT') === 'production') {
      console.error('⚠️ ALERTE SÉCURITÉ: Signature Webhook invalide ou corrompue !');
      return new Response(JSON.stringify({ error: 'Signature invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(rawBody);
    console.log('📦 Webhook Paiement Reçu:', payload);

    const {
      order_id,
      transaction_id,
      status, // 'SUCCESS', 'FAILED', 'CANCELLED'
      amount_xof,
      payment_method, // 'wave', 'orange_money', 'mtn', 'moov'
    } = payload;

    if (!order_id || !status) {
      return new Response(JSON.stringify({ error: 'Données de payload incomplètes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Traitement du paiement réussi
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      
      // a) Récupérer la commande pour vérifier l'état courant et l'ID produit
      const { data: order, error: orderFetchErr } = await supabaseAdmin
        .from('orders')
        .select('id, product_id, amount_xof, payment_status')
        .eq('id', order_id)
        .single();

      if (orderFetchErr || !order) {
        console.error(`Commande introuvable N°: ${order_id}`, orderFetchErr);
        return new Response(JSON.stringify({ error: 'Commande non trouvée' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Protection contre les répétitions (Idempotence)
      if (order.payment_status === 'paid') {
        console.log(`Commande N° ${order_id} déjà marquée comme payée.`);
        return new Response(JSON.stringify({ success: true, message: 'Déjà traité' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // b) Mettre à jour la commande : payment_status = 'paid'
      const { error: updateOrderErr } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
        })
        .eq('id', order_id);

      if (updateOrderErr) {
        console.error('Erreur mise à jour statut commande:', updateOrderErr);
        throw updateOrderErr;
      }

      // c) Décrémenter le stock du produit en question
      if (order.product_id) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', order.product_id)
          .single();

        if (product && product.stock_quantity > 0) {
          await supabaseAdmin
            .from('products')
            .update({ stock_quantity: Math.max(0, product.stock_quantity - 1) })
            .eq('id', order.product_id);
        }
      }

      console.log(`✅ SUCCÈS: Commande ${order_id} validée et stock décrémenté.`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Paiement Mobile Money validé avec succès',
          order_id,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } 
    else if (status === 'FAILED' || status === 'CANCELLED') {
      // Mettre à jour le statut en 'failed'
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order_id);

      console.log(`❌ Échec de paiement notifié pour la commande ${order_id}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Échec de paiement enregistré' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, message: 'Statut ignoré' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Erreur serveur Webhook:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erreur interne' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
