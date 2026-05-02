import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia", // FIX: Versiunea cerută de Next.js 16 build
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[WEBHOOK ERROR]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Supabase Service Role Client (pentru a trece de RLS când proiectul e blocat/revizie)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const coinsToAdd = parseInt(session.metadata?.coins || "0");

    if (userId && coinsToAdd > 0) {
      try {
        // 1. Adăugăm monedele în profilul userului
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("coins")
          .eq("id", userId)
          .single();

        if (fetchError) throw fetchError;

        const newBalance = (profile?.coins || 0) + coinsToAdd;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ coins: newBalance })
          .eq("id", userId);

        if (updateError) throw updateError;

        // 2. Înregistrăm tranzacția în istoric
        await supabaseAdmin.from("transactions").insert({
          user_id: userId,
          amount: coinsToAdd,
          type: "coin_purchase",
          status: "completed",
          stripe_session_id: session.id
        });

        console.log(`[SUCCESS] ${coinsToAdd} coins added to user ${userId}`);
      } catch (err: any) {
        console.error("[WEBHOOK DB ERROR]", err.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
