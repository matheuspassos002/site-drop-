'use client';

import { useEffect, useState } from 'react';
import { Zap, X } from 'lucide-react';

const RECENT_SALES = [
  { name: 'Lucas F.', city: 'São Paulo, SP', kit: 'Kit 10 Cuecas Boxer (Oferta Campeã)', time: 'há 2 minutos' },
  { name: 'Rodrigo S.', city: 'Curitiba, PR', kit: 'Kit 20 Cuecas Boxer (Mega Econômico)', time: 'há 4 minutos' },
  { name: 'Matheus B.', city: 'Rio de Janeiro, RJ', kit: 'Kit 10 Cuecas Boxer (Oferta Campeã)', time: 'há 1 minuto' },
  { name: 'Felipe A.', city: 'Belo Horizonte, MG', kit: 'Kit 10 Cuecas Boxer (Oferta Campeã)', time: 'há 6 minutos' },
  { name: 'Gustavo M.', city: 'Campinas, SP', kit: 'Kit 20 Cuecas Boxer (Mega Econômico)', time: 'há 3 minutos' },
];

export function RecentSalesToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_SALES.length);
        setIsVisible(true);
      }, 800);
    }, 18000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  const sale = RECENT_SALES[currentIndex];

  return (
    <div className="fixed bottom-20 left-4 z-30 max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/95 text-white p-3.5 shadow-2xl backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          <Zap className="h-4 w-4 fill-yellow-400" />
        </div>
        <div className="min-w-0 pr-4">
          <p className="text-xs font-semibold text-white">
            {sale.name} <span className="font-normal text-neutral-400">de {sale.city}</span>
          </p>
          <p className="text-xs text-yellow-400 font-bold truncate">
            Garantiu: {sale.kit}
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{sale.time} • Compra Verificada</p>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-neutral-400 hover:text-white p-0.5 cursor-pointer -mr-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
