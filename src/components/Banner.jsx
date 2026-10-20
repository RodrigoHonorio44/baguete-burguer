import { Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';

export const Banner = () => {
  return (
    <div className="relative text-white overflow-hidden py-6 sm:py-10 md:py-16 border-b border-slate-200/80 shadow-xs">
      
      {/* Imagem de Fundo com overlay proporcional */}
      <div className="absolute inset-0 z-0">
        <img
          src="/banner-bg.jpg"
          alt="Açaí e Massas Tay Mix"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        {/* Overlay escuro balanceado para garantir leitura sem escurecer demais a foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        
        {/* Etiqueta de Destaque (Ajustada no mobile) */}
        <div className="inline-flex items-center gap-1.5 bg-black/40 border border-white/20 text-amber-300 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider mb-3 sm:mb-5 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span>O Melhor do Açaí & Massas em Maricá - RJ</span>
        </div>

        {/* Título Principal Responsivo */}
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2 sm:mb-4 leading-snug sm:leading-tight drop-shadow-md">
          O Encontro Perfeito do <span className="text-amber-400">Açaí</span> e das <span className="text-amber-400">Massas</span>
        </h1>

        {/* Descrição Enxuta */}
        <p className="text-xs sm:text-base md:text-lg text-slate-100 max-w-xl mx-auto mb-4 sm:mb-6 font-medium leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
          Ingredientes selecionados para ambas as linhas, frescor diário e receitas preparadas para você montar a sua combinação perfeita.
        </p>

        {/* Ícones de Diferenciais Organizadinhos */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm font-bold text-white">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Entrega Rápida</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg shadow-md backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Qualidade Premium</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/20 px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-md">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Feito com Carinho</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Banner;