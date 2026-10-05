import React from 'react';
import { Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';

export const Banner = () => {
  return (
    <div className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
      {/* Imagem de Fundo com Gradiente Escuro para Legibilidade */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="/logoaçai.jpg"
          alt="Fundo Tay Mix"
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        
        {/* Etiqueta de Destaque */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>O Melhor Açaí Cremoso de Maricá - RJ</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Sabor Incomparável no <span className="text-amber-400">Melhor Açaí</span> da Região!
        </h1>

        {/* Descrição */}
        <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Ingredientes selecionados, cremosidade única e acompanhamentos frescos preparados diariamente para você montar o seu mix perfeito.
        </p>

        {/* Ícones de Diferenciais */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Entrega Rápida</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Qualidade Premium</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <Heart className="w-4 h-4 text-amber-400" />
            <span>Feito com Carinho</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Banner;