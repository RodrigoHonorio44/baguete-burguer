import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, AlertCircle, PlusCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  // Força o padrão inicial para 20 caso não encontre em lugar nenhum
  const [pedidoMinimo, setPedidoMinimo] = useState(20);

  // Carrega o pedido mínimo da API do banco e faz fallback para o localStorage
  useEffect(() => {
    if (isCartOpen) {
      const buscarPedidoMinimo = async () => {
        try {
          // Tenta buscar diretamente do backend/banco de dados online
          if (api.getConfiguracoesLoja) {
            const configServer = await api.getConfiguracoesLoja();
            if (configServer && (configServer.pedidoMinimo !== undefined || configServer.pedido_minimo !== undefined)) {
              const minServidor = Number(configServer.pedidoMinimo ?? configServer.pedido_minimo);
              setPedidoMinimo(minServidor >= 0 ? minServidor : 20);
              return;
            }
          }

          // Se falhar a API, tenta o localStorage
          const configSalva = localStorage.getItem('configuracoes_loja');
          if (configSalva) {
            const parsed = JSON.parse(configSalva);
            const minLocal = Number(parsed.pedidoMinimo ?? parsed.pedido_minimo);
            if (!isNaN(minLocal)) {
              setPedidoMinimo(minLocal);
              return;
            }
          }
        } catch (e) {
          console.error('Erro ao carregar pedido mínimo:', e);
        }
      };

      buscarPedidoMinimo();
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // Cálculo de segurança blindado contra NaN para o total
  const totalGeral = typeof cartTotal === 'number' && !isNaN(cartTotal)
    ? cartTotal
    : cart.reduce((acc, item) => {
        const preco = Number(item.preco || item.price || 0);
        const qtd = Number(item.quantity || 1);
        return acc + (preco * qtd);
      }, 0);

  const atingiuMinimo = pedidoMinimo <= 0 || totalGeral >= pedidoMinimo;
  const faltaValor = pedidoMinimo > 0 && totalGeral < pedidoMinimo ? pedidoMinimo - totalGeral : 0;

  // Função para voltar ao cardápio e fechar o carrinho
  const handleVoltarAoCardapio = () => {
    setIsCartOpen(false);
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fundo escurecido suave com blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200/80 p-6 text-slate-800 flex flex-col justify-between shadow-2xl">
          <div>
            {/* Cabeçalho do Carrinho */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">seu carrinho</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Itens ou Estado Vazio */}
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium text-sm">
                o seu carrinho está vazio.
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const id = item.id || item._id;
                  const preco = Number(item.preco || item.price || 0);
                  const quantidade = Number(item.quantity || 1);
                  const subtotalItem = preco * quantidade;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs"
                    >
                      <div className="flex-1 pr-2">
                        <h4 className="font-bold text-sm text-slate-800 capitalize">{item.nome || item.name}</h4>
                        <span className="text-xs text-emerald-600 font-extrabold block">
                          R$ {preco.toFixed(2)} un
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Subtotal: R$ {subtotalItem.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-2xs">
                          {/* Botão Menos */}
                          <button
                            onClick={() => updateQuantity(id, quantidade - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold cursor-pointer rounded-l-lg transition"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{quantidade}</span>
                          {/* Botão Mais */}
                          <button
                            onClick={() => updateQuantity(id, quantidade + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold cursor-pointer rounded-r-lg transition"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rodapé e Ações do Carrinho */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <div className="flex justify-between items-center mb-3 text-slate-800 font-black">
                <span className="text-sm uppercase tracking-wider">total:</span>
                <span className="text-emerald-600 text-xl font-extrabold">R$ {totalGeral.toFixed(2)}</span>
              </div>

              {/* Alerta Visual e Ação para Pedido Mínimo */}
              {pedidoMinimo > 0 && !atingiuMinimo ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 font-medium">
                      <span className="font-bold block text-amber-950">Pedido mínimo: R$ {pedidoMinimo.toFixed(2)}</span>
                      <span>Faltam <strong className="text-amber-950 font-bold">R$ {faltaValor.toFixed(2)}</strong> para finalizar.</span>
                    </div>
                  </div>

                  {/* Botão para Adicionar Mais Itens no Cardápio */}
                  <button
                    type="button"
                    onClick={handleVoltarAoCardapio}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Adicionar mais R$ {faltaValor.toFixed(2)} (Ver Cardápio)
                  </button>
                </div>
              ) : (
                /* Botão de Avançar para o Checkout */
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition text-sm cursor-pointer shadow-xs"
                >
                  finalizar pedido
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;