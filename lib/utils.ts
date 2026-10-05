/**
 * Formata um valor numérico para a moeda brasileira (BRL)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Remove qualquer caractere não numérico
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const digits = onlyNumbers(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Validação algorítmica básica de CPF
 */
export function isValidCPF(cpf: string): boolean {
  const clean = onlyNumbers(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Aplica máscara de telefone / WhatsApp: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const digits = onlyNumbers(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/**
 * Aplica máscara de CEP: 00000-000
 */
export function formatCEP(value: string): string {
  const digits = onlyNumbers(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/**
 * Gera texto formatado para cópia rápida no Mercado Livre, Shopee ou TikTok Shop
 */
export function formatMercadoLivreOrder(order: {
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
    variation?: string;
    quantity: number;
    amount: number;
  };
  id: string;
  createdAt: string;
}): string {
  const { customer, address, product, id } = order;
  const comp = address.complement ? ` - ${address.complement}` : '';

  return `--- DADOS DE ENVIO (SHOPEE / MERCADO LIVRE / TIKTOK SHOP) ---
Pedido ID: #${id.slice(-6).toUpperCase()}
Destinatário: ${customer.name}
CPF: ${customer.cpf}
WhatsApp: ${customer.phone}
E-mail: ${customer.email}

ENDEREÇO DE ENTREGA:
Rua/Av: ${address.street}, Nº ${address.number}${comp}
Bairro: ${address.neighborhood}
Cidade/UF: ${address.city} - ${address.state.toUpperCase()}
CEP: ${address.cep}

ITEM COMPRADO:
Produto: ${product.name}
Kit: ${product.kitName}
Variação/Tamanho: ${product.variation || 'Sortidas'}
--------------------------------------------------------------`;
}

/**
 * Valida formato de telefone móvel brasileiro (11 dígitos com DDD)
 */
export function isValidPhone(phone: string): boolean {
  const clean = onlyNumbers(phone);
  // Deve ter 11 dígitos, DDD entre 11 e 99, e o 3º dígito deve ser 9
  if (clean.length !== 11) return false;
  const ddd = parseInt(clean.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  return clean.charAt(2) === '9';
}

/**
 * Sanitiza o número e gera o link direto do WhatsApp (wa.me/55...)
 */
export function getSanitizedWhatsAppLink(phone: string, message: string): string {
  const digits = onlyNumbers(phone);
  // Se já tiver código do país 55 com 13 dígitos
  const clean = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/55${clean}?text=${encodedText}`;
}

/**
 * Formata o nome do kit de forma amigável para envio no WhatsApp (ex: "Kit 10 Cuecas Boxer")
 */
export function formatKitNameForWhatsApp(rawKitName: string, quantity?: number): string {
  if (quantity === 10 || rawKitName.includes('10')) {
    return 'Kit 10 Cuecas Boxer';
  }
  if (quantity === 5 || rawKitName.includes('5')) {
    return 'Kit 5 Cuecas Boxer';
  }
  return rawKitName.split('(')[0].trim();
}

/**
 * Templates padrão de mensagens para notificação de WhatsApp no Admin
 */
export const WHATSAPP_TEMPLATES = {
  confirmation: (name: string, kitName: string, city: string, uf: string) => {
    const firstName = name.trim().split(' ')[0];
    const friendlyKit = formatKitNameForWhatsApp(kitName);
    return `Olá, ${firstName}! Confirmamos seu pedido do ${friendlyKit}. Estamos preparando o envio para ${city}/${uf}.`;
  },
  tracking: (name: string, trackingCode: string) => {
    const firstName = name.trim().split(' ')[0];
    return `Olá, ${firstName}! Seu pedido já está a caminho. Código de rastreamento: ${trackingCode}.`;
  },
  postSale: (name: string) => {
    const firstName = name.trim().split(' ')[0];
    return `Olá, ${firstName}! Constatamos que seu kit chegou. O que achou da qualidade do produto?`;
  },
};

/**
 * Gera link direto para notificar o cliente via WhatsApp sobre o código de rastreamento
 */
export function getWhatsAppTrackingLink(
  phone: string,
  customerName: string,
  productName: string,
  trackingCode: string
): string {
  const message = WHATSAPP_TEMPLATES.tracking(customerName, trackingCode);
  return getSanitizedWhatsAppLink(phone, message);
}
