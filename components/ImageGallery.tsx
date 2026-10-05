'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { ColorSwatch, ProductKit } from '@/config/product';

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  colors?: ColorSwatch[];
  selectedKit?: ProductKit;
}

export function ImageGallery({ images, colors = [], selectedKit }: ImageGalleryProps) {
  const [currentSrc, setCurrentSrc] = useState(images[0]?.src || '/images/hero.jpg');
  const [currentAlt, setCurrentAlt] = useState(images[0]?.alt || 'Kit de Cuecas Boxer Masculinas Microfibra');
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  const changeImageSmoothly = (newSrc: string, newAlt: string, colorId: string | null) => {
    if (newSrc === currentSrc) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentSrc(newSrc);
      setCurrentAlt(newAlt);
      setSelectedColorId(colorId);
      setIsFading(false);
    }, 150);
  };

  const activeColor = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="flex flex-col gap-4">
      {/* Imagem Principal da Galeria */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div
          className={`relative h-full w-full transition-all duration-300 ${
            isFading ? 'opacity-40 scale-98 blur-[1px]' : 'opacity-100 scale-100 blur-0'
          }`}
        >
          <Image
            src={currentSrc}
            alt={currentAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Badges Flutuantes em Amarelo & Preto */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-3.5 py-1 text-xs font-black text-black shadow-lg">
            <Zap className="h-3.5 w-3.5 fill-black" />
            {selectedKit
              ? `${selectedKit.quantity} Peças • ${selectedKit.pricePerUnit}`
              : 'Frete Grátis • Pronta Entrega'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950/90 border border-yellow-500/40 px-3 py-1 text-[11px] font-bold text-yellow-400 shadow backdrop-blur-xs">
            <ShieldCheck className="h-3 w-3 text-yellow-400" />
            Cós Anatômico • Não Enrola
          </span>
        </div>

        {/* Legenda Dinâmica de Cor Ativa */}
        {activeColor && (
          <div className="absolute top-4 right-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950/90 border border-yellow-500/50 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-xs">
              <span
                className="h-2.5 w-2.5 rounded-full border border-neutral-600"
                style={{ backgroundColor: activeColor.hex }}
              />
              Cor: {activeColor.name}
            </span>
          </div>
        )}

        {/* Prova Social de Visualização */}
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-950/85 border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300 shadow backdrop-blur-xs z-10">
          <Eye className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
          <span>194 pessoas visualizando</span>
        </div>
      </div>

      {/* Barra de Amostras de Cores Interativas (Color Swatches) */}
      {colors.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 sm:p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Cores Lisas Sortidas no Pacote
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/30 w-fit">
              Sortimento de Fábrica
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 mt-2 mb-3 leading-relaxed">
            Clique nas amostras abaixo para visualizar o acabamento e textura de cada cor real do kit:
          </p>

          {/* Swatches Circulares */}
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((color) => {
              const isSelected = selectedColorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => changeImageSmoothly(color.image, color.name, color.id)}
                  className={`group relative flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3 text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-500/15 border-2 border-yellow-500 text-yellow-300 ring-2 ring-yellow-500/20 scale-105'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
                  }`}
                  title={`Visualizar cor ${color.name}`}
                >
                  <span
                    className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: color.hex,
                      border: color.borderColor ? `1.5px solid ${color.borderColor}` : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {isSelected && (
                      <Check
                        className={`h-3 w-3 ${
                          color.hex === '#FFFFFF' ? 'text-black' : 'text-white'
                        }`}
                      />
                    )}
                  </span>
                  <span className="text-[11px] font-bold">{color.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Sparkles className="h-3 w-3 text-yellow-400 shrink-0" />
            <span>
              {activeColor ? (
                <>
                  Visualizando foto real da cor: <strong className="text-yellow-400">{activeColor.name}</strong>.
                </>
              ) : (
                'Todas as cores acima são enviadas de forma sortida e equilibrada no seu pacote.'
              )}
            </span>
          </div>
        </div>
      )}

      {/* Miniaturas de Navegação Geral da Galeria */}
      <div className="grid grid-cols-5 gap-2">
        {images.slice(0, 5).map((img, idx) => {
          const isSelected = currentSrc === img.src;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => changeImageSmoothly(img.src, img.alt, null)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-yellow-500 ring-2 ring-yellow-500/30 scale-[0.98]'
                  : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-700 bg-neutral-900'
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
