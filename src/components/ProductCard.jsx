import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const id = product.id || product._id;
  const preco = Number(product.preco || product.price || 0);
  const imagem = product.imagem || product.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition">
      <img
        src={imagem}
        alt={product.nome || product.name}
        className="h-48 w-full object-cover"
      />
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
          {product.categoria || product.category}
        </span>
        <h3 className="font-bold text-lg text-slate-100 mb-2">{product.nome || product.name}</h3>
        <p className="text-sm text-slate-400 flex-1 mb-4">{product.descricao || product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800">
          <span className="text-lg font-bold text-emerald-400">
            r$ {preco.toFixed(2)}
          </span>
          <button
            onClick={() => addToCart({ ...product, id, preco, imagem })}
            className="flex items-center gap-1 bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            adicionar
          </button>
        </div>
      </div>
    </div>
  );
};