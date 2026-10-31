import React, { useState, useMemo } from 'react';
import { PlusCircle, X, Check, Search } from 'lucide-react';

export const ModalPdv = ({
  modalPdvAberto,
  setModalPdvAberto,
  canalPdv,
  setCanalPdv,
  tipoRetiradaPdv,
  setTipoRetiradaPdv,
  clientePdv,
  setClientePdv,
  produtos = [],
  adicionarAoCarrinhoPdv,
  formatarMoeda,
  carrinhoPdv = [],
  totalCarrinhoPdv,
  taxaComissaoPdv,
  repasseLiquidoPdv,
  pagamentoPdv,
  setPagamentoPdv,
  valorRecebidoPdv,
  setValorRecebidoPdv,
  trocoPdv,
  finalizarVendaPdv
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');

  // Extrai as categorias únicas a partir dos produtos informados
  const categorias = useMemo(() => {
    if (!Array.isArray(produtos)) return ['todos'];
    const list = produtos.map(p => p.categoria || p.category).filter(Boolean);
    return ['todos', ...Array.from(new Set(list))];
  }, [produtos]);

  // Filtra os produtos por categoria ativa e por texto digitado na busca
  const produtosFiltrados = useMemo(() => {
    if (!Array.isArray(produtos)) return [];
    return produtos.filter(prod => {
      const catProd = (prod.categoria || prod.category || '').toLowerCase();
      const nomeProd = (prod.nome || prod.name || '').toLowerCase();
      
      const bateCategoria = categoriaAtiva === 'todos' || catProd === categoriaAtiva.toLowerCase();
      const bateBusca = !busca || nomeProd.includes(busca.toLowerCase());

      return bateCategoria && bateBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  if (!modalPdvAberto) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" /> Registrar Venda Manual (Caixa)
          </h2>
          <button 
            type="button"
            onClick={() => setModalPdvAberto(false)} 
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Dados Iniciais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Canal de Venda</label>
              <select
                value={canalPdv}
                onChange={(e) => setCanalPdv(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-amber-700 text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="presencial">Balcão / Presencial</option>
                <option value="ifood_loja">iFood (Entrega Própria)</option>
                <option value="ifood_parceiro">iFood (Entrega Parceira)</option>
                <option value="99food">99Food</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Atendimento</label>
              <select
                value={tipoRetiradaPdv}
                onChange={(e) => setTipoRetiradaPdv(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="retirada">Retirada no Balcão</option>
                <option value="entrega">Delivery / Motoboy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nome do Cliente</label>
              <input
                type="text"
                placeholder="Ex: Nome do cliente"
                value={clientePdv}
                onChange={(e) => setClientePdv(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Filtro por Categorias + Pesquisa em Texto */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Selecionar Produtos</label>
              
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar produto pelo nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Abas de Categorias */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categorias.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                    categoriaAtiva === cat
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grade de Produtos do Estoque */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-60 overflow-y-auto">
            {produtosFiltrados.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">Nenhum produto encontrado nesta categoria.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {produtosFiltrados.map((prod) => {
                  const id = prod._id || prod.id;
                  const disponivel = prod.disponivel !== false && Number(prod.estoque || 0) > 0;

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!disponivel}
                      onClick={() => adicionarAoCarrinhoPdv(prod)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        disponivel
                          ? 'bg-white border-slate-200 hover:border-amber-500 hover:shadow-xs'
                          : 'bg-rose-50/40 border-rose-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 capitalize leading-snug line-clamp-2">
                        {prod.nome || prod.name}
                      </span>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-black text-amber-600">{formatarMoeda(prod.preco)}</span>
                        {!disponivel && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded uppercase">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrinho de Itens */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Itens da Venda</label>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 max-h-36 overflow-y-auto">
              {carrinhoPdv.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Nenhum produto selecionado ainda.</p>
              ) : (
                carrinhoPdv.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1.5 pt-0.5">
                    <span className="text-slate-800 font-medium">{item.qtd}x {item.nome}</span>
                    <span className="text-emerald-600 font-bold">{formatarMoeda(item.preco * item.qtd)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo de Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Bruto</span>
              <span className="text-sm font-extrabold text-slate-800">{formatarMoeda(totalCarrinhoPdv)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Taxa / Comissão</span>
              <span className="text-sm font-extrabold text-amber-600">{taxaComissaoPdv}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Repasse Líquido</span>
              <span className="text-sm font-extrabold text-emerald-600">{formatarMoeda(repasseLiquidoPdv)}</span>
            </div>
          </div>

          {/* Pagamento e Troco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Forma de Pagamento</label>
              <select
                value={pagamentoPdv}
                onChange={(e) => setPagamentoPdv(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cartao_credito">Cartão de Crédito</option>
              </select>
            </div>

            {pagamentoPdv === 'dinheiro' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50.00"
                  value={valorRecebidoPdv}
                  onChange={(e) => setValorRecebidoPdv(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
                {trocoPdv > 0 && (
                  <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                    Troco: {formatarMoeda(trocoPdv)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé das Ações */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setModalPdvAberto(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={finalizarVendaPdv}
            disabled={carrinhoPdv.length === 0}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 ${
              carrinhoPdv.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Check size={16} /> Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPdv;