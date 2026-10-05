import { NextRequest, NextResponse } from 'next/server';
import { createOrder, updateOrderStatus } from '@/lib/db';
import { getPaymentGateway } from '@/lib/gateways';
import { isValidCPF, isValidPhone } from '@/lib/utils';
import { PRODUCT_CONFIG } from '@/config/product';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customer,
      address,
      kitId,
      selectedSize,
      size,
      paymentMethod = 'pix',
      cardData,
    } = body;

    // 1. Validação de tamanho obrigatório
    const finalSize = selectedSize || size;
    if (!finalSize || !['P', 'M', 'G', 'GG'].includes(String(finalSize).toUpperCase().trim())) {
      return NextResponse.json(
        { error: 'Por favor, selecione um tamanho válido (P, M, G ou GG) para o seu kit.' },
        { status: 400 }
      );
    }

    // 2. Validação básica de campos obrigatórios para fulfillment
    if (!customer?.name || !customer?.cpf || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos (Nome, CPF, WhatsApp e E-mail são obrigatórios).' },
        { status: 400 }
      );
    }

    if (!isValidCPF(customer.cpf)) {
      return NextResponse.json(
        { error: 'CPF inválido. Por favor, verifique os dígitos informados.' },
        { status: 400 }
      );
    }

    // Validação estrita de WhatsApp com DDD brasileiro (11 dígitos com 9)
    if (!isValidPhone(customer.phone)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Informe o número com DDD e 9 dígitos no formato (DDD) 9XXXX-XXXX.' },
        { status: 400 }
      );
    }

    if (!address?.cep || !address?.street || !address?.number || !address?.neighborhood || !address?.city || !address?.state) {
      return NextResponse.json(
        { error: 'Endereço incompleto. CEP, Rua, Número, Bairro, Cidade e UF são obrigatórios.' },
        { status: 400 }
      );
    }

    // 3. Busca o kit selecionado e calcula valor com 10% de desconto no PIX
    const selectedKit = PRODUCT_CONFIG.kits.find((k) => k.id === kitId) || PRODUCT_CONFIG.kits[0];
    const variationDesc = `Tamanho ${finalSize.toUpperCase()} • Cores Lisas Sortidas`;

    const isPix = paymentMethod === 'pix';
    const orderAmount = isPix
      ? Number((selectedKit.price * 0.9).toFixed(2))
      : Number(selectedKit.price.toFixed(2));

    // 4. Salva o pedido inicial no banco de dados local
    const order = await createOrder({
      customer: {
        name: customer.name.trim(),
        cpf: customer.cpf.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim().toLowerCase(),
      },
      address: {
        cep: address.cep.trim(),
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement?.trim() || '',
        neighborhood: address.neighborhood.trim(),
        city: address.city.trim(),
        state: address.state.trim().toUpperCase(),
      },
      product: {
        name: PRODUCT_CONFIG.name,
        kitId: selectedKit.id,
        kitName: selectedKit.name,
        variation: variationDesc,
        quantity: selectedKit.quantity,
        amount: orderAmount,
      },
      payment: {
        method: paymentMethod,
        status: 'pending',
        gateway: 'unknown',
      },
    });

    // 5. Processa o pagamento através do gateway (Mercado Pago oficial)
    const gateway = getPaymentGateway();

    const paymentResult = await gateway.processPayment({
      orderId: order.id,
      amount: orderAmount,
      paymentMethod,
      customer: order.customer,
      address: order.address,
      product: {
        name: order.product.name,
        kitName: `${order.product.kitName} (${variationDesc})`,
        quantity: order.product.quantity,
      },
      cardData: cardData
        ? {
            ...cardData,
            installments: Math.min(Math.max(Number(cardData.installments || 1), 1), 3),
          }
        : undefined,
    });

    // 6. Atualiza o status do pedido com os dados de retorno do gateway
    const updatedStatus = paymentResult.status === 'paid' ? 'paid' : 'pending';
    await updateOrderStatus(
      order.id,
      updatedStatus,
      undefined,
      paymentResult.gateway,
      paymentResult.transactionId
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: updatedStatus,
      gateway: paymentResult.gateway,
      message: paymentResult.message,
      pixCopyPaste: paymentResult.pixCopyPaste,
      qrCode: paymentResult.qrCode,
      qrCodeBase64: paymentResult.qrCodeBase64,
      checkoutUrl: paymentResult.checkoutUrl,
      amount: orderAmount,
    });
  } catch (error: unknown) {
    console.error('Erro na rota de checkout:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao processar pedido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
