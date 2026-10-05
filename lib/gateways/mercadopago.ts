import { PaymentGateway, ProcessPaymentInput, ProcessPaymentResult } from './types';
import { onlyNumbers } from '../utils';

export class MercadoPagoGateway implements PaymentGateway {
  name = 'mercadopago';
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken && this.accessToken.trim().length > 10);
  }

  async processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    if (!this.isConfigured()) {
      throw new Error('MP_ACCESS_TOKEN não configurado no .env.local');
    }

    const cleanCpf = onlyNumbers(input.customer.cpf);
    const cleanPhone = onlyNumbers(input.customer.phone);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. FLUXO CARTÃO DE CRÉDITO SEM TOKEN DO FRONTEND: CRIAR PREFERÊNCIA MERCADO PAGO
    // Com restrição estrita no backend: payment_methods.installments = 3
    if (input.paymentMethod === 'credit_card' && !input.cardData?.token) {
      const preferencePayload = {
        items: [
          {
            id: input.orderId,
            title: `${input.product.name} - ${input.product.kitName}`,
            description: `Pedido #${input.orderId} • Entrega com Frete Grátis`,
            quantity: 1,
            unit_price: Number(input.amount.toFixed(2)),
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: input.customer.name.trim().split(' ')[0],
          surname: input.customer.name.trim().split(' ').slice(1).join(' ') || 'Cliente',
          email: input.customer.email.trim(),
          phone: {
            area_code: cleanPhone.substring(0, 2) || '11',
            number: cleanPhone.substring(2) || '999999999',
          },
          identification: {
            type: 'CPF',
            number: cleanCpf,
          },
          address: {
            street_name: input.address.street,
            street_number: Number(onlyNumbers(input.address.number)) || 0,
            zip_code: onlyNumbers(input.address.cep),
          },
        },
        payment_methods: {
          installments: 3, // Restrição estrita de no máximo 3 parcelas
          default_installments: 1,
        },
        external_reference: input.orderId,
        statement_descriptor: 'PROJETO DROP',
        ...(appUrl.startsWith('https://')
          ? {
              back_urls: {
                success: `${appUrl}/?status=paid&order_id=${input.orderId}`,
                pending: `${appUrl}/?status=pending&order_id=${input.orderId}`,
                failure: `${appUrl}/?status=failure&order_id=${input.orderId}`,
              },
              auto_return: 'approved',
            }
          : {}),
      };

      const prefResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(preferencePayload),
      });

      const prefData = await prefResponse.json();

      if (!prefResponse.ok) {
        console.error('Erro ao criar preferência no Mercado Pago:', prefData);
        throw new Error(prefData.message || 'Falha ao gerar link seguro de pagamento do Mercado Pago');
      }

      return {
        success: true,
        status: 'pending',
        transactionId: String(prefData.id),
        gateway: 'mercadopago',
        message: 'Preferência gerada no Mercado Pago (até 3x sem juros)',
        checkoutUrl: prefData.init_point || prefData.sandbox_init_point,
      };
    }

    // 2. FLUXO PIX OU CARTÃO COM TOKEN: CHAMADA DIRETA /v1/payments
    const body: Record<string, unknown> = {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: `${input.product.name} - ${input.product.kitName}`,
      payment_method_id: input.paymentMethod === 'pix' ? 'pix' : 'credit_card',
      payer: {
        email: input.customer.email,
        first_name: input.customer.name.trim().split(' ')[0],
        last_name: input.customer.name.trim().split(' ').slice(1).join(' ') || 'Cliente',
        identification: {
          type: 'CPF',
          number: cleanCpf,
        },
        address: {
          zip_code: onlyNumbers(input.address.cep),
          street_name: input.address.street,
          street_number: input.address.number,
          neighborhood: input.address.neighborhood,
          city: input.address.city,
          federal_unit: input.address.state.toUpperCase(),
        },
      },
      external_reference: input.orderId,
    };

    if (input.paymentMethod === 'credit_card' && input.cardData?.token) {
      body.token = input.cardData.token;
      // Restrição estrita de no máximo 3 parcelas
      body.installments = Math.min(Math.max(Number(input.cardData.installments || 1), 1), 3);
      body.payment_methods = {
        installments: 3,
        default_installments: 1,
      };
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'X-Idempotency-Key': input.orderId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Mercado Pago:', data);
      throw new Error(data.message || 'Falha ao processar pagamento com Mercado Pago');
    }

    const isApproved = data.status === 'approved';
    const isPending = data.status === 'pending' || data.status === 'in_process';

    const qrCodeData = data.point_of_interaction?.transaction_data;

    return {
      success: true,
      status: isApproved ? 'paid' : isPending ? 'pending' : 'cancelled',
      transactionId: String(data.id),
      gateway: 'mercadopago',
      message: data.status_detail,
      pixCopyPaste: qrCodeData?.qr_code,
      qrCodeBase64: qrCodeData?.qr_code_base64
        ? `data:image/png;base64,${qrCodeData.qr_code_base64}`
        : undefined,
      qrCode: qrCodeData?.qr_code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData.qr_code)}`
        : undefined,
    };
  }

  async handleWebhook(payload: unknown): Promise<{ processed: boolean; orderId?: string; status?: 'paid' | 'cancelled' }> {
    const data = payload as { type?: string; action?: string; data?: { id?: string } };
    if (data.type === 'payment' || data.action === 'payment.updated') {
      const paymentId = data.data?.id;
      if (!paymentId) return { processed: false };

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (res.ok) {
        const payment = await res.json();
        const orderId = payment.external_reference;
        const status = payment.status === 'approved' ? 'paid' : 'cancelled';
        return { processed: true, orderId, status };
      }
    }
    return { processed: false };
  }
}
