import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, CreditCard, Wallet, QrCode, TrendingUp, RefreshCw, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export const Caixa = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarCaixa = async () => {
    setLoading(true);
    try {
      const data = await api.getPedidos();
      setPedidos(data || []);
    } catch (err) {
      console.error(err);
      toast.error('erro ao carregar os dados do caixa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCaixa();
  }, []);

  // Função para formatar em Reais (Padrão BR: R$ 0,00)
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  const totalGeral = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPix = pedidos.filter(p => p.forma_pagamento === 'pix').reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalCartao = pedidos.filter(p => p.forma_pagamento === 'cartao').reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalDinheiro = pedidos.filter(p => p.forma_pagamento === 'dinheiro').reduce((acc, p) => acc + Number(p.total || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-500" />
            fechamento e controlo de caixa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            resumo financeiro das vendas e fluxo de pagamentos em tempo real
          </p>
        </div>

        <button
          onClick={carregarCaixa}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          atualizar caixa
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Faturado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">total faturado</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatarMoeda(totalGeral)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {pedidos.length} pedidos registados
          </span>
        </div>

        {/* PIX */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">pix</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {formatarMoeda(totalPix)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            transferências instantâneas
          </span>
        </div>

        {/* Cartão */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">cartão</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400">
            {formatarMoeda(totalCartao)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            crédito / débito
          </span>
        </div>

        {/* Dinheiro */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">dinheiro</span>
            <div className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-200">
            {formatarMoeda(totalDinheiro)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            caixa físico
          </span>
        </div>
      </div>

      {/* Histórico / Tabela de Pedidos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center justify-between">
          <span>histórico de recebimentos</span>
          <span className="text-xs font-normal text-slate-400">({pedidos.length} transações)</span>
        </h2>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">a carregar transações...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">nenhum pedido registado no caixa ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">id / pedido</th>
                  <th className="py-3 px-4">forma de pagamento</th>
                  <th className="py-3 px-4 text-right">valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pedidos.map((p, index) => (
                  <tr key={p._id || index} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-xs text-amber-400">
                      #{p._id ? p._id.slice(-6) : index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700 capitalize">
                        {p.forma_pagamento || 'não especificado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {formatarMoeda(p.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};