import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChefHat, Bike, XCircle, PackageCheck, ShoppingBag, Navigation } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarMeusPedidos = async () => {
    try {
      // Pega o utilizador logado no localStorage
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;

      // Busca todos os pedidos do sistema e filtra pelos do utilizador logado
      const todosPedidos = await api.getPedidos();
      const meusPedidos = (todosPedidos || []).filter(
        (p) => p.userId === userId || p.cliente_id === userId || p.telefone === user.telefone
      );

      // REGRA DAS 8 HORAS: Filtra pedidos finalizados/entregues/recusados com mais de 8 horas
      const agora = new Date().getTime();
      const OITO_HORAS_MS = 8 * 60 * 60 * 1000;

      const pedidosFiltrados = meusPedidos.filter((p) => {
        const dataPedido = new Date(p.createdAt || p.data || Date.now()).getTime();
        const diffTempo = agora - dataPedido;
        const status = (p.status || '').toLowerCase();

        if (diffTempo > OITO_HORAS_MS && (status === 'entregue' || status === 'concluido' || status === 'recusado' || status === 'cancelado')) {
          return false;
        }
        return true;
      });

      // Ordena para mostrar os mais recentes primeiro
      pedidosFiltrados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPedidos(pedidosFiltrados);
    } catch (err) {
      console.error('Erro ao carregar pedidos do cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMeusPedidos();
    // Atualiza a cada 5 segundos para refletir o que a cozinha alterar no painel de comandas
    const interval = setInterval(carregarMeusPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Função para o cliente confirmar que recebeu o pedido
  const handleConfirmarRecebimento = async (pedidoId) => {
    try {
      if (api.atualizarStatusPedido) {
        await api.atualizarStatusPedido(pedidoId, 'entregue');
      } else if (api.put) {
        await api.put(`/pedidos/${pedidoId}/status`, { status: 'entregue' });
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

  if (pedidos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Ainda não tem pedidos</h2>
        <p className="text-sm text-slate-400 mt-1">Faça o seu primeiro pedido no cardápio para acompanhar o status aqui em tempo real!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Acompanhar Meus Pedidos</h1>

      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const status = (pedido.status || 'pendente').toLowerCase();
          const pedidoId = pedido._id || pedido.id;

          return (
            <div key={pedidoId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs text-slate-400">Pedido #{pedidoId?.slice(-4)}</span>
                  <p className="text-xs text-slate-500">
                    {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('pt-BR') : 'Data indisponível'}
                  </p>
                </div>
                <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-semibold uppercase">
                  {pedido.forma_pagamento || pedido.pagamento || 'Cartão/Dinheiro'}
                </span>
              </div>

              {/* Caixa de Mensagem Visual baseada na alteração da Cozinha */}
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
                  <div className="bg-purple-500/10 border border-purple-900/40 rounded-xl p-4 flex flex-col gap-4 text-purple-400 bg-purple-950/20">
                    <div className="flex items-center gap-3">
                      <Bike className="w-6 h-6 shrink-0 animate-pulse text-purple-400" />
                      <div>
                        <p className="font-bold text-xs text-purple-300">Saiu para Entrega! 🛵</p>
                        <p className="text-[11px] text-slate-300">O motoboy está a caminho do seu endereço.</p>
                      </div>
                    </div>

                    {/* Botões de Ação do Cliente: Rastrear ao Vivo e Confirmar Recebimento */}
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

                {status === 'entregue' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold text-xs">Pedido Entregue</p>
                      <p className="text-[11px] text-slate-300">Recebimento confirmado. Bom apetite!</p>
                    </div>
                  </div>
                )}

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

              {/* Lista de itens */}
              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <span className="font-semibold text-slate-400 uppercase text-[10px]">Itens:</span>
                {pedido.itens?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantidade}x {item.nome}</span>
                    <span className="text-slate-400">R$ {((item.preco_unitario || item.preco || 0) * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-emerald-400">
                <span>Total:</span>
                <span>R$ {Number(pedido.total || 0).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};