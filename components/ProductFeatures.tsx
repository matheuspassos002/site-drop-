'use client';

import { Wind, Shield, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRODUCT_CONFIG } from '@/config/product';

const iconMap = {
  Wind: Wind,
  Shield: Shield,
  Layers: Layers,
  Sparkles: Sparkles,
};

export function ProductFeatures() {
  const { techFeatures } = PRODUCT_CONFIG;

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0A] border-t border-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2.5">
            <Sparkles className="h-3.5 w-3.5" /> Engenharia Têxtil de Alto Desempenho
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Por que este kit substitui todas as outras cuecas da sua gaveta?
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Desenvolvida para homens que exigem conforto absoluto, seja no treino de alta intensidade ou em 10 horas de trabalho no escritório.
          </p>
        </div>

        {/* Grid de Tecnologias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {techFeatures.map((feat, idx) => {
            const Icon = iconMap[feat.iconName as keyof typeof iconMap] || Shield;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-7 hover:border-yellow-500/40 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-neutral-950 border border-neutral-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs font-bold text-yellow-500 mb-2.5">
                  {feat.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {feat.description}
                </p>

                <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                  <span>Testado e aprovado para uso diário</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
