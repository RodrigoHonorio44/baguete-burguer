import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Layers, Check, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';

export const AdminComplementos = ({ produtoId, onFechar }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para criar um grupo configurado inicialmente com mínimo: 1 e máximo: 2
  const [grupoForm, setGrupoForm] = useState({
    nome: '',
    minimo: 1,
    maximo: 2,
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
      // Busca os grupos cadastrados para este produto usando a URL completa da API
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/grupos?produtoId=${produtoId}`);
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
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...grupoForm, produtoId })
      });
      
      if (!response.ok) throw new Error('Falha ao salvar grupo');

      toast.success('Grupo de complementos criado!');
      
      // Reinicia mantendo os padrões de mínimo: 1 e máximo: 2
      setGrupoForm({ nome: '', minimo: 1, maximo: 2, obrigatorio: false });
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
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/complementos/itens`, {
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
    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          Gerenciar Complementos e Opcionais
        </h3>
        {onFechar && (
          <button
            onClick={onFechar}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer transition flex items-center gap-1"
          >
            <X size={14} /> Fechar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Cadastro de Grupo */}
        <form onSubmit={handleSalvarGrupo} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            1. Criar Grupo de Opcionais
          </h4>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Grupo</label>
            <input
              type="text"
              required
              placeholder="Ex: Escolha o Sabor, Acompanhamentos"
              value={grupoForm.nome}
              onChange={(e) => setGrupoForm({ ...grupoForm, nome: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mínimo</label>
              <input
                type="number"
                min="0"
                value={grupoForm.minimo}
                onChange={(e) => {
                  const val = e.target.value;
                  setGrupoForm({ ...grupoForm, minimo: val === '' ? '' : parseInt(val) });
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Máximo</label>
              <input
                type="number"
                min="1"
                value={grupoForm.maximo}
                onChange={(e) => {
                  const val = e.target.value;
                  setGrupoForm({ ...grupoForm, maximo: val === '' ? '' : parseInt(val) });
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
            💡 <strong className="text-amber-800">Dica:</strong> Mínimo <span className="text-slate-900 font-bold">1</span> obriga o cliente a escolher. Mínimo <span className="text-slate-900 font-bold">0</span> deixa a escolha opcional.
          </p>

          <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition shadow-xs">
            + Adicionar Grupo
          </button>
        </form>

        {/* 2. Cadastro de Itens dentro do Grupo */}
        <form onSubmit={handleSalvarItem} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            2. Adicionar Opção ao Grupo
          </h4>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Grupo</label>
            <select
              value={itemForm.grupoId}
              onChange={(e) => setItemForm({ ...itemForm, grupoId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="">Selecione...</option>
              {grupos.map((g) => (
                <option key={g._id || g.id} value={g._id || g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Item</label>
              <input
                type="text"
                required
                placeholder="Ex: Brigadeiro"
                value={itemForm.nome}
                onChange={(e) => setItemForm({ ...itemForm, nome: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Adicional (R$)</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.preco}
                onChange={(e) => setItemForm({ ...itemForm, preco: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              Foto do Complemento (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
            {itemForm.foto && (
              <div className="mt-2 flex items-center gap-2">
                <img src={itemForm.foto} alt="Pré-visualização" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                <span className="text-xs text-emerald-600 font-bold">Foto carregada com sucesso!</span>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs">
            + Adicionar Opção
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminComplementos;