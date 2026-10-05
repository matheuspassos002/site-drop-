'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Lock,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ProductKit, ProductSize } from '@/config/product';
import { formatBRL, formatCPF, formatPhone, formatCEP, isValidCPF, isValidPhone, onlyNumbers } from '@/lib/utils';

const STORAGE_DELIVERY_KEY = 'drop_saved_delivery_info';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKit: ProductKit;
  selectedSize: ProductSize | null;
  productName: string;
}

function getSavedDeliveryData() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_DELIVERY_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function CheckoutModal({
  isOpen,
  onClose,
  selectedKit,
  selectedSize,
  productName,
}: CheckoutModalProps) {
  // Dados do formulário inicializados com persistência local (PCI-DSS)
  const [name, setName] = useState(() => getSavedDeliveryData()?.name || '');
  const [cpf, setCpf] = useState(() => getSavedDeliveryData()?.cpf || '');
  const [phone, setPhone] = useState(() => getSavedDeliveryData()?.phone || '');
  const [email, setEmail] = useState(() => getSavedDeliveryData()?.email || '');

  const [cep, setCep] = useState(() => getSavedDeliveryData()?.cep || '');
  const [street, setStreet] = useState(() => getSavedDeliveryData()?.street || '');
  const [number, setNumber] = useState(() => getSavedDeliveryData()?.number || '');
  const [complement, setComplement] = useState(() => getSavedDeliveryData()?.complement || '');
  const [neighborhood, setNeighborhood] = useState(() => getSavedDeliveryData()?.neighborhood || '');
  const [city, setCity] = useState(() => getSavedDeliveryData()?.city || '');
  const [state, setState] = useState(() => getSavedDeliveryData()?.state || '');

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = useState(3);
  const [saveCustomerData, setSaveCustomerData] = useState(true);

  // Estados de controle
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    status: string;
    gateway: string;
    pixCopyPaste?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    amount: number;
  } | null>(null);

  const [hasCopiedPix, setHasCopiedPix] = useState(false);

  // Polling em tempo real para verificar se o PIX foi pago
  useEffect(() => {
    if (!orderResult?.orderId || orderResult.status === 'paid') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderResult.orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            setOrderResult((prev) => (prev ? { ...prev, status: 'paid' } : null));
          }
        }
      } catch {
        // Ignora falhas transitórias de conexão no polling
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [orderResult?.orderId, orderResult?.status]);

  if (!isOpen) return null;

  // Busca automática do CEP no ViaCEP
  const handleCepChange = async (value: string) => {
    const masked = formatCEP(value);
    setCep(masked);

    const clean = onlyNumbers(masked);
    if (clean.length === 8) {
      setIsLoadingCep(true);
      setErrorMessage('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          const numInput = document.getElementById('street-number');
          if (numInput) numInput.focus();
        } else {
          setErrorMessage('CEP não encontrado. Por favor, preencha o endereço manualmente.');
        }
      } catch (err) {
        console.error('Erro ao consultar ViaCEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleCopyPix = () => {
    if (orderResult?.pixCopyPaste) {
      navigator.clipboard.writeText(orderResult.pixCopyPaste);
      setHasCopiedPix(true);
      setTimeout(() => setHasCopiedPix(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedSize) {
      setErrorMessage('Por favor, feche este modal e selecione um tamanho (P, M, G ou GG).');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!isValidCPF(cpf)) {
      setErrorMessage('Por favor, informe um CPF válido.');
      return;
    }
    if (!isValidPhone(phone)) {
      setErrorMessage('Por favor, informe seu WhatsApp com DDD no formato (DDD) 9XXXX-XXXX.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido para confirmação.');
      return;
    }
    if (onlyNumbers(cep).length !== 8) {
      setErrorMessage('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }
    if (!street.trim() || !number.trim() || !city.trim() || !state.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios do endereço.');
      return;
    }

    // Persistência segura local (apenas contato e endereço - PCI-DSS)
    if (saveCustomerData) {
      try {
        localStorage.setItem(
          STORAGE_DELIVERY_KEY,
          JSON.stringify({
            name: name.trim(),
            cpf: cpf.trim(),
            phone: phone.trim(),
            email: email.trim(),
            cep: cep.trim(),
            street: street.trim(),
            number: number.trim(),
            complement: complement.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
          })
        );
      } catch {
        // Ignora erro
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_DELIVERY_KEY);
      } catch {
        // Ignora erro
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, cpf, phone, email },
          address: { cep, street, number, complement, neighborhood, city, state },
          kitId: selectedKit.id,
          selectedSize: selectedSize.id,
          paymentMethod,
          cardData: {
            installments: Math.min(installments, 3),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar checkout');
      }

      // Se o gateway gerou uma URL de preferência para cartão de crédito, redireciona
      if (paymentMethod === 'credit_card' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setOrderResult({
        orderId: data.orderId,
        status: data.status,
        gateway: data.gateway,
        pixCopyPaste: data.pixCopyPaste,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        amount: data.amount,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na conexão com o servidor';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0A0A0A] border border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-neutral-100">
        {/* Header do Checkout */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500 text-black shadow-md">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {orderResult ? 'Acompanhamento do Pedido' : 'Checkout Seguro Mercado Pago'}
              </h3>
              <p className="text-xs text-neutral-400">
                {orderResult ? 'QR Code Oficial Gerado' : 'Ambiente 100% Criptografado & Protegido'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 overflow-y-auto">
          {orderResult ? (
            /* TELA DE SUCESSO / PIX */
            <div className="space-y-6 text-center py-2">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-3 shadow-lg ${
                    orderResult.status === 'paid'
                      ? 'bg-yellow-500 text-black animate-bounce'
                      : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-pulse'
                  }`}
                >
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h4 className="text-xl font-black text-white">
                  {orderResult.status === 'paid'
                    ? 'Pagamento Confirmado com Sucesso!'
                    : 'Pedido Criado! Pague com PIX para Liberação'}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Pedido Nº: <span className="font-mono font-bold text-yellow-400">#{orderResult.orderId}</span>
                </p>

                {orderResult.status === 'pending' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-[11px] font-bold text-yellow-400">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping mr-1" />
                    Aguardando confirmação bancária em tempo real...
                  </div>
                )}
              </div>

              {/* Informações do PIX se for pendente */}
              {orderResult.pixCopyPaste && orderResult.status !== 'paid' && (
                <div className="rounded-2xl border border-yellow-500/30 bg-neutral-900/80 p-4 sm:p-5 text-left">
                  <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4" /> Pagamento Instantâneo via PIX
                    </span>
                    <span className="text-xs font-bold text-black bg-yellow-500 px-2.5 py-0.5 rounded-full">
                      Expira em 15 min
                    </span>
                  </div>

                  {/* QR Code Container em Fundo Branco Limpo para Leitura Fácil */}
                  {(orderResult.qrCodeBase64 || orderResult.qrCode) && (
                    <div className="flex justify-center my-4">
                      <div className="bg-white p-3 rounded-2xl shadow-xl border border-neutral-700">
                        <Image
                          src={orderResult.qrCodeBase64 || orderResult.qrCode || ''}
                          alt="QR Code Pix Mercado Pago"
                          width={200}
                          height={200}
                          className="rounded-lg"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-neutral-300 mb-2 font-medium">
                    Ou pague copiando o código PIX Copia e Cola abaixo:
                  </p>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={orderResult.pixCopyPaste}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 pr-32 text-xs font-mono text-neutral-200 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3.5 text-xs font-black text-black hover:bg-yellow-600 cursor-pointer transition-colors"
                    >
                      {hasCopiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{hasCopiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl bg-neutral-950 p-3.5 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                    <p className="font-bold text-white">Como pagar:</p>
                    <p>1. Abra o aplicativo do seu banco no celular.</p>
                    <p>2. Selecione a opção <span className="font-semibold text-neutral-200">PIX &gt; Copia e Cola</span>.</p>
                    <p>3. Cole o código copiado acima e confirme o pagamento.</p>
                    <p className="text-yellow-400/90 font-medium pt-1">
                      Assim que você pagar, esta tela será atualizada automaticamente!
                    </p>
                  </div>
                </div>
              )}

              {/* Informações de Entrega */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left text-xs text-neutral-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Truck className="h-4 w-4 text-yellow-400" /> Envio Expresso com Rastreamento
                </div>
                <p>
                  Destino: <span className="font-semibold text-white">{street}, Nº {number} - {city}/{state}</span>.
                </p>
                <p>
                  Kit: <span className="font-semibold text-white">{selectedKit.name}</span> •{' '}
                  <span className="font-semibold text-yellow-400">
                    Tamanho {selectedSize?.label} ({selectedSize?.subtitle})
                  </span>
                </p>
                <p className="text-neutral-400 pt-1">
                  Você receberá as atualizações de rastreio no WhatsApp <span className="font-semibold text-neutral-200">{phone}</span> e no e-mail <span className="font-semibold text-neutral-200">{email}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-neutral-800 py-3.5 text-sm font-bold text-white hover:bg-neutral-700 cursor-pointer transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          ) : (
            /* FORMULÁRIO DE CHECKOUT */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resumo do Item Selecionado */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">
                    Item Selecionado
                  </span>
                  <h4 className="text-sm font-black text-white truncate">
                    {productName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="rounded-md bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-[11px] font-black text-yellow-400">
                      Tamanho: {selectedSize ? `${selectedSize.label} (${selectedSize.subtitle})` : 'Não definido'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {selectedKit.name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {paymentMethod === 'pix' ? (
                    <>
                      <span className="text-[10px] font-black text-yellow-400 uppercase bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full inline-block mb-0.5">
                        10% OFF no PIX
                      </span>
                      <div className="text-base font-black text-white">
                        {formatBRL(selectedKit.price * 0.9)}
                      </div>
                      <span className="text-[10px] text-neutral-500 line-through">
                        {formatBRL(selectedKit.price)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-yellow-400 uppercase block">Frete Grátis</span>
                      <span className="text-base font-black text-white">{formatBRL(selectedKit.price)}</span>
                      <span className="text-[10px] text-neutral-400 block">em até 3x sem juros</span>
                    </>
                  )}
                </div>
              </div>

              {/* Alerta de Erro */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Dados Pessoais */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black">
                    1
                  </span>
                  <h5 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                    Dados do Destinatário
                  </h5>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      CPF (Obrigatório para NF/Envio) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      maxLength={14}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      WhatsApp (Para Rastreamento) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      maxLength={15}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    E-mail para Confirmação do Pedido *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 2. Endereço de Entrega */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black">
                    2
                  </span>
                  <h5 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                    Endereço de Entrega
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      CEP *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        maxLength={9}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden font-mono"
                      />
                      {isLoadingCep && (
                        <div className="absolute right-3 top-3 text-yellow-400 animate-spin">
                          <Loader2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rua das Flores"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Número *
                    </label>
                    <input
                      id="street-number"
                      type="text"
                      required
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      placeholder="Apto 42"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Centro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      UF *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="SP"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-hidden text-center uppercase"
                    />
                  </div>
                </div>

                {/* Recurso "Lembrar Meus Dados" (PCI-DSS Compliant) */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={saveCustomerData}
                      onChange={(e) => setSaveCustomerData(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-neutral-950 cursor-pointer accent-yellow-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block">
                        Salvar meus dados de entrega para compras futuras
                      </span>
                      <span className="text-[11px] text-neutral-400 leading-tight block mt-0.5">
                        🔒 Dados de contato e endereço salvos com segurança no seu navegador. Nenhum dado de cartão de crédito é armazenado no cliente (Compliance estrito PCI-DSS).
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Forma de Pagamento */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black">
                    3
                  </span>
                  <h5 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                    Forma de Pagamento
                  </h5>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 ring-2 ring-yellow-500/20'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-sm">
                      <QrCode className="h-4 w-4" />
                      <span>PIX Oficial</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/30">
                      10% OFF • Imediato
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 ring-2 ring-yellow-500/20'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-sm">
                      <CreditCard className="h-4 w-4" />
                      <span>Cartão de Crédito</span>
                    </div>
                    <span className="text-[10px] text-neutral-300 font-semibold">
                      Em até 3x sem juros
                    </span>
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3.5 text-xs text-neutral-300 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                      <span>
                        Desconto de 10% aplicado automaticamente via PIX Mercado Pago.
                      </span>
                    </div>
                    <span className="text-xs font-black text-yellow-400 whitespace-nowrap">
                      {formatBRL(selectedKit.price * 0.9)}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3.5 text-xs text-neutral-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Parcelamento (Restrito a no máximo 3x) *
                      </label>
                      <span className="text-[10px] font-bold text-emerald-400">Sem juros</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setInstallments(num)}
                          className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                            installments === num
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-xs font-black text-white">{num}x</div>
                          <div className="text-[10px] font-semibold text-yellow-400">
                            {formatBRL(selectedKit.price / num)}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-neutral-400 pt-1">
                      🔒 Pagamento protegido processado via checkout Mercado Pago.
                    </p>
                  </div>
                )}
              </div>

              {/* Botão de Finalização Amarelo de Alto Impacto */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-600 py-4 px-6 text-base font-black text-black shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>GERANDO PEDIDO NO MERCADO PAGO...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>
                      {paymentMethod === 'pix'
                        ? `GERAR PIX DE ${formatBRL(selectedKit.price * 0.9)} (10% OFF)`
                        : `PAGAR ${formatBRL(selectedKit.price)} EM ${installments}X SEM JUROS`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-yellow-400" /> Criptografia 256-bit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-yellow-400" /> Frete Grátis com Seguro
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
