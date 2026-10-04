import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChefHat, Bike, XCircle, PackageCheck, ShoppingBag, Navigation, History, ListOrdered, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalHistoricoOpen, setIsModalHistoricoOpen] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;
  const navigate = useNavigate();

  const carregarMeusPedidos = async () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;

      const todosPedidos = await api.getPedidos();
      const meusPedidos = (todosPedidos || []).filter(
        (p) => p.userId === userId || p.cliente_id === userId || p.telefone === user.telefone
      );

      // FILTRO DO DIA ATUAL (YYYY-MM-DD)
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosDoDia = meusPedidos.filter((p) => {
        const dataPedidoStr = p.createdAt || p.criadoEm || p.data;
        if (!dataPedidoStr) return false;
        
        const dataFormatada = new Date(
          typeof dataPedidoStr === 'object' && dataPedidoStr.$date ? dataPedidoStr.$date : dataPedidoStr
        ).toISOString().split('T')[0];

        return dataFormatada === hoje;
      });

      pedidosDoDia.sort((a, b) => new Date(b.createdAt || b.criadoEm) - new Date(a.createdAt || a.criadoEm));
      setPedidos(pedidosDoDia);
    } catch (err) {
      console.error('Erro ao carregar pedidos do cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMeusPedidos();
    const interval = setInterval(carregarMeusPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmarRecebimento = async (pedidoId) => {
    try {
      if (api.atualizarStatusPedido) {
        await api.atualizarStatusPedido(pedidoId, 'entregue');
      } else {
        await fetch(`/api/pedidos/${pedidoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'entregue' })
        });
      }

      toast.success('Recebimento confirmado com sucesso!');
      carregarMeusPedidos();
    } catch (error) {
      console.error('Erro ao confirmar recebimento:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">A carregar os seus pedidos...</div>;
  }

  const pedidosEmAndamento = pedidos.filter(p => {
    const status = (p.status || 'pendente').toLowerCase();
    return status !== 'entregue' && status !== 'concluido' && status !== 'recusado' && status !== 'cancelado';
  });

  const historicoPedidos = pedidos.filter(p => {
    const status = (p.status || 'pendente').toLowerCase();
    return status === 'entregue' || status === 'concluido' || status === 'recusado' || status === 'cancelado';
  });

  // Paginação do Histórico
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const historicoPaginado = historicoPedidos.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(historicoPedidos.length / itensPorPagina);

  if (pedidos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Ainda não tem pedidos hoje</h2>
        <p className="text-sm text-slate-400 mt-1">Faça o seu primeiro pedido no cardápio para acompanhar o status aqui em tempo real!</p>
      </div>
    );
  }

  const renderCardPedido = (pedido) => {
    const status = (pedido.status || 'pendente').toLowerCase();
    const pedidoId = pedido._id || pedido.id;

    return (
      <div key={pedidoId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-xs font-mono text-amber-500 font-bold">Pedido #{pedidoId?.slice(-4)}</span>
            <p className="text-[11px] text-slate-500">
              {pedido.createdAt || pedido.criadoEm ? new Date(pedido.createdAt || pedido.criadoEm).toLocaleString('pt-BR') : 'Data indisponível'}
            </p>
          </div>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold uppercase">
            {pedido.forma_pagamento || pedido.pagamento || 'Cartão/Dinheiro'}
          </span>
        </div>

        <div className="mb-4">
          {status === 'pendente' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3 text-amber-400">
              <Clock className="w-5 h-5 shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-xs">Pedido Enviado</p>
                <p className="text-[11px] text-slate-300">Aguardando a confirmação do estabelecimento.</p>
              </div>
            </div>
          )}

          {status === 'preparo' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3 text-blue-400">
              <ChefHat className="w-5 h-5 shrink-0 animate-bounce" />
              <div>
                <p className="font-bold text-xs">Em Preparo pela Cozinha! 🍔</p>
                <p className="text-[11px] text-slate-300">O seu pedido já está a ser preparado.</p>
              </div>
            </div>
          )}

          {status === 'pronto' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400">
              <PackageCheck className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Pedido Pronto! 🚀</p>
                <p className="text-[11px] text-slate-300">O seu pedido está pronto e prestes a sair.</p>
              </div>
            </div>
          )}

          {status === 'enviado' && (
            <div className="bg-purple-500/10 border border-purple-900/40 rounded-xl p-4 flex flex-col gap-3 text-purple-400 bg-purple-950/20">
              <div className="flex items-center gap-3">
                <Bike className="w-6 h-6 shrink-0 animate-pulse text-purple-400" />
                <div>
                  <p className="font-bold text-xs text-purple-300">Saiu para Entrega! 🛵</p>
                  <p className="text-[11px] text-slate-300">O motoboy está a caminho do seu endereço.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-purple-900/30">
                <button
                  onClick={() => navigate(`/rastreio/${pedidoId}`)}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/30 animate-pulse"
                >
                  <Navigation className="w-4 h-4" />
                  Rastrear Motoboy ao Vivo
                </button>

                <button
                  onClick={() => handleConfirmarRecebimento(pedidoId)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <PackageCheck className="w-4 h-4" />
                  Já recebi meu pedido
                </button>
              </div>
            </div>
          )}

          {status === 'entregue' || status === 'concluido' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Pedido Entregue / Concluído</p>
                <p className="text-[11px] text-slate-300">Recebimento confirmado. Bom apetite!</p>
              </div>
            </div>
          ) : null}

          {status === 'recusado' && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3 text-rose-400">
              <XCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Pedido Recusado</p>
                <p className="text-[11px] text-slate-300">Infelizmente não foi possível aceitar o pedido no momento.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-3">
          <span className="font-semibold text-slate-400 uppercase text-[10px]">Itens:</span>
          {pedido.itens?.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.quantidade || item.quantity}x {item.nome || item.name}</span>
              <span className="text-slate-400">R$ {(((item.preco_unitario || item.preco || item.price) || 0) * (item.quantidade || item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-emerald-400">
          <span>Total:</span>
          <span>R$ {Number(pedido.total || 0).toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Acompanhar Meus Pedidos</h1>

      {/* SEÇÃO 1: PEDIDOS EM ANDAMENTO */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ListOrdered size={16} /> Pedidos em Andamento ({pedidosEmAndamento.length})
        </h2>

        {pedidosEmAndamento.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 text-center text-slate-400 text-xs">
            Nenhum pedido ativo no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosEmAndamento.map(renderCardPedido)}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: HISTÓRICO DE PEDIDOS DO DIA (MINIMALISTA) */}
      {historicoPedidos.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History size={16} /> Histórico de Pedidos Concluídos Hoje ({historicoPedidos.length})
            </h2>
            <button
              onClick={() => setIsModalHistoricoOpen(true)}
              className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              Ver histórico completo
            </button>
          </div>

          {/* Prévia minimalista (mostra apenas os 2 primeiros na tela principal) */}
          <div className="space-y-2">
            {historicoPedidos.slice(0, 2).map((pedido) => {
              const pId = pedido._id || pedido.id;
              const status = (pedido.status || '').toLowerCase();
              const isConcluido = status === 'entregue' || status === 'concluido';

              return (
                <div key={pId} className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/70 px-3 py-2.5 rounded-xl border border-slate-800 text-xs transition">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-500 font-bold">#{pId?.slice(-4)}</span>
                    <span className="text-slate-400">
                      {pedido.createdAt || pedido.criadoEm ? new Date(pedido.createdAt || pedido.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${isConcluido ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {pedido.status}
                    </span>
                    <span className="font-bold text-slate-200">R$ {Number(pedido.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO COMPLETO COM PAGINAÇÃO */}
      {isModalHistoricoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> Histórico Completo de Pedidos ({historicoPedidos.length})
              </h2>
              <button
                onClick={() => setIsModalHistoricoOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista com Paginação */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {historicoPaginado.map((pedido) => {
                const pId = pedido._id || pedido.id;
                const status = (pedido.status || '').toLowerCase();
                const isConcluido = status === 'entregue' || status === 'concluido';

                return (
                  <div key={pId} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40 gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500">Pedido #{pId?.slice(-4)}</span>
                        <span className="text-slate-400">• {pedido.createdAt || pedido.criadoEm ? new Date(pedido.createdAt || pedido.criadoEm).toLocaleString('pt-BR') : ''}</span>
                      </div>
                      <p className="text-slate-400 mt-1">
                        {pedido.itens?.map(i => `${i.quantidade || i.quantity}x ${i.nome || i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="block font-bold text-slate-200">R$ {Number(pedido.total || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{pedido.forma_pagamento || pedido.pagamento || 'Dinheiro/Cartão'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${isConcluido ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {pedido.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé e Controles de Paginação */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40 text-xs">
              <span className="text-slate-400">
                Página <strong className="text-slate-200">{paginaAtual}</strong> de <strong className="text-slate-200">{totalPaginas || 1}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-medium disabled:opacity-40 hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button
                  onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas || totalPaginas === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-medium disabled:opacity-40 hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MeusPedidos;