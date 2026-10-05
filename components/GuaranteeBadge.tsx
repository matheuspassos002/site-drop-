import { ShieldCheck, Truck, Lock, Headphones } from 'lucide-react';

export function GuaranteeBadge() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Garantia Blindada de 30 Dias',
      desc: '100% de reembolso sem perguntas caso não goste',
    },
    {
      icon: Truck,
      title: 'Frete Grátis com Rastreio',
      desc: 'Código enviado por WhatsApp e E-mail',
    },
    {
      icon: Lock,
      title: 'Pagamento 100% Seguro',
      desc: 'Criptografia de ponta a ponta',
    },
    {
      icon: Headphones,
      title: 'Atendimento Dedicado',
      desc: 'Suporte humanizado no pós-venda',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-y border-neutral-900 my-8">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-2">
              <Icon className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-white leading-tight mb-0.5">{item.title}</h4>
            <p className="text-[11px] text-neutral-400 leading-snug">{item.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
