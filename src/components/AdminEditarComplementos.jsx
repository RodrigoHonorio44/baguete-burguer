import React from 'react';
import { Layers, Trash2, Edit2, X, Image as ImageIcon, Save, Plus, Camera } from 'lucide-react';
import { useAdminEditarComplementos } from '../hooks/useAdminEditarComplementos';

export const AdminEditarComplementos = ({ produtoId, categoriaId, onFechar }) => {
  const {
    gruposComItens,
    loading,
    categoriasDisponiveis,
    isCriandoNovaCategoria,
    setIsCriandoNovaCategoria,
    novaCategoriaInput,
    setNovaCategoriaInput,
    novaCategoria,
    setNovaCategoria,
    novoNomeGrupo,
    setNovoNomeGrupo,
    novoMinimo,
    setNovoMinimo,
    novoMaximo,
    setNovoMaximo,
    grupoSelecionadoId,
    setGrupoSelecionadoId,
    novoNomeItem,
    setNovoNomeItem,
    novoPrecoItem,
    setNovoPrecoItem,
    novoFotoItem,
    setNovoFotoItem,
    editandoGrupoId,
    setEditandoGrupoId,
    grupoNomeEdit,
    setGrupoNomeEdit,
    grupoMinEdit,
    setGrupoMinEdit,
    grupoMaxEdit,
    setGrupoMaxEdit,
    editandoItemId,
    setEditandoItemId,
    itemNomeEdit,
    setItemNomeEdit,
    itemPrecoEdit,
    setItemPrecoEdit,
    itemFotoEdit,         // <-- Garantido aqui
    setItemFotoEdit,      // <-- Garantido aqui
    adicionandoNoGrupoId,
    setAdicionandoNoGrupoId,
    novoItemForm,
    setNovoItemForm,
    handleFotoArquivo,
    handleCriarGrupo,
    handleCriarItemSuperior,
    handleSalvarGrupo,
    handleExcluirGrupo,
    handleSalvarItem,
    handleAtualizarFotoItemDireto,
    handleExcluirItem,
    handleCriarItemNoGrupo,
  } = useAdminEditarComplementos(produtoId, categoriaId);

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl mt-6 shadow-xs relative">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Gerenciar e Editar Grupos e Opcionais Cadastrados
        </h3>
        
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

      {/* PAINEL SUPERIOR: CRIAR NOVO GRUPO + ADICIONAR ITEM COM FOTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70">
        
        {/* 1. Criar Novo Grupo */}
        <form onSubmit={handleCriarGrupo} className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={15} className="text-amber-600" />
            1. Criar Novo Grupo / Categoria de Opcionais
          </h4>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600">Categoria Alvo:</label>
              {isCriandoNovaCategoria && (
                <button
                  type="button"
                  onClick={() => setIsCriandoNovaCategoria(false)}
                  className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                >
                  ← Voltar para lista
                </button>
              )}
            </div>

            {!isCriandoNovaCategoria ? (
              <select
                value={novaCategoria}
                onChange={(e) => {
                  if (e.target.value === '__CRIAR_NOVA__') {
                    setIsCriandoNovaCategoria(true);
                    setNovaCategoria('');
                  } else {
                    setNovaCategoria(e.target.value);
                  }
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
              >
                {categoriasDisponiveis.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
                <option value="__CRIAR_NOVA__" className="text-amber-600 font-bold">+ Criar nova categoria...</option>
              </select>
            ) : (
              <input
                type="text"
                value={novaCategoriaInput}
                onChange={(e) => setNovaCategoriaInput(e.target.value)}
                placeholder="Ex: Açaí / Copos"
                className="w-full text-xs bg-white border border-amber-500 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Novo Grupo:</label>
            <input
              type="text"
              placeholder="Ex: Escolha sua Calda"
              value={novoNomeGrupo}
              onChange={(e) => setNovoNomeGrupo(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mínimo:</label>
              <input
                type="number"
                min="0"
                value={novoMinimo}
                onChange={(e) => setNovoMinimo(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Máximo:</label>
              <input
                type="number"
                min="1"
                value={novoMaximo}
                onChange={(e) => setNovoMaximo(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer"
          >
            + Criar Grupo
          </button>
        </form>

        {/* 2. Adicionar Opção ao Grupo com Foto */}
        <form onSubmit={handleCriarItemSuperior} className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={15} className="text-emerald-600" />
            2. Adicionar Item ao Grupo
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Grupo Destino:</label>
            <select
              value={grupoSelecionadoId}
              onChange={(e) => setGrupoSelecionadoId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500"
            >
              <option value="">Selecione um grupo...</option>
              {gruposComItens.map(g => {
                const gId = g._id?.$oid || g._id;
                return <option key={gId} value={gId}>{g.nome} ({g.categoria || 'geral'})</option>;
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Item:</label>
              <input
                type="text"
                placeholder="Ex: Calda de Chocolate"
                value={novoNomeItem}
                onChange={(e) => setNovoNomeItem(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Preço (R$):</label>
              <input
                type="text"
                placeholder="0.00"
                value={novoPrecoItem}
                onChange={(e) => setNovoPrecoItem(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Foto do Item (Opcional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFotoArquivo(e, setNovoFotoItem)}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-white border border-slate-300 rounded-xl p-1.5"
            />
            {novoFotoItem && (
              <div className="mt-2 w-10 h-10 rounded-lg overflow-hidden border border-slate-300">
                <img src={novoFotoItem} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer"
          >
            + Incluir Item no Grupo
          </button>
        </form>

      </div>

      {loading ? (
        <p className="text-xs text-slate-500 py-4 text-center">Carregando grupos e itens do banco...</p>
      ) : gruposComItens.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-4 text-center">Nenhum grupo cadastrado.</p>
      ) : (
        <div className="space-y-6">
          <h4 className="text-sm font-extrabold text-slate-900 border-b pb-2">Grupos Cadastrados</h4>
          {gruposComItens.map((grupo) => {
            const grupoId = grupo._id?.$oid || grupo._id;
            const itens = grupo.itens || [];

            return (
              <div key={grupoId} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                {/* EDIÇÃO DO GRUPO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-3 border-b border-slate-200 gap-3">
                  <div className="w-full flex-1">
                    {editandoGrupoId === grupoId ? (
                      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-amber-400 shadow-2xs">
                        <div className="flex-1 min-w-[150px]">
                          <label className="text-[10px] font-bold text-slate-500 block">Nome do Grupo</label>
                          <input
                            type="text"
                            value={grupoNomeEdit}
                            onChange={(e) => setGrupoNomeEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-bold text-slate-500 block">Mínimo</label>
                          <input
                            type="number"
                            value={grupoMinEdit}
                            onChange={(e) => setGrupoMinEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] font-bold text-slate-500 block">Máximo</label>
                          <input
                            type="number"
                            value={grupoMaxEdit}
                            onChange={(e) => setGrupoMaxEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="flex items-end gap-1 mt-4 sm:mt-0">
                          <button onClick={() => handleSalvarGrupo(grupoId)} className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                            <Save className="w-3.5 h-3.5" /> Salvar
                          </button>
                          <button onClick={() => setEditandoGrupoId(null)} className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border text-xs cursor-pointer">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-amber-700 text-sm">{grupo.nome}</h4>
                        {grupo.categoria && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">
                            {grupo.categoria}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded-md border font-semibold">
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
                          title="Editar grupo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdicionandoNoGrupoId(adicionandoNoGrupoId === grupoId ? null : grupoId)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incluir Item
                    </button>
                    <button
                      onClick={() => handleExcluirGrupo(grupoId)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer"
                      title="Excluir grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* FORMULÁRIO DE NOVO ITEM NA LISTA */}
                {adicionandoNoGrupoId === grupoId && (
                  <form onSubmit={(e) => handleCriarItemNoGrupo(e, grupoId)} className="bg-white p-3.5 rounded-xl border border-emerald-300 mb-4 space-y-3 shadow-2xs">
                    <h5 className="text-xs font-bold text-emerald-700">Adicionar novo item em "{grupo.nome}"</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nome do item"
                        value={novoItemForm.nome}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, nome: e.target.value })}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Preço Adicional (R$)"
                        value={novoItemForm.preco}
                        onChange={(e) => setNovoItemForm({ ...novoItemForm, preco: e.target.value })}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFotoArquivo(e, (res) => setNovoItemForm({ ...novoItemForm, foto: res }))}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                      <div className="flex gap-1.5 shrink-0">
                        <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer">Salvar Item</button>
                        <button type="button" onClick={() => setAdicionandoNoGrupoId(null)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border text-xs font-semibold cursor-pointer">Cancelar</button>
                      </div>
                    </div>
                  </form>
                )}

                {/* LISTA DE ITENS */}
                {itens.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">Nenhum item cadastrado neste grupo.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {itens.map((item) => {
                      const itemId = item._id?.$oid || item._id;
                      const precoItem = Number(item.preco ?? 0);
                      // Captura a foto independentemente da chave retornada pela API
                      const fotoItem = item.foto || item.imagem || item.img || item.url;

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
                                type="text"
                                value={itemPrecoEdit}
                                onChange={(e) => setItemPrecoEdit(e.target.value)}
                                className="bg-slate-50 border border-emerald-500 rounded-md px-2 py-1 text-xs text-slate-800"
                              />
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => handleSalvarItem(itemId, grupoId)} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-md text-[10px] cursor-pointer">Salvar</button>
                                <button onClick={() => setEditandoItemId(null)} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border text-[10px] cursor-pointer">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="relative group/foto shrink-0">
                                  {fotoItem ? (
                                    <img src={fotoItem} alt={item.nome} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                      <ImageIcon className="w-4 h-4" />
                                    </div>
                                  )}
                                  
                                  <label className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition cursor-pointer" title="Alterar foto">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => handleFotoArquivo(e, (base64) => handleAtualizarFotoItemDireto(item, base64))}
                                    />
                                  </label>
                                </div>

                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-800 truncate">{item.nome}</p>
                                  <p className="text-[10px] text-emerald-600 font-extrabold">+ R$ {precoItem.toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => { setEditandoItemId(itemId); setItemNomeEdit(item.nome); setItemPrecoEdit(precoItem); setItemFotoEdit(fotoItem || ''); }}
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