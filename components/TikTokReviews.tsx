'use client';

import Image from 'next/image';
import { Star, CheckCircle, Flame, ThumbsUp } from 'lucide-react';
import { PRODUCT_CONFIG } from '@/config/product';

export function TikTokReviews() {
  const { reviews } = PRODUCT_CONFIG;

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0A] border-t border-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Flame className="h-3.5 w-3.5 fill-yellow-400" /> Avaliações Verificadas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quem comprou o Kit não volta para as cuecas comuns
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Mais de 2.300 clientes satisfeitos em todo o Brasil. Veja o que eles relatam sobre o conforto no dia a dia:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6 shadow-md hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Header do Comprador */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-yellow-500 shrink-0">
                      <Image
                        src={rev.avatar}
                        alt={rev.author}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white leading-tight">
                          {rev.author}
                        </span>
                        {rev.verifiedBuyer && (
                          <CheckCircle className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 block">
                        {rev.handle}
                      </span>
                    </div>
                  </div>

                  <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                    {rev.badgeText}
                  </span>
                </div>

                {/* Estrelas */}
                <div className="flex text-yellow-400 mb-2.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400" />
                  ))}
                </div>

                {/* Comentário */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Barra de Engajamento */}
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{rev.likes} acharam útil</span>
                </div>
                <span className="text-[11px] text-neutral-500">{rev.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
