'use client';

import { Check, X, Zap } from 'lucide-react';
import { PRODUCT_CONFIG } from '@/config/product';

export function ComparisonTable() {
  const { comparison } = PRODUCT_CONFIG;

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0A] border-t border-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2.5">
            <Zap className="h-3.5 w-3.5 fill-yellow-400" /> Comparativo Lado a Lado
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cuecas Comuns de Algodão vs. Kit 10 Microfibra Conforto
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Entenda por que mais de 2.000 homens aposentaram suas cuecas antigas após testarem a microfibra:
          </p>
        </div>

        {/* Tabela de Comparação Dark Mode */}
        <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
          {/* Header da Tabela */}
          <div className="grid grid-cols-12 bg-neutral-900 border-b border-neutral-800 p-4 sm:p-5 items-center">
            <div className="col-span-5 sm:col-span-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-400">
              Critério
            </div>
            <div className="col-span-3 sm:col-span-3 text-center text-xs sm:text-sm font-bold text-neutral-400">
              Cuecas Comuns
            </div>
            <div className="col-span-4 sm:col-span-4 text-center text-xs sm:text-sm font-black text-yellow-400 flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 hidden sm:inline fill-yellow-400" />
              <span>Kit 10 Microfibra</span>
            </div>
          </div>

          {/* Linhas da Tabela */}
          <div className="divide-y divide-neutral-900">
            {comparison.map((item, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-4 sm:p-5 items-center text-xs sm:text-sm transition-colors ${
                  item.highlight
                    ? 'bg-yellow-500/5'
                    : idx % 2 === 0
                    ? 'bg-neutral-950'
                    : 'bg-neutral-900/40'
                }`}
              >
                {/* Nome do Critério */}
                <div className="col-span-5 sm:col-span-5 font-bold text-neutral-200 pr-2">
                  {item.criterion}
                </div>

                {/* Cuecas Comuns */}
                <div className="col-span-3 sm:col-span-3 text-center text-neutral-500 font-medium px-1 flex flex-col items-center justify-center">
                  <span className="text-red-400 text-xs font-bold mb-0.5 sm:hidden">
                    <X className="h-3.5 w-3.5 inline" />
                  </span>
                  <span>{item.commonBriefs}</span>
                </div>

                {/* Kit 10 Microfibra */}
                <div className="col-span-4 sm:col-span-4 text-center font-bold text-yellow-400 px-1 flex flex-col items-center justify-center">
                  <span className="text-yellow-400 text-xs font-bold mb-0.5 sm:hidden">
                    <Check className="h-3.5 w-3.5 inline" />
                  </span>
                  <span className="font-extrabold">{item.microfiberKit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé da Tabela com Ancoragem */}
          <div className="bg-neutral-900 p-4 text-center border-t border-neutral-800">
            <p className="text-xs sm:text-sm font-extrabold text-neutral-200">
              Economia real: De <span className="line-through text-neutral-500">R$ 249,90</span> por apenas <span className="text-yellow-400 font-black">R$ 159,90</span> com Frete Grátis incluso hoje.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
