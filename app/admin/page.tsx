'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Copy,
  Check,
  Truck,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Lock,
  LogOut,
  Send,
  Search,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  X,
  CreditCard,
  QrCode,
  ChevronDown,
} from 'lucide-react';
import { Order } from '@/lib/db';
import {
  formatBRL,
  formatMercadoLivreOrder,
  getSanitizedWhatsAppLink,
  WHATSAPP_TEMPLATES,
  onlyNumbers,
} from '@/lib/utils';

export default function AdminPage() {
  // Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Pedidos e Filtros
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'shipped'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Notificações de Cópia
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal de Despacho (Código de Rastreio)
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modal / Ação de Disparo WhatsApp em 1 Clique
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<Order | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<'confirmation' | 'tracking' | 'postSale'>('confirmation');
  const [customTrackingInput, setCustomTrackingInput] = useState('');
  const [quickWhatsAppMenuId, setQuickWhatsAppMenuId] = useState<string | null>(null);

  // Menu suspenso de Recompra no Fornecedor
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

  // Links de Recompra no Mercado Livre para Kit 5 e Kit 10
  const supplierKit5Url =
    process.env.NEXT_PUBLIC_SUPPLIER_KIT_5_URL ||
    'https://lista.mercadolivre.com.br/kit-5-cuecas-boxer-microfibra';
  const supplierKit10Url =
    process.env.NEXT_PUBLIC_SUPPLIER_KIT_10_URL ||
    'https://lista.mercadolivre.com.br/kit-10-cuecas-boxer-microfibra';

  // Busca lista de pedidos
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/orders')
      .then((res) => {
        if (res.status === 401) {
          if (active) setIsAuthenticated(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.orders && active) {
          setOrders(data.orders);
          setIsAuthenticated(true);
        }
      })
      .catch((err) => console.error('Erro ao carregar pedidos:', err));

    return () => {
      active = false;
    };
  }, []);

  // Handler de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: secretKeyInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Senha incorreta');
      }

      setIsAuthenticated(true);
      fetchOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Copiar dados formatados para Shopee / Mercado Livre / TikTok Shop
  const handleCopyForSupplier = (order: Order) => {
    const formatted = formatMercadoLivreOrder(order);
    navigator.clipboard.writeText(formatted);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Atualizar status do pedido
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: Order['payment']['status'],
    trackingCode?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingCode,
        }),
      });

      if (res.ok) {
        setShippingModalOrder(null);
        setTrackingCodeInput('');
        fetchOrders();
      }
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Gerar pedido de teste instantâneo de Cuecas Boxer
  const handleCreateMockOrder = async () => {
    setIsLoadingOrders(true);
    try {
      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: 'Carlos Eduardo da Silva',
            cpf: '111.222.333-44',
            phone: '(11) 99876-5432',
            email: 'carlos.eduardo@exemplo.com',
          },
          address: {
            cep: '01414-001',
            street: 'Rua Oscar Freire',
            number: '920',
            complement: 'Apto 402',
            neighborhood: 'Cerqueira César',
            city: 'São Paulo',
            state: 'SP',
          },
          kitId: 'kit-10',
          selectedSize: 'M',
          paymentMethod: 'pix',
        }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Erro ao gerar pedido teste:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Helper de Custo Fornecedor Estrito por Kit
  // Kit 5: R$ 45,00 | Kit 10: R$ 69,99
  const getOrderSupplierCost = (order: Order): number => {
    const kitId = order.product.kitId;
    const qty = order.product.quantity;
    if (kitId === 'kit-5' || qty === 5) return 45.0;
    if (kitId === 'kit-10' || qty === 10) return 69.99;
    return qty <= 5 ? 45.0 : 69.99;
  };

  // Helper de Taxa Estimada Gateway (Mercado Pago: PIX ~0.99%, Cartão ~3.99%)
  const getOrderGatewayFee = (order: Order): number => {
    const rate = order.payment.method === 'pix' ? 0.0099 : 0.0399;
    return order.product.amount * rate;
  };

  // Helper de Disparo WhatsApp com 1 Clique (Sanitização estrita)
  const openWhatsAppNotification = (
    order: Order,
    templateType: 'confirmation' | 'tracking' | 'postSale',
    overrideTracking?: string
  ) => {
    const { customer, address, product, trackingCode } = order;
    const cleanPhone = onlyNumbers(customer.phone);
    const tracking = overrideTracking || trackingCode || 'BR123456789ML';

    let message = '';
    if (templateType === 'confirmation') {
      message = WHATSAPP_TEMPLATES.confirmation(customer.name, product.kitName, address.city, address.state);
    } else if (templateType === 'tracking') {
      message = WHATSAPP_TEMPLATES.tracking(customer.name, tracking);
    } else if (templateType === 'postSale') {
      message = WHATSAPP_TEMPLATES.postSale(customer.name);
    }

    const url = getSanitizedWhatsAppLink(cleanPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // TELA DE LOGIN SE NÃO AUTENTICADO
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 text-white">
        <div className="w-full max-w-md rounded-3xl bg-neutral-900 p-8 shadow-2xl border border-yellow-500/30">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg mb-3">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black">Painel de Fulfillment</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Digite a chave mestre (<code className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-400 font-mono">ADMIN_SECRET_KEY</code>) para acessar a expedição.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-500/40 p-3 text-xs font-semibold text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1.5">
                Chave de Acesso Admin
              </label>
              <input
                type="password"
                required
                placeholder="Ex: admin123"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 py-3 text-sm font-black text-black shadow-md cursor-pointer transition-all"
            >
              {isLoggingIn ? 'Autenticando...' : 'Acessar Gestão de Pedidos'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CÁLCULOS FINANCEIROS E FILTROS CONSOLIDADOS
  const confirmedOrders = orders.filter(
    (o) => o.payment.status === 'paid' || o.payment.status === 'shipped'
  );

  const totalRevenue = confirmedOrders.reduce((acc, curr) => acc + curr.product.amount, 0);
  const totalSupplierCost = confirmedOrders.reduce((acc, curr) => acc + getOrderSupplierCost(curr), 0);
  const totalGatewayFee = confirmedOrders.reduce((acc, curr) => acc + getOrderGatewayFee(curr), 0);
  const netProfit = totalRevenue - totalSupplierCost - totalGatewayFee;
  const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const pendingCount = orders.filter((o) => o.payment.status === 'pending').length;
  const readyToShipCount = orders.filter((o) => o.payment.status === 'paid').length;
  const shippedCount = orders.filter((o) => o.payment.status === 'shipped').length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.payment.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.customer.cpf.includes(term) ||
        o.customer.phone.includes(term) ||
        o.address.city.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 pb-16 font-sans">
      {/* Top Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-black shadow-md">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">Fulfillment & Expedição</h1>
                <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2.5 py-0.5 text-[10px] font-black text-yellow-400">
                  Cuecas Boxer Microfibra
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Copie os dados em 1 clique para Mercado Livre / Shopee e notifique via WhatsApp
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* MENU SUSPENSO: ABRIR FORNECEDOR / RECOMPRA */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSupplierDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 px-3.5 py-2 text-xs font-black text-black shadow-md cursor-pointer transition-all active:scale-95"
                title="Abrir fornecedores do Mercado Livre para recompra"
              >
                <ShoppingBag className="h-4 w-4 fill-black" />
                <span>Abrir Fornecedor / Recompra</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isSupplierDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSupplierDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-neutral-900 border border-yellow-500/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-400 border-b border-neutral-800">
                    Recompra Direta no Mercado Livre
                  </div>
                  <a
                    href={supplierKit5Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsSupplierDropdownOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors cursor-pointer group mt-1"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-yellow-400">
                        [ Recomprar Kit 5 no ML ]
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Custo Base: R$ 45,00 / pacote
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-yellow-400" />
                  </a>

                  <a
                    href={supplierKit10Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsSupplierDropdownOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-yellow-400">
                        [ Recomprar Kit 10 no ML ]
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Custo Base: R$ 69,99 (Mais Vendido)
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-yellow-400" />
                  </a>
                </div>
              )}
            </div>

            {/* BOTÕES DIRETOS EXTERNOS */}
            <a
              href={supplierKit5Url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-neutral-800 border border-yellow-500/30 px-3 py-2 text-xs font-bold text-yellow-400 hover:bg-neutral-700 cursor-pointer shadow-md transition-all"
              title="Abrir anúncio do Kit 5 no Mercado Livre"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-yellow-400" />
              <span>Recomprar Kit 5 no ML</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <a
              href={supplierKit10Url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-neutral-800 border border-yellow-500/30 px-3 py-2 text-xs font-bold text-yellow-400 hover:bg-neutral-700 cursor-pointer shadow-md transition-all"
              title="Abrir anúncio do Kit 10 no Mercado Livre"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-yellow-400" />
              <span>Recomprar Kit 10 no ML</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={fetchOrders}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              type="button"
              onClick={handleCreateMockOrder}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-400 hover:bg-yellow-500/20 cursor-pointer transition-colors"
            >
              <span>+ Pedido Teste</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              title="Sair"
              className="rounded-xl border border-neutral-700 p-2 text-neutral-400 hover:bg-rose-900/30 hover:text-rose-400 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* CARDS DE GESTÃO DE MARGENS CONSOLIDADAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Faturamento Confirmado */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Faturamento Confirmado</span>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatBRL(totalRevenue)}
            </div>
            <span className="text-[11px] text-neutral-400">
              {confirmedOrders.length} pedido(s) confirmados
            </span>
          </div>

          {/* Custo Fornecedor Consolidado */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Custo Fornecedor</span>
              <ShoppingBag className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {formatBRL(totalSupplierCost)}
            </div>
            <span className="text-[11px] text-neutral-400">
              Kit 5: R$ 45,00 • Kit 10: R$ 69,99
            </span>
          </div>

          {/* Lucro Líquido Consolidado */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Lucro Líquido</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {formatBRL(netProfit)}
            </div>
            <span className="text-[11px] text-emerald-400/90 font-medium">
              Margem Líquida: {netMarginPercent.toFixed(1)}% (após taxas gateway)
            </span>
          </div>

          {/* Pedidos em Aberto / Pendentes */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Aguardando Envio</span>
              <Truck className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-yellow-400">
              {readyToShipCount}
            </div>
            <span className="text-[11px] text-neutral-400">
              {pendingCount} pendente(s) aguardando PIX
            </span>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(
              [
                { id: 'all', label: `Todos (${orders.length})` },
                { id: 'paid', label: `Prontos p/ Envio (${readyToShipCount})` },
                { id: 'pending', label: `Pendentes (${pendingCount})` },
                { id: 'shipped', label: `Enviados (${shippedCount})` },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === filter.id
                    ? 'bg-yellow-500 text-black shadow-md font-black'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, WhatsApp, CPF, cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-9 pr-4 py-2 text-xs text-white focus:border-yellow-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center shadow-lg">
            <Package className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Nenhum pedido localizado</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Quando clientes concluírem compras na vitrine ou quando você clicar em &quot;+ Pedido Teste&quot;, eles serão exibidos aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TABELA DE PEDIDOS COMPLETA (DESKTOP / TABLET) */}
            <div className="hidden lg:block overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl">
              <table className="w-full text-left text-xs text-neutral-200">
                <thead className="border-b border-neutral-800 bg-neutral-950/90 text-[11px] font-black uppercase tracking-wider text-yellow-400">
                  <tr>
                    <th className="py-4 px-4">Pedido / Data</th>
                    <th className="py-4 px-4">Cliente & WhatsApp</th>
                    <th className="py-4 px-4">Kit & Variação</th>
                    <th className="py-4 px-4">Financeiro & Lucro Bruto</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Ações de Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {filteredOrders.map((order) => {
                    const isCopied = copiedId === order.id;
                    const isPaid = order.payment.status === 'paid';
                    const isShipped = order.payment.status === 'shipped';
                    const isPending = order.payment.status === 'pending';

                    const supplierCost = getOrderSupplierCost(order);
                    const gatewayFee = getOrderGatewayFee(order);
                    const orderNetProfit = order.product.amount - supplierCost - gatewayFee;
                    const isKit5 = order.product.kitId === 'kit-5' || order.product.quantity === 5;
                    const mlReorderLink = isKit5 ? supplierKit5Url : supplierKit10Url;

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-neutral-850/60 transition-colors ${
                          isPaid ? 'bg-yellow-500/[0.02]' : ''
                        }`}
                      >
                        {/* 1. Pedido / Data */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-mono font-black text-yellow-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-[11px] block w-fit">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-1.5 leading-tight">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mt-1">
                            {order.payment.method === 'pix' ? (
                              <>
                                <QrCode className="h-3 w-3 text-yellow-400" /> PIX (10% OFF)
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3 text-yellow-400" /> Cartão (Até 3x)
                              </>
                            )}
                          </span>
                        </td>

                        {/* 2. Cliente & WhatsApp */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-white text-sm leading-tight">
                            {order.customer.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            CPF: {order.customer.cpf}
                          </div>
                          <div className="text-[11px] text-neutral-300 mt-1 flex items-center gap-1.5">
                            <span className="font-semibold text-emerald-400">
                              {order.customer.phone}
                            </span>
                            <button
                              type="button"
                              onClick={() => openWhatsAppNotification(order, 'confirmation')}
                              className="text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              title="Disparar confirmação rápida no WhatsApp"
                            >
                              Chamar
                            </button>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {order.address.city}/{order.address.state} • CEP {order.address.cep}
                          </div>
                        </td>

                        {/* 3. Kit & Variação */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-bold text-white block">
                            {order.product.kitName}
                          </span>
                          <span className="inline-block mt-1 text-[11px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-md">
                            {order.product.variation || 'Cores Lisas Sortidas'}
                          </span>
                          <a
                            href={mlReorderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-neutral-400 hover:text-yellow-400 flex items-center gap-1 mt-1.5 w-fit transition-colors"
                            title="Recomprar kit correspondente no Mercado Livre"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Link Anúncio ML</span>
                          </a>
                        </td>

                        {/* 4. Financeiro & Margens */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="text-xs">
                            <span className="text-neutral-400">Venda: </span>
                            <strong className="text-white font-black">{formatBRL(order.product.amount)}</strong>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Custo Fornecedor: <strong className="text-amber-300">{formatBRL(supplierCost)}</strong>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Taxa Gateway: {formatBRL(gatewayFee)}
                          </div>
                          <div className="mt-1.5 pt-1 border-t border-neutral-800 text-xs">
                            <span className="text-neutral-400">Lucro Bruto: </span>
                            <strong className="text-emerald-400 font-black text-sm">
                              {formatBRL(orderNetProfit)}
                            </strong>
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td className="py-4 px-4 align-top">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                : isShipped
                                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                                : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                            }`}
                          >
                            {isPaid ? 'Pago • Comprar no ML' : isShipped ? 'Enviado' : 'Pendente (PIX)'}
                          </span>
                          {isShipped && (
                            <div className="text-[11px] font-mono text-neutral-300 mt-1.5">
                              Rastreio: <span className="text-yellow-400 font-bold">{order.trackingCode || 'S/ código'}</span>
                            </div>
                          )}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'paid')}
                              className="mt-1.5 block text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                            >
                              Simular Aprovação
                            </button>
                          )}
                        </td>

                        {/* 6. COLUNA DE AÇÕES DE FULFILLMENT */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1.5 items-end">
                            {/* BOTÃO NOTIFICAR WHATSAPP COM MENU RÁPIDO */}
                            <div className="relative">
                              <div className="inline-flex rounded-xl shadow-md">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWhatsAppModalOrder(order);
                                    setActiveTemplate(isShipped ? 'tracking' : 'confirmation');
                                    setCustomTrackingInput(order.trackingCode || '');
                                  }}
                                  className="flex items-center gap-1.5 rounded-l-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white cursor-pointer transition-colors"
                                  title="Notificar WhatsApp do Cliente"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>Notificar WhatsApp</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuickWhatsAppMenuId(
                                      quickWhatsAppMenuId === order.id ? null : order.id
                                    )
                                  }
                                  className="rounded-r-xl bg-emerald-700 hover:bg-emerald-600 px-1.5 py-1.5 text-white border-l border-emerald-800 cursor-pointer transition-colors"
                                  title="Opções rápidas de mensagem WhatsApp"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Menu Rápido Dropdown de WhatsApp */}
                              {quickWhatsAppMenuId === order.id && (
                                <div className="absolute right-0 mt-1 w-64 rounded-2xl bg-neutral-900 border border-yellow-500/40 shadow-2xl p-2 z-50 animate-in fade-in duration-100 text-left">
                                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400 border-b border-neutral-800">
                                    Disparo Direto em 1 Clique
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openWhatsAppNotification(order, 'confirmation');
                                      setQuickWhatsAppMenuId(null);
                                    }}
                                    className="w-full text-left p-2 rounded-xl hover:bg-neutral-800 text-xs text-neutral-200 hover:text-white transition-colors cursor-pointer mt-1"
                                  >
                                    <div className="font-bold text-emerald-400">1. Confirmação & Previsão</div>
                                    <div className="text-[10px] text-neutral-400">Prepara envio p/ {order.address.city}</div>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openWhatsAppNotification(order, 'tracking');
                                      setQuickWhatsAppMenuId(null);
                                    }}
                                    className="w-full text-left p-2 rounded-xl hover:bg-neutral-800 text-xs text-neutral-200 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <div className="font-bold text-emerald-400">2. Código de Rastreio</div>
                                    <div className="text-[10px] text-neutral-400">Pedido já a caminho</div>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openWhatsAppNotification(order, 'postSale');
                                      setQuickWhatsAppMenuId(null);
                                    }}
                                    className="w-full text-left p-2 rounded-xl hover:bg-neutral-800 text-xs text-neutral-200 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <div className="font-bold text-emerald-400">3. Pós-Venda (Chegada)</div>
                                    <div className="text-[10px] text-neutral-400">O que achou da qualidade?</div>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* BOTÃO COPIAR DADOS DE ENVIO */}
                            <button
                              type="button"
                              onClick={() => handleCopyForSupplier(order)}
                              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all shadow-md cursor-pointer w-full justify-center ${
                                isCopied
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                  : 'bg-yellow-500 text-black hover:bg-yellow-600'
                              }`}
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{isCopied ? 'Copiado! ✅' : 'Copiar Dados de Envio'}</span>
                            </button>

                            {/* MARCAR ENVIADO */}
                            {!isShipped && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShippingModalOrder(order);
                                  setTrackingCodeInput('');
                                }}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3 py-1 text-[11px] font-bold text-neutral-300 cursor-pointer transition-colors w-full"
                              >
                                <Send className="h-3 w-3 text-neutral-400" />
                                <span>Marcar como Enviado</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CARDS RESPONSIVOS PARA MOBILE (TELAS MENORES QUE LG) */}
            <div className="lg:hidden space-y-4">
              {filteredOrders.map((order) => {
                const isCopied = copiedId === order.id;
                const isPaid = order.payment.status === 'paid';
                const isShipped = order.payment.status === 'shipped';
                const isPending = order.payment.status === 'pending';

                const supplierCost = getOrderSupplierCost(order);
                const gatewayFee = getOrderGatewayFee(order);
                const orderNetProfit = order.product.amount - supplierCost - gatewayFee;
                const isKit5 = order.product.kitId === 'kit-5' || order.product.quantity === 5;
                const mlReorderLink = isKit5 ? supplierKit5Url : supplierKit10Url;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border bg-neutral-900/90 p-5 shadow-lg transition-all ${
                      isPaid ? 'border-yellow-400/60 ring-2 ring-yellow-500/20' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-yellow-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                              : isShipped
                              ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                              : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                          }`}
                        >
                          {isPaid ? 'Pago' : isShipped ? 'Enviado' : 'Pendente (PIX)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="font-bold text-white text-sm">{order.customer.name}</div>
                        <div className="text-neutral-400">CPF: {order.customer.cpf}</div>
                        <div className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span>WhatsApp: {order.customer.phone}</span>
                          <button
                            type="button"
                            onClick={() => openWhatsAppNotification(order, 'confirmation')}
                            className="text-[10px] font-bold text-white bg-emerald-700 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Chamar
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800/80">
                        <div className="font-bold text-white">{order.product.kitName}</div>
                        <div className="text-yellow-400 text-[11px]">{order.product.variation}</div>
                        <div className="text-neutral-400 text-[11px] mt-1">
                          {order.address.street}, Nº {order.address.number} - {order.address.city}/{order.address.state}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Venda: {formatBRL(order.product.amount)}</span>
                          <span className="text-amber-300 font-bold block text-[11px]">Custo ML: {formatBRL(supplierCost)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-400 block text-[10px]">Lucro Bruto:</span>
                          <span className="text-emerald-400 font-black text-sm block">{formatBRL(orderNetProfit)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações Mobile */}
                    <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setWhatsAppModalOrder(order);
                          setActiveTemplate(isShipped ? 'tracking' : 'confirmation');
                          setCustomTrackingInput(order.trackingCode || '');
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-black text-white shadow-md cursor-pointer transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Notificar WhatsApp</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyForSupplier(order)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black transition-all shadow-md cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-yellow-500 text-black hover:bg-yellow-600'
                          }`}
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{isCopied ? 'Copiado!' : 'Copiar Envio'}</span>
                        </button>

                        <a
                          href={mlReorderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-800 border border-yellow-500/30 py-2 px-3 text-xs font-bold text-yellow-400 hover:bg-neutral-700 cursor-pointer"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Recomprar ML</span>
                        </a>
                      </div>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'paid')}
                          className="w-full text-center py-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-500/20 transition-colors"
                        >
                          Simular Aprovação de Pagamento
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE NOTIFICAÇÃO DE WHATSAPP EM 1 CLIQUE */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 p-6 shadow-2xl border border-yellow-500/40 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Disparo Automático no WhatsApp</h3>
                  <p className="text-xs text-neutral-400">
                    {whatsAppModalOrder.customer.name} • {whatsAppModalOrder.customer.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Seleção do Template */}
            <div className="space-y-3 mb-4">
              <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Selecione o Modelo da Mensagem:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTemplate('confirmation')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTemplate === 'confirmation'
                      ? 'border-yellow-500 bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-black text-white">1. Confirmação</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Envio & Previsão</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplate('tracking')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTemplate === 'tracking'
                      ? 'border-yellow-500 bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-black text-white">2. Rastreamento</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Código a Caminho</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplate('postSale')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTemplate === 'postSale'
                      ? 'border-yellow-500 bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-black text-white">3. Pós-Venda</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Feedback Produto</div>
                </button>
              </div>

              {activeTemplate === 'tracking' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Código de Rastreamento a Enviar:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BR123456789ML"
                    value={customTrackingInput}
                    onChange={(e) => setCustomTrackingInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white focus:border-yellow-400 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              {/* Preview em estilo Balão WhatsApp */}
              <div className="mt-3 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Prévia da Mensagem a ser Aberta no WhatsApp:
                </span>
                <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/30 p-3.5 text-xs text-emerald-200 leading-relaxed font-sans">
                  {activeTemplate === 'confirmation' &&
                    WHATSAPP_TEMPLATES.confirmation(
                      whatsAppModalOrder.customer.name,
                      whatsAppModalOrder.product.kitName,
                      whatsAppModalOrder.address.city,
                      whatsAppModalOrder.address.state
                    )}
                  {activeTemplate === 'tracking' &&
                    WHATSAPP_TEMPLATES.tracking(
                      whatsAppModalOrder.customer.name,
                      customTrackingInput || whatsAppModalOrder.trackingCode || '[SEU-CODIGO-DE-RASTREIO]'
                    )}
                  {activeTemplate === 'postSale' &&
                    WHATSAPP_TEMPLATES.postSale(whatsAppModalOrder.customer.name)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-xl border border-neutral-700 px-4 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  openWhatsAppNotification(whatsAppModalOrder, activeTemplate, customTrackingInput);
                  setWhatsAppModalOrder(null);
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-lg cursor-pointer transition-all active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>Disparar Mensagem no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Despacho / Código de Rastreio */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 p-6 shadow-2xl border border-yellow-500/30 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Marcar Pedido como Enviado</h3>
                <p className="text-xs text-neutral-400">
                  Pedido #{shippingModalOrder.id.slice(-8).toUpperCase()} • {shippingModalOrder.customer.name}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-yellow-400 mb-1">
                Código de Rastreio (Mercado Livre / Correios / Shopee)
              </label>
              <input
                type="text"
                placeholder="Ex: BR123456789ML ou código Mercado Livre"
                value={trackingCodeInput}
                onChange={(e) => setTrackingCodeInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-hidden font-mono"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Após confirmar, você poderá notificar o cliente via WhatsApp com 1 clique.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() =>
                  handleUpdateStatus(shippingModalOrder.id, 'shipped', trackingCodeInput)
                }
                className="rounded-xl bg-yellow-500 hover:bg-yellow-600 px-4 py-2 text-xs font-black text-black cursor-pointer transition-all active:scale-[0.98]"
              >
                {isUpdatingStatus ? 'Salvando...' : 'Confirmar Envio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
