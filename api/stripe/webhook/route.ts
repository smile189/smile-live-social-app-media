// app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
   apiVersion: "2025-02-24.acacia", // Versiune actualizată pentru build
});

// Supabase service role client (bypass RLS) pentru webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
);

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[WEBHOOK] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // ── Handle events ──
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Verifică că plata e finalizată
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const userId  = session.metadata?.user_id;
    const coins   = parseInt(session.metadata?.coins || "0");
    const currency = session.metadata?.currency || "eur";

    if (!userId || !coins) {
      console.error("[WEBHOOK] Missing metadata:", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      // ── 1. Fetch current balance ──
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("coins_balance")
        .eq("user_id", userId)
        .maybeSingle();

      const currentBalance = wallet?.coins_balance ?? 0;
      const newBalance     = currentBalance + coins;

      // ── 2. Upsert wallet ──
      const { error: walletError } = await supabaseAdmin
        .from("wallets")
        .upsert(
          {
            user_id:       userId,
            coins_balance: newBalance,
            updated_at:    new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (walletError) throw walletError;

      // ── 3. Log tranzacție (FIX: Eliminat .then().catch() care bloca build-ul) ──
      try {
        await supabaseAdmin.from("coin_purchases").insert({
          user_id:          userId,
          coins_amount:     coins,
          amount_paid:      session.amount_total,
          currency:         currency,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          status:           "completed",
        });
      } catch (logErr) {
        // Ignorăm erorile aici dacă tabela nu există, conform logicii originale
        console.warn("[WEBHOOK] Log purchase table missing or error.");
      }

      console.log(`[WEBHOOK] ✓ Added ${coins} coins to user ${userId}. New balance: ${newBalance}`);

    } catch (err: any) {
      console.error("[WEBHOOK] DB Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// Configurația pentru Next.js App Router (bodyParser se dezactivează automat la req.text())
export const dynamic = "force-dynamic";
