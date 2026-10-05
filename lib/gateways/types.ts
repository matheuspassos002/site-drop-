export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  paymentMethod: 'pix' | 'credit_card';
  customer: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  product: {
    name: string;
    kitName: string;
    quantity: number;
  };
  cardData?: {
    token?: string;
    cardNumber?: string;
    cardHolder?: string;
    cardExpMonth?: string;
    cardExpYear?: string;
    cardCvv?: string;
    installments?: number;
  };
}

export interface ProcessPaymentResult {
  success: boolean;
  status: 'pending' | 'paid' | 'cancelled';
  transactionId: string;
  gateway: string;
  message?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCopyPaste?: string;
  checkoutUrl?: string;
}

export interface PaymentGateway {
  name: string;
  isConfigured(): boolean;
  processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult>;
  handleWebhook(payload: unknown, headers?: Headers): Promise<{ processed: boolean; orderId?: string; status?: 'paid' | 'cancelled' }>;
}
