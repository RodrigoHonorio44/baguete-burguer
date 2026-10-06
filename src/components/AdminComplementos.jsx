import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Layers, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminComplementos = ({ produtoId, onFechar }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para criar um grupo (ex: "Sabores", "Acompanhamentos")
  const [grupoForm, setGrupoForm] = useState({
    nome: '',
    minimo: 0,
    maximo: 1,
    obrigatorio: false,
  });

  // Estado para criar um item dentro de um grupo (ex: "Leite em pó", "Brigadeiro")
  const [itemForm, setItemForm] = useState({
    grupoId: '',
    nome: '',
    preco: '0.00',
    foto: '',
  });

  // Método para carregar grupos e complementos vinculados ao produto
  const carregarComplementos = async () => {
    if (!produtoId) return;
    setLoading(true);
    try {
      // Busca os grupos cadastrados para este produto
      const response = await fetch(`/api/complementos/grupos?produtoId=${produtoId}`);
      const data = await response.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar complementos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComplementos();
  }, [produtoId]);

  const handleSalvarGrupo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/complementos/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...grupoForm, produtoId })
      });
      
      if (!response.ok) throw new Error('Falha ao salvar grupo');

      toast.success('Grupo de complementos criado!');
      setGrupoForm({ nome: '', minimo: 0, maximo: 1, obrigatorio: false });
      carregarComplementos();
    } catch (err) {
      toast.error('Erro ao salvar grupo: ' + err.message);
    }
  };

  // Função para tratar o upload da foto do item e converter em Base64
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemForm({ ...itemForm, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarItem = async (e) => {
    e.preventDefault();
    if (!itemForm.grupoId) return toast.error('Selecione um grupo primeiro.');
    try {
      const response = await fetch('/api/complementos/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          preco: parseFloat(itemForm.preco) || 0,
        })
      });

      if (!response.ok) throw new Error('Falha ao salvar item');

      toast.success('Opção adicionada com sucesso!');
      setItemForm({ grupoId: '', nome: '', preco: '0.00', foto: '' });
      carregarComplementos();
    } catch (err) {
      toast.error('Erro ao adicionar opção: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          Gerenciar Complementos e Opcionais
        </h3>
        {onFechar && (
          <button
            onClick={onFechar}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1 rounded"
          >
            Fechar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cadastro de Grupo */}
        <form onSubmit={handleSalvarGrupo} className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h4 className="text-sm font-semibold text-amber-400">1. Criar Grupo de Opcionais</h4>
          <div>
            <label className="block text-xs text-slate-400">Nome do Grupo</label>
            <input
              type="text"
              required
              placeholder="Ex: Escolha o Sabor, Acompanhamentos"
              value={grupoForm.nome}
              onChange={(e) => setGrupoForm({ ...grupoForm, nome: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400">Mínimo</label>
              <input
                type="number"
                value={grupoForm.minimo}
                onChange={(e) => setGrupoForm({ ...grupoForm, minimo: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Máximo</label>
              <input
                type="number"
                value={grupoForm.maximo}
                onChange={(e) => setGrupoForm({ ...grupoForm, maximo: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs">
            + Adicionar Grupo
          </button>
        </form>

        {/* Cadastro de Itens dentro do Grupo */}
        <form onSubmit={handleSalvarItem} className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h4 className="text-sm font-semibold text-amber-400">2. Adicionar Opção ao Grupo</h4>
          <div>
            <label className="block text-xs text-slate-400">Selecione o Grupo</label>
            <select
              value={itemForm.grupoId}
              onChange={(e) => setItemForm({ ...itemForm, grupoId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
            >
              <option value="">Selecione...</option>
              {grupos.map((g) => (
                <option key={g._id || g.id} value={g._id || g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400">Nome do Item</label>
              <input
                type="text"
                required
                placeholder="Ex: Brigadeiro"
                value={itemForm.nome}
                onChange={(e) => setItemForm({ ...itemForm, nome: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Preço Adicional (R$)</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.preco}
                onChange={(e) => setItemForm({ ...itemForm, preco: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
              />
            </div>
          </div>

          {/* Campo de Foto do Complemento */}
          <div>
            <label className="block text-xs text-slate-400 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              Foto do Complemento (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
            {itemForm.foto && (
              <div className="mt-2 flex items-center gap-2">
                <img src={itemForm.foto} alt="Pré-visualização" className="w-10 h-10 object-cover rounded border border-slate-700" />
                <span className="text-xs text-emerald-400">Foto carregada com sucesso!</span>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs">
            + Adicionar Opção
          </button>
        </form>
      </div>
    </div>
  );
};