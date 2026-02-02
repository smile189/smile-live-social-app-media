
/**
 * stripe driver 
 * @author  BM
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY missing key!');
}

// init stripe business
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

  apiVersion: '2025-01-27', 
  typescript: true,
  appInfo: {
    name: "SaaS-ul-Meu-Forza",
    version: "1.0.0",
  },
});
