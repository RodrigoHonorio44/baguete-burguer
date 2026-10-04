import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, EyeOff, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCardExpandable = ({ product, onToggleDisponibilidade }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const id = product.id || product._id;
  const preco = Number(product.preco || product.price || 0);
  const imagem = product.imagem || product.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';
  const nome = product.nome || product.name;
  const descricao = product.descricao || product.description;
  
  const disponivel = product.disponivel !== undefined ? product.disponivel : true;

  const itemInCart = cart.find(item => (item.id || item._id) === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  // Verificação estrita do perfil de admin ou root
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.role || userObj.tipo || userObj.nivel) {
          return String(userObj.role || userObj.tipo || userObj.nivel).toLowerCase();
        }
      }
    } catch (e) {
      // Ignora erro de parse
    }
    return (localStorage.getItem('userRole') || localStorage.getItem('role') || localStorage.getItem('tipo') || '').toLowerCase().trim();
  };

  const userRole = getUserRole();
  const isAdminOrRoot = ['admin', 'root', 'administrador', 'administrator'].includes(userRole);

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!disponivel) return;
    addToCart({ ...product, id, preco, imagem });
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    removeFromCart(id);
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    if (typeof onToggleDisponibilidade === 'function') {
      onToggleDisponibilidade(id, !disponivel);
    }
  };

  return (
    <div className={`bg-white border ${disponivel ? 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md' : 'border-rose-200 opacity-75 bg-rose-50/20'} rounded-2xl overflow-hidden transition-all duration-200 relative group`}>
      
      {/* Cabeçalho do Card */}
      <div 
        onClick={handleToggleExpand}
        className="p-5 flex justify-between items-center cursor-pointer bg-white hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="font-bold text-base md:text-lg text-slate-900 tracking-tight">{nome}</h3>
            {!disponivel && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Esgotado
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{descricao}</p>
          <p className="text-sm md:text-base font-extrabold text-slate-900">
            <span className="text-xs font-normal text-slate-500 mr-1">a partir de</span> 
            <span className="text-emerald-600">R$ {preco.toFixed(2)}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          {!isExpanded && (
            <div className="relative">
              <img
                src={imagem}
                alt={nome}
                className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover shadow-sm border border-slate-100"
              />
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100 bg-slate-50/50">
          <img
            src={imagem}
            alt={nome}
            className="w-full h-56 md:h-64 object-cover rounded-xl mb-4 mt-4 shadow-sm border border-slate-100"
          />
          
          <p className="text-sm text-slate-700 mb-5 leading-relaxed font-normal">
            {descricao}
          </p>

          {/* Botão de controle visível APENAS para Admin/Root */}
          {isAdminOrRoot && (
            <div className="mb-4 flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-700 font-semibold">Controle de Estoque/Disponibilidade:</span>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer select-none ${
                  disponivel 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {disponivel ? 'Disponível (Visível)' : 'Indisponível (Esgotado)'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 block">Total do item</span>
              <span className="text-lg md:text-xl font-black text-slate-900">
                R$ {(preco * (quantity > 0 ? quantity : 1)).toFixed(2)}
              </span>
            </div>

            {!disponivel ? (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
                Produto Indisponível
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition text-sm cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm">
                <button 
                  onClick={handleRemoveFromCart} 
                  className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-slate-900 w-8 text-center text-sm">{quantity}</span>
                <button 
                  onClick={handleAddToCart} 
                  className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
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