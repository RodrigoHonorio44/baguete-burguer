import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Edit2, X, Image as ImageIcon, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';

export const AdminEditarComplementos = ({ produtoId, onFechar }) => {
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
    if (!produtoId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/produtos/${produtoId}/complementos`);
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
  }, [produtoId]);

  // ==========================================
  // AÇÕES DE GRUPO (CATEGORIA)
  // ==========================================
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

  // ==========================================
  // AÇÕES DE ITEM (SABORES / ADICIONAIS)
  // ==========================================
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

  // ==========================================
  // ADICIONAR NOVO ITEM
  // ==========================================
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
    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl mt-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Gerenciar e Editar Categorias e Adicionais Cadastrados
        </h3>
        {onFechar && (
          <button onClick={onFechar} className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1 rounded flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Fechar
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Carregando categorias e itens do banco...</p>
      ) : gruposComItens.length === 0 ? (
        <p className="text-xs text-slate-500 italic">Nenhuma categoria cadastrada para este produto.</p>
      ) : (
        <div className="space-y-6">
          {gruposComItens.map((grupo) => {
            const grupoId = grupo._id?.$oid || grupo._id;
            const itens = grupo.itens || [];

            return (
              <div key={grupoId} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
                {/* EDIÇÃO DA CATEGORIA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-3 border-b border-slate-700 gap-3">
                  <div className="w-full flex-1">
                    {editandoGrupoId === grupoId ? (
                      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-3 rounded border border-amber-500">
                        <div className="flex-1 min-w-[150px]">
                          <label className="text-[10px] text-slate-400 block">Nome da Categoria</label>
                          <input
                            type="text"
                            value={grupoNomeEdit}
                            onChange={(e) => setGrupoNomeEdit(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] text-slate-400 block">Mínimo</label>
                          <input
                            type="number"
                            value={grupoMinEdit}
                            onChange={(e) => setGrupoMinEdit(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] text-slate-400 block">Máximo</label>
                          <input
                            type="number"
                            value={grupoMaxEdit}
                            onChange={(e) => setGrupoMaxEdit(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                          />
                        </div>
                        <div className="flex items-end gap-1 mt-4 sm:mt-0">
                          <button onClick={() => handleSalvarGrupo(grupoId)} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1">
                            <Save className="w-3.5 h-3.5" /> Salvar
                          </button>
                          <button onClick={() => setEditandoGrupoId(null)} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-amber-400 text-sm capitalize">{grupo.nome}</h4>
                        <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          Mín: {grupo.minimo ?? 0} | Máx: {grupo.maximo ?? 1}
                        </span>
                        <button
                          onClick={() => {
                            setEditandoGrupoId(grupoId);
                            setGrupoNomeEdit(grupo.nome);
                            setGrupoMinEdit(grupo.minimo ?? 0);
                            setGrupoMaxEdit(grupo.maximo ?? 1);
                          }}
                          className="text-slate-400 hover:text-amber-400 p-1 rounded"
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
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incluir Item
                    </button>

                    <button
                      onClick={() => handleExcluirGrupo(grupoId)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 bg-slate-800 rounded transition"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* FORMULÁRIO DE NOVO ITEM */}
                {adicionandoNoGrupoId === grupoId && (
                  <form onSubmit={(e) => handleCriarItemNoGrupo(e, grupoId)} className="bg-slate-900/90 p-3 rounded-lg border border-emerald-500/50 mb-4 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400">Adicionar novo item em "{grupo.nome}"</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nome do item (ex: Morango, Chocolate)"
                        value={novoItemForm.nome}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, nome: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço Adicional (R$)"
                        value={novoItemForm.preco}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, preco: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoNovoItem}
                        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                      <div className="flex gap-1">
                        <button type="submit" className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-xs">Salvar Item</button>
                        <button type="button" onClick={() => setAdicionandoNoGrupoId(null)} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Cancelar</button>
                      </div>
                    </div>
                  </form>
                )}

                {/* LISTA DE ITENS */}
                {itens.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhum item cadastrado nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {itens.map((item) => {
                      const itemId = item._id?.$oid || item._id;
                      const precoItem = Number(item.preco ?? 0);
                      const fotoItem = item.foto || item.imagem;

                      return (
                        <div key={itemId} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2 rounded-lg">
                          {editandoItemId === itemId ? (
                            <div className="flex flex-col gap-1 w-full pr-2">
                              <label className="text-[9px] text-slate-400">Nome</label>
                              <input
                                type="text"
                                value={itemNomeEdit}
                                onChange={(e) => setItemNomeEdit(e.target.value)}
                                className="bg-slate-800 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-slate-100"
                              />
                              <label className="text-[9px] text-slate-400">Preço (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={itemPrecoEdit}
                                onChange={(e) => setItemPrecoEdit(e.target.value)}
                                className="bg-slate-800 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-slate-100"
                              />
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => handleSalvarItem(itemId)} className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded text-[10px]">Salvar</button>
                                <button onClick={() => setEditandoItemId(null)} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px]">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 overflow-hidden">
                                {fotoItem ? (
                                  <img src={fotoItem} alt={item.nome} className="w-8 h-8 rounded object-cover border border-slate-700 flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-600 flex-shrink-0">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="text-xs font-semibold text-slate-200 truncate capitalize">{item.nome}</p>
                                  <p className="text-[10px] text-emerald-400 font-bold">+ R$ {precoItem.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => { setEditandoItemId(itemId); setItemNomeEdit(item.nome); setItemPrecoEdit(precoItem); }}
                                  className="p-1 text-slate-400 hover:text-amber-400 rounded"
                                  title="Editar item"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleExcluirItem(itemId)}
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded"
                                  title="Excluir item"
                                >
                                  <Trash2 className="w-3 h-3" />
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