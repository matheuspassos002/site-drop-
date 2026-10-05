import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json({ error: 'ID do pedido obrigatório' }, { status: 400 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.payment.status,
      method: order.payment.method,
      amount: order.product.amount,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Erro ao consultar status do pedido:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
