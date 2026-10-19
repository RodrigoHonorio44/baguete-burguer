import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  // Substitua pelo número real da loja com DDD (ex: 5521999999999)
  const numeroTelefone = '5521990066154'; 
  const mensagemInicial = encodeURIComponent('Olá! Gostaria de falar com a loja Tay Mix.');

  return (
    <a
      href={`https://wa.me/${numeroTelefone}?text=${mensagemInicial}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 scale-100 hover:scale-110 active:scale-95 border-2 border-white/20"
      title="Falar no WhatsApp"
      aria-label="Atendimento via WhatsApp"
    >
      {/* Ícone limpo em formato de balão */}
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-emerald-500" />
    </a>
  );
};

export default WhatsAppButton;