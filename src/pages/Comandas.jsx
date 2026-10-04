import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Phone, Volume2, BellRing } from 'lucide-react';
import { formatarMoeda, formatarDataHora } from '../utils/whatsapp';

// Função auxiliar para lidar com datas que podem vir como string ou como objeto MongoDB {$date: '...'}
const extrairData = (criadoEm, createdAt) => {
  const dataBruta = criadoEm || createdAt;
  if (!dataBruta) return null;
  
  if (typeof dataBruta === 'object' && dataBruta.$date) {
    return dataBruta.$date;
  }
  return dataBruta;
};

export const Comandas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [somAtivado, setSomAtivado] = useState(false);
  const alarmeIntervalRef = useRef(null);

  // Som contínuo estilo iFood (bipe duplo repetitivo)
  const tocarSomIfood = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Primeiro bipe
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota A5
      gain1.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      // Segundo bipe logo em seguida
      setTimeout(() => {
        try {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1174.66, audioCtx.currentTime); // Nota D6
          gain2.gain.setValueAtTime(0.4, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.2);
        } catch (e) {
          // Ignora se o contexto for fechado
        }
      }, 200);

    } catch (e) {
      console.error('Erro ao reproduzir alarme:', e);
    }
  };

  const ativarAudioPorInteracao = () => {
    tocarSomIfood();
    setSomAtivado(true);
  };

  const carregarPedidos = async () => {
    try {
      const data = await api.getPedidos();
      
      // Filtrar apenas as comandas do DIA ATUAL
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosDoDia = (data || []).filter(pedido => {
        const dataPedidoStr = extrairData(pedido.criadoEm, pedido.createdAt);
        if (!dataPedidoStr) return false;
        const dataPedido = new Date(dataPedidoStr).toISOString().split('T')[0];
        return dataPedido === hoje;
      });

      // Ordenar por ordem de chegada (mais antigas primeiro)
      const pedidosOrdenados = pedidosDoDia.sort((a, b) => {
        const dataA = new Date(extrairData(a.criadoEm, a.createdAt) || 0);
        const dataB = new Date(extrairData(b.criadoEm, b.createdAt) || 0);
        return dataA - dataB;
      });
      
      setPedidos(pedidosOrdenados);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  // Remove da tela comandas enviadas, concluídas, entregues ou recusadas/canceladas
  const pedidosAtivos = pedidos.filter(pedido => {
    const status = pedido.status || 'pendente';
    return (
      status !== 'enviado' && 
      status !== 'concluido' && 
      status !== 'entregue' && 
      status !== 'pronto' && 
      status !== 'recusado' && 
      status !== 'cancelado'
    );
  });

  // Verifica se há algum pedido pendente aguardando ação da cozinha
  const temPendentes = pedidosAtivos.some(p => (p.status || 'pendente') === 'pendente');

  // Gerencia o alarme contínuo estilo iFood: toca a cada 4 segundos enquanto houver pedidos pendentes e o áudio estiver ativado
  useEffect(() => {
    if (somAtivado && temPendentes) {
      // Toca imediatamente ao detectar pendente
      tocarSomIfood();
      
      // Configura o loop sonoro a cada 4 segundos
      alarmeIntervalRef.current = setInterval(() => {
        tocarSomIfood();
      }, 4000);
    } else {
      if (alarmeIntervalRef.current) {
        clearInterval(alarmeIntervalRef.current);
        alarmeIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmeIntervalRef.current) {
        clearInterval(alarmeIntervalRef.current);
      }
    };
  }, [somAtivado, temPendentes]);

  const toggleExpand = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const alterarStatus = async (e, id, novoStatus) => {
    e.stopPropagation();
    try {
      await api.atualizarStatusPedido(id, novoStatus);
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-100">painel de comandas (cozinha / delivery)</h1>
          {temPendentes && somAtivado && (
            <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <BellRing size={14} /> NOVO PEDIDO TOCANDO!
            </span>
          )}
        </div>
        
        {/* Botão de desbloqueio de áudio exigido pelos navegadores */}
        {!somAtivado ? (
          <button 
            onClick={ativarAudioPorInteracao}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition animate-bounce cursor-pointer"
          >
            <Volume2 size={16} /> Ativar Alarme Contínuo (Estilo iFood)
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
            <Volume2 size={14} /> Alarme iFood Ativo
          </span>
        )}
      </div>

      {pedidosAtivos.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          Nenhuma comanda ativa hoje no momento. 🍔
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pedidosAtivos.map((pedido) => {
            const idPedido = pedido._id || pedido.id;
            const statusAtual = pedido.status || 'pendente';
            const estaExpandido = expandidos[idPedido];
            const dataFormatada = extrairData(pedido.criadoEm, pedido.createdAt);
            const isPendente = statusAtual === 'pendente';

            return (
              <div 
                key={idPedido} 
                onClick={() => toggleExpand(idPedido)}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition shadow-md ${
                  isPendente ? 'border-amber-500/80 ring-1 ring-amber-500/50 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* CABEÇALHO COMPACTO */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-500 text-lg">#{idPedido.slice(-4)}</span>
                      <span className="text-xs text-slate-300 font-medium">{pedido.cliente_nome || 'Cliente'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isPendente ? 'bg-amber-500 text-slate-950 animate-pulse' :
                        statusAtual === 'preparo' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {statusAtual}
                      </span>
                      {estaExpandido ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatarDataHora(dataFormatada)}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase text-slate-300">
                      {pedido.forma_pagamento || pedido.pagamento || 'não inf.'}
                    </span>
                  </div>

                  {/* CONTEÚDO DETALHADO */}
                  {estaExpandido && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1"><Phone size={12} /> {pedido.telefone || pedido.cliente_telefone || 'Sem telefone'}</p>
                        <p className="flex items-start gap-1">
                          <MapPin size={12} className="mt-0.5 shrink-0" /> 
                          <span>
                            {pedido.rua || pedido.endereco?.rua 
                              ? `${pedido.rua || pedido.endereco?.rua}, ${pedido.numero || pedido.endereco?.numero || 'S/N'} - ${pedido.bairro || pedido.endereco?.bairro || ''}` 
                              : 'Endereço não informado'}
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itens:</span>
                        {pedido.itens?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-200">
                            <span>{item.quantidade || item.quantity}x {item.nome || item.name}</span>
                            <span className="text-amber-400">{formatarMoeda((item.preco_unitario || item.preco || item.price) * (item.quantidade || item.quantity))}</span>
                          </div>
                        ))}
                      </div>

                      {pedido.observacoes && (
                        <p className="text-xs text-rose-400 italic bg-slate-950 p-2 rounded border border-rose-950">
                          obs: {pedido.observacoes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* RODAPÉ E BOTÕES DE AÇÃO */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total:</span>
                    <span className="font-bold text-emerald-400">{formatarMoeda(pedido.total)}</span>
                  </div>

                  <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {isPendente && (
                      <>
                        <button 
                          onClick={(e) => alterarStatus(e, idPedido, 'preparo')}
                          className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          <CheckCircle size={14} /> Assumir / Preparo
                        </button>
                        <button 
                          onClick={(e) => alterarStatus(e, idPedido, 'recusado')}
                          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                          title="Recusar Pedido"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}

                    {statusAtual === 'preparo' && (
                      <button 
                        onClick={(e) => alterarStatus(e, idPedido, 'pronto')}
                        className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle size={14} /> Marcar como Pronto (Concluir Cozinha)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comandas;