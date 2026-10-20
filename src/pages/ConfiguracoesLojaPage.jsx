import React, { useState } from 'react';
import { Settings, Megaphone, MapPin } from 'lucide-react';
import PaginaMarketing from './PaginaMarketing';
import { MapaRaioEntrega } from '../components/MapaRaioEntrega';

export default function ConfiguracoesLojaPage() {
  const [abaAtiva, setAbaAtiva] = useState('marketing'); // 'marketing' | 'entrega'

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Cabeçalho Unificado de Configurações */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Configurações da Loja</h1>
              <p className="text-xs text-slate-500">Gerencie marketing, promoções e o raio de entrega em um só lugar</p>
            </div>
          </div>

          {/* Seletor de Abas Interno */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold gap-1">
            <button
              onClick={() => setAbaAtiva('marketing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                abaAtiva === 'marketing' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone size={16} /> Marketing & Banners
            </button>

            <button
              onClick={() => setAbaAtiva('entrega')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                abaAtiva === 'entrega' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin size={16} /> Raio de Entrega
            </button>
          </div>
        </div>

        {/* EXIBIÇÃO DO CONTEÚDO CONFORME A ABA SELECIONADA */}
        {abaAtiva === 'marketing' && <PaginaMarketing />}
        {abaAtiva === 'entrega' && <MapaRaioEntrega />}

      </div>
    </div>
  );
}