import React, { useState } from 'react';
import { Plus, Camera, CheckSquare, Square, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FormularioELancamentos({
  tipo = 'Receita',
  setTipo,
  categoria = 'Vendas / Pedidos',
  setCategoria,
  descricao = '',
  setDescricao,
  valor = '',
  setValor,
  dataLancamento = '',
  setDataLancamento,
  ehInvestimentoInicial = false,
  setEhInvestimentoInicial,
  lendoNota = false,
  handleScanNota,
  adicionarLancamento,
  excluirLancamento,
  categoriasReceita = [],
  categoriasDespesa = [],
  movimentacoesFiltradas = [],
  formatarBRL
}) {
  // Estado de paginação local para controlar o extrato
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6; // Ajustado para preencher a altura sem esticar ou deixar espaços soltos

  const listaMovs = Array.isArray(movimentacoesFiltradas) ? movimentacoesFiltradas : [];

  // Cálculos de paginação
  const totalPaginas = Math.ceil(listaMovs.length / itensPorPagina) || 1;
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensPaginaAtual = listaMovs.slice(indexPrimeiroItem, indexUltimoItem);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* FORMULÁRIO DE CADASTRO DE GASTOS / ENTRADAS */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus size={16} className="text-amber-600" /> Cadastrar Gastos ou Entradas
        </h3>

        {/* Leitura Rápida com Câmera */}
        <div className="mb-4 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
          <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
            <Camera size={16} className="text-amber-600" /> Leitura Rápida por Foto do Cupom
          </label>
          <p className="text-[10px] text-amber-800 font-medium mb-2">
            Tire uma foto do comprovante/notinha para preencher tudo automaticamente.
          </p>
          <label className={`block w-full text-center py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${lendoNota ? 'bg-amber-200 text-amber-900' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}>
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
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Movimentação:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTipo && setTipo('Receita'); setCategoria && setCategoria('Vendas / Pedidos'); }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${tipo === 'Receita' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                + Receita (Entrada)
              </button>
              <button
                type="button"
                onClick={() => { setTipo && setTipo('Despesa'); setCategoria && setCategoria('Insumos / Ingredientes'); }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${tipo === 'Despesa' ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                - Despesa (Saída)
              </button>
            </div>
          </div>

          {tipo === 'Despesa' && (
            <div
              onClick={() => setEhInvestimentoInicial && setEhInvestimentoInicial(!ehInvestimentoInicial)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${ehInvestimentoInicial ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              {ehInvestimentoInicial ? <CheckSquare size={16} className="text-amber-600" /> : <Square size={16} className="text-slate-400" />}
              <span className="text-xs font-bold">Notinha de Investimento Inicial (Abertura/Equipamento)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Categoria:</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria && setCategoria(e.target.value)}
              className="w-full border border-slate-300 bg-slate-50 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition"
            >
              {(tipo === 'Receita' ? categoriasReceita : categoriasDespesa).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descrição:</label>
            <input
              type="text"
              placeholder="Ex: Compra de pães e carne / Venda do dia"
              value={descricao}
              onChange={(e) => setDescricao && setDescricao(e.target.value)}
              className="w-full border border-slate-300 bg-slate-50 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Valor (R$):</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor && setValor(e.target.value)}
              className="w-full border border-slate-300 bg-slate-50 rounded-xl p-2 text-xs outline-none font-black text-slate-800 focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Data:</label>
            <input
              type="date"
              value={dataLancamento || ''}
              onChange={(e) => setDataLancamento && setDataLancamento(e.target.value)}
              className="w-full border border-slate-300 bg-slate-50 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-xs transition-colors mt-2 cursor-pointer"
          >
            Salvar Lançamento
          </button>
        </form>
      </div>

      {/* EXTRATO DE ENTRADAS E SAÍDAS COM PAGINAÇÃO LIMPA */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Extrato de Entradas e Saídas ({listaMovs.length} lançamentos)
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Página {paginaAtual} de {totalPaginas}
            </span>
          </div>

          {listaMovs.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center font-medium">Nenhum lançamento registrado no período.</p>
          ) : (
            <div className="space-y-2">
              {itensPaginaAtual.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-xs font-black ${item.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {item.tipo === 'Receita' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 capitalize">{item.descricao}</p>
                        {item.ehInvestimentoInicial && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-md font-bold border border-amber-200">
                            Investimento Inicial
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {item.categoria} • {new Date(item.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black ${item.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.tipo === 'Receita' ? '+' : '-'} {formatarBRL(item.valor)}
                    </span>
                    <button
                      onClick={() => excluirLancamento && excluirLancamento(item._id || item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                      title="Excluir lançamento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RODAPÉ DE CONTROLE DA PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
            <span className="text-xs text-slate-500 font-semibold">
              Mostrando {indexPrimeiroItem + 1} a {Math.min(indexUltimoItem, listaMovs.length)} de {listaMovs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
                disabled={paginaAtual === 1}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}