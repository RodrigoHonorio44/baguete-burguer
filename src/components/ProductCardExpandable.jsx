import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, EyeOff, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export const ProductCardExpandable = ({ product, onToggleDisponibilidade }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [gruposComplementos, setGruposComplementos] = useState([]);
  const [loadingComplementos, setLoadingComplementos] = useState(false);

  // Guarda as opções selecionadas: { "grupoId": [ { id, nome, preco, quantidade, foto } ] }
  const [selecoes, setSelecoes] = useState({});

  const id = product?.id || product?._id;
  const precoBase = Number(product?.preco || product?.price || 0);
  const imagem = product?.imagem || product?.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60';
  const nome = product?.nome || product?.name || '';
  const descricao = product?.descricao || product?.description || '';
  
  const disponivel = product?.disponivel !== undefined ? product.disponivel : true;

  const itemInCart = cart.find(item => (item.id || item._id) === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  // Busca os complementos lidando de forma flexível com qualquer formato que a API retorne
  useEffect(() => {
    if (isExpanded && id) {
      const carregarComplementos = async () => {
        setLoadingComplementos(true);
        try {
          let data = [];
          
          if (typeof api?.getComplementosProduto === 'function') {
            try {
              data = await api.getComplementosProduto(id);
            } catch (e) { /* ignora e tenta via fetch */ }
          }

          if (!data || (Array.isArray(data) && data.length === 0)) {
            const res = await fetch(`https://api-hamburgueria.rodhonsystem.com.br/api/produtos/${id}/complementos`);
            if (res.ok) {
              data = await res.json();
            }
          }

          console.log("Resposta bruta da API de complementos:", data);

          // Normalização inteligente: aceita array direto ou objetos encapsulados (grupos, complementos, data, etc.)
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

  // Controle de quantidade de cada item dentro do grupo (respeitando o limite máximo)
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
          (i._id || i.id) === itemId
            ? { ...i, quantidade: i.quantidade + delta }
            : i
        );
      } else {
        novosItens.push({ ...item, quantidade: 1 });
      }
    }

    setSelecoes({
      ...selecoes,
      [grupoId]: novosItens,
    });
  };

  // Cálculo do valor adicional dos itens escolhidos (itens sem preço somam R$ 0,00)
  const calcularValorAdicional = () => {
    let valorExtra = 0;
    Object.values(selecoes).forEach(itensDoGrupo => {
      if (Array.isArray(itensDoGrupo)) {
        itensDoGrupo.forEach(item => {
          const precoItem = Number(item.preco || 0);
          const qtdItem = Number(item.quantidade || 0);
          valorExtra += precoItem * qtdItem;
        });
      }
    });
    return valorExtra;
  };

  const precoTotalUnitario = precoBase + calcularValorAdicional();

  // Verificação de perfil de admin
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

    // Validação obrigatória dos mínimos configurados nos grupos
    for (const grupo of gruposComplementos) {
      const gId = grupo._id || grupo.id;
      const itensSelecionados = selecoes[gId] || [];
      const totalQtdGrupo = itensSelecionados.reduce((acc, curr) => acc + curr.quantidade, 0);
      const minimoObrigatorio = Number(grupo.minimo || 0);

      if (totalQtdGrupo < minimoObrigatorio) {
        alert(`O grupo "${grupo.nome}" é obrigatório. Escolha pelo menos ${minimoObrigatorio} item(ns).`);
        return;
      }
    }

    addToCart({
      ...product,
      id,
      preco: precoTotalUnitario,
      imagem,
      opcionaisSelecionados: selecoes,
    });
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
            <h3 className="font-bold text-base md:text-lg text-slate-900 tracking-tight capitalize">{nome}</h3>
            {!disponivel && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Esgotado
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{descricao}</p>
          <p className="text-sm md:text-base font-extrabold text-slate-900">
            <span className="text-xs font-normal text-slate-500 mr-1">a partir de</span> 
            <span className="text-emerald-600">R$ {precoBase.toFixed(2)}</span>
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

      {/* Conteúdo Expandido com Opcionais / Complementos */}
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

          {/* LISTAGEM DOS GRUPOS DE COMPLEMENTOS */}
          {loadingComplementos ? (
            <p className="text-xs text-slate-500 py-2">Carregando opções...</p>
          ) : gruposComplementos.length > 0 ? (
            <div className="space-y-4 mb-6">
              {gruposComplementos.map(grupo => {
                const gId = grupo._id || grupo.id;
                const itensSelecionadosDoGrupo = selecoes[gId] || [];
                const qtdTotalNoGrupo = itensSelecionadosDoGrupo.reduce((acc, curr) => acc + curr.quantidade, 0);
                const min = Number(grupo.minimo || 0);
                const max = Number(grupo.maximo || 1);

                return (
                  <div key={gId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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
                          <div key={itemId} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition border border-slate-100">
                            <div className="flex items-center gap-3">
                              {item.foto && (
                                <img src={item.foto} alt={item.nome} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
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

          {/* Controle de Estoque/Disponibilidade para Admin */}
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

          {/* Rodapé com Preço Total e Botão de Adicionar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 block">Total do item</span>
              <span className="text-lg md:text-xl font-black text-slate-900">
                R$ {(precoTotalUnitario * (quantity > 0 ? quantity : 1)).toFixed(2)}
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