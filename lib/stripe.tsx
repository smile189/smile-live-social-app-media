
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

  apiVersion: '2026', 
  typescript: true,
  appInfo: {
    name: "smileliveapp.com stripe payments",
    version: "1.13.0",
  },
});
