import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  // Cálculo de segurança blindado contra NaN para o total
  const totalGeral = typeof cartTotal === 'number' && !isNaN(cartTotal)
    ? cartTotal
    : cart.reduce((acc, item) => {
        const preco = Number(item.preco || item.price || 0);
        const qtd = Number(item.quantity || 1);
        return acc + (preco * qtd);
      }, 0);

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
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                          {/* Botão Menos garantindo o cálculo correto */}
                          <button
                            onClick={() => updateQuantity(id, quantidade - 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-slate-100 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-100">{quantidade}</span>
                          {/* Botão Mais garantindo o cálculo correto */}
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
              <div className="flex justify-between items-center mb-4 text-slate-100 font-bold">
                <span>total:</span>
                <span className="text-emerald-400 text-xl">R$ {totalGeral.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition cursor-pointer"
              >
                finalizar pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};