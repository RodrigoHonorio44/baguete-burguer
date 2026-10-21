import React from 'react';
import { BookOpen, BarChart2, DollarSign, Settings } from 'lucide-react';
import ImpressaoPrestacaoContasTaymix from './ImpressaoPrestacaoContasTaymix';

export default function CabecalhoPrestacao({
  abaAtiva,
  setAbaAtiva,
  setManualAberto,
  // Dados passados para o componente de impressão do PDF
  faturamento,
  gastos,
  lucroLiquido,
  capitalGiro,
  investimentoInicialPendente,
  totalInvestido,
  extrato,
  retencaoGiro,
  totalDisponivelDivisao,
  socio1Valor,
  socio2Valor,
  dataInicio,
  dataFim,
  totalDinheiroCaixaAcumulado,
  totalCartaoAcumulado,
  totalPixAcumulado,
  totalIfoodAcumulado,
  totalIfoodEntrega,
  total99Food
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white text-slate-800 p-6 rounded-2xl shadow-xs border border-slate-200/80 gap-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
            Painel Financeiro
          </span>
          
          <button
            onClick={() => setManualAberto && setManualAberto(true)}
            className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full font-black transition-colors cursor-pointer shadow-2xs"
          >
            <BookOpen size={14} /> 📖 Manual de Ajuda
          </button>

          {abaAtiva === 'prestacao' && (
            <ImpressaoPrestacaoContasTaymix 
              faturamento={faturamento}
              gastos={gastos}
              lucroLiquido={lucroLiquido}
              capitalGiro={capitalGiro}
              investimentoInicialPendente={investimentoInicialPendente}
              totalInvestido={totalInvestido}
              extrato={extrato}
              retencaoGiro={retencaoGiro}
              totalDisponivelDivisao={totalDisponivelDivisao}
              socio1Valor={socio1Valor}
              socio2Valor={socio2Valor}
              dataInicio={dataInicio}
              dataFim={dataFim}
              totalDinheiroCaixaAcumulado={totalDinheiroCaixaAcumulado}
              totalCartaoAcumulado={totalCartaoAcumulado}
              totalPixAcumulado={totalPixAcumulado}
              totalIfoodAcumulado={totalIfoodAcumulado}
              totalIfoodEntrega={totalIfoodEntrega}
              total99Food={total99Food}
            />
          )}
        </div>

        <h1 className="text-2xl font-black tracking-wide text-amber-700">
          TAYMIX — Controle Financeiro
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Gestão de faturamento, despesas, capital de giro e visão geral de vendas
        </p>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold gap-1 self-start md:self-auto">
        <button
          onClick={() => setAbaAtiva('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 size={16} /> Visão Geral
        </button>
        
        <button
          onClick={() => setAbaAtiva('prestacao')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'prestacao' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign size={16} /> Prestação & Divisão
        </button>

        <button
          onClick={() => setAbaAtiva('taxas')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            abaAtiva === 'taxas' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings size={16} /> Taxas & Regras
        </button>
      </div>
    </div>
  );
}