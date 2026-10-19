import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  const location = useLocation();
  const role = (localStorage.getItem('role') || '').toLowerCase();

  // Oculta o botão se estiver nas rotas do entregador ou se o perfil logado for entregador/motoboy
  const isModoEntregador = 
    location.pathname.startsWith('/motoboy') || 
    location.pathname.startsWith('/entregador') ||
    ['entregador', 'motoboy'].includes(role);

  if (isModoEntregador) {
    return null; // Não renderiza o botão no modo entregador
  }

  // Substitua pelo número real da loja com DDD
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