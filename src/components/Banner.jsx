import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../services/api'; // <-- Ajustado para usar chaves { api }

export const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar banners ativos do banco de dados usando o método do api.js
  useEffect(() => {
    api.getBanners()
      .then(data => {
        if (Array.isArray(data)) {
          const ativos = data.filter(b => b.ativo !== false);
          setBanners(ativos);
        }
      })
      .catch(err => console.error('Erro ao carregar banners:', err));
  }, []);

  // Passar o banner automaticamente a cada 5 segundos (se houver mais de um)
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const bannerAtual = banners.length > 0 ? banners[currentIndex] : null;

  const imagemFundo = bannerAtual?.imagemUrl || "/banner-bg.jpg";
  const badgeTexto = bannerAtual?.badge || "O Melhor do Açaí & Massas em Maricá - RJ";
  const tituloPrincipal = bannerAtual?.titulo || "O Encontro Perfeito do Açaí e das Massas";
  const destaqueTexto = bannerAtual?.destaqueTitulo || "";
  const descricaoTexto = bannerAtual?.descricao || "Ingredientes selecionados para ambas as linhas, frescor diário e receitas preparadas para você montar a sua combinação perfeita.";

  return (
    <div className="relative text-white overflow-hidden py-6 sm:py-10 md:py-16 border-b border-slate-200/80 shadow-xs transition-all duration-700">
      
      {/* Imagem de Fundo com overlay proporcional */}
      <div className="absolute inset-0 z-0">
        <img
          src={imagemFundo}
          alt="Banner Promocional Tay Mix"
          className="w-full h-full object-cover object-center transition-all duration-700"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        
        <div className="inline-flex items-center gap-1.5 bg-black/40 border border-white/20 text-amber-300 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider mb-3 sm:mb-5 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span>{badgeTexto}</span>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2 sm:mb-4 leading-snug sm:leading-tight drop-shadow-md">
          {tituloPrincipal} <span className="text-amber-400">{destaqueTexto}</span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-slate-100 max-w-xl mx-auto mb-4 sm:mb-6 font-medium leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
          {descricaoTexto}
        </p>

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

        {banners.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Banner;