import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, Truck } from 'lucide-react';

export const Comandas = () => {
  const [pedidos, setPedidos] = useState([]);

  const carregarPedidos = async () => {
    try {
      const data = await api.getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">painel de comandas (cozinha / delivery)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pedidos.map((pedido) => (
          <div key={pedido._id || pedido.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <span className="font-bold text-amber-500">#{pedido._id?.slice(-4) || '0000'}</span>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                  {pedido.forma_pagamento}
                </span>
              </div>

              <h3 className="font-bold text-slate-100">{pedido.cliente_nome}</h3>
              <p className="text-xs text-slate-400">{pedido.telefone}</p>
              <p className="text-xs text-slate-400 mb-3">{pedido.rua}, {pedido.numero} - {pedido.bairro}</p>

              <div className="border-t border-slate-800 pt-2 space-y-1">
                {pedido.itens?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-200">
                    <span>{item.quantidade}x {item.nome}</span>
                    <span>r$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {pedido.observacoes && (
                <p className="text-xs text-rose-400 italic mt-2 bg-slate-950 p-2 rounded">
                  obs: {pedido.observacoes}
                </p>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between items-center">
              <span className="font-bold text-emerald-400">r$ {Number(pedido.total).toFixed(2)}</span>
              <button className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg">
                avançar status
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};