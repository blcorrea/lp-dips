import { loadStripe, Stripe } from '@stripe/stripe-js';

// This is your test publishable API key
// For production, use environment variables
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51QTjUQB0VgFN6nMaPiVEtLHO9Gm2VN5nRJM4Eb3iLHnEy0GW6GKf7jF0qOH2RjY0nM3EKn3R8r1F1I0K9eY7E0K900TqR1E1E1'; // Demo test key

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Payment method types for display
export const PAYMENT_METHODS = {
  card: {
    label: 'Credit/Debit Card',
    icon: '💳',
    supported: true
  },
  paypal: {
    label: 'PayPal',
    icon: '🅿️',
    supported: false // Mock for POC
  },
  apple_pay: {
    label: 'Apple Pay',
    icon: '🍎',
    supported: true // Via Stripe
  },
  google_pay: {
    label: 'Google Pay',
    icon: 'G',
    supported: true // Via Stripe
  },
  klarna: {
    label: 'Klarna',
    icon: 'K',
    supported: false // Mock for POC
  },
  afterpay: {
    label: 'Afterpay',
    icon: 'A',
    supported: false // Mock for POC
  }
} as const;

export type PaymentMethodType = keyof typeof PAYMENT_METHODS;
