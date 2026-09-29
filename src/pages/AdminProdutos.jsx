import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'hamburgueres',
    imagem: '',
  });

  const [editandoId, setEditandoId] = useState(null);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await api.getProdutos();
      setProdutos(data);
    } catch (err) {
      console.error(err);
      toast.error('erro ao carregar os produtos do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      preco: parseFloat(form.preco),
    };

    const acao = editandoId
      ? api.atualizarProduto(editandoId, payload)
      : api.criarProduto(payload);

    toast.promise(acao, {
      loading: editandoId ? 'a atualizar produto...' : 'a cadastrar produto...',
      success: () => {
        setForm({ nome: '', descricao: '', preco: '', categoria: 'hamburgueres', imagem: '' });
        setEditandoId(null);
        carregarProdutos();
        return editandoId ? 'produto atualizado com sucesso!' : 'produto cadastrado com sucesso!';
      },
      error: (err) => 'erro ao salvar o produto: ' + err.message,
    });
  };

  const handleEdit = (prod) => {
    setEditandoId(prod._id || prod.id);
    setForm({
      nome: prod.nome || prod.name || '',
      descricao: prod.descricao || prod.description || '',
      preco: prod.preco || prod.price || '',
      categoria: prod.categoria || 'hamburgueres',
      imagem: prod.imagem || prod.image || '',
    });
    toast('modo de edição ativado', { icon: '✏️' });
  };

  const handleDelete = async (id) => {
    // Para substituir o confirm do window, pode usar um toast interativo ou confirmação simples:
    if (!window.confirm('tem certeza que deseja excluir este item do cardápio?')) return;

    try {
      await api.excluirProduto(id);
      toast.success('produto removido com sucesso!');
      carregarProdutos();
    } catch (err) {
      console.error(err);
      toast.error('erro ao excluir produto: ' + err.message);
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm({ nome: '', descricao: '', preco: '', categoria: 'hamburgueres', imagem: '' });
    toast('edição cancelada', { icon: 'ℹ️' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-500" />
          gestão de produtos (hambúrgueres e bebidas)
        </h1>
        <button
          onClick={carregarProdutos}
          className="p-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 transition"
          title="atualizar lista"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro / Edição */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-fit">
          <h2 className="text-lg font-bold text-slate-100 mb-4">
            {editandoId ? 'editar produto' : 'cadastrar novo produto'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">nome do item</label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                placeholder="ex: baguete artesanal, coca-cola 350ml"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">categoria</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="hamburgueres">hambúrgueres / baguetes</option>
                <option value="bebidas">bebidas</option>
                <option value="porcoes">porções / acompanhamentos</option>
                <option value="sobremesas">sobremesas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">preço (r$)</label>
              <input
                type="number"
                step="0.01"
                name="preco"
                required
                value={form.preco}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">descrição / ingredientes</label>
              <textarea
                name="descricao"
                rows="3"
                value={form.descricao}
                onChange={handleChange}
                placeholder="ex: pão baguete, 180g de hambúrguer artesanal..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">url da imagem (opcional)</label>
              <input
                type="text"
                name="imagem"
                value={form.imagem}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                {editandoId ? 'salvar alterações' : 'cadastrar no banco'}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="px-3 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold rounded-lg text-sm transition"
                >
                  cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela / Lista de Produtos Cadastrados */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-slate-100 mb-4">itens no cardápio ({produtos.length})</h2>

          {loading ? (
            <p className="text-slate-400 text-sm">a carregar produtos do banco...</p>
          ) : produtos.length === 0 ? (
            <p className="text-slate-500 text-sm">nenhum produto cadastrado no banco de dados.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {produtos.map((prod) => {
                const id = prod._id || prod.id;
                const preco = Number(prod.preco || prod.price || 0);

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between bg-slate-800/40 border border-slate-800 p-3 rounded-lg"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 capitalize">{prod.nome || prod.name}</span>
                        <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                          {prod.categoria || 'hamburgueres'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {prod.descricao || prod.description || 'sem descrição'}
                      </p>
                      <span className="text-xs font-bold text-emerald-400">r$ {preco.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                        title="editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="excluir do banco"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};