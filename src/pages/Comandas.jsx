import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatarMoeda, formatarDataHora, enviarParaMotoboy } from '../utils/whatsapp';

export const Comandas = () => {
  const [pedidos, setPedidos] = useState([]);

  const carregarPedidos = async () => {
    try {
      const data = await api.getPedidos();
      const pedidosOrdenados = (data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setPedidos(pedidosOrdenados);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const alterarStatus = async (id, novoStatus, pedido) => {
    try {
      // Utiliza a função da API centralizada para evitar erros de CORS/URL incorreta
      await api.atualizarStatusPedido(id, novoStatus);
      
      carregarPedidos();

      if (pedido && pedido.telefone) {
        let texto = '';
        if (novoStatus === 'preparo') texto = 'seu pedido foi *aceito* e já começou a ser preparado pela cozinha! 🍔';
        if (novoStatus === 'pronto') texto = 'o seu pedido já está *pronto* e logo sairá para entrega! 🚀';
        if (novoStatus === 'recusado') texto = 'infelizmente o seu pedido foi recusado no momento.';

        if (texto) {
          const telefoneLimpo = pedido.telefone.replace(/\D/g, '');
          const url = `https://api.whatsapp.com/send?phone=55${telefoneLimpo}&text=${encodeURIComponent(`Olá ${pedido.cliente_nome},${texto}`)}`;
          window.open(url, '_blank');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleEnviarMotoboy = (pedido) => {
    enviarParaMotoboy(pedido);
    alterarStatus(pedido._id || pedido.id, 'enviado', null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">painel de comandas (cozinha / delivery)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pedidos.map((pedido) => {
          const statusAtual = pedido.status || 'pendente';

          return (
            <div key={pedido._id || pedido.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                  <span className="font-bold text-amber-500">#{pedido._id?.slice(-4) || '0000'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase">
                      {pedido.forma_pagamento || pedido.pagamento || 'não inf.'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      statusAtual === 'pendente' ? 'bg-amber-500/20 text-amber-400' :
                      statusAtual === 'preparo' ? 'bg-blue-500/20 text-blue-400' :
                      statusAtual === 'pronto' ? 'bg-emerald-500/20 text-emerald-400' :
                      statusAtual === 'enviado' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {statusAtual}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                  <Clock size={12} />
                  <span>{formatarDataHora(pedido.createdAt)}</span>
                </div>

                <h3 className="font-bold text-slate-100">{pedido.cliente_nome}</h3>
                <p className="text-xs text-slate-400">{pedido.telefone || pedido.cliente_telefone || 'Sem telefone'}</p>
                <p className="text-xs text-slate-400 mb-3">
                  {pedido.rua}, {pedido.numero} - {pedido.bairro}
                </p>

                <div className="border-t border-slate-800 pt-2 space-y-1">
                  {pedido.itens?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-200">
                      <span>{item.quantidade}x {item.nome}</span>
                      <span>{formatarMoeda((item.preco_unitario || item.preco) * item.quantidade)}</span>
                    </div>
                  ))}
                </div>

                {pedido.observacoes && (
                  <p className="text-xs text-rose-400 italic mt-2 bg-slate-950 p-2 rounded">
                    obs: {pedido.observacoes}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3 mt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">{formatarMoeda(pedido.total)}</span>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {statusAtual === 'pendente' && (
                    <>
                      <button 
                        onClick={() => alterarStatus(pedido._id || pedido.id, 'preparo', pedido)}
                        className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} /> Assumir / Preparo
                      </button>
                      <button 
                        onClick={() => alterarStatus(pedido._id || pedido.id, 'recusado', pedido)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                        title="Recusar Pedido"
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}

                  {statusAtual === 'preparo' && (
                    <button 
                      onClick={() => alterarStatus(pedido._id || pedido.id, 'pronto', pedido)}
                      className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> Marcar como Pronto
                    </button>
                  )}

                  {(statusAtual === 'pronto' || statusAtual === 'enviado') && (
                    <button 
                      onClick={() => handleEnviarMotoboy(pedido)}
                      className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Truck size={14} /> Enviar para Motoboy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};