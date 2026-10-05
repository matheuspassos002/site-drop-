'use client';

import { useState, useRef } from 'react';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Zap,
  ShoppingBag,
  Award,
  Layers,
  Wind,
  AlertTriangle,
} from 'lucide-react';
import { PRODUCT_CONFIG, ProductKit, ProductSize } from '@/config/product';
import { formatBRL } from '@/lib/utils';
import { ImageGallery } from '@/components/ImageGallery';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ProductFeatures } from '@/components/ProductFeatures';
import { ComparisonTable } from '@/components/ComparisonTable';
import { TikTokReviews } from '@/components/TikTokReviews';
import { FAQSection } from '@/components/FAQSection';
import { StickyCTA } from '@/components/StickyCTA';
import { RecentSalesToast } from '@/components/RecentSalesToast';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function LandingPage() {
  // Kit selecionado (Kit 10 é o padrão mais vendido)
  const [selectedKit, setSelectedKit] = useState<ProductKit>(
    PRODUCT_CONFIG.kits.find((k) => k.popular) || PRODUCT_CONFIG.kits[0]
  );

  // Tamanho selecionado (inicialmente null para forçar validação)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [sizeError, setSizeError] = useState(false);

  // Modal de checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Ref para rolar suavemente até o seletor de tamanho
  const sizeSectionRef = useRef<HTMLDivElement>(null);

  const handleOpenCheckout = () => {
    if (!selectedSize) {
      setSizeError(true);
      if (sizeSectionRef.current) {
        sizeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSizeError(false);
    setIsCheckoutOpen(true);
  };

  const handleSelectSize = (size: ProductSize) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-neutral-100 selection:bg-yellow-500 selection:text-black pb-24 sm:pb-16 font-sans">
      {/* 1. Barra de Aviso Superior */}
      <div className="bg-yellow-500 text-black text-xs sm:text-sm font-black text-center py-2.5 px-4 shadow-md flex items-center justify-center gap-2 tracking-tight">
        <Zap className="h-4 w-4 fill-black" />
        <span>FRETE GRÁTIS PARA TODO O BRASIL HOJE • DESPACHO EXPRESSO EM ATÉ 24H</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* 2. Hero Section: Galeria + Seletores de Kit e Tamanho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Coluna Esquerda: Galeria Visual Interativa com Color Swatches */}
          <div className="lg:col-span-6 lg:sticky lg:top-6">
            <ImageGallery
              images={PRODUCT_CONFIG.gallery}
              colors={PRODUCT_CONFIG.colorInfo.colors}
              selectedKit={selectedKit}
            />
          </div>

          {/* Coluna Direita: Copy Técnica & Seletores */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Avaliações e Prova Social */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-yellow-400">
                {PRODUCT_CONFIG.rating}/5.0 ({PRODUCT_CONFIG.reviewsCount} avaliações)
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" /> Tecido Aprovado
              </span>
            </div>

            {/* Título & Headline */}
            <div>
              <span className="inline-block rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                {PRODUCT_CONFIG.tagline}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 leading-tight">
                {PRODUCT_CONFIG.headline}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {PRODUCT_CONFIG.subheadline}
              </p>
            </div>

            {/* Badges Técnicos Rápidos */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <Wind className="h-4 w-4 text-yellow-400 mb-1" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Tecido</span>
                <span className="text-xs font-black text-white">Microfibra Dry</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <Layers className="h-4 w-4 text-yellow-400 mb-1" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Ajuste</span>
                <span className="text-xs font-black text-white">Não Enrola</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <Award className="h-4 w-4 text-yellow-400 mb-1" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Forro</span>
                <span className="text-xs font-black text-white">100% Algodão</span>
              </div>
            </div>

            {/* Cronômetro de Escassez */}
            <CountdownTimer initialMinutes={PRODUCT_CONFIG.countdownMinutes} />

            {/* Bloco de Ancoragem de Preço e Desconto PIX */}
            <div className="rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-semibold line-through">
                      De {formatBRL(selectedKit.originalPrice)}
                    </span>
                    <span className="rounded-md bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 text-[11px] font-black text-yellow-400 uppercase">
                      {selectedKit.savingsText}
                    </span>
                  </div>
                  {/* Badge Destacado de Desconto PIX */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-3 py-1 text-xs font-black text-black shadow-md">
                    <Zap className="h-3.5 w-3.5 fill-black" />
                    10% de desconto no PIX
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2.5 mt-1">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatBRL(selectedKit.price * 0.9)}
                  </div>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                    no PIX
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-300 pt-1.5 border-t border-neutral-800/80">
                  <span>
                    Ou no cartão <strong className="text-white font-bold">{formatBRL(selectedKit.price)}</strong> em até{' '}
                    <strong className="text-yellow-400 font-black">{selectedKit.installments}</strong>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Sem juros
                  </span>
                </div>
              </div>
            </div>

            {/* Passo 1: Seletor de Kits com Ancoragem de Valor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                  Passo 1: Selecione seu Kit
                </label>
                <span className="text-xs font-bold text-neutral-400">
                  Apenas {PRODUCT_CONFIG.stockLeft} kits no lote de hoje
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PRODUCT_CONFIG.kits.map((kit) => {
                  const isSelected = selectedKit.id === kit.id;
                  const pixPrice = kit.price * 0.9;
                  return (
                    <div
                      key={kit.id}
                      onClick={() => setSelectedKit(kit)}
                      className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all gap-3 ${
                        isSelected
                          ? 'border-yellow-500 bg-neutral-900/90 ring-2 ring-yellow-500/20 shadow-xl'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      {/* Badge Promocional */}
                      {kit.badge && (
                        <div
                          className={`absolute -top-2.5 right-4 rounded-full px-3 py-0.5 text-[10px] font-black tracking-wider uppercase shadow-md ${
                            kit.popular
                              ? 'bg-yellow-500 text-black'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {kit.badge}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500 text-black'
                              : 'border-neutral-700 bg-neutral-900'
                          }`}
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-black" />}
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-black text-white leading-tight">
                            {kit.name}
                          </div>
                          <div className="text-xs text-neutral-400">{kit.tagline}</div>
                          <div className="text-[11px] font-bold text-yellow-400 mt-0.5">
                            {kit.pricePerUnit} • <span className="text-neutral-300">{kit.savingsText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-neutral-800/80 pt-2 sm:pt-0">
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <span className="text-xs text-neutral-500 line-through">
                            {formatBRL(kit.originalPrice)}
                          </span>
                          <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                            10% OFF PIX
                          </span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white">
                          {formatBRL(pixPrice)}{' '}
                          <span className="text-xs font-bold text-yellow-400">no PIX</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium">
                          ou {formatBRL(kit.price)} em {kit.installments}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passo 2: Seletor de Tamanhos Interativo com Validação */}
            <div
              ref={sizeSectionRef}
              className={`space-y-3 rounded-2xl p-4 transition-all duration-300 ${
                sizeError
                  ? 'border-2 border-yellow-500 bg-yellow-500/10 ring-4 ring-yellow-500/25 animate-pulse'
                  : 'border border-neutral-800 bg-neutral-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <span>Passo 2: Escolha o seu Tamanho *</span>
                </label>
                <span className="text-[11px] font-bold text-neutral-400">Padrão Nacional ABNT</span>
              </div>

              {/* Botões dos Tamanhos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRODUCT_CONFIG.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSelectSize(size)}
                      className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-[1.02]'
                          : 'border-neutral-800 bg-neutral-950 text-white hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black leading-none">
                        {`${size.label} (${size.subtitle})`}
                      </span>
                      <span
                        className={`text-[11px] mt-1 font-semibold ${
                          isSelected ? 'text-black/80' : 'text-neutral-400'
                        }`}
                      >
                        {size.id === 'P' && 'Cintura 72-76cm'}
                        {size.id === 'M' && 'Cintura 78-82cm'}
                        {size.id === 'G' && 'Cintura 84-90cm'}
                        {size.id === 'GG' && 'Cintura 92-100cm'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Alerta se não tiver tamanho selecionado */}
              {sizeError && (
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-500/15 p-3 rounded-xl border border-yellow-500/40">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
                  <span>Por favor, selecione seu tamanho [ P (36), M (38), G (40/42) ou GG (44/46) ] para continuar com seu pedido.</span>
                </div>
              )}

              {selectedSize && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-300 font-medium text-center pt-1">
                  <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                  <span>
                    Tamanho selecionado: <strong className="text-yellow-400 font-black">{selectedSize.label} ({selectedSize.subtitle})</strong> • {selectedSize.detail}
                  </span>
                </div>
              )}
            </div>

            {/* Botão CTA Principal Amarelo Vibrante */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-600 py-4 px-6 text-base sm:text-lg font-black text-black shadow-2xl transition-all cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag className="h-5 w-5 fill-black" />
                <span>
                  {selectedSize ? 'COMPRAR MEU KIT AGORA' : 'ESCOLHER TAMANHO E COMPRAR'}
                </span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-medium text-neutral-400">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-yellow-400" /> Frete Grátis
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" /> Garantia 30 Dias
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" /> PIX Mercado Pago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Selos de Confiança Técnicos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-8 my-8 border-y border-neutral-900 text-center">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <Wind className="h-6 w-6 text-yellow-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">Microfibra Dry</h4>
            <p className="text-[11px] text-neutral-400">Respirável e anti-suor</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <Truck className="h-6 w-6 text-yellow-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">Envio Expresso Brasil</h4>
            <p className="text-[11px] text-neutral-400">Rastreio no WhatsApp</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <ShieldCheck className="h-6 w-6 text-yellow-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">Garantia 30 Dias</h4>
            <p className="text-[11px] text-neutral-400">Troca fácil sem estresse</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <Award className="h-6 w-6 text-yellow-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">R$ 15,99 por Peça</h4>
            <p className="text-[11px] text-neutral-400">Direto da fábrica</p>
          </div>
        </div>
      </div>

      {/* 4. Características Técnicas do Tecido */}
      <ProductFeatures />

      {/* 5. Tabela Comparativa (Cuecas Comuns vs Kit 10 Microfibra) */}
      <ComparisonTable />

      {/* 6. Avaliações de Clientes Verificados */}
      <TikTokReviews />

      {/* 7. Garantia Blindada de Satisfação */}
      <section className="py-12 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl bg-neutral-900 text-white p-6 sm:p-10 shadow-2xl border border-neutral-800">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
                Risco Zero para Você
              </span>
              <h3 className="text-2xl font-black mt-1 mb-2">
                {PRODUCT_CONFIG.guarantee.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {PRODUCT_CONFIG.guarantee.description}
              </p>
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 px-5 py-2.5 text-sm font-black text-black transition-all cursor-pointer"
              >
                <span>Experimentar sem Risco</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. Rodapé */}
      <footer className="border-t border-neutral-900 bg-[#0A0A0A] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-bold text-neutral-300">
            {PRODUCT_CONFIG.name} • Loja Oficial
          </p>
          <p>
            CNPJ: 00.000.000/0001-00 • Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-neutral-500">
            Pagamentos processados de forma segura e protegida através do Mercado Pago.
          </p>
        </div>
      </footer>

      {/* 10. Sticky CTA Mobile, Notificações de Venda e Modal */}
      <StickyCTA
        selectedKit={selectedKit}
        selectedSize={selectedSize}
        thumbnailUrl={PRODUCT_CONFIG.gallery[0].src}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onRequireSize={() => {
          setSizeError(true);
          if (sizeSectionRef.current) {
            sizeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      <RecentSalesToast />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedKit={selectedKit}
        selectedSize={selectedSize}
        productName={PRODUCT_CONFIG.name}
      />
    </main>
  );
}
