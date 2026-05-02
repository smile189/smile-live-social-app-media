// app/api/stripe/create-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// ─── PACHETE ──────────────────────────────────────────────────────────────────

export const COIN_PACKAGES = [
  { id: "pack_500",   coins: 500,   eur: 99,   usd: 99,   ron: 499,  label: "Starter",  popular: false },
  { id: "pack_1000",  coins: 1000,  eur: 199,  usd: 199,  ron: 999,  label: "Basic",    popular: false },
  { id: "pack_5000",  coins: 5000,  eur: 499,  usd: 499,  ron: 2499, label: "Pro",      popular: false },
  { id: "pack_10000", coins: 10000, eur: 999,  usd: 999,  ron: 4999, label: "Elite",    popular: true  },
  { id: "pack_25000", coins: 25000, eur: 2499, usd: 2499, ron: 12499,label: "Premium",  popular: false },
  { id: "pack_50000", coins: 50000, eur: 4499, usd: 4499, ron: 22499,label: "Ultimate", popular: false },
];

export async function POST(req: NextRequest) {
  try {
    const { packageId, currency } = await req.json();

    // ── Validare pachet ──
    const pack = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // ── Validare currency ──
    const validCurrencies = ["eur", "usd", "ron"];
    const cur = (currency || "eur").toLowerCase();
    if (!validCurrencies.includes(cur)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // ── Auth ──
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", session.user.id)
      .single();

    // ── Preț în funcție de currency ──
    const priceMap: Record<string, number> = {
      eur: pack.eur,
      usd: pack.usd,
      ron: pack.ron,
    };
    const unitAmount = priceMap[cur];

    // ── Stripe Checkout Session ──
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: cur,
            unit_amount: unitAmount, // în cenți/bani
            product_data: {
              name: `${pack.coins.toLocaleString()} Smile Coins — ${pack.label}`,
              description: `Pachet ${pack.label} · ${pack.coins.toLocaleString()} coins pentru contul @${profile?.username || "user"}`,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/smile_rebrand-app.png`],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id:   session.user.id,
        package_id: pack.id,
        coins:     pack.coins.toString(),
        currency:  cur,
      },
      customer_email: session.user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/coins/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/app/coins`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("[STRIPE CREATE-CHECKOUT]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}