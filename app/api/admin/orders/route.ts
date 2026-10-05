import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrderStatus } from '@/lib/db';

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET || process.env.ADMIN_SECRET_KEY || 'admin123';
  const headerKey = req.headers.get('x-admin-key');
  const cookieKey = req.cookies.get('admin_session')?.value;

  return headerKey === adminKey || cookieKey === adminKey;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { orderId, status, trackingCode } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId e status são obrigatórios' }, { status: 400 });
    }

    const updated = await updateOrderStatus(orderId, status, trackingCode);

    if (!updated) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
