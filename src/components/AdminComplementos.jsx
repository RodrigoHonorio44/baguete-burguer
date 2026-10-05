import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Layers, Check } from 'lucide-react';
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

  // Estado para criar um item dentro de um grupo (ex: "Leite em pó", "Granola")
  const [itemForm, setItemForm] = useState({
    grupoId: '',
    nome: '',
    preco: '0.00',
  });

  // Método para carregar complementos vinculados ao produto
  const carregarComplementos = async () => {
    if (!produtoId) return;
    setLoading(true);
    try {
      const data = await api.getComplementosProduto(produtoId);
      setGrupos(data || []);
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
      await api.criarGrupoComplemento({ ...grupoForm, produtoId });
      toast.success('Grupo de complementos criado!');
      setGrupoForm({ nome: '', minimo: 0, maximo: 1, obrigatorio: false });
      carregarComplementos();
    } catch (err) {
      toast.error('Erro ao salvar grupo: ' + err.message);
    }
  };

  const handleSalvarItem = async (e) => {
    e.preventDefault();
    if (!itemForm.grupoId) return toast.error('Selecione um grupo primeiro.');
    try {
      await api.criarItemComplemento({
        ...itemForm,
        preco: parseFloat(itemForm.preco),
      });
      toast.success('Opção adicionada!');
      setItemForm({ grupoId: '', nome: '', preco: '0.00' });
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
                onChange={(e) => setGrupoForm({ ...grupoForm, minimo: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Máximo</label>
              <input
                type="number"
                value={grupoForm.maximo}
                onChange={(e) => setGrupoForm({ ...grupoForm, maximo: parseInt(e.target.value) })}
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
                placeholder="Ex: Leite em pó"
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
          <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs">
            + Adicionar Opção
          </button>
        </form>
      </div>
    </div>
  );
};