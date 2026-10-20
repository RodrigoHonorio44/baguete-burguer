import { useState, useEffect } from 'react';
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

          const webpDataUrl = canvas.toDataURL('image/webp', 0.75);
          const dataUrl = webpDataUrl.startsWith('data:image/webp')
            ? webpDataUrl
            : canvas.toDataURL('image/jpeg', 0.7);
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
        setForm({ nome: '', descricao: '', preco: '', categoria: categoriasDisponiveis[0] || 'açaí / garrafas', imagem: '', disponivel: true });
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
    const catProd = prod.categoria || prod.category || 'açaí / garrafas';
    
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
        categoria: prod.categoria || prod.category || 'açaí / garrafas',
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
    setForm({ nome: '', descricao: '', preco: '', categoria: categoriasDisponiveis[0] || 'açaí / garrafas', imagem: '', disponivel: true });
    toast('edição cancelada', { icon: 'ℹ️' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho Limpo em Modo Claro */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-500" />
            Gestão de Produtos (Açaí, Baguetes e Bebidas)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre novos itens, gerencie preços e atualize o cardápio em tempo real
          </p>
        </div>

        <button
          onClick={carregarProdutos}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer shadow-xs"
          title="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Cadastro / Edição (Coluna Esquerda) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs h-fit">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
            {editandoId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Item</label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: açaí na garrafa 500ml, baguete artesanal"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Categoria com suporte a seleção, criação e exclusão */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Categoria</label>
                {isCriandoNovaCategoria && (
                  <button
                    type="button"
                    onClick={() => setIsCriandoNovaCategoria(false)}
                    className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                  >
                    &larr; Voltar para lista
                  </button>
                )}
              </div>

              {!isCriandoNovaCategoria ? (
                <div className="flex gap-2 items-center">
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 cursor-pointer capitalize"
                  >
                    {categoriasDisponiveis.map((cat, idx) => (
                      <option key={idx} value={cat} className="bg-white text-slate-800 capitalize">
                        {cat}
                      </option>
                    ))}
                    <option value="__CRIAR_NOVA__" className="bg-white text-amber-600 font-bold">
                      + Criar nova categoria...
                    </option>
                  </select>

                  {form.categoria && (
                    <button
                      type="button"
                      onClick={handleExcluirCategoriaSelecionada}
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
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
                  placeholder="Digite o nome da nova categoria..."
                  className="w-full bg-slate-50 border border-amber-500 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none"
                  autoFocus
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                name="preco"
                required
                value={form.preco}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Ingredientes</label>
              <textarea
                name="descricao"
                rows="3"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Ex: garrafa de açaí cremoso de 500ml. monte com seus sabores e acompanhamentos..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Foto do Produto (Computador ou Celular)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
              
              {form.imagem && (
                <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                {editandoId ? 'Salvar Alterações' : 'Cadastrar no Banco'}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-xs transition cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela / Lista de Produtos Cadastrados (Coluna Direita) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Itens no Cardápio ({produtos.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Cardápio Ativo</span>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm py-8 text-center">A carregar produtos do banco...</p>
          ) : produtos.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Nenhum produto cadastrado no banco de dados.</p>
            </div>
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
                    className={`flex items-center justify-between bg-slate-50 border p-3.5 rounded-xl gap-4 transition shadow-2xs ${
                      disponivel ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30 opacity-70'
                    }`}
                  >
                    {imagemProd ? (
                      <img src={imagemProd} alt={prod.nome} className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm capitalize">{prod.nome || prod.name}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">
                          {prod.categoria || prod.category || 'açaí / garrafas'}
                        </span>
                        {!disponivel && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded uppercase border border-rose-200">
                            Esgotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {prod.descricao || prod.description || 'Sem descrição'}
                      </p>
                      <span className="text-xs font-extrabold text-emerald-600 mt-0.5 block">R$ {preco.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => { setProdutoComplementosId(id); setProdutoGerenciarId(null); }}
                        className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 bg-white border border-slate-200 cursor-pointer shadow-2xs text-xs font-semibold"
                        title="Cadastrar novas categorias ou adicionais"
                      >
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span className="hidden sm:inline">Cadastrar</span>
                      </button>

                      <button
                        onClick={() => { setProdutoGerenciarId(id); setProdutoComplementosId(null); }}
                        className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 bg-white border border-slate-200 cursor-pointer shadow-2xs text-xs font-semibold"
                        title="Gerenciar e editar categorias cadastradas"
                      >
                        <Sliders className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Gerenciar</span>
                      </button>

                      <button
                        onClick={() => handleToggleDisponibilidadeRapida(prod)}
                        className={`p-2 rounded-lg transition cursor-pointer border shadow-2xs ${
                          disponivel 
                            ? 'bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50' 
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={disponivel ? 'Marcar como indisponível (esgotado)' : 'Marcar como disponível'}
                      >
                        {disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-2 text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition cursor-pointer shadow-2xs"
                        title="Editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(id)}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer shadow-2xs"
                        title="Excluir do banco"
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