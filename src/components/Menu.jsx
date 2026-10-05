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

  const handleToggleDisponibilidade = async (productId, novoStatus) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const id = p.id || p._id;
        if (id === productId) {
          return { ...p, disponivel: novoStatus };
        }
        return p;
      })
    );

    try {
      if (typeof api.atualizarProduto === 'function') {
        await api.atualizarProduto(productId, { disponivel: novoStatus });
      } else if (typeof api.updateProduct === 'function') {
        await api.updateProduct(productId, { disponivel: novoStatus });
      } else if (typeof api.put === 'function') {
        await api.put(`/produtos/${productId}`, { disponivel: novoStatus });
      } else if (typeof api.patch === 'function') {
        await api.patch(`/produtos/${productId}`, { disponivel: novoStatus });
      } else {
        console.warn('Método de atualização de produto não identificado na API.');
      }
    } catch (err) {
      console.error('Erro ao salvar a disponibilidade no servidor:', err);
    }
  };

  const categories = ['todos', ...new Set(products.map((p) => p.categoria || p.category).filter(Boolean))];

  const groupedProducts = categories
    .filter((cat) => cat !== 'todos')
    .reduce((acc, cat) => {
      acc[cat] = products.filter((p) => (p.categoria || p.category) === cat);
      return acc;
    }, {});

  return (
    <div className="w-full bg-white text-slate-800 pb-16">
      {/* Topo do cardápio colado no banner (sem margem superior extra) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <section className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            nosso cardápio
          </h2>
          <p className="text-slate-500 text-xs md:text-sm">
            escolha suas baguetes e hambúrgueres artesanais favoritos
          </p>
        </section>
      </div>

      {/* Container de Categorias Estilo iFood */}
      <div className="sticky top-0 z-25 bg-white/95 backdrop-blur-md py-3 px-4 mb-8 border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div 
            className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 shadow-sm capitalize ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/20'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">carregando cardápio do servidor...</div>
        ) : error ? (
          <div className="text-center py-12 text-rose-500">{error}</div>
        ) : selectedCategory === 'todos' ? (
          <div className="space-y-10">
            {Object.entries(groupedProducts).map(([categoryName, catProducts]) => (
              catProducts.length > 0 && (
                <div key={categoryName} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 capitalize border-b border-slate-200 pb-2">
                    {categoryName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {catProducts.map((product, index) => (
                      <ProductCardExpandable 
                        key={product.id || product._id ? `${product.id || product._id}-${index}` : index} 
                        product={product} 
                        onToggleDisponibilidade={handleToggleDisponibilidade}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {products
              .filter((p) => (p.categoria || p.category) === selectedCategory)
              .map((product, index) => (
                <ProductCardExpandable 
                  key={product.id || product._id ? `${product.id || product._id}-${index}` : index} 
                  product={product} 
                  onToggleDisponibilidade={handleToggleDisponibilidade}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;