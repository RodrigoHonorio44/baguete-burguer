import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, PackageCheck } from 'lucide-react';

// FUNÇÃO AUXILIAR DE CÁLCULO
const calcularSimulacao = (custoDireto, pctTaxa, rateioFixo, precoEntrada, margemEntrada, modoCalculo) => {
  const custoTotal = custoDireto + rateioFixo;
  let precoVenda = 0;

  if (modoCalculo === 'preco') {
    precoVenda = Number(String(precoEntrada).replace(',', '.')) || 0;
  } else {
    const margemFracao = (Number(String(margemEntrada).replace(',', '.')) || 0) / 100;
    const taxaFracao = (pctTaxa || 0) / 100;
    const divisor = 1 - taxaFracao - margemFracao;
    precoVenda = divisor > 0 && custoTotal > 0 ? custoTotal / divisor : 0;
  }

  const descontoApp = precoVenda * (pctTaxa / 100);
  const repasseLiquido = precoVenda - descontoApp;
  const lucroLiquido = repasseLiquido - custoTotal;
  const margemRealPct = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;

  return {
    precoVenda,
    descontoApp,
    repasseLiquido,
    custoTotal,
    lucroLiquido,
    margemRealPct
  };
};

export default function PainelSimuladorDinamico({ custoDireto, taxas, precoIFoodIni = '24.90', preco99Ini = '24.90', produtoNome = '' }) {
  const [modoCalculo, setModoCalculo] = useState('preco');
  const [precoIF, setPrecoIF] = useState(precoIFoodIni);
  const [preco99, setPreco99] = useState(preco99Ini);
  const [margemTarget, setMargemTarget] = useState('40');

  useEffect(() => {
    setPrecoIF(precoIFoodIni);
    setPreco99(preco99Ini);
  }, [precoIFoodIni, preco99Ini, custoDireto]);

  const calcIFood = calcularSimulacao(custoDireto, taxas.ifoodPercentual, taxas.ifoodRateioUnidade, precoIF, margemTarget, modoCalculo);
  const calc99 = calcularSimulacao(custoDireto, taxas.f99Percentual, taxas.f99RateioUnidade, preco99, margemTarget, modoCalculo);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
      {produtoNome && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulando Produto:</span>
            <span className="text-base font-black text-slate-800 capitalize">{produtoNome}</span>
          </div>
          <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl font-bold text-xs border border-emerald-200">
            Custo Base: R$ {custoDireto.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-amber-700 tracking-wider">Como deseja simular os valores?</span>
        
        <div className="flex bg-white p-1 rounded-xl gap-1 border border-slate-200">
          <button 
            type="button"
            onClick={() => setModoCalculo('preco')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              modoCalculo === 'preco' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Digitar Preço de Venda
          </button>
          <button 
            type="button"
            onClick={() => setModoCalculo('margem')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              modoCalculo === 'margem' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> Informar Lucro Desejado (%)
          </button>
        </div>
      </div>

      {modoCalculo === 'margem' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-4">
          <div>
            <label className="text-xs text-amber-900 font-bold block">Defina a Margem de Lucro Desejada (%)</label>
            <p className="text-[11px] text-amber-700 font-medium">O sistema ajustará os preços sugeridos no iFood e 99Food.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={margemTarget} 
              onChange={e => setMargemTarget(e.target.value)} 
              className="w-20 bg-white p-2 rounded-xl text-center text-lg font-bold text-emerald-600 border border-amber-300 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
            <span className="text-lg font-bold text-amber-800">%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IFOOD */}
        <div className="bg-slate-50 p-5 rounded-xl border border-rose-200 space-y-4">
          <div className="flex justify-between items-center border-b border-rose-100 pb-2">
            <span className="font-bold text-rose-600 text-base">iFood</span>
            <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold border border-rose-200">
              Taxa: {taxas.ifoodPercentual}% {taxas.ifoodRateioUnidade > 0 ? `+ R$ ${taxas.ifoodRateioUnidade.toFixed(2)}` : ''}
            </span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-bold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={precoIF} 
                onChange={e => setPrecoIF(e.target.value)} 
                className="w-full bg-white p-2.5 rounded-xl text-base text-slate-800 font-bold border border-slate-300 focus:outline-none focus:border-amber-500 shadow-2xs" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs font-medium">
            <div className="flex justify-between text-slate-700">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-slate-900 text-sm font-bold">R$ {calcIFood.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comissão iFood ({taxas.ifoodPercentual}%):</span>
              <span className="text-rose-600 font-bold">R$ {calcIFood.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-600 text-sm font-bold">R$ {calcIFood.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Custo Total Produto + Rateio:</span>
              <span className="text-slate-800 font-semibold">R$ {calcIFood.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
              <span className="text-amber-800 font-bold">Lucro Líquido Real:</span>
              <span className="font-bold text-emerald-600 text-base">R$ {calcIFood.lucroLiquido.toFixed(2)} ({calcIFood.margemRealPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* 99FOOD */}
        <div className="bg-slate-50 p-5 rounded-xl border border-emerald-200 space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
            <span className="font-bold text-emerald-600 text-base">99Food</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-200">
              Taxa: {taxas.f99Percentual}%
            </span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-bold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={preco99} 
                onChange={e => setPreco99(e.target.value)} 
                className="w-full bg-white p-2.5 rounded-xl text-base text-slate-800 font-bold border border-slate-300 focus:outline-none focus:border-amber-500 shadow-2xs" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs font-medium">
            <div className="flex justify-between text-slate-700">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-slate-900 text-sm font-bold">R$ {calc99.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comissão 99Food ({taxas.f99Percentual}%):</span>
              <span className="text-rose-600 font-bold">R$ {calc99.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-600 text-sm font-bold">R$ {calc99.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Custo Total Produto:</span>
              <span className="text-slate-800 font-semibold">R$ {calc99.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
              <span className="text-amber-800 font-bold">Lucro Líquido Real:</span>
              <span className="font-bold text-emerald-600 text-base">R$ {calc99.lucroLiquido.toFixed(2)} ({calc99.margemRealPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}