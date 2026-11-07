import React from 'react';

export default function ImprimirBalancete({ movimentacoes = [], formatarBRL }) {
  const totalReceitas = movimentacoes.filter(m => m.tipo === 'Receita').reduce((a, b) => a + Number(b.valor || 0), 0);
  const totalOpex = movimentacoes.filter(m => m.tipo === 'Despesa' && !m.ehInvestimentoInicial).reduce((a, b) => a + Number(b.valor || 0), 0);
  const totalCapex = movimentacoes.filter(m => m.tipo === 'Despesa' && m.ehInvestimentoInicial).reduce((a, b) => a + Number(b.valor || 0), 0);
  const resultado = totalReceitas - totalOpex;

  return (
    <div className="p-8 bg-white text-slate-900 max-w-4xl mx-auto space-y-6 font-sans">
      {/* CABEÇALHO OFICIAL PARA IMPRESSÃO */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">TAY MIX — Balancete Financeiro Oficial</h1>
          <p className="text-xs text-slate-600 font-semibold">Açaí Cremoso & Delivery | Maricá - RJ</p>
        </div>
        <div className="text-right text-xs font-bold text-slate-500">
          <p>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      {/* RESUMO EXECUTIVO */}
      <div className="grid grid-cols-4 gap-4 border border-slate-300 p-4 rounded-lg bg-slate-50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Faturamento Bruto</span>
          <span className="text-sm font-black text-slate-900">{formatarBRL(totalReceitas)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Gastos OPEX</span>
          <span className="text-sm font-black text-rose-700">{formatarBRL(totalOpex)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Investimento Inicial</span>
          <span className="text-sm font-black text-amber-700">{formatarBRL(totalCapex)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Resultado Líquido</span>
          <span className={`text-sm font-black ${resultado >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatarBRL(resultado)}</span>
        </div>
      </div>

      {/* TABELA DE LANÇAMENTOS */}
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-slate-800 text-slate-700">
            <th className="py-2">DATA</th>
            <th className="py-2">TIPO</th>
            <th className="py-2">DESCRIÇÃO / CATEGORIA</th>
            <th className="py-2 text-center">CLASSIFICAÇÃO</th>
            <th className="py-2 text-right">VALOR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {movimentacoes.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2 text-slate-600 font-medium">{item.dataLancamento ? item.dataLancamento.split('-').reverse().join('/') : '-'}</td>
              <td className="py-2 font-bold uppercase">{item.tipo}</td>
              <td className="py-2">
                <span className="font-bold text-slate-900 block">{item.descricao}</span>
                <span className="text-[10px] text-slate-500">{item.categoria}</span>
              </td>
              <td className="py-2 text-center">
                {item.ehInvestimentoInicial ? 'Investimento Inicial' : 'Operacional'}
              </td>
              <td className={`py-2 text-right font-black ${item.tipo === 'Receita' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {item.tipo === 'Receita' ? '+ ' : '- '}{formatarBRL(item.valor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ASSINATURA */}
      <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs">
        <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">Responsável Financeiro — Tay Mix</div>
        <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">Sócia / Gerência — Erica Oliveira</div>
      </div>
    </div>
  );
}