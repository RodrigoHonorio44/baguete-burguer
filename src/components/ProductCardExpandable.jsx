import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export const ProductCardExpandable = ({ product, onToggleDisponibilidade }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [gruposComplementos, setGruposComplementos] = useState([]);
  const [loadingComplementos, setLoadingComplementos] = useState(false);

  const [selecoes, setSelecoes] = useState({});
  const [gruposAbertos, setGruposAbertos] = useState({});
  
  // Estado para a Mensagem Toast moderna no lugar do alert() do navegador
  const [toastMessage, setToastMessage] = useState(null);

  const id = product?.id || product?._id;
  const categoriaProduto = product?.categoria || product?.category || '';
  const precoBase = Number(product?.preco || product?.price || 0);
  const precoOriginal = Number(product?.precoOriginal || product?.precoAntigo || product?.originalPrice || 0);

  const imagem = product?.imagem || product?.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';
  const nome = product?.nome || product?.name || '';
  const descricao = product?.descricao || product?.description || '';
  
  const disponivel = product?.disponivel !== undefined ? product.disponivel : true;

  const itemInCart = cart.find(item => (item.id || item._id) === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    if (isExpanded && id) {
      const carregarComplementos = async () => {
        setLoadingComplementos(true);
        try {
          let data = [];
          
          try {
            const resCat = await fetch(`https://api-hamburgueria.rodhonsystem.com.br/api/complementos/grupos?categoriaId=${encodeURIComponent(categoriaProduto)}`);
            if (resCat.ok) {
              const dataCat = await resCat.json();
              if (Array.isArray(dataCat) && dataCat.length > 0) {
                data = dataCat;
              }
            }
          } catch (e) {}

          if (!data || data.length === 0) {
            if (typeof api?.getComplementosProduto === 'function') {
              try {
                data = await api.getComplementosProduto(id);
              } catch (e) {}
            }
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

          const abertosIniciais = {};
          gruposArray.forEach(g => {
            const gId = g._id || g.id;
            abertosIniciais[gId] = false;
          });
          setGruposAbertos(abertosIniciais);

        } catch (err) {
          console.error('Erro ao carregar complementos:', err);
          setGruposComplementos([]);
        } finally {
          setLoadingComplementos(false);
        }
      };
      carregarComplementos();
    }
  }, [isExpanded, id, categoriaProduto]);

  const toggleGrupoAccordion = (gId) => {
    setGruposAbertos(prev => ({
      ...prev,
      [gId]: !prev[gId]
    }));
  };

  const handleOptionChange = (grupo, item, delta) => {
    const isItemAtivo = item.disponivel !== undefined 
      ? Boolean(item.disponivel) 
      : (item.ativo !== undefined ? Boolean(item.ativo) : true);

    if (!isItemAtivo && delta > 0) {
      showToast('Este item está esgotado e não pode ser selecionado.');
      return;
    }

    const grupoId = grupo._id || grupo.id;
    const itemArray = selecoes[grupoId] || [];
    const itemId = item._id || item.id;
    const itemExistente = itemArray.find(i => (i._id || i.id) === itemId);
    const qtdAtual = itemExistente ? itemExistente.quantidade : 0;
    
    const totalQtdGrupo = itemArray.reduce((acc, curr) => acc + curr.quantidade, 0);
    const maximoGrupo = grupo.maximo !== undefined && grupo.maximo !== null ? Number(grupo.maximo) : Infinity;

    if (delta > 0 && totalQtdGrupo >= maximoGrupo) {
      showToast(`Você pode escolher no máximo ${maximoGrupo} item(ns) neste grupo (${grupo.nome}).`);
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
      showToast(`Falta(s) ${validacao.faltam} item(ns) obrigatório(s) em "${validacao.grupoNome}".`);
      return;
    }

    addToCart({ ...product, id, preco: precoTotalUnitario, imagem, opcionaisSelecionados: selecoes });
    showToast('Produto adicionado ao carrinho com sucesso!');
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
      
      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fadeIn border border-slate-700">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. VISUALIZAÇÃO FECHADA */}
      {!isExpanded && (
        <div 
          onClick={handleToggleExpand}
          className="p-4 md:p-5 flex justify-between items-center cursor-pointer bg-white hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="font-bold text-base md:text-lg text-slate-900 tracking-tight capitalize">{nome}</h3>
              {!disponivel && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Esgotado
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{descricao}</p>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {precoOriginal > precoBase && (
                <span className="text-xs md:text-sm text-slate-400 line-through font-semibold mr-1">
                  R$ {precoOriginal.toFixed(2)}
                </span>
              )}
              <span className="text-xs md:text-sm text-slate-500 font-medium">
                a partir de
              </span>
              <span className="text-sm md:text-base font-extrabold text-emerald-600">
                R$ {precoBase.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
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
        <div className="bg-white p-4 md:p-6 relative">
          
          {/* Botão de Fechar */}
          <button
            onClick={handleToggleExpand}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Recolher produto"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
            
            {/* Coluna da Imagem */}
            <div className="w-full lg:col-span-5 flex items-center justify-center bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 p-3">
              <img
                src={imagem}
                alt={nome}
                className="w-full h-48 md:h-72 lg:h-[380px] object-contain object-center rounded-xl shadow-sm transition-transform duration-300"
                width="500"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Coluna de Informações e Complementos */}
            <div className="w-full lg:col-span-7 flex flex-col h-full justify-between pr-2 md:pr-0">
              <div>
                <h3 className="font-extrabold text-lg md:text-2xl text-slate-900 mb-1.5 capitalize pr-8">{nome}</h3>
                <p className="text-xs md:text-sm text-slate-600 mb-3 leading-relaxed font-normal">
                  {descricao}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {precoOriginal > precoBase && (
                    <span className="text-xs md:text-sm text-slate-400 line-through font-semibold mr-1">
                      R$ {precoOriginal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    a partir de
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-emerald-600">
                    R$ {precoBase.toFixed(2)}
                  </span>
                </div>

                {/* LISTAGEM DOS GRUPOS DE COMPLEMENTOS */}
                {loadingComplementos ? (
                  <p className="text-xs text-slate-500 py-2">Carregando opções...</p>
                ) : gruposComplementos.length > 0 ? (
                  <div className="space-y-2.5 mb-4 max-h-[320px] md:max-h-[380px] overflow-y-auto pr-1">
                    {gruposComplementos.map(grupo => {
                      const gId = grupo._id || grupo.id;
                      const itensSelecionadosDoGrupo = selecoes[gId] || [];
                      const qtdTotalNoGrupo = itensSelecionadosDoGrupo.reduce((acc, curr) => acc + curr.quantidade, 0);
                      const min = Number(grupo.minimo || 0);
                      const max = Number(grupo.maximo || 1);
                      const aberto = gruposAbertos[gId] || false;

                      return (
                        <div key={gId} className="bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                          
                          {/* Cabeçalho do Grupo */}
                          <div 
                            onClick={() => toggleGrupoAccordion(gId)}
                            className="flex justify-between items-center p-3.5 md:p-4 cursor-pointer bg-white hover:bg-slate-50/80 transition-colors select-none gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs md:text-sm text-slate-900 capitalize flex items-center gap-2 flex-wrap">
                                <span className="truncate">{grupo.nome}</span>
                                {min > 0 && <span className="text-[9px] md:text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-bold shrink-0">Obrigatório</span>}
                              </h4>
                              <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">
                                {min > 0 ? `Escolha de ${min} até ${max}` : `Opcional (Até ${max})`}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-semibold border ${
                                min > 0 && qtdTotalNoGrupo < min 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                {qtdTotalNoGrupo} / {max}
                              </span>
                              {aberto ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </div>
                          </div>

                          {/* Itens do Grupo */}
                          {aberto && (
                            <div className="p-2.5 md:p-3 bg-slate-50/60 border-t border-slate-100 space-y-2">
                              {(grupo.itens || []).map(item => {
                                const itemId = item._id || item.id;
                                const itemSel = itensSelecionadosDoGrupo.find(i => (i._id || i.id) === itemId);
                                const qtdItem = itemSel ? itemSel.quantidade : 0;
                                const precoItem = Number(item.preco || 0);

                                const isItemAtivo = item.disponivel !== undefined 
                                  ? Boolean(item.disponivel) 
                                  : (item.ativo !== undefined ? Boolean(item.ativo) : true);

                                return (
                                  <div key={itemId} className={`flex items-center justify-between p-2 md:p-2.5 rounded-lg border transition gap-2 ${isItemAtivo ? 'bg-white border-slate-100' : 'bg-rose-50/30 border-rose-200 opacity-75'}`}>
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      {item.foto && (
                                        <img src={item.foto} alt={item.nome} width="36" height="36" loading="lazy" decoding="async" className="w-9 h-9 md:w-10 md:h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-semibold text-slate-800 capitalize truncate">{item.nome}</span>
                                          {!isItemAtivo && (
                                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded uppercase shrink-0">Esgotado</span>
                                          )}
                                        </div>
                                        <div className="text-[10px] md:text-[11px]">
                                          {precoItem > 0 ? (
                                            <span className="text-emerald-600 font-bold">+ R$ {precoItem.toFixed(2)}</span>
                                          ) : (
                                            <span className="text-slate-400 font-medium">Grátis</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
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
                                        <span className="text-xs font-bold text-slate-900 w-4 text-center">{qtdItem}</span>
                                      )}

                                      <button
                                        type="button"
                                        disabled={!isItemAtivo}
                                        onClick={() => handleOptionChange(grupo, item, 1)}
                                        className={`w-7 h-7 font-bold rounded-lg flex items-center justify-center shadow-sm ${
                                          isItemAtivo 
                                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer' 
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2 italic mb-3">Nenhum complemento cadastrado para este produto.</p>
                )}

                {/* Controle de Estoque (Admin) */}
                {isAdminOrRoot && (
                  <div className="mb-3 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-2">
                    <span className="text-xs text-slate-700 font-semibold truncate">Controle de Estoque/Disponibilidade:</span>
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer select-none shrink-0 ${
                        disponivel 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{disponivel ? 'Disponível (Visível)' : 'Indisponível (Esgotado)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Rodapé com Preço Total e Botão Adicionar */}
              <div className="pt-3 border-t border-slate-200 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl shadow-sm border">
                <div className="text-center sm:text-left w-full sm:w-auto">
                  <span className="text-[11px] text-slate-500 block">Total do item</span>
                  <span className="text-base md:text-xl font-black text-slate-900">
                    R$ {precoTotalUnitario.toFixed(2)}
                  </span>
                  {!validacao.valido && (
                    <span className="block text-[10px] font-semibold text-rose-500 mt-0.5">
                      Falta escolher em "{validacao.grupoNome}"
                    </span>
                  )}
                </div>

                {!disponivel ? (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl w-full sm:w-auto text-center">
                    Produto Indisponível
                  </span>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!validacao.valido}
                    className={`flex items-center justify-center gap-2 font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-md w-full sm:w-auto ${
                      validacao.valido 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shadow-amber-500/20 active:scale-95' 
                        : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>Adicionar</span>
                    <span>•</span>
                    <span>R$ {precoTotalUnitario.toFixed(2)}</span>
                  </button>
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