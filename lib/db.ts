import fs from 'fs/promises';
import path from 'path';

export interface OrderCustomer {
  name: string;
  cpf: string;
  phone: string;
  email: string;
}

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface OrderProduct {
  name: string;
  kitId: string;
  kitName: string;
  variation?: string;
  quantity: number;
  amount: number;
}

export interface OrderPayment {
  method: 'pix' | 'credit_card';
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  gateway: string;
  gatewayTransactionId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCopyPaste?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  address: OrderAddress;
  product: OrderProduct;
  payment: OrderPayment;
  trackingCode?: string;
  shippedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Diretório já existe
  }

  try {
    await fs.access(ORDERS_FILE);
  } catch {
    // Cria arquivo com array vazio se não existir
    await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Retorna todos os pedidos ordenados por data decrescente
 */
export async function getOrders(): Promise<Order[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const orders: Order[] = JSON.parse(data);
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao ler base de pedidos:', error);
    return [];
  }
}

/**
 * Busca um pedido específico pelo ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * Cria um novo pedido na base
 */
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Promise<Order> {
  await ensureDataDir();
  const orders = await getOrders();

  const newOrder: Order = {
    ...data,
    id: `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return newOrder;
}

/**
 * Atualiza o status e/ou código de rastreio de um pedido
 */
export async function updateOrderStatus(
  id: string,
  status: Order['payment']['status'],
  trackingCode?: string,
  gateway?: string,
  gatewayTransactionId?: string
): Promise<Order | null> {
  await ensureDataDir();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) return null;

  orders[index].payment.status = status;

  if (gateway) {
    orders[index].payment.gateway = gateway;
  }

  if (gatewayTransactionId) {
    orders[index].payment.gatewayTransactionId = gatewayTransactionId;
  }

  if (trackingCode !== undefined) {
    orders[index].trackingCode = trackingCode;
  }

  if (status === 'shipped' && !orders[index].shippedAt) {
    orders[index].shippedAt = new Date().toISOString();
  }

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return orders[index];
}
