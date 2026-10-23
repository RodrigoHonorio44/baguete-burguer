import { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, EyeOff, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export const ProductCardExpandable = ({ product, onToggleDisponibilidade }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [gruposComplementos, setGruposComplementos] = useState([]);
  const [loadingComplementos, setLoadingComplementos] = useState(false);

  const [selecoes, setSelecoes] = useState({});

  const id = product?.id || product?._id;
  const precoBase = Number(product?.preco || product?.price || 0);
  // Preço antigo / original para mostrar riscado
  const precoOriginal = Number(product?.precoOriginal || product?.precoAntigo || product?.originalPrice || 0);

  const imagem = product?.imagem || product?.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';
  const nome = product?.nome || product?.name || '';
  const descricao = product?.descricao || product?.description || '';
  
  const disponivel = product?.disponivel !== undefined ? product.disponivel : true;

  const itemInCart = cart.find(item => (item.id || item._id) === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  useEffect(() => {
    if (isExpanded && id) {
      const carregarComplementos = async () => {
        setLoadingComplementos(true);
        try {
          let data = [];
          if (typeof api?.getComplementosProduto === 'function') {
            try {
              data = await api.getComplementosProduto(id);
            } catch (e) {}
          }

          if (!data || (Array.isArray(data) && data.length === 0)) {
            const res = await fetch(`https://api-hamburgueria.rodhonsystem.com.br/api/produtos/${id}/complementos`);
            if (res.ok) {
              data = await res.json();
            }
          }

          let gruposArray = [];
          if (Array.isArray(data)) {
            gruposArray = data;
          } else if (data && typeof data === 'object') {
            gruposArray = data.grupos || data.complementos || data.data || data.items || [];
          }

          setGruposComplementos(Array.isArray(gruposArray) ? gruposArray : []);
        } catch (err) {
          console.error('Erro ao carregar complementos:', err);
          setGruposComplementos([]);
        } finally {
          setLoadingComplementos(false);
        }
      };
      carregarComplementos();
    }
  }, [isExpanded, id]);

  const handleOptionChange = (grupo, item, delta) => {
    const grupoId = grupo._id || grupo.id;
    const itemArray = selecoes[grupoId] || [];
    const itemId = item._id || item.id;
    const itemExistente = itemArray.find(i => (i._id || i.id) === itemId);
    const qtdAtual = itemExistente ? itemExistente.quantidade : 0;
    
    const totalQtdGrupo = itemArray.reduce((acc, curr) => acc + curr.quantidade, 0);
    const maximoGrupo = grupo.maximo !== undefined && grupo.maximo !== null ? Number(grupo.maximo) : Infinity;

    if (delta > 0 && totalQtdGrupo >= maximoGrupo) {
      alert(`Você pode escolher no máximo ${maximoGrupo} item(ns) neste grupo (${grupo.nome}).`);
      return;
    }

    let novosItens = [...itemArray];
    if (qtdAtual + delta <= 0) {
      novosItens = novosItens.filter(i => (i._id || i.id) !== itemId);
    } else {
      if (itemExistente) {
        novosItens = novosItens.map(i =>
          (i._id || i.id) === itemId ? { ...i, quantidade: i.quantidade + delta } : i
        );
      } else {
        novosItens.push({ ...item, quantidade: 1 });
      }
    }

    setSelecoes({ ...selecoes, [grupoId]: novosItens });
  };

  const calcularValorAdicional = () => {
    let valorExtra = 0;
    Object.values(selecoes).forEach(itensDoGrupo => {
      if (Array.isArray(itensDoGrupo)) {
        itensDoGrupo.forEach(item => {
          valorExtra += Number(item.preco || 0) * Number(item.quantidade || 0);
        });
      }
    });
    return valorExtra;
  };

  const precoTotalUnitario = precoBase + calcularValorAdicional();

  const verificarValidacaoMinimos = () => {
    for (const grupo of gruposComplementos) {
      const gId = grupo._id || grupo.id;
      const itensSelecionados = selecoes[gId] || [];
      const totalQtdGrupo = itensSelecionados.reduce((acc, curr) => acc + curr.quantidade, 0);
      const minimoObrigatorio = Number(grupo.minimo || 0);

      if (totalQtdGrupo < minimoObrigatorio) {
        return { valido: false, grupoNome: grupo.nome, faltam: minimoObrigatorio - totalQtdGrupo };
      }
    }
    return { valido: true };
  };

  const validacao = verificarValidacaoMinimos();

  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.role || userObj.tipo || userObj.nivel) {
          return String(userObj.role || userObj.tipo || userObj.nivel).toLowerCase();
        }
      }
    } catch (e) {}
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

    if (!validacao.valido) {
      alert(`Falta(m) ${validacao.faltam} item(ns) a escolher no grupo "${validacao.grupoNome}".`);
      return;
    }

    addToCart({ ...product, id, preco: precoTotalUnitario, imagem, opcionaisSelecionados: selecoes });
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
    <div className={`bg-white border ${disponivel ? 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md' : 'border-rose-200 opacity-75 bg-rose-50/20'} rounded-2xl overflow-hidden transition-all duration-300 relative group mb-4 ${isExpanded ? 'col-span-full' : ''}`}>
      
      {/* 1. VISUALIZAÇÃO FECHADA */}
      {!isExpanded && (
        <div 
          onClick={handleToggleExpand}
          className="p-5 flex justify-between items-center cursor-pointer bg-white hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="font-bold text-base md:text-lg text-slate-900 tracking-tight capitalize">{nome}</h3>
              {!disponivel && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Esgotado
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{descricao}</p>
            
            {/* EXIBIÇÃO DE PREÇO COM OPÇÃO DE VALOR RISCADO */}
            <div className="flex items-center gap-2">
              {precoOriginal > precoBase && (
                <span className="text-xs md:text-sm text-slate-400 line-through font-semibold">
                  R$ {precoOriginal.toFixed(2)}
                </span>
              )}
              <span className="text-sm md:text-base font-extrabold text-emerald-600">
                R$ {precoBase.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <img
                src={imagem}
                alt={nome}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-sm border border-slate-100"
                width="500"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 2. VISUALIZAÇÃO ABERTA (ESTENDIDA) */}
      {isExpanded && (
        <div className="bg-white p-5 md:p-6 relative">
          
          {/* Botão de Fechar */}
          <button
            onClick={handleToggleExpand}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Recolher produto"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Grid de 2 Colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Coluna Esquerda */}
            <div className="w-full flex items-center justify-center bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 p-4">
              <img
                src={imagem}
                alt={nome}
                className="w-full h-72 md:h-[400px] object-contain object-center rounded-xl shadow-sm transition-transform duration-300"
                width="500"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Coluna Direita */}
            <div className="flex flex-col h-full justify-between pr-8 md:pr-0">
              <div>
                <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-2 capitalize">{nome}</h3>
                <p className="text-xs md:text-sm text-slate-600 mb-4 leading-relaxed font-normal">
                  {descricao}
                </p>

                {/* PREÇO DETALHADO NO MODO EXPANDIDO */}
                <div className="flex items-center gap-2 mb-5">
                  {precoOriginal > precoBase && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      R$ {precoOriginal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-lg font-extrabold text-emerald-600">
                    R$ {precoBase.toFixed(2)}
                  </span>
                </div>

                {/* LISTAGEM DOS GRUPOS DE COMPLEMENTOS */}
                {loadingComplementos ? (
                  <p className="text-xs text-slate-500 py-2">Carregando opções...</p>
                ) : gruposComplementos.length > 0 ? (
                  <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-1">
                    {gruposComplementos.map(grupo => {
                      const gId = grupo._id || grupo.id;
                      const itensSelecionadosDoGrupo = selecoes[gId] || [];
                      const qtdTotalNoGrupo = itensSelecionadosDoGrupo.reduce((acc, curr) => acc + curr.quantidade, 0);
                      const min = Number(grupo.minimo || 0);
                      const max = Number(grupo.maximo || 1);

                      return (
                        <div key={gId} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 capitalize">{grupo.nome}</h4>
                              <p className="text-[11px] text-slate-500">
                                {min > 0 ? `Obrigatório (Escolha de ${min} até ${max})` : `Opcional (Até ${max})`}
                              </p>
                            </div>
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                              {qtdTotalNoGrupo} / {max}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(grupo.itens || []).map(item => {
                              const itemId = item._id || item.id;
                              const itemSel = itensSelecionadosDoGrupo.find(i => (i._id || i.id) === itemId);
                              const qtdItem = itemSel ? itemSel.quantidade : 0;
                              const precoItem = Number(item.preco || 0);

                              return (
                                <div key={itemId} className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-50 transition border border-slate-100">
                                  <div className="flex items-center gap-3">
                                    {item.foto && (
                                      <img src={item.foto} alt={item.nome} width="40" height="40" loading="lazy" decoding="async" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                                    )}
                                    <div>
                                      <span className="text-xs font-semibold text-slate-800 capitalize">{item.nome}</span>
                                      <div className="text-[11px]">
                                        {precoItem > 0 ? (
                                          <span className="text-emerald-600 font-bold">+ R$ {precoItem.toFixed(2)}</span>
                                        ) : (
                                          <span className="text-slate-400 font-medium">Grátis</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {qtdItem > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOptionChange(grupo, item, -1)}
                                        className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                                      >
                                        <Minus size={14} />
                                      </button>
                                    )}

                                    {qtdItem > 0 && (
                                      <span className="text-xs font-bold text-slate-900 w-5 text-center">{qtdItem}</span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleOptionChange(grupo, item, 1)}
                                      className="w-7 h-7 bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center justify-center hover:bg-amber-400 cursor-pointer shadow-sm"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2 italic mb-4">Nenhum complemento cadastrado para este produto.</p>
                )}

                {/* Controle de Estoque (Admin) */}
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
              </div>

              {/* Rodapé com Preço Total e Botão */}
              <div className="pt-4 border-t border-slate-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-slate-500 block">Total do item</span>
                  <span className="text-lg md:text-xl font-black text-slate-900">
                    R$ {(precoTotalUnitario * (quantity > 0 ? quantity : 1)).toFixed(2)}
                  </span>
                  {!validacao.valido && (
                    <span className="block text-[11px] font-semibold text-rose-500 mt-0.5">
                      Falta escolher {validacao.faltam} em "{validacao.grupoNome}"
                    </span>
                  )}
                </div>

                {!disponivel ? (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
                    Produto Indisponível
                  </span>
                ) : quantity === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={!validacao.valido}
                    className={`flex items-center justify-center gap-2 font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-md w-full sm:w-auto ${
                      validacao.valido 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shadow-amber-500/20 active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {validacao.valido ? 'Adicionar' : `Escolha mais ${validacao.faltam}`}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm w-full sm:w-auto justify-center">
                    <button 
                      onClick={handleRemoveFromCart} 
                      className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-slate-900 w-8 text-center text-sm">{quantity}</span>
                    <button 
                      onClick={handleAddToCart} 
                      disabled={!validacao.valido}
                      className={`p-2 rounded-lg transition-colors ${
                        validacao.valido ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCardExpandable;