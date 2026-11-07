import React, { useState } from 'react';
import { FileText, Calendar, ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, CheckCircle2, Printer, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import ImprimirBalancete from './ImprimirBalancete';

export default function TelaBalanceteRelatorio({ 
  movimentacoesGerais = [], 
  totalReceitasOficial = 0, 
  totalDinheiroAcumulado = 0, 
  totalPixAcumulado = 0, 
  totalCartaoAcumulado = 0, 
  totalIfoodAcumulado = 0, 
  formatarBRL 
}) {
  const [tipoFiltro, setTipoFiltro] = useState('mes'); // 'mes' | 'ano' | 'todos'
  const [mesSelecionado, setMesSelecionado] = useState('2026-11');
  const [anoSelecionado, setAnoSelecionado] = useState('2026');
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const listaMovimentacoes = Array.isArray(movimentacoesGerais) ? movimentacoesGerais : [];

  // 1. Filtragem por período
  const movimentacoesFiltradas = listaMovimentacoes.filter(m => {
    const dataStr = m.dataLancamento || m.data;
    if (!dataStr) return false;
    const dataLimpa = String(dataStr).split('T')[0];

    if (tipoFiltro === 'mes' && mesSelecionado) {
      return dataLimpa.startsWith(mesSelecionado);
    }
    if (tipoFiltro === 'ano' && anoSelecionado) {
      return dataLimpa.startsWith(anoSelecionado);
    }
    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(movimentacoesFiltradas.length / itensPorPagina) || 1;
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensPaginaAtual = movimentacoesFiltradas.slice(indexPrimeiroItem, indexUltimoItem);

  // 2. Custos e Gastos Operacionais (OPEX) do período filtrado
  const totalDespesasOperacionais = movimentacoesFiltradas
    .filter(m => m.tipo === 'Despesa' && !m.ehInvestimentoInicial)
    .reduce((acc, m) => acc + Number(m.valor || 0), 0);

  const totalInvestimentosIniciaisFiltrados = movimentacoesFiltradas
    .filter(m => m.tipo === 'Despesa' && m.ehInvestimentoInicial)
    .reduce((acc, m) => acc + Number(m.valor || 0), 0);

  const totalSaidasGerais = totalDespesasOperacionais + totalInvestimentosIniciaisFiltrados;

  // Resultado Operacional / Lucro Líquido do Período
  const resultadoOperacional = totalReceitasOficial - totalDespesasOperacionais;

  // 3. CÁLCULO EXATO DO PAYBACK (Histórico global de investimento de abertura)
  const totalInvestidoHistorico = listaMovimentacoes
    .filter(m => m.ehInvestimentoInicial === true || m.categoria === 'Aporte de Sócio')
    .reduce((acc, m) => acc + Number(m.valor || 0), 0) || 1042.79;

  // Lucro líquido acumulado histórico da empresa inteira para abater o investimento inicial
  const receitaTotalHistorico = listaMovimentacoes.filter(m => m.tipo === 'Receita').reduce((acc, m) => acc + Number(m.valor || 0), 0);
  const despesaOpexHistorico = listaMovimentacoes.filter(m => m.tipo === 'Despesa' && !m.ehInvestimentoInicial).reduce((acc, m) => acc + Number(m.valor || 0), 0);
  const lucroLiquidoHistoricoGeral = receitaTotalHistorico - despesaOpexHistorico;

  const saldoPaybackPendente = Math.max(0, totalInvestidoHistorico - Math.max(0, lucroLiquidoHistoricoGeral));
  const paybackQuitado = saldoPaybackPendente === 0;

  // 4. Divisão de Lucros (Erica e Tatiane - 50% / 50%)
  const valorParaDividir = paybackQuitado && resultadoOperacional > 0 ? resultadoOperacional : 0;
  const lucroSocioErica = valorParaDividir * 0.5;
  const lucroSocioTatiane = valorParaDividir * 0.5;

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO E FILTROS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-amber-600" size={24} /> Balancete e Relatório Financeiro Oficial — Tay Mix
          </h2>
          <p className="text-xs text-slate-500 font-medium">Demonstrativo contábil de faturamento, custos de produção, apuração de lucro e partilha das sócias.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleImprimir}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Calendar size={16} className="text-amber-600 ml-1" />
            <select
              value={tipoFiltro}
              onChange={(e) => { setTipoFiltro(e.target.value); setPaginaAtual(1); }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="mes">Mês Específico</option>
              <option value="ano">Ano Inteiro ({new Date().getFullYear()})</option>
              <option value="todos">Todo o Período (Histórico)</option>
            </select>

            {tipoFiltro === 'mes' && (
              <input
                type="month"
                value={mesSelecionado}
                onChange={(e) => { setMesSelecionado(e.target.value); setPaginaAtual(1); }}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
              />
            )}

            {tipoFiltro === 'ano' && (
              <select
                value={anoSelecionado}
                onChange={(e) => { setAnoSelecionado(e.target.value); setPaginaAtual(1); }}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* CARDS RESUMO DO BALANCETE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Faturamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Faturamento Bruto</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={18} /></div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatarBRL(totalReceitasOficial)}</div>
          <p className="text-[11px] text-slate-400 font-medium">Pix: {formatarBRL(totalPixAcumulado)} | Dinheiro: {formatarBRL(totalDinheiroAcumulado)}</p>
        </div>

        {/* Custos e Gastos Operacionais */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Custos e Gastos (OPEX)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ArrowDownRight size={18} /></div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatarBRL(totalDespesasOperacionais)}</div>
          <p className="text-[11px] text-slate-400 font-medium">Insumos e produção do período</p>
        </div>

        {/* Payback Histórico Global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Payback (Inv. Inicial)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Wallet size={18} /></div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatarBRL(totalInvestidoHistorico)}</div>
          <p className="text-[11px] text-amber-700 font-bold">
            {paybackQuitado ? '🎉 Investimento Quitado!' : `Faltam ${formatarBRL(saldoPaybackPendente)} para zerar`}
          </p>
        </div>

        {/* Lucro do Período */}
        <div className={`p-5 rounded-2xl border shadow-sm space-y-2 ${resultadoOperacional >= 0 ? 'bg-emerald-950 text-white border-emerald-900' : 'bg-rose-950 text-white border-rose-900'}`}>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider opacity-80">
            <span>Lucro do Período</span>
            {resultadoOperacional >= 0 ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-rose-400" />}
          </div>
          <div className="text-2xl font-black">{formatarBRL(resultadoOperacional)}</div>
          <p className="text-[11px] opacity-70 font-medium">{resultadoOperacional >= 0 ? 'Lucro Líquido Real' : 'Déficit no Período'}</p>
        </div>
      </div>

      {/* PAINEL DE PARTILHA DE LUCROS ENTRE AS SÓCIAS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Users className="text-amber-600" size={18} /> Partilha de Lucros da Sociedade (Erica & Tatiane)
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${paybackQuitado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {paybackQuitado ? 'Apto para Divisão (50% / 50%)' : 'Aguardando Quitação do Payback'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Disponível para Divisão</span>
            <span className="text-xl font-black text-slate-900">{formatarBRL(valorParaDividir)}</span>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-900 font-bold uppercase block mb-1">Sócio 1 (Erica - 50%)</span>
            <span className="text-xl font-black text-amber-950">{formatarBRL(lucroSocioErica)}</span>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-900 font-bold uppercase block mb-1">Sócio 2 (Tatiane - 50%)</span>
            <span className="text-xl font-black text-amber-950">{formatarBRL(lucroSocioTatiane)}</span>
          </div>
        </div>
      </div>

      {/* TABELA COM PAGINAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800">
            Extrato do Período ({movimentacoesFiltradas.length} lançamentos encontrados)
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            Total de Saídas no Período: {formatarBRL(totalSaidasGerais)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-4">Data</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Categoria / Descrição</th>
                <th className="p-4 text-center">Classificação</th>
                <th className="p-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {itensPaginaAtual.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold">Nenhum lançamento encontrado para este filtro.</td>
                </tr>
              ) : (
                itensPaginaAtual.map((item, index) => {
                  let dataFormatada = '-';
                  const rawDate = item.dataLancamento || item.data;
                  if (rawDate) {
                    const dStr = String(rawDate).split('T')[0];
                    const partes = dStr.split('-');
                    if (partes.length === 3) {
                      dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                  }

                  const isInvestimento = item.ehInvestimentoInicial === true;

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-slate-500 font-bold whitespace-nowrap">{dataFormatada}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${item.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{item.descricao}</div>
                        <div className="text-[11px] text-slate-400">{item.categoria}</div>
                      </td>
                      <td className="p-4 text-center">
                        {isInvestimento ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Inv. Inicial (Payback)</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Custo / Produção (OPEX)</span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-black text-sm whitespace-nowrap ${item.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.tipo === 'Receita' ? '+ ' : '- '}{formatarBRL(item.valor)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="text-xs text-slate-500 font-semibold">Página {paginaAtual} de {totalPaginas}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                disabled={paginaAtual === 1}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE IMPRESSÃO */}
      <div className="hidden print:block">
        <ImprimirBalancete movimentacoes={movimentacoesFiltradas} formatarBRL={formatarBRL} />
      </div>
    </div>
  );
}