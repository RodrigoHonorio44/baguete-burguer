import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProductCardExpandable } from './ProductCardExpandable';

export const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    api.getProdutos()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar o cardápio. Verifique a conexão com o servidor.');
        setLoading(false);
      });
  }, []);

  const categories = ['todos', ...new Set(products.map((p) => p.categoria || p.category).filter(Boolean))];

  const filteredProducts =
    selectedCategory === 'todos'
      ? products
      : products.filter((p) => (p.categoria || p.category) === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <section className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-1">
          nosso cardápio
        </h2>
        <p className="text-slate-400 text-xs md:text-sm">
          escolha suas baguetes e hambúrgueres artesanais favoritos
        </p>
      </section>

      {/* Filtro por categoria */}
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">carregando cardápio do servidor...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : (
        /* 1 coluna no mobile, 2 colunas no computador (estilo o print de referência) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCardExpandable key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;