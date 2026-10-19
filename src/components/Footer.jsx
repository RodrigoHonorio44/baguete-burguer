import React from 'react';
import { MapPin, Clock, MessageCircle } from 'lucide-react';

export const Footer = () => {
  // Ajuste o número da loja com DDD se for diferente
  const numeroWhatsApp = '5521999999999'; 
  const mensagemWhatsApp = encodeURIComponent('Olá! Gostaria de falar com o atendimento da Tay Mix.');

  return (
    // pb-24 garante espaçamento extra no mobile para não sobrepor o botão flutuante
    <footer className="border-t border-slate-200/80 bg-slate-100/70 pt-8 pb-24 md:pb-8 text-slate-700">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center md:text-left">
        
        {/* Coluna 1: Marca */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src="/logoaçai8.png" alt="Tay Mix" className="w-7 h-7 rounded-full object-cover border border-amber-400" />
            <span className="font-black text-base text-slate-900 tracking-tight">
              Tay <span className="text-amber-500">Mix</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto md:mx-0 font-medium">
            O equilíbrio perfeito entre o sabor do açaí e a tradição das massas.
          </p>
        </div>

        {/* Coluna 2: Informações de Atendimento */}
        <div className="space-y-1.5 text-xs font-semibold text-slate-700">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Atendimento</h4>
          <p className="flex items-center justify-center md:justify-start gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>São José do Imbassaí &bull; Maricá - RJ</span>
          </p>
          <p className="flex items-center justify-center md:justify-start gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Todos os dias das 08:00 às 23:30</span>
          </p>
          <a 
            href={`https://wa.me/${numeroWhatsApp}?text=${mensagemWhatsApp}`}
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center md:justify-start gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold transition-colors pt-0.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-emerald-100" />
            <span>Fale conosco no WhatsApp</span>
          </a>
        </div>

        {/* Coluna 3: Redes Sociais */}
        <div className="space-y-1.5 text-xs">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] md:text-right">Acompanhe</h4>
          <div className="flex items-center justify-center md:justify-end gap-2">
            <a 
              href="https://www.instagram.com/taymix2026" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full text-slate-700 hover:text-amber-600 hover:border-amber-300 font-bold transition-all shadow-xs group"
            >
              <svg className="w-4 h-4 text-pink-600 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@taymix2026</span>
            </a>
          </div>
        </div>

      </div>

      {/* Linha Divisória e Direitos Autorais */}
      <div className="max-w-6xl mx-auto px-4 pt-4 border-t border-slate-200/80 text-center text-xs space-y-0.5">
        <p className="font-bold text-slate-800">
          © {new Date().getFullYear()} TAY MIX - Açaí & Massas. Todos os direitos reservados.
        </p>
        <p className="text-slate-500 font-medium text-[11px]">
          Maricá - RJ
        </p>
      </div>
    </footer>
  );
};

export default Footer;