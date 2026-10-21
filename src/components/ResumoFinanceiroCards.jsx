import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

export default function ResumoFinanceiroCards({
  totalReceitas = 0,
  totalDespesasOperacionais = 0,
  lucroLiquido = 0,
  investimentoQuitado = false,
  valorCapitalGiro = 0,
  percentualGiro = 35,
  setPercentualGiro,
  formatarBRL
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Faturamento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Faturamento (Vendas)</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200"><TrendingUp size={18} /></div>
        </div>
        <p className="text-2xl font-black text-emerald-600">{formatarBRL(totalReceitas)}</p>
      </div>

      {/* Gastos */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Gastos do Mês</span>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200"><TrendingDown size={18} /></div>
        </div>
        <p className="text-2xl font-black text-rose-600">{formatarBRL(totalDespesasOperacionais)}</p>
      </div>

      {/* Lucro */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase">
            {investimentoQuitado ? 'Lucro Líquido Real' : 'Lucro do Mês (Amortização)'}
          </span>
          <div className={`p-2 rounded-xl border ${investimentoQuitado ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <DollarSign size={18} />
          </div>
        </div>
        <p className={`text-2xl font-black ${investimentoQuitado ? 'text-blue-600' : 'text-amber-700'}`}>
          {formatarBRL(lucroLiquido)}
        </p>
        <p className="text-[10px] text-slate-500 font-medium mt-1">
          {investimentoQuitado ? 'Liberado para distribuição' : 'Retido para pagamento do Payback'}
        </p>
      </div>

      {/* Capital de Giro */}
      <div className="bg-amber-500 text-slate-950 p-5 rounded-2xl shadow-xs border border-amber-400">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-950">Capital de Giro</span>
            <input
              type="number"
              min="0"
              max="100"
              value={percentualGiro}
              onChange={(e) => setPercentualGiro && setPercentualGiro(Number(e.target.value))}
              className="w-12 bg-white text-slate-950 font-black text-xs text-center rounded-lg p-0.5 outline-none border border-amber-600 shadow-2xs cursor-pointer"
            />
            <span className="text-xs font-black text-slate-950">%</span>
          </div>
          <div className="p-2 bg-slate-950 text-amber-400 rounded-xl"><Wallet size={18} /></div>
        </div>
        <p className="text-2xl font-black">{formatarBRL(valorCapitalGiro)}</p>
        <p className="text-[10px] text-slate-900 font-extrabold mt-1">Fixado e reservado para compras e estoque</p>
      </div>
    </div>
  );
}