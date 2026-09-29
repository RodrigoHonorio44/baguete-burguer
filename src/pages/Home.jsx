import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
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
        console.error('erro ao carregar produtos:', err);
        setError('não foi possível carregar o cardápio. verifique a conexão com o servidor.');
        setLoading(false);
      });
  }, []);

  const categories = ['todos', ...new Set(products.map((p) => p.categoria || p.category).filter(Boolean))];

  const filteredProducts =
    selectedCategory === 'todos'
      ? products
      : products.filter((p) => (p.categoria || p.category) === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">
          nosso cardápio
        </h1>
        <p className="text-slate-400 text-sm">
          escolha suas baguetes e hambúrgueres artesanais favoritos
        </p>
      </section>

      {/* filtro por categoria */}
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};