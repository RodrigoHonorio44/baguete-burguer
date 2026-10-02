import React, { useEffect, useState } from 'react';
import { Flame, Clock, Star, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Menu } from '../components/Menu';

export const Home = () => {
  const [configLoja, setConfigLoja] = useState({
    isOnline: true,
    horarioAbertura: '18:00',
    horarioFechamento: '23:30',
    diasFuncionamento: {}
  });

  useEffect(() => {
    const carregarConfiguracoesLoja = async () => {
      try {
        if (typeof api.getConfiguracoesLoja === 'function') {
          const dadosServer = await api.getConfiguracoesLoja();
          if (dadosServer && Object.keys(dadosServer).length > 0) {
            setConfigLoja(dadosServer);
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações do servidor, usando cache local:', err);
      }

      const dadosSalvos = localStorage.getItem('configuracoes_loja');
      if (dadosSalvos) {
        try {
          const parsed = JSON.parse(dadosSalvos);
          setConfigLoja(parsed);
        } catch (e) {
          console.error('Erro ao carregar configurações locais', e);
        }
      }
    };

    carregarConfiguracoesLoja();
  }, []);

  const diasAtivosObj = Object.entries(configLoja.diasFuncionamento || {}).filter(([_, ativo]) => ativo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 overflow-x-hidden w-full max-w-full">
      
      {/* BANNER PRINCIPAL (HERO SECTION) */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 overflow-hidden mb-8 w-full box-border">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-14 flex flex-col items-center text-center w-full box-border">
          
          {/* PAINEL DE STATUS DA LOJA - Ajustado com max-w-full e box-border */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-slate-900/90 border border-slate-800 px-3 py-2.5 rounded-2xl shadow-lg mb-4 text-xs w-full max-w-md box-border">
            
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {configLoja.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${configLoja.isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className={`font-bold ${configLoja.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {configLoja.isOnline ? 'ABERTO AGORA' : 'FECHADO'}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{configLoja.horarioAbertura} às {configLoja.horarioFechamento}</span>
            </div>

            {diasAtivosObj.length > 0 && (
              <>
                <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="capitalize">
                    {diasAtivosObj.map(([dia]) => dia.slice(0, 3)).join(', ')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* AVISO DE LOJA FECHADA */}
          {!configLoja.isOnline && (
            <div className="w-full max-w-md bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2 rounded-xl mb-4 flex items-center justify-center gap-2 text-xs font-medium box-border">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Loja fechada no momento. Volte no horário de funcionamento!</span>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3 tracking-wide uppercase">
            <Flame className="w-4 h-4 shrink-0" /> Artesanal & Saboroso
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white mb-3 max-w-full break-words">
            O Melhor Sabor da <span className="text-amber-500">Baguete & Burger</span>
          </h1>
          
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mb-6 leading-relaxed px-2">
            Ingredientes selecionados, carnes suculentas grelhadas na brasa e pães fresquinhos preparados diariamente para si.
          </p>

          {/* SELOS / VANTAGENS - Ajustados para grid flexível */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 w-full max-w-xl text-xs text-slate-300 box-border">
            <div className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-800 py-2 px-2 rounded-xl shadow-md">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" /> Entrega Rápida
            </div>
            <div className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-800 py-2 px-2 rounded-xl shadow-md">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" /> Qualidade Premium
            </div>
            <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-800 py-2 px-2 rounded-xl shadow-md">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" /> Brasa & Sabor
            </div>
          </div>
        </div>
      </div>

      {/* COMPONENTE DE CARDÁPIO */}
      <Menu />

    </div>
  );
};

export default Home;