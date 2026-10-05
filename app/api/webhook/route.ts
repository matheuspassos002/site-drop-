import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/gateways';
import { updateOrderStatus } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const gateway = getPaymentGateway();

    const result = await gateway.handleWebhook(payload, req.headers);

    if (result.processed && result.orderId && result.status) {
      await updateOrderStatus(result.orderId, result.status);
      console.log(`[WEBHOOK] Pedido #${result.orderId} atualizado para ${result.status}`);
      return NextResponse.json({ received: true, updated: true });
    }

    return NextResponse.json({ received: true, updated: false });
  } catch (error) {
    console.error('Erro no webhook de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 400 });
  }
}
