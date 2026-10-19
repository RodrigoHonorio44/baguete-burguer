import React from 'react';
import { Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';

export const Banner = () => {
  return (
    <div className="relative text-white overflow-hidden py-12 md:py-20 border-b border-slate-800">
      
      {/* Imagem de Fundo 100% visível com overlay escuro suave para leitura do texto */}
      <div className="absolute inset-0 z-0">
        <img
          src="/banner-bg.jpg" // Coloque o nome da imagem dividida salva em public
          alt="Açaí e Massas Tay Mix"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay escuro leve apenas para dar contraste às letras */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        
        {/* Etiqueta de Destaque */}
        <div className="inline-flex items-center gap-2 bg-black/50 border border-white/20 text-amber-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-6 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>O Melhor do Açaí & Massas em Maricá - RJ</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-md">
          O Encontro Perfeito do <span className="text-amber-400">Açaí</span> e das <span className="text-amber-400">Massas</span>
        </h1>

        {/* Descrição */}
        <p className="text-sm md:text-lg text-slate-100 max-w-2xl mx-auto mb-8 font-medium leading-relaxed drop-shadow">
          Ingredientes selecionados para ambas as linhas, frescor diário e receitas preparadas para você montar a sua combinação perfeita.
        </p>

        {/* Ícones de Diferenciais */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm font-semibold text-white">
          <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-4 py-2 rounded-xl shadow-md backdrop-blur-md">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Entrega Rápida</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-4 py-2 rounded-xl shadow-md backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Qualidade Premium</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-4 py-2 rounded-xl shadow-md backdrop-blur-md">
            <Heart className="w-4 h-4 text-amber-400" />
            <span>Feito com Carinho</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Banner;