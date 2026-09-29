import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';

export const Caixa = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    api.getPedidos().then(setPedidos).catch(console.error);
  }, []);

  const totalGeral = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPix = pedidos.filter(p => p.forma_pagamento === 'pix').reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalCartao = pedidos.filter(p => p.forma_pagamento === 'cartao').reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalDinheiro = pedidos.filter(p => p.forma_pagamento === 'dinheiro').reduce((acc, p) => acc + Number(p.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">fechamento e controlo de caixa</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold">total faturado</span>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">r$ {totalGeral.toFixed(2)}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold">pix</span>
          <h3 className="text-xl font-bold text-amber-400 mt-1">r$ {totalPix.toFixed(2)}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold">cartão</span>
          <h3 className="text-xl font-bold text-sky-400 mt-1">r$ {totalCartao.toFixed(2)}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold">dinheiro</span>
          <h3 className="text-xl font-bold text-slate-200 mt-1">r$ {totalDinheiro.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};