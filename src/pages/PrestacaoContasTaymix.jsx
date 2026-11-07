import React, { useState } from 'react';
import { Calendar, BookOpen, X, FileText } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { usePrestacaoContasTaymix } from '../hooks/usePrestacaoContasTaymix';
import DashboardPage from './DashboardPage';
import TelaBalanceteRelatorio from '../components/TelaBalanceteRelatorio';

// Importação dos componentes da aba de prestação
import ResumoFinanceiroCards from '../components/ResumoFinanceiroCards';
import DetalhamentoCanaisCards from '../components/DetalhamentoCanaisCards';
import FormularioELancamentos from '../components/FormularioELancamentos';
import ModalConfigTaxas from '../components/ModalConfigTaxas';

export default function PrestacaoContasTaymix() {
  const [abaAtiva, setAbaAtiva] = useState('prestacao'); // 'dashboard' | 'prestacao' | 'balancete' | 'taxas'
  const hookData = usePrestacaoContasTaymix();

  const {
    tipoFiltro, setTipoFiltro,
    mesSelecionado, setMesSelecionado,
    anoSelecionado, setAnoSelecionado,
    movimentacoesFiltradas = [], percentualGiro = 35, setPercentualGiro,
    tipo = 'Receita', setTipo, categoria = 'Vendas / Pedidos', setCategoria,
    descricao = '', setDescricao, valor = '', setValor,
    ehInvestimentoInicial = false, setEhInvestimentoInicial,
    dataLancamento = '', setDataLancamento, lendoNota = false,
    manualAberto = false, setManualAberto,
    categoriasReceita = [], categoriasDespesa = [],
    handleScanNota, adicionarLancamento, excluirLancamento,
    totalReceitas = 0, totalDespesasOperacionais = 0, lucroLiquido = 0,
    investimentoQuitado = false, valorCapitalGiro = 0,
    totalDinheiroCaixaAcumulado = 0, totalCartaoAcumulado = 0, totalPixAcumulado = 0,
    totalIfoodAcumulado = 0, total99Food = 0,
    qtdPedidosIfood = 0, qtdPedidos99Food = 0, qtdPedidosPix = 0,
    qtdPedidosDinheiro = 0, qtdPedidosCartao = 0
  } = hookData || {};

  // Estados locais de taxas
  const [taxaIfoodPct, setTaxaIfoodPct] = useState(hookData?.taxaIfoodPct ?? 26.2);
  const [taxaIfoodMensalidade, setTaxaIfoodMensalidade] = useState(hookData?.taxaIfoodMensalidade ?? 150.0);
  const [limiteIfoodMensalidade, setLimiteIfoodMensalidade] = useState(hookData?.limiteIfoodMensalidade ?? 1800.0);
  const [taxa99FoodPct, setTaxa99FoodPct] = useState(hookData?.taxa99FoodPct ?? 12.1);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState(hookData?.taxaCartaoPct ?? 0.0);

  const formatarBRL = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 relative">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BARRA SUPERIOR DE ABAS E ATALHOS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setManualAberto(true)}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <BookOpen size={14} /> Manual de Ajuda
            </button>

            {/* BOTÃO DA TELA DE BALANCETE */}
            <button
              onClick={() => setAbaAtiva('balancete')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                abaAtiva === 'balancete'
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <FileText size={14} /> Balancete & Relatório Oficial
            </button>
          </div>

          {/* ABAS DE NAVEGAÇÃO PRINCIPAL */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setAbaAtiva('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                abaAtiva === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setAbaAtiva('prestacao')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                abaAtiva === 'prestacao' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Prestação & Divisão
            </button>
            <button
              onClick={() => setAbaAtiva('taxas')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                abaAtiva === 'taxas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Taxas & Regras
            </button>
          </div>
        </div>

        {/* EXIBIÇÃO DA ABA 1: DASHBOARD */}
        {abaAtiva === 'dashboard' && <DashboardPage />}

        {/* EXIBIÇÃO DA TELA DE BALANCETE & RELATÓRIO OFICIAL */}
        {abaAtiva === 'balancete' && (
          <TelaBalanceteRelatorio
            movimentacoesGerais={hookData?.movimentacoesFiltradas || movimentacoesFiltradas}
            totalReceitasOficial={totalReceitas}
            totalDinheiroAcumulado={totalDinheiroCaixaAcumulado}
            totalPixAcumulado={totalPixAcumulado}
            totalCartaoAcumulado={totalCartaoAcumulado}
            totalIfoodAcumulado={totalIfoodAcumulado}
            total99FoodAcumulado={total99Food}
            formatarBRL={formatarBRL}
          />
        )}

        {/* EXIBIÇÃO DA ABA: TAXAS & REGRAS */}
        {abaAtiva === 'taxas' && (
          <ModalConfigTaxas
            taxaIfoodPct={taxaIfoodPct}
            setTaxaIfoodPct={setTaxaIfoodPct}
            taxaIfoodMensalidade={taxaIfoodMensalidade}
            setTaxaIfoodMensalidade={setTaxaIfoodMensalidade}
            limiteIfoodMensalidade={limiteIfoodMensalidade}
            setLimiteIfoodMensalidade={setLimiteIfoodMensalidade}
            taxa99FoodPct={taxa99FoodPct}
            setTaxa99FoodPct={setTaxa99FoodPct}
            taxaCartaoPct={taxaCartaoPct}
            setTaxaCartaoPct={setTaxaCartaoPct}
            setAbaAtiva={setAbaAtiva}
            formatarBRL={formatarBRL}
          />
        )}

        {/* EXIBIÇÃO DA ABA: PRESTAÇÃO DE CONTAS (COM FILTRO UNIFICADO IGUAL AO BALANCETE) */}
        {abaAtiva === 'prestacao' && (
          <div className="space-y-6">
            {/* BARRA DE FILTRO UNIFICADA (MÊS, ANO OU HISTÓRICO) */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <Calendar size={16} className="text-amber-600 ml-1" />
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
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
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
                  />
                )}

                {tipoFiltro === 'ano' && (
                  <select
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(e.target.value)}
                    className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                )}
              </div>
            </div>

            {/* CARDS SUPERIORES */}
            <ResumoFinanceiroCards
              totalReceitas={totalReceitas}
              totalDespesasOperacionais={totalDespesasOperacionais}
              lucroLiquido={lucroLiquido}
              investimentoQuitado={investimentoQuitado}
              valorCapitalGiro={valorCapitalGiro}
              percentualGiro={percentualGiro}
              setPercentualGiro={setPercentualGiro}
              formatarBRL={formatarBRL}
            />

            {/* CARDS DETALHADOS DOS CANAIS */}
            <DetalhamentoCanaisCards
              totalIfoodAcumulado={totalIfoodAcumulado}
              total99Food={total99Food}
              totalPixAcumulado={totalPixAcumulado}
              totalDinheiroCaixaAcumulado={totalDinheiroCaixaAcumulado}
              totalCartaoAcumulado={totalCartaoAcumulado}
              qtdPedidosIfood={qtdPedidosIfood}
              qtdPedidos99Food={qtdPedidos99Food}
              qtdPedidosPix={qtdPedidosPix}
              qtdPedidosDinheiro={qtdPedidosDinheiro}
              qtdPedidosCartao={qtdPedidosCartao}
              taxaIfoodPct={taxaIfoodPct}
              taxaIfoodMensalidade={taxaIfoodMensalidade}
              limiteIfoodMensalidade={limiteIfoodMensalidade}
              taxa99FoodPct={taxa99FoodPct}
              taxaCartaoPct={taxaCartaoPct}
              formatarBRL={formatarBRL}
            />

            {/* FORMULÁRIO DE LANÇAMENTOS + EXTRATO */}
            <FormularioELancamentos
              tipo={tipo}
              setTipo={setTipo}
              categoria={categoria}
              setCategoria={setCategoria}
              descricao={descricao}
              setDescricao={setDescricao}
              valor={valor}
              setValor={setValor}
              dataLancamento={dataLancamento}
              setDataLancamento={setDataLancamento}
              ehInvestimentoInicial={ehInvestimentoInicial}
              setEhInvestimentoInicial={setEhInvestimentoInicial}
              lendoNota={lendoNota}
              handleScanNota={handleScanNota}
              adicionarLancamento={adicionarLancamento}
              excluirLancamento={excluirLancamento}
              categoriasReceita={categoriasReceita}
              categoriasDespesa={categoriasDespesa}
              movimentacoesFiltradas={movimentacoesFiltradas}
              formatarBRL={formatarBRL}
            />
          </div>
        )}

        {/* MODAL MANUAL DE AJUDA */}
        {manualAberto && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="text-amber-600" size={20} /> Manual Prático de Gestão — Taymix
                </h2>
                <button
                  onClick={() => setManualAberto(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-medium">
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <p className="font-bold text-amber-900 mb-1">💡 Regra de Ouro: Como lançar notinhas?</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800">
                    <li><strong>Compras do Dia a Dia (OPEX):</strong> Deixe a caixinha de investimento <em>desmarcada</em> (como contas de luz, internet, gasolina e insumos).</li>
                    <li><strong>Investimento Inicial / Abertura:</strong> Marque <strong>[x] Notinha de Investimento Inicial</strong> para integrar o cálculo de Payback.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setManualAberto(false)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-colors mt-4 shadow-xs"
              >
                Entendido, Fechar Manual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}