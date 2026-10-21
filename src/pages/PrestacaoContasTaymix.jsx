import React, { useState } from 'react';
import { Filter, BookOpen, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { usePrestacaoContasTaymix } from '../hooks/usePrestacaoContasTaymix';
import DashboardPage from './DashboardPage';

// Importação de todos os componentes divididos
import CabecalhoPrestacao from '../components/CabecalhoPrestacao';
import ResumoFinanceiroCards from '../components/ResumoFinanceiroCards';
import DetalhamentoCanaisCards from '../components/DetalhamentoCanaisCards';
import PaybackEDivisaoSocios from '../components/PaybackEDivisaoSocios';
import FormularioELancamentos from '../components/FormularioELancamentos';
import ModalConfigTaxas from '../components/ModalConfigTaxas'; // <-- Aba de Taxas

export default function PrestacaoContasTaymix() {
  const [abaAtiva, setAbaAtiva] = useState('prestacao'); // 'dashboard' | 'prestacao' | 'taxas'
  const hookData = usePrestacaoContasTaymix();

  const {
    dataInicio, setDataInicio, dataFim, setDataFim,
    movimentacoesFiltradas = [], percentualGiro = 35, setPercentualGiro,
    investimentoManual = 0, setInvestimentoManual,
    tipo = 'Receita', setTipo, categoria = 'Vendas / Pedidos', setCategoria,
    descricao = '', setDescricao, valor = '', setValor,
    ehInvestimentoInicial = false, setEhInvestimentoInicial,
    dataLancamento = '', setDataLancamento, lendoNota = false,
    manualAberto = false, setManualAberto,
    categoriasReceita = [], categoriasDespesa = [],
    handleScanNota, adicionarLancamento, excluirLancamento,
    totalReceitas = 0, totalDespesasOperacionais = 0, lucroLiquido = 0,
    totalNotinhasIniciais = 0, investimentoTotalCalculado = 0, saldoInvestimentoPendente = 0,
    investimentoQuitado = false, valorCapitalGiro = 0, valorParaDividir = 0,
    lucroSocioA = 0, lucroSocioB = 0,
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
        {/* CABEÇALHO */}
        <CabecalhoPrestacao
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          setManualAberto={setManualAberto}
          faturamento={totalReceitas}
          gastos={totalDespesasOperacionais}
          lucroLiquido={lucroLiquido}
          capitalGiro={valorCapitalGiro}
          investimentoInicialPendente={saldoInvestimentoPendente}
          totalInvestido={investimentoTotalCalculado}
          extrato={movimentacoesFiltradas}
          retencaoGiro={percentualGiro}
          totalDisponivelDivisao={valorParaDividir}
          socio1Valor={lucroSocioA}
          socio2Valor={lucroSocioB}
          dataInicio={dataInicio}
          dataFim={dataFim}
          totalDinheiroCaixaAcumulado={totalDinheiroCaixaAcumulado}
          totalCartaoAcumulado={totalCartaoAcumulado}
          totalPixAcumulado={totalPixAcumulado}
          totalIfoodAcumulado={totalIfoodAcumulado}
          totalIfoodEntrega={0}
          total99Food={total99Food}
        />

        {/* EXIBIÇÃO DA ABA 1: DASHBOARD */}
        {abaAtiva === 'dashboard' && <DashboardPage />}

        {/* EXIBIÇÃO DA ABA 3: TAXAS & REGRAS (NOVO COMPONENTE) */}
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

        {/* EXIBIÇÃO DA ABA 2: PRESTAÇÃO DE CONTAS */}
        {abaAtiva === 'prestacao' && (
          <div className="space-y-6">
            {/* Filtro de Datas */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <Filter size={16} className="text-amber-600" />
                <input
                  type="date"
                  value={dataInicio || ''}
                  onChange={(e) => setDataInicio && setDataInicio(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
                />
                <span className="text-xs font-bold text-slate-400">até</span>
                <input
                  type="date"
                  value={dataFim || ''}
                  onChange={(e) => setDataFim && setDataFim(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 p-1.5 rounded-lg outline-none focus:border-amber-500"
                />
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

            {/* PAYBACK E SOCIOS */}
            <PaybackEDivisaoSocios
              totalNotinhasIniciais={totalNotinhasIniciais}
              investimentoTotalCalculado={investimentoTotalCalculado}
              setInvestimentoManual={setInvestimentoManual}
              investimentoQuitado={investimentoQuitado}
              saldoInvestimentoPendente={saldoInvestimentoPendente}
              percentualGiro={percentualGiro}
              setPercentualGiro={setPercentualGiro}
              valorParaDividir={valorParaDividir}
              lucroSocioA={lucroSocioA}
              lucroSocioB={lucroSocioB}
              formatarBRL={formatarBRL}
            />

            {/* FORMULÁRIO + EXTRATO */}
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
                  onClick={() => setManualAberto && setManualAberto(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-medium">
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <p className="font-bold text-amber-900 mb-1">💡 Regra de Ouro: Como lançar notinhas?</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800">
                    <li><strong>Compras do Dia a Dia:</strong> Deixe a caixinha de investimento <em>desmarcada</em> (despesa operacional).</li>
                    <li><strong>Investimento Inicial / Abertura:</strong> Marque <strong>[x] Notinha de Investimento Inicial</strong> para entrar no Payback.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setManualAberto && setManualAberto(false)}
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