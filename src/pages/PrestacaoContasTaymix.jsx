import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Users, Plus, Trash2, Filter, Camera, ShieldCheck, CheckSquare, Square, BookOpen, X, CreditCard, Smartphone, Store, Bike, Car } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { usePrestacaoContasTaymix } from '../hooks/usePrestacaoContasTaymix';
import ImpressaoPrestacaoContasTaymix from '../components/ImpressaoPrestacaoContasTaymix';

export default function PrestacaoContasTaymix() {
  const {
    dataInicio, setDataInicio,
    dataFim, setDataFim,
    movimentacoesFiltradas,
    percentualGiro, setPercentualGiro,
    investimentoManual, setInvestimentoManual,
    tipo, setTipo,
    categoria, setCategoria,
    descricao, setDescricao,
    valor, setValor,
    ehInvestimentoInicial, setEhInvestimentoInicial,
    dataLancamento, setDataLancamento,
    lendoNota,
    manualAberto, setManualAberto,
    categoriasReceita, categoriasDespesa,
    handleScanNota,
    adicionarLancamento,
    excluirLancamento,
    totalReceitas,
    totalDespesasOperacionais,
    lucroLiquido,
    totalNotinhasIniciais,
    investimentoTotalCalculado,
    saldoInvestimentoPendente,
    investimentoQuitado,
    valorCapitalGiro,
    valorParaDividir,
    lucroSocioA,
    lucroSocioB,
    totalDinheiroCaixaAcumulado,
    totalCartaoAcumulado,
    totalPixAcumulado,
    totalIfoodAcumulado,
    totalIfoodEntrega,
    total99Food
  } = usePrestacaoContasTaymix();

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-800 relative">
      <Toaster position="top-right" />

      {/* 🖥️ PAINEL VISUAL NA TELA */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho com Botões de Ajuda e Download de PDF */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                Prestação de Contas
              </span>
              <button
                onClick={() => setManualAberto(true)}
                className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer"
              >
                <BookOpen size={14} /> 📖 Manual de Ajuda
              </button>

              <ImpressaoPrestacaoContasTaymix 
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
                totalIfoodEntrega={totalIfoodEntrega}
                total99Food={total99Food}
              />
            </div>
            <h1 className="text-2xl font-black mt-2 tracking-wide text-amber-400">TAYMIX — Controle Financeiro</h1>
            <p className="text-xs text-slate-400 mt-1">Gestão de faturamento, despesas, capital de giro e divisão de lucros</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <Filter size={16} className="text-amber-400" />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white p-1.5 rounded outline-none"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white p-1.5 rounded outline-none"
            />
          </div>
        </div>

        {/* MODAL DO MANUAL DE AJUDA */}
        {manualAberto && (
          <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-amber-500" size={22} /> Manual Prático de Gestão — Taymix
                </h2>
                <button
                  onClick={() => setManualAberto(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <p className="font-bold text-amber-900 mb-1">💡 Regra de Ouro: Como lançar notinhas?</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800">
                    <li><strong>Compras do Dia a Dia:</strong> Deixe a caixinha de investimento <em>desmarcada</em> (despesa operacional).</li>
                    <li><strong>Investimento Inicial / Abertura:</strong> Marque <strong>[x] Notinha de Investimento Inicial</strong> para entrar no Payback.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-slate-900 text-sm">Como exportar o Balancete?</p>
                  <p>Clique no botão verde <strong>📄 Baixar Balancete Oficial em PDF</strong> no topo para gerar o documento corporativo formatado, respeitando o período filtrado.</p>
                </div>
              </div>

              <button
                onClick={() => setManualAberto(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors mt-4"
              >
                Entendido, Fechar Manual
              </button>
            </div>
          </div>
        )}

        {/* CARDS DE RESUMO FINANCEIRO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Faturamento (Vendas)</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Gastos do Mês</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={18} /></div>
            </div>
            <p className="text-2xl font-black text-rose-600">
              {totalDespesasOperacionais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          {/* 🎯 CARD DE LUCRO LÍQUIDO DINÂMICO: Fica âmbar quando retido no Payback e Azul somente quando 100% quitado */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {investimentoQuitado ? 'Lucro Líquido Real' : 'Lucro do Mês (Amortização)'}
              </span>
              <div className={`p-2 rounded-lg ${investimentoQuitado ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                <DollarSign size={18} />
              </div>
            </div>
            <p className={`text-2xl font-black ${investimentoQuitado ? 'text-blue-600' : 'text-amber-600'}`}>
              {lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {investimentoQuitado ? 'Liberado para distribuição' : 'Retido para pagamento do Payback'}
            </p>
          </div>

          {/* CARD DE CAPITAL DE GIRO */}
          <div className="bg-amber-500 text-slate-950 p-5 rounded-2xl shadow-sm border border-amber-400">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">Capital de Giro</span>
                <input
                  type="number"
                  value={percentualGiro}
                  onChange={(e) => setPercentualGiro(Number(e.target.value))}
                  className="w-12 bg-slate-950 text-amber-400 font-black text-xs text-center rounded p-0.5 outline-none border border-amber-600"
                />
                <span className="text-xs font-black text-slate-900">%</span>
              </div>
              <div className="p-2 bg-slate-950 text-amber-400 rounded-lg"><Wallet size={18} /></div>
            </div>
            <p className="text-2xl font-black">
              {valorCapitalGiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[10px] text-slate-800 font-bold mt-1">Sempre reservado para compras e estoque</p>
          </div>
        </div>

        {/* DETALHAMENTO DE VENDAS POR MEIO E CANAL */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-amber-500" /> Detalhamento de Vendas por Meio e Canal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Dinheiro (Espécie)</span>
              <span className="text-sm font-black text-slate-800">{totalDinheiroCaixaAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Cartão (Créd/Déb)</span>
              <span className="text-sm font-black text-slate-800">{totalCartaoAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Pix</span>
              <span className="text-sm font-black text-slate-800">{totalPixAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">iFood (Loja)</span>
              <span className="text-sm font-black text-slate-800">{totalIfoodAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">iFood (Parceiro)</span>
              <span className="text-sm font-black text-slate-800">{totalIfoodEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">99Food</span>
              <span className="text-sm font-black text-slate-800">{total99Food.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>

        {/* PAINEL DE INVESTIMENTO INICIAL & PAYBACK */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} /> Recuperação do Investimento Inicial (Payback)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notinhas de Abertura Cadastradas: <strong>{totalNotinhasIniciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Total Investido (R$):</label>
              <input
                type="number"
                value={investimentoTotalCalculado}
                onChange={(e) => setInvestimentoManual(Number(e.target.value) - totalNotinhasIniciais)}
                className="border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 w-36 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className={`p-3 rounded-xl border text-xs font-bold flex-1 md:flex-initial text-center ${investimentoQuitado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
              {investimentoQuitado ? (
                <span>✅ Investimento 100% Recuperado!</span>
              ) : (
                <span>⏳ Faltam {saldoInvestimentoPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para zerar</span>
              )}
            </div>
          </div>
        </div>

        {/* DIVISÃO DE LUCROS ENTRE SÓCIOS */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-3 border-b border-slate-800 gap-2">
            <h2 className="text-base font-bold flex items-center gap-2 text-amber-400">
              <Users size={18} /> Divisão de Lucros da Sociedade
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <label>Retenção Capital de Giro:</label>
              <input
                type="number"
                value={percentualGiro}
                onChange={(e) => setPercentualGiro(Number(e.target.value))}
                className="w-16 bg-slate-800 border border-slate-700 text-amber-400 font-bold text-center rounded p-1"
              /> %
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Total Disponível para Divisão</p>
              <p className="text-xl font-bold text-white">
                {valorParaDividir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500/30">
              <p className="text-xs text-emerald-400 font-bold mb-1">Sócio 1 (50%)</p>
              <p className="text-2xl font-black text-emerald-400">
                {lucroSocioA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500/30">
              <p className="text-xs text-emerald-400 font-bold mb-1">Sócio 2 (50%)</p>
              <p className="text-2xl font-black text-emerald-400">
                {lucroSocioB.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO DE LANÇAMENTO + LISTAGEM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-amber-500" /> Cadastrar Gastos ou Entradas
            </h3>

            {/* BOTÃO DE LEITURA RÁPIDA POR FOTO */}
            <div className="mb-4 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Camera size={16} className="text-amber-600" /> Leitura Rápida por Foto do Cupom
              </label>
              <p className="text-[10px] text-amber-700 mb-2">
                Tire uma foto do comprovante/notinha para preencher tudo automaticamente.
              </p>
              <label className={`block w-full text-center py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${lendoNota ? 'bg-amber-300 text-amber-900' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'}`}>
                {lendoNota ? 'Lendo imagem com IA...' : '📸 Tirar Foto / Enviar Notinha'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleScanNota}
                  disabled={lendoNota}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={adicionarLancamento} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Movimentação:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTipo('Receita'); setCategoria('Vendas / Pedidos'); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${tipo === 'Receita' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    + Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipo('Despesa'); setCategoria('Insumos / Ingredientes'); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${tipo === 'Despesa' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    - Despesa (Saída)
                  </button>
                </div>
              </div>

              {tipo === 'Despesa' && (
                <div
                  onClick={() => setEhInvestimentoInicial(!ehInvestimentoInicial)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${ehInvestimentoInicial ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  {ehInvestimentoInicial ? <CheckSquare size={16} className="text-amber-600" /> : <Square size={16} className="text-slate-400" />}
                  <span className="text-xs font-bold">Notinha de Investimento Inicial (Abertura/Equipamento)</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria:</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {(tipo === 'Receita' ? categoriasReceita : categoriasDespesa).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição:</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de pães e carne / Venda do dia"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Valor (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data:</label>
                <input
                  type="date"
                  value={dataLancamento}
                  onChange={(e) => setDataLancamento(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs shadow transition-colors mt-2"
              >
                Salvar Lançamento
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Extrato de Entradas e Saídas</h3>

            {movimentacoesFiltradas.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Nenhum lançamento registrado no período.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {movimentacoesFiltradas.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-xs font-bold ${item.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.tipo === 'Receita' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 capitalize">{item.descricao}</p>
                          {item.ehInvestimentoInicial && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-200">
                              Investimento Inicial
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {item.categoria} • {new Date(item.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black ${item.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.tipo === 'Receita' ? '+' : '-'} {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <button
                        onClick={() => excluirLancamento(item._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}