import React from 'react';
import { PlusCircle, X, Check } from 'lucide-react';

export const ModalPdv = ({
  modalPdvAberto,
  setModalPdvAberto,
  canalPdv,
  setCanalPdv,
  tipoRetiradaPdv,
  setTipoRetiradaPdv,
  clientePdv,
  setClientePdv,
  produtos,
  adicionarAoCarrinhoPdv,
  formatarMoeda,
  carrinhoPdv,
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
  if (!modalPdvAberto) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" /> Registrar Venda Manual (Caixa)
          </h2>
          <button onClick={() => setModalPdvAberto(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Canal de Venda</label>
              <select
                value={canalPdv}
                onChange={(e) => setCanalPdv(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-amber-700 text-sm font-bold focus:outline-none focus:border-amber-500"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
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

          {/* Produtos do Estoque */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Selecionar Produtos</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {produtos && produtos.map((prod) => (
                <button
                  key={prod._id || prod.id}
                  type="button"
                  onClick={() => adicionarAoCarrinhoPdv(prod)}
                  className="text-left bg-white hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition cursor-pointer flex flex-col justify-between shadow-2xs"
                >
                  <span className="text-xs font-semibold text-slate-800 truncate block">{prod.nome}</span>
                  <span className="text-[11px] text-amber-600 font-bold mt-1">{formatarMoeda(prod.preco)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Carrinho de Itens */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Itens da Venda</label>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 max-h-32 overflow-y-auto">
              {carrinhoPdv.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Nenhum produto selecionado ainda.</p>
              ) : (
                carrinhoPdv.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1">
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
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
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
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