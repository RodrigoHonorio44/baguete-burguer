import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';

export const Checkout = () => {
  const {
    cart,
    form,
    loading,
    loadingGeo,
    loadingCancelamento,
    taxaEntrega,
    navigate,
    handleChange,
    capturarLocalizacao,
    calcularSubtotal,
    calcularTotal,
    handleCancelarPedido,
    handleSubmit,
  } = useCheckout();

  // Subtotal apenas dos produtos do carrinho
  const subtotalProdutos = calcularSubtotal();

  // Valor total final: Produtos + Taxa de Entrega calculada pelo hook
  const totalGeral = calcularTotal();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Finalizar Pedido</h1>
        <p className="text-sm text-slate-400">Reveja a morada, personalize o seu hambúrguer e escolha o pagamento</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
        
        {/* Bloco de Dados Cadastrais */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Dados de Entrega</span>
            <button 
              type="button" 
              onClick={() => navigate('/cadastro')} 
              className="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer"
            >
              Editar dados
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Nome:</span>
              <span className="text-slate-100 font-medium">{form.cliente_nome || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Telefone:</span>
              <span className="text-slate-100 font-medium">{form.telefone || 'Não informado'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 text-xs block">Morada:</span>
              <span className="text-slate-100 font-medium whitespace-pre-line">
                {form.rua ? `${form.rua}, nº ${form.numero}\n${form.bairro}` : 'Endereço não informado'}
              </span>
              {/* Alerta caso as coordenadas não estejam definidas ou a taxa seja zero fora da área */}
              {!form.latitude && (
                <p className="text-xs text-amber-400 mt-1">Clique em "Atualizar Localização Atual (GPS)" para calcular a taxa de entrega.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={capturarLocalizacao}
            disabled={loadingGeo}
            className="w-full py-2 bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <MapPin className="w-4 h-4" />
            {loadingGeo ? 'A atualizar GPS...' : 'Atualizar Localização Atual (GPS)'}
          </button>
        </div>

        {/* Observações do Hambúrguer */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Observações do Pedido (Ex: sem cebola, ponto da carne, tirar maionese...)
          </label>
          <textarea
            name="observacoes"
            rows="3"
            value={form.observacoes}
            onChange={handleChange}
            placeholder="Deseja retirar ou acrescentar algum ingrediente no hambúrguer?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Forma de Pagamento
          </label>
          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="pix">Pix</option>
            <option value="dinheiro_certo">Dinheiro (sem troco)</option>
            <option value="dinheiro_troco">Dinheiro (com troco)</option>
            <option value="cartao_credito">Cartão de Crédito (na entrega)</option>
            <option value="cartao_debito">Cartão de Débito (na entrega)</option>
          </select>
        </div>

        {/* CAMPO CONDICIONAL DE TROCO (Apenas se escolher dinheiro com troco) */}
        {form.forma_pagamento === 'dinheiro_troco' && (
          <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <label className="block text-xs font-medium text-amber-400">
              Precisa de troco para quanto? (Informe o valor em dinheiro que vai entregar)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                name="troco_para"
                placeholder="Ex: 100.00"
                value={form.troco_para || ''}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            {form.troco_para && Number(form.troco_para) > totalGeral && (
              <p className="text-xs text-emerald-400 font-bold">
                Troco a devolver: R$ {(Number(form.troco_para) - totalGeral).toFixed(2)}
              </p>
            )}
            {form.troco_para && Number(form.troco_para) <= totalGeral && (
              <p className="text-xs text-rose-400 font-bold">
                O valor informado deve ser maior que o total do pedido.
              </p>
            )}
          </div>
        )}

        {/* Resumo de Valores (Produto + Frete) */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal dos produtos:</span>
            <span>R$ {subtotalProdutos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxa de entrega:</span>
            <span className="text-amber-400">
              {taxaEntrega > 0 ? `R$ ${taxaEntrega.toFixed(2)}` : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* Resumo e Botões Finais */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total a pagar:</span>
              <span className="text-2xl font-bold text-amber-500">R$ {totalGeral.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={
                loading || 
                cart.length === 0 || 
                taxaEntrega === 0 || 
                (form.forma_pagamento === 'dinheiro_troco' && (!form.troco_para || Number(form.troco_para) <= totalGeral))
              }
              className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-sm shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'A finalizar...' : 'Finalizar Pedido'}
            </button>
          </div>

          {/* Botão de Cancelar Pedido */}
          <button
            type="button"
            onClick={handleCancelarPedido}
            disabled={loadingCancelamento}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loadingCancelamento ? 'A cancelar...' : 'Desistir / Cancelar Pedido'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;