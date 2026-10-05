'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductKit, ProductSize } from '@/config/product';
import { formatBRL } from '@/lib/utils';

interface StickyCTAProps {
  selectedKit: ProductKit;
  selectedSize: ProductSize | null;
  thumbnailUrl: string;
  onOpenCheckout: () => void;
  onRequireSize: () => void;
}

export function StickyCTA({
  selectedKit,
  selectedSize,
  thumbnailUrl,
  onOpenCheckout,
  onRequireSize,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleClick = () => {
    if (!selectedSize) {
      onRequireSize();
    } else {
      onOpenCheckout();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-neutral-800 shadow-2xl p-3 sm:py-3.5 transition-transform duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Info do Produto Mini */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-neutral-800 hidden sm:block bg-neutral-900">
            <Image
              src={thumbnailUrl}
              alt="Kit 10 Cuecas Boxer"
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/30">
                Frete Grátis
              </span>
              {selectedSize ? (
                <span className="text-[10px] font-black uppercase text-white bg-neutral-800 px-2 py-0.5 rounded-md">
                  Tam: {selectedSize.label} ({selectedSize.subtitle})
                </span>
              ) : (
                <span className="text-[10px] font-bold text-yellow-400/90 animate-pulse">
                  Escolha seu tamanho
                </span>
              )}
            </div>
            <div className="text-sm sm:text-base font-black text-white leading-tight truncate mt-0.5">
              {formatBRL(selectedKit.price * 0.9)}{' '}
              <span className="text-xs font-black text-yellow-400">no PIX</span>{' '}
              <span className="text-xs font-normal text-neutral-400 block xs:inline">
                ou {selectedKit.installments}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Conversão Amarelo Vibrante */}
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 px-5 py-3 text-sm sm:text-base font-black text-black shadow-lg transition-all shrink-0 cursor-pointer active:scale-[0.98]"
        >
          <ShoppingBag className="h-4 w-4 fill-black" />
          <span>{selectedSize ? 'COMPRAR AGORA' : 'ESCOLHER TAMANHO'}</span>
          <ArrowRight className="h-4 w-4 hidden xs:inline" />
        </button>
      </div>
    </div>
  );
}
