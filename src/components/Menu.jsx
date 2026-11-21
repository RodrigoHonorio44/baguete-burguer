import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { ProductCardExpandable } from './ProductCardExpandable';
import { ShoppingBag, Utensils, GlassWater, Sparkles, CupSoda } from 'lucide-react';
import { montarListaOrdenada } from '../utils/ordemCategorias';

export const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [pedidoMinimo, setPedidoMinimo] = useState(20);
  const [ordemCategoriasSalva, setOrdemCategoriasSalva] = useState([]);
  const [isNavbarFixed, setIsNavbarFixed] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(64);

  const navPlaceholderRef = useRef(null);
  const navBarRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const sectionRefs = useRef({});
  const tabRefs = useRef({});
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const normalizarCat = (cat) => String(cat || '').trim().toLowerCase();

  const formatCategoryName = (cat) => {
    if (!cat) return '';
    const lower = normalizarCat(cat);
    if (lower === 'todos') return 'Todos';
    if (lower === 'acai' || lower === 'açaí') return 'Açaí';
    if (lower === 'massas' || lower === 'massa') return 'Massas';
    return cat;
  };

  const getCategoryIcon = (cat) => {
    const lower = normalizarCat(cat);
    if (lower === 'todos') return <Sparkles className="w-4 h-4" />;
    if (lower.includes('açaí') || lower.includes('acai')) return <GlassWater className="w-4 h-4" />;
    if (lower.includes('massa') || lower.includes('pasta')) return <Utensils className="w-4 h-4" />;
    if (lower.includes('bebida')) return <CupSoda className="w-4 h-4" />;
    return <Utensils className="w-4 h-4" />;
  };

  useEffect(() => {
    api.getProdutos()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar o cardápio. Verifique a conexão com o servidor.');
        setLoading(false);
      });

    const carregarConfig = async () => {
      try {
        const configSalva = localStorage.getItem('configuracoes_loja');
        if (configSalva) {
          const parsed = JSON.parse(configSalva);
          if (parsed.pedidoMinimo !== undefined) {
            setPedidoMinimo(Number(parsed.pedidoMinimo));
          }
          if (Array.isArray(parsed.ordemCategorias)) {
            setOrdemCategoriasSalva(parsed.ordemCategorias);
          }
        }

        let dadosServer = null;
        if (typeof api.getConfiguracoesLoja === 'function') {
          dadosServer = await api.getConfiguracoesLoja();
        } else if (typeof api.getConfiguracoes === 'function') {
          dadosServer = await api.getConfiguracoes();
        }

        if (dadosServer) {
          if (dadosServer.pedidoMinimo !== undefined) {
            setPedidoMinimo(Number(dadosServer.pedidoMinimo));
          }
          if (Array.isArray(dadosServer.ordemCategorias)) {
            setOrdemCategoriasSalva(dadosServer.ordemCategorias);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
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
      }
    } catch (err) {
      console.error('Erro ao salvar a disponibilidade no servidor:', err);
    }
  };

  const categoriasBrutas = Array.from(
    new Map(
      products
        .map((p) => p.categoria || p.category)
        .filter(Boolean)
        .map((cat) => [normalizarCat(cat), cat])
    ).values()
  );

  const chavesOrdenadas = montarListaOrdenada(
    categoriasBrutas.map(normalizarCat),
    ordemCategoriasSalva
  );

  const categoriasOrdenadas = chavesOrdenadas
    .map((chave) => categoriasBrutas.find((c) => normalizarCat(c) === chave))
    .filter(Boolean);

  const categories = ['todos', ...categoriasOrdenadas];

  const groupedProducts = categoriasOrdenadas.reduce((acc, cat) => {
    acc[cat] = products.filter(
      (p) => normalizarCat(p.categoria || p.category) === normalizarCat(cat)
    );
    return acc;
  }, {});

  // Mede altura da barra e fixa no topo ao rolar além dela
  useEffect(() => {
    if (navBarRef.current) {
      setNavbarHeight(navBarRef.current.offsetHeight || 64);
    }

    const onScroll = () => {
      const anchor = navPlaceholderRef.current || navBarRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      setIsNavbarFixed(rect.top <= 0);

      if (isManualScrollRef.current) return;

      if (window.scrollY < 180) {
        setSelectedCategory('todos');
        return;
      }

      const offsetTrigger = 150;
      let categoriaAtual = null;

      for (const cat of categoriasOrdenadas) {
        const el = sectionRefs.current[normalizarCat(cat)];
        if (!el) continue;
        const secRect = el.getBoundingClientRect();
        if (secRect.top <= offsetTrigger) {
          categoriaAtual = cat;
        }
      }

      if (categoriaAtual) {
        setSelectedCategory(categoriaAtual);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [loading, products, categoriasOrdenadas]);

  // Centraliza a aba ativa apenas na rolagem horizontal da própria barra
  useEffect(() => {
    const container = tabsScrollRef.current;
    const activeTab = tabRefs.current[normalizarCat(selectedCategory)];
    if (!container || !activeTab) return;

    const targetLeft =
      activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [selectedCategory]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);

    if (normalizarCat(cat) === 'todos') {
      isManualScrollRef.current = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
      }, 700);
      return;
    }

    const alvo = sectionRefs.current[normalizarCat(cat)];
    if (alvo) {
      isManualScrollRef.current = true;
      const y = alvo.getBoundingClientRect().top + window.scrollY - (navbarHeight + 16);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
      }, 700);
    }
  };

  return (
    <div className="w-full bg-slate-50/50 text-slate-800 pb-16">
      {/* Topo do cardápio */}
      <div className="max-w-6xl mx-auto px-4 pt-8 text-center">
        <section className="mb-6">
          {pedidoMinimo > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-900 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 shadow-xs">
              <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Entregas em Maricá • Pedido mínimo para delivery: <strong>R$ {pedidoMinimo.toFixed(2)}</strong>
              </span>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">
            Nosso Cardápio
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Escolha os seus favoritos e faça seu pedido online.
          </p>
        </section>
      </div>

      {/* Placeholder para evitar salto de layout quando a barra vira fixed */}
      <div
        ref={navPlaceholderRef}
        style={{ height: isNavbarFixed ? `${navbarHeight}px` : '0px' }}
        className="mb-8"
      >
        <div
          ref={navBarRef}
          className={`bg-white/95 backdrop-blur-md py-2.5 px-3 md:px-4 border-y border-slate-200/90 shadow-xs transition-shadow ${
            isNavbarFixed ? 'fixed top-0 left-0 right-0 z-40 shadow-sm' : 'relative'
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div
              ref={tabsScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {categories.map((cat) => {
                const chave = normalizarCat(cat);
                const isSelected = normalizarCat(selectedCategory) === chave;

                return (
                  <button
                    key={cat}
                    ref={(el) => {
                      tabRefs.current[chave] = el;
                    }}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
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
      </div>

      {/* Lista de Categorias e Produtos */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Carregando cardápio do servidor...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-500 font-semibold">{error}</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedProducts).map(([categoryName, catProducts]) => {
              if (!catProducts || catProducts.length === 0) return null;
              const chave = normalizarCat(categoryName);

              return (
                <section
                  key={categoryName}
                  ref={(el) => {
                    sectionRefs.current[chave] = el;
                  }}
                  className="scroll-mt-24 space-y-4"
                >
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
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;