import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProductCardExpandable } from './ProductCardExpandable';
import { ShoppingBag, Utensils, GlassWater, Sparkles, CupSoda } from 'lucide-react';

export const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [pedidoMinimo, setPedidoMinimo] = useState(20);

  // Helper para formatar o nome da categoria com acentuação e ícones visuais
  const formatCategoryName = (cat) => {
    if (!cat) return '';
    const lower = cat.toLowerCase();
    if (lower === 'todos') return 'Todos';
    if (lower === 'acai' || lower === 'açaí') return 'Açaí';
    if (lower === 'massas' || lower === 'massa') return 'Massas';
    return cat;
  };

  // Helper para retornar ícones adequados de acordo com a categoria
  const getCategoryIcon = (cat) => {
    const lower = cat.toLowerCase();
    if (lower === 'todos') return <Sparkles className="w-4 h-4" />;
    if (lower.includes('açaí') || lower.includes('acai')) return <GlassWater className="w-4 h-4" />;
    if (lower.includes('massa') || lower.includes('pasta')) return <Utensils className="w-4 h-4" />;
    if (lower.includes('bebida')) return <CupSoda className="w-4 h-4" />;
    return <Utensils className="w-4 h-4" />;
  };

  useEffect(() => {
    // 1. Carrega os produtos do cardápio
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

    // 2. Carrega a configuração do pedido mínimo
    const carregarConfig = async () => {
      try {
        const configSalva = localStorage.getItem('configuracoes_loja');
        if (configSalva) {
          const parsed = JSON.parse(configSalva);
          if (parsed.pedidoMinimo !== undefined) {
            setPedidoMinimo(Number(parsed.pedidoMinimo));
          }
        }

        let dadosServer = null;
        if (typeof api.getConfiguracoesLoja === 'function') {
          dadosServer = await api.getConfiguracoesLoja();
        } else if (typeof api.getConfiguracoes === 'function') {
          dadosServer = await api.getConfiguracoes();
        }

        if (dadosServer && dadosServer.pedidoMinimo !== undefined) {
          setPedidoMinimo(Number(dadosServer.pedidoMinimo));
        }
      } catch (err) {
        console.error('Erro ao carregar pedido mínimo:', err);
      }
    };

    carregarConfig();
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
    <div className="w-full bg-slate-50/50 text-slate-800 pb-16">
      {/* Topo do cardápio colado no banner */}
      <div className="max-w-6xl mx-auto px-4 pt-8 text-center">
        <section className="mb-6">
          
          {/* Banner de Aviso de Pedido Mínimo */}
          {pedidoMinimo > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-900 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 shadow-xs">
              <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Entregas em Maricá &bull; Pedido mínimo para delivery: <strong>R$ {pedidoMinimo.toFixed(2)}</strong>
              </span>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">
            Nosso Cardápio
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Escolha os seus favoritos de Açaí e Massas e faça seu pedido online.
          </p>
        </section>
      </div>

      {/* Container de Categorias Estilo iFood */}
      <div className="sticky top-0 z-25 bg-white/95 backdrop-blur-md py-3 px-4 mb-8 border-y border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto">
          <div 
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none scroll-smooth py-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-102'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{formatCategoryName(cat)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium">Carregando cardápio do servidor...</div>
        ) : error ? (
          <div className="text-center py-16 text-rose-500 font-semibold">{error}</div>
        ) : selectedCategory === 'todos' ? (
          <div className="space-y-12">
            {Object.entries(groupedProducts).map(([categoryName, catProducts]) => (
              catProducts.length > 0 && (
                <div key={categoryName} className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-200/80 pb-2 flex items-center gap-2">
                    {getCategoryIcon(categoryName)}
                    <span>{formatCategoryName(categoryName)}</span>
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