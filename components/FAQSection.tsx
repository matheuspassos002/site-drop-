'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { PRODUCT_CONFIG } from '@/config/product';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0A] border-t border-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
            <HelpCircle className="h-3.5 w-3.5" /> Dúvidas Frequentes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Perguntas & Respostas
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Tudo o que você precisa saber antes de fechar seu pedido com Frete Grátis.
          </p>
        </div>

        <div className="space-y-3">
          {PRODUCT_CONFIG.faq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-yellow-500/50 bg-neutral-900'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-bold text-white hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base pr-4">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-yellow-400' : 'text-neutral-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
