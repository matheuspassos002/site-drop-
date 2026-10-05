'use client';

import { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
}

export function CountdownTimer({ initialMinutes = 15 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('promo_timer_remaining');
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch {
        // Ignora erro
      }
    }
    return initialMinutes * 60;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev > 1 ? prev - 1 : initialMinutes * 60;
        try {
          sessionStorage.setItem('promo_timer_remaining', String(next));
        } catch {
          // Ignora erro
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 px-4 py-2.5 text-neutral-200">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500 text-black shadow-sm">
          <Zap className="h-4 w-4 fill-black" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-white">Preço Promocional do Lote </span>
          <span className="hidden sm:inline text-neutral-400">— encerra em:</span>
        </div>
      </div>

      <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-black tracking-wider text-yellow-400 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800 shadow-inner">
        <Clock className="h-3.5 w-3.5 text-yellow-400 mr-1" />
        <span>{pad(minutes)}</span>
        <span className="animate-pulse">:</span>
        <span>{pad(seconds)}</span>
      </div>
    </div>
  );
}
