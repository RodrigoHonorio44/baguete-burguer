import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Package, RefreshCw, Image as ImageIcon, Eye, EyeOff, Layers, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminComplementos } from '../components/AdminComplementos';
import { AdminEditarComplementos } from '../components/AdminEditarComplementos';

export const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados separados para controlar cada painel individualmente
  const [produtoComplementosId, setProdutoComplementosId] = useState(null); // Painel de Cadastro
  const [produtoGerenciarId, setProdutoGerenciarId] = useState(null); // Painel de Edição e Gestão

  // Lista dinâmica extraída dos produtos já cadastrados + padrões iniciais
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([
    'açaí / garrafas',
    'hambúrgueres / baguetes',
    'bebidas',
    'porções / acompanhamentos',
    'sobremesas'
  ]);

  const [isCriandoNovaCategoria, setIsCriandoNovaCategoria] = useState(false);
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'açaí / garrafas',
    imagem: '',
    disponivel: true,
  });

  const [editandoId, setEditandoId] = useState(null);

  // Função para comprimir, redimensionar a imagem e validar o padrão de píxeis
  const comprimirImagem = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const larguraOriginal = img.width;
          const alturaOriginal = img.height;
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;

          if (larguraOriginal > 4000 || alturaOriginal > 4000) {
            toast.error(`foto fora do padrão! dimensões atuais: ${larguraOriginal}x${alturaOriginal}px. máximo permitido: 4000x4000px.`);
          }

          let width = larguraOriginal;
          let height = alturaOriginal;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
    });
  };

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await api.getProdutos();
      setProdutos(data);

      // Extrai categorias existentes no banco para popular o select automaticamente
      if (Array.isArray(data)) {
        const catsDoBanco = data.map(p => p.categoria || p.category).filter(Boolean);
        setCategoriasDisponiveis((prev) => {
          const combinadas = new Set([...prev, ...catsDoBanco]);
          return Array.from(combinadas);
        });
      }
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
    const { name, value } = e.target;
    if (name === 'categoria') {
      if (value === '__CRIAR_NOVA__') {
        setIsCriandoNovaCategoria(true);
        setForm({ ...form, categoria: '' });
      } else {
        setIsCriandoNovaCategoria(false);
        setForm({ ...form, categoria: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleExcluirCategoriaSelecionada = () => {
    if (!form.categoria) {
      toast.error('Selecione uma categoria válida para excluir.');
      return;
    }

    if (window.confirm(`Deseja remover a categoria "${form.categoria}" da lista?`)) {
      const novasCategorias = categoriasDisponiveis.filter(cat => cat !== form.categoria);
      setCategoriasDisponiveis(novasCategorias);
      setForm({ ...form, categoria: novasCategorias[0] || '' });
      toast.success('Categoria removida das opções!');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imagemOtimizada = await comprimirImagem(file);
        setForm({ ...form, imagem: imagemOtimizada });
        toast.success('foto carregada e otimizada com sucesso!');
      } catch (error) {
        console.error(error);
        toast.error('erro ao processar a imagem.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Se estiver a criar uma nova categoria via input livre, usa ela
    const categoriaFinal = isCriandoNovaCategoria
      ? novaCategoriaInput.trim().toLowerCase()
      : form.categoria;

    if (!categoriaFinal) {
      toast.error('por favor, informe ou selecione uma categoria.');
      return;
    }

    const payload = {
      ...form,
      categoria: categoriaFinal,
      preco: parseFloat(form.preco),
    };

    const acao = editandoId
      ? api.atualizarProduto(editandoId, payload)
      : api.criarProduto(payload);

    toast.promise(acao, {
      loading: editandoId ? 'a atualizar produto...' : 'a cadastrar produto...',
      success: () => {
        setForm({ nome: '', descricao: '', preco: '', categoria: categoriasDisponiveis[0] || 'acai', imagem: '', disponivel: true });
        setEditandoId(null);
        setIsCriandoNovaCategoria(false);
        setNovaCategoriaInput('');
        carregarProdutos();
        return editandoId ? 'produto atualizado com sucesso!' : 'produto cadastrado com sucesso!';
      },
      error: (err) => 'erro ao salvar o produto: ' + err.message,
    });
  };

  const handleEdit = (prod) => {
    setEditandoId(prod._id || prod.id);
    const catProd = prod.categoria || prod.category || 'acai';
    
    // Se a categoria do produto não estiver na lista padrão, adiciona para aparecer no select
    if (!categoriasDisponiveis.includes(catProd)) {
      setCategoriasDisponiveis(prev => [...prev, catProd]);
    }

    setIsCriandoNovaCategoria(false);
    setForm({
      nome: prod.nome || prod.name || '',
      descricao: prod.descricao || prod.description || '',
      preco: prod.preco || prod.price || '',
      categoria: catProd,
      imagem: prod.imagem || prod.image || '',
      disponivel: prod.disponivel !== undefined ? prod.disponivel : true,
    });
    toast('modo de edição ativado', { icon: '✏️' });
  };

  const handleToggleDisponibilidadeRapida = async (prod) => {
    const id = prod._id || prod.id;
    const novoStatus = prod.disponivel === false ? true : false;

    try {
      const payload = {
        nome: prod.nome || prod.name,
        descricao: prod.descricao || prod.description,
        preco: Number(prod.preco || prod.price),
        categoria: prod.categoria || prod.category || 'acai',
        imagem: prod.imagem || prod.image,
        disponivel: novoStatus,
      };

      await api.atualizarProduto(id, payload);
      toast.success(novoStatus ? 'produto agora está disponível!' : 'produto marcado como esgotado!');
      carregarProdutos();
    } catch (err) {
      console.error(err);
      toast.error('erro ao atualizar status do produto.');
    }
  };

  const handleDelete = async (id) => {
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
    setIsCriandoNovaCategoria(false);
    setNovaCategoriaInput('');
    setForm({ nome: '', descricao: '', preco: '', categoria: categoriasDisponiveis[0] || 'acai', imagem: '', disponivel: true });
    toast('edição cancelada', { icon: 'ℹ️' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-500" />
          gestão de produtos (açaí, baguetes e bebidas)
        </h1>
        <button
          onClick={carregarProdutos}
          className="p-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 transition cursor-pointer"
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
                placeholder="ex: açaí na garrafa 500ml, baguete artesanal"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Categoria com suporte a seleção, criação e exclusão */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-400">categoria</label>
                {isCriandoNovaCategoria && (
                  <button
                    type="button"
                    onClick={() => setIsCriandoNovaCategoria(false)}
                    className="text-[11px] text-amber-500 hover:underline cursor-pointer"
                  >
                    &larr; voltar para lista
                  </button>
                )}
              </div>

              {!isCriandoNovaCategoria ? (
                <div className="flex gap-2 items-center">
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categoriasDisponiveis.map((cat, idx) => (
                      <option key={idx} value={cat} className="bg-slate-900 text-slate-100 capitalize">
                        {cat}
                      </option>
                    ))}
                    <option value="__CRIAR_NOVA__" className="bg-slate-900 text-amber-400 font-bold">
                      + Criar nova categoria...
                    </option>
                  </select>

                  {/* Botão para excluir a categoria selecionada da lista */}
                  {form.categoria && (
                    <button
                      type="button"
                      onClick={handleExcluirCategoriaSelecionada}
                      className="p-2 bg-slate-800 text-rose-400 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500 rounded-lg transition cursor-pointer"
                      title="Excluir categoria selecionada da lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={novaCategoriaInput}
                  onChange={(e) => setNovaCategoriaInput(e.target.value)}
                  placeholder="digite o nome da nova categoria..."
                  className="w-full bg-slate-800 border border-amber-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoFocus
                  required
                />
              )}
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
                placeholder="ex: garrafa de açaí cremoso de 500ml. monte com seus sabores e acompanhamentos..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">foto do produto (computador ou telemóvel)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer bg-slate-800 border border-slate-700 rounded-lg"
              />
              
              {form.imagem && (
                <div className="mt-3 relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700">
                  <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editandoId ? 'salvar alterações' : 'cadastrar no banco'}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="px-3 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold rounded-lg text-sm transition cursor-pointer"
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
                const imagemProd = prod.imagem || prod.image;
                const disponivel = prod.disponivel !== false;

                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between bg-slate-800/40 border p-3 rounded-lg gap-4 transition ${
                      disponivel ? 'border-slate-800' : 'border-rose-900/50 opacity-60'
                    }`}
                  >
                    {imagemProd ? (
                      <img src={imagemProd} alt={prod.nome} className="w-14 h-14 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 capitalize">{prod.nome || prod.name}</span>
                        <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 capitalize">
                          {prod.categoria || prod.category || 'acai'}
                        </span>
                        {!disponivel && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded uppercase">
                            esgotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {prod.descricao || prod.description || 'sem descrição'}
                      </p>
                      <span className="text-xs font-bold text-emerald-400">r$ {preco.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => { setProdutoComplementosId(id); setProdutoGerenciarId(null); }}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 bg-slate-800/80 border border-slate-700 cursor-pointer"
                        title="cadastrar novas categorias ou adicionais"
                      >
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">cadastrar</span>
                      </button>

                      <button
                        onClick={() => { setProdutoGerenciarId(id); setProdutoComplementosId(null); }}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 bg-slate-800/80 border border-slate-700 cursor-pointer"
                        title="gerenciar e editar categorias cadastradas"
                      >
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">gerenciar</span>
                      </button>

                      <button
                        onClick={() => handleToggleDisponibilidadeRapida(prod)}
                        className={`p-2 rounded-lg transition cursor-pointer ${
                          disponivel 
                            ? 'text-emerald-400 hover:bg-emerald-500/10' 
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={disponivel ? 'marcar como indisponível (esgotado)' : 'marcar como disponível'}
                      >
                        {disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
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

      {/* Renderização condicional do painel de cadastro */}
      {produtoComplementosId && (
        <AdminComplementos
          produtoId={produtoComplementosId}
          onFechar={() => setProdutoComplementosId(null)}
        />
      )}

      {/* Renderização condicional do painel de gerenciamento e edição */}
      {produtoGerenciarId && (
        <AdminEditarComplementos
          produtoId={produtoGerenciarId}
          onFechar={() => setProdutoGerenciarId(null)}
        />
      )}
    </div>
  );
};

export default AdminProdutos;