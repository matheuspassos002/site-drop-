import { PaymentGateway } from './types';
import { SimulatorGateway } from './simulator';
import { MercadoPagoGateway } from './mercadopago';
import { StripeGateway } from './stripe';

export function getPaymentGateway(): PaymentGateway {
  const provider = (process.env.GATEWAY_PROVIDER || '').toLowerCase().trim();

  if (provider === 'mercadopago') {
    const mp = new MercadoPagoGateway();
    if (mp.isConfigured()) return mp;
    console.warn('[GATEWAY] Mercado Pago selecionado, porém chaves ausentes. Alternando para Modo Simulação.');
  }

  if (provider === 'stripe') {
    const stripe = new StripeGateway();
    if (stripe.isConfigured()) return stripe;
    console.warn('[GATEWAY] Stripe selecionado, porém chaves ausentes. Alternando para Modo Simulação.');
  }

  // Tenta detectar automaticamente se alguma chave foi fornecida
  const mpAuto = new MercadoPagoGateway();
  if (mpAuto.isConfigured()) return mpAuto;

  const stripeAuto = new StripeGateway();
  if (stripeAuto.isConfigured()) return stripeAuto;

  // Fallback padrão: Simulador Sandbox garantido
  return new SimulatorGateway();
}

export * from './types';
