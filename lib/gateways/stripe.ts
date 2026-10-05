import { PaymentGateway, ProcessPaymentInput, ProcessPaymentResult } from './types';

export class StripeGateway implements PaymentGateway {
  name = 'stripe';
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey && this.secretKey.startsWith('sk_'));
  }

  async processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    if (!this.isConfigured()) {
      throw new Error('STRIPE_SECRET_KEY não configurada ou inválida no .env.local');
    }

    // Criação de PaymentIntent na API do Stripe via HTTP direto (sem dependência pesada da SDK)
    const amountInCents = Math.round(input.amount * 100);

    const body = new URLSearchParams({
      amount: String(amountInCents),
      currency: 'brl',
      'payment_method_types[]': 'card',
      description: `${input.product.name} - ${input.product.kitName}`,
      'metadata[orderId]': input.orderId,
      'metadata[customerCpf]': input.customer.cpf,
      'metadata[customerPhone]': input.customer.phone,
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Stripe:', data);
      throw new Error(data.error?.message || 'Falha ao processar pagamento com Stripe');
    }

    return {
      success: true,
      status: data.status === 'succeeded' ? 'paid' : 'pending',
      transactionId: data.id,
      gateway: 'stripe',
      message: 'Pagamento iniciado via Stripe',
    };
  }

  async handleWebhook(payload: unknown): Promise<{ processed: boolean; orderId?: string; status?: 'paid' | 'cancelled' }> {
    const data = payload as { type?: string; data?: { object?: { metadata?: { orderId?: string }; status?: string } } };
    if (data.type === 'payment_intent.succeeded') {
      const orderId = data.data?.object?.metadata?.orderId;
      return { processed: true, orderId, status: 'paid' };
    }
    return { processed: false };
  }
}
