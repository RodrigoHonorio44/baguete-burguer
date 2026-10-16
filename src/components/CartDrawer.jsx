import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // Certifique-se de que a api está importada

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* fundo escuro com opacidade */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 text-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">seu carrinho</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                o seu carrinho está vazio.
              </div>
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const id = item.id || item._id;
                  const preco = Number(item.preco || item.price || 0);
                  const quantidade = Number(item.quantity || 1);
                  const subtotalItem = preco * quantidade;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-800"
                    >
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-sm capitalize">{item.nome || item.name}</h4>
                        <span className="text-xs text-emerald-400 font-bold block">
                          R$ {preco.toFixed(2)} un
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Subtotal: R$ {subtotalItem.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-700 rounded-md bg-slate-800">
                          {/* Botão Menos */}
                          <button
                            onClick={() => updateQuantity(id, quantidade - 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-slate-100 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-100">{quantidade}</span>
                          {/* Botão Mais */}
                          <button
                            onClick={() => updateQuantity(id, quantidade + 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-slate-100 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(id)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
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

          {cart.length > 0 && (
            <div className="border-t border-slate-800 pt-4 mt-auto">
              <div className="flex justify-between items-center mb-3 text-slate-100 font-bold">
                <span>total:</span>
                <span className="text-emerald-400 text-xl">R$ {totalGeral.toFixed(2)}</span>
              </div>

              {/* Alerta Visual de Pedido Mínimo */}
              {pedidoMinimo > 0 && !atingiuMinimo && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg mb-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-300">
                    <span className="font-bold block">Pedido mínimo: R$ {pedidoMinimo.toFixed(2)}</span>
                    <span>Faltam <strong className="text-white">R$ {faltaValor.toFixed(2)}</strong> para finalizar.</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!atingiuMinimo) return;
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                disabled={!atingiuMinimo}
                className={`w-full py-3 font-bold rounded-lg transition ${
                  atingiuMinimo
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {atingiuMinimo ? 'finalizar pedido' : `adicione mais R$ ${faltaValor.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;