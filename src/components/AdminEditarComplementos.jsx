import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Edit2, X, Image as ImageIcon, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';

export const AdminEditarComplementos = ({ produtoId, categoriaId, onFechar }) => {
  const [gruposComItens, setGruposComItens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Edição do Grupo
  const [editandoGrupoId, setEditandoGrupoId] = useState(null);
  const [grupoNomeEdit, setGrupoNomeEdit] = useState('');
  const [grupoMinEdit, setGrupoMinEdit] = useState(0);
  const [grupoMaxEdit, setGrupoMaxEdit] = useState(1);

  // Estados para Edição de Item
  const [editandoItemId, setEditandoItemId] = useState(null);
  const [itemNomeEdit, setItemNomeEdit] = useState('');
  const [itemPrecoEdit, setItemPrecoEdit] = useState(0);

  // Estado para Adicionar Novo Item
  const [adicionandoNoGrupoId, setAdicionandoNoGrupoId] = useState(null);
  const [novoItemForm, setNovoItemForm] = useState({
    nome: '',
    preco: '0.00',
    foto: '',
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (produtoId) params.append('produtoId', produtoId);
      if (categoriaId) params.append('categoriaId', categoriaId);

      const url = params.toString()
        ? `${API_URL.replace(/\/$/, '')}/api/complementos/grupos?${params.toString()}`
        : `${API_URL.replace(/\/$/, '')}/api/complementos/grupos`;

      const res = await fetch(url);
      const data = await res.json();
      setGruposComItens(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados de complementos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [produtoId, categoriaId]);

  // AÇÕES DE GRUPO (CATEGORIA)
  const handleSalvarGrupo = async (grupoId) => {
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/grupos/${grupoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: grupoNomeEdit.trim().toLowerCase(),
          minimo: parseInt(grupoMinEdit) || 0,
          maximo: parseInt(grupoMaxEdit) || 1,
        })
      });

      if (!response.ok) throw new Error('Erro ao atualizar categoria');

      toast.success('Categoria atualizada com sucesso!');
      setEditandoGrupoId(null);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao salvar categoria.');
    }
  };

  const handleExcluirGrupo = async (grupoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria e todos os seus itens?')) return;
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/grupos/${grupoId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir');
      
      toast.success('Categoria excluída!');
      carregarDados();
    } catch (err) {
      toast.error('Erro ao excluir categoria.');
    }
  };

  // AÇÕES DE ITEM
  const handleSalvarItem = async (itemId) => {
    const valorNumerico = parseFloat(itemPrecoEdit);
    const precoFinal = isNaN(valorNumerico) ? 0 : valorNumerico;

    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/itens/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: itemNomeEdit.trim().toLowerCase(),
          preco: precoFinal,
        })
      });

      if (!response.ok) throw new Error('Erro ao atualizar item');

      toast.success('Item atualizado com sucesso!');
      setEditandoItemId(null);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao salvar item.');
    }
  };

  const handleExcluirItem = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/itens/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir item');

      toast.success('Item removido!');
      carregarDados();
    } catch (err) {
      toast.error('Erro ao excluir item.');
    }
  };

  const handleFotoNovoItem = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoItemForm({ ...novoItemForm, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCriarItemNoGrupo = async (e, grupoId) => {
    e.preventDefault();
    const precoNum = parseFloat(novoItemForm.preco) || 0;
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/itens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grupoId: grupoId,
          nome: novoItemForm.nome.trim().toLowerCase(),
          preco: precoNum,
          foto: novoItemForm.foto,
        })
      });

      if (!response.ok) throw new Error('Falha ao adicionar item');

      toast.success('Novo item adicionado com sucesso!');
      setNovoItemForm({ nome: '', preco: '0.00', foto: '' });
      setAdicionandoNoGrupoId(null);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao adicionar item.');
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl mt-6 shadow-xs relative">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Gerenciar e Editar Categorias e Adicionais Cadastrados
          {categoriaId && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">(Por Categoria)</span>}
        </h3>
        
        {/* BOTÃO DE FECHAR CORRIGIDO */}
        {onFechar && (
          <button 
            type="button"
            onClick={onFechar} 
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-xs"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 py-4 text-center">Carregando categorias e itens do banco...</p>
      ) : gruposComItens.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-4 text-center">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="space-y-6">
          {gruposComItens.map((grupo) => {
            const grupoId = grupo._id?.$oid || grupo._id;
            const itens = grupo.itens || [];

            return (
              <div key={grupoId} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                {/* EDIÇÃO DA CATEGORIA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-3 border-b border-slate-200 gap-3">
                  <div className="w-full flex-1">
                    {editandoGrupoId === grupoId ? (
                      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-amber-400 shadow-2xs">
                        <div className="flex-1 min-w-[150px]">
                          <label className="text-[10px] font-bold text-slate-500 block">Nome da Categoria</label>
                          <input
                            type="text"
                            value={grupoNomeEdit}
                            onChange={(e) => setGrupoNomeEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-bold text-slate-500 block">Mínimo</label>
                          <input
                            type="number"
                            value={grupoMinEdit}
                            onChange={(e) => setGrupoMinEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-bold text-slate-500 block">Máximo</label>
                          <input
                            type="number"
                            value={grupoMaxEdit}
                            onChange={(e) => setGrupoMaxEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex items-end gap-1 mt-4 sm:mt-0">
                          <button 
                            onClick={() => handleSalvarGrupo(grupoId)} 
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" /> Salvar
                          </button>
                          <button 
                            onClick={() => setEditandoGrupoId(null)} 
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-amber-700 text-sm capitalize">{grupo.nome}</h4>
                        {grupo.categoria && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">
                            {grupo.categoria}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold shadow-2xs">
                          Mín: {grupo.minimo ?? 0} | Máx: {grupo.maximo ?? 1}
                        </span>
                        <button
                          onClick={() => {
                            setEditandoGrupoId(grupoId);
                            setGrupoNomeEdit(grupo.nome);
                            setGrupoMinEdit(grupo.minimo ?? 0);
                            setGrupoMaxEdit(grupo.maximo ?? 1);
                          }}
                          className="text-slate-500 hover:text-amber-600 p-1 hover:bg-slate-200/60 rounded-md transition cursor-pointer"
                          title="Editar categoria"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdicionandoNoGrupoId(adicionandoNoGrupoId === grupoId ? null : grupoId)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incluir Item
                    </button>

                    <button
                      onClick={() => handleExcluirGrupo(grupoId)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer shadow-2xs"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* FORMULÁRIO DE NOVO ITEM */}
                {adicionandoNoGrupoId === grupoId && (
                  <form onSubmit={(e) => handleCriarItemNoGrupo(e, grupoId)} className="bg-white p-3.5 rounded-xl border border-emerald-300 mb-4 space-y-3 shadow-2xs">
                    <h5 className="text-xs font-bold text-emerald-700">Adicionar novo item em "{grupo.nome}"</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nome do item (ex: Morango, Chocolate)"
                        value={novoItemForm.nome}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, nome: e.target.value })}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço Adicional (R$)"
                        value={novoItemForm.preco}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, preco: e.target.value })}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoNovoItem}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                      <div className="flex gap-1.5 shrink-0">
                        <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs">
                          Salvar Item
                        </button>
                        <button type="button" onClick={() => setAdicionandoNoGrupoId(null)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* LISTA DE ITENS */}
                {itens.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">Nenhum item cadastrado nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {itens.map((item) => {
                      const itemId = item._id?.$oid || item._id;
                      const precoItem = Number(item.preco ?? 0);
                      const fotoItem = item.foto || item.imagem;

                      return (
                        <div key={itemId} className="flex justify-between items-center bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-2xs">
                          {editandoItemId === itemId ? (
                            <div className="flex flex-col gap-1.5 w-full pr-1">
                              <label className="text-[9px] font-bold text-slate-500">Nome</label>
                              <input
                                type="text"
                                value={itemNomeEdit}
                                onChange={(e) => setItemNomeEdit(e.target.value)}
                                className="bg-slate-50 border border-emerald-500 rounded-md px-2 py-1 text-xs text-slate-800"
                              />
                              <label className="text-[9px] font-bold text-slate-500">Preço (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={itemPrecoEdit}
                                onChange={(e) => setItemPrecoEdit(e.target.value)}
                                className="bg-slate-50 border border-emerald-500 rounded-md px-2 py-1 text-xs text-slate-800"
                              />
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => handleSalvarItem(itemId)} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-md text-[10px] cursor-pointer shadow-2xs">Salvar</button>
                                <button onClick={() => setEditandoItemId(null)} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[10px] cursor-pointer">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 overflow-hidden">
                                {fotoItem ? (
                                  <img src={fotoItem} alt={item.nome} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-800 truncate capitalize">{item.nome}</p>
                                  <p className="text-[10px] text-emerald-600 font-extrabold">+ R$ {precoItem.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => { setEditandoItemId(itemId); setItemNomeEdit(item.nome); setItemPrecoEdit(precoItem); }}
                                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                  title="Editar item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleExcluirItem(itemId)}
                                  className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                  title="Excluir item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEditarComplementos;