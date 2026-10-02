import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCardExpandable = ({ product }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const id = product.id || product._id;
  const preco = Number(product.preco || product.price || 0);
  const imagem = product.imagem || product.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';
  const nome = product.nome || product.name;
  const descricao = product.descricao || product.description;

  const itemInCart = cart.find(item => (item.id || item._id) === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({ ...product, id, preco, imagem });
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    removeFromCart(id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-md">
      
      {/* Cabeçalho do Card com imagem maior (w-24 h-24 no mobile/desktop) */}
      <div 
        onClick={handleToggleExpand}
        className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/50"
      >
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-lg text-slate-100 mb-1">{nome}</h3>
          <p className="text-xs md:text-sm text-slate-400 line-clamp-2 mb-3">{descricao}</p>
          <p className="text-sm font-bold text-emerald-400">
            a partir de R$ {preco.toFixed(2)}
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          {!isExpanded && (
            <img
              src={imagem}
              alt={nome}
              className="w-24 h-24 rounded-xl object-cover shadow-sm"
            />
          )}
          <div className="text-slate-500">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-800 bg-slate-950/50">
          <img
            src={imagem}
            alt={nome}
            className="w-full h-56 md:h-64 object-cover rounded-xl mb-4 mt-4 shadow-md"
          />
          
          <p className="text-sm text-slate-300 mb-5 leading-relaxed">
            {descricao}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xl font-bold text-emerald-400">
              R$ {(preco * (quantity > 0 ? quantity : 1)).toFixed(2)}
            </span>

            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition text-sm cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-md">
                <button 
                  onClick={handleRemoveFromCart} 
                  className="p-2 bg-slate-800 rounded-lg text-amber-400 hover:bg-slate-700 cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-slate-100 w-8 text-center">{quantity}</span>
                <button 
                  onClick={handleAddToCart} 
                  className="p-2 bg-slate-800 rounded-lg text-amber-400 hover:bg-slate-700 cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCardExpandable;