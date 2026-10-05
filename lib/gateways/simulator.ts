import { PaymentGateway, ProcessPaymentInput, ProcessPaymentResult } from './types';

export class SimulatorGateway implements PaymentGateway {
  name = 'simulator';

  isConfigured(): boolean {
    return true; // Sempre disponível para testes e fallback
  }

  async processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    // Simula uma leve latência de rede realista (250ms)
    await new Promise((resolve) => setTimeout(resolve, 250));

    const transactionId = `sim_tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (input.paymentMethod === 'credit_card') {
      // No simulador, cartão de crédito é aprovado instantaneamente
      return {
        success: true,
        status: 'paid',
        transactionId,
        gateway: 'simulator',
        message: 'Pagamento aprovado com sucesso via Cartão de Crédito (Modo Simulação)',
      };
    }

    // Para PIX, geramos uma chave copia-e-cola formatada e QR code simulado
    const pixCopyPaste = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${input.amount.toFixed(2)}5802BR5915PROJETO DROP6009SAO PAULO62070503***6304ABCD`;

    return {
      success: true,
      status: 'pending',
      transactionId,
      gateway: 'simulator',
      message: 'Cobrança PIX gerada com sucesso (Modo Simulação)',
      pixCopyPaste,
      // Usamos uma imagem de QR Code pública ou gerada via data-uri
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCopyPaste)}`,
    };
  }

  async handleWebhook(payload: unknown): Promise<{ processed: boolean; orderId?: string; status?: 'paid' | 'cancelled' }> {
    const data = payload as { orderId?: string; status?: 'paid' | 'cancelled' };
    return {
      processed: true,
      orderId: data.orderId,
      status: data.status || 'paid',
    };
  }
}
