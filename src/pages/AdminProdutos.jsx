import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Package,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Layers,
  Sliders,
  CheckSquare,
  Square,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminEditarComplementos from '../components/AdminEditarComplementos';
import { EstoqueInputForm, EstoqueBadgeCard } from '../components/EstoqueControl';

const CHAVE_ORDEM_CATEGORIAS = 'cardapio_ordem_categorias_v1';

const normalizarCat = (cat) => String(cat || '').trim().toLowerCase();

const lerOrdemLocal = () => {
  try {
    const raw = localStorage.getItem(CHAVE_ORDEM_CATEGORIAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizarCat).filter((c) => c && c !== 'todos');
      }
    }
    const cfg = JSON.parse(localStorage.getItem('configuracoes_loja') || '{}');
    if (Array.isArray(cfg.ordemCategorias) && cfg.ordemCategorias.length > 0) {
      return cfg.ordemCategorias.map(normalizarCat).filter((c) => c && c !== 'todos');
    }
    return [];
  } catch {
    return [];
  }
};

const salvarOrdemLocal = (ordem) => {
  const limpa = Array.from(
    new Set((ordem || []).map(normalizarCat).filter((c) => c && c !== 'todos'))
  );
  try {
    localStorage.setItem(CHAVE_ORDEM_CATEGORIAS, JSON.stringify(limpa));
    const atualCfg = JSON.parse(localStorage.getItem('configuracoes_loja') || '{}');
    localStorage.setItem(
      'configuracoes_loja',
      JSON.stringify({ ...atualCfg, ordemCategorias: limpa })
    );
  } catch (err) {
    console.error('Erro ao salvar ordem das categorias:', err);
  }
  return limpa;
};

const montarListaOrdenada = (categoriasExistentes = [], ordemSalva = []) => {
  const ordemBase = (ordemSalva && ordemSalva.length > 0 ? ordemSalva : lerOrdemLocal())
    .map(normalizarCat)
    .filter((c) => c && c !== 'todos');

  const unicas = Array.from(
    new Set(
      (categoriasExistentes || [])
        .map(normalizarCat)
        .filter((c) => c && c !== 'todos')
    )
  );

  const naOrdem = ordemBase.filter((c) => unicas.includes(c));
  const novas = unicas.filter((c) => !ordemBase.includes(c));
  return [...naOrdem, ...novas];
};

export const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [gruposDisponiveis, setGruposDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroCategoriaCardapio, setFiltroCategoriaCardapio] = useState('todos');
  const [buscaCardapio, setBuscaCardapio] = useState('');

  const [gerenciadorGlobalAberto, setGerenciadorGlobalAberto] = useState(false);
  const [ordenadorCategoriasAberto, setOrdenadorCategoriasAberto] = useState(false);
  const [ordemCategorias, setOrdemCategorias] = useState(() => lerOrdemLocal());
  const [produtoComplementoAtivoId, setProdutoComplementoAtivoId] = useState(null);

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([
    'açaí / garrafas',
    'açaí / copos',
    'sorvete',
    'hambúrgueres / baguetes',
    'bebidas',
    'porções / acompanhamentos',
    'sobremesas',
    'combos',
    'nhoques & lasanhas',
  ]);

  const [isCriandoNovaCategoria, setIsCriandoNovaCategoria] = useState(false);
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    precoOriginal: '',
    categoria: 'açaí / garrafas',
    imagem: '',
    disponivel: true,
    estoque: '',
    gruposComplementosIds: [],
  });

  const [editandoId, setEditandoId] = useState(null);

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
            toast.error(`foto fora do padrão! dimensões atuais: ${larguraOriginal}x${alturaOriginal}px.`);
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

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const [dataProdutos, dataGrupos] = await Promise.all([
        api.getProdutos(),
        fetch('https://api-hamburgueria.rodhonsystem.com.br/api/complementos/grupos')
          .then((res) => res.json())
          .catch(() => []),
      ]);

      const listaProdutos = Array.isArray(dataProdutos) ? dataProdutos : [];
      setProdutos(listaProdutos);

      const listaGrupos = Array.isArray(dataGrupos)
        ? dataGrupos
        : dataGrupos.data || dataGrupos.grupos || [];
      setGruposDisponiveis(listaGrupos);

      if (listaProdutos.length > 0) {
        const catsDoBanco = listaProdutos
          .map((p) => normalizarCat(p.categoria || p.category))
          .filter(Boolean);
        setCategoriasDisponiveis((prev) => {
          const combinadas = new Set([...prev.map(normalizarCat), ...catsDoBanco]);
          return Array.from(combinadas);
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('erro ao carregar os dados do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const todasCategoriasSemTodos = montarListaOrdenada(
    [
      ...categoriasDisponiveis,
      ...produtos.map((p) => p.categoria || p.category),
    ],
    ordemCategorias
  );

  const handleMoverCategoria = (cat, direcao) => {
    const alvo = normalizarCat(cat);
    const idx = todasCategoriasSemTodos.indexOf(alvo);
    if (idx === -1) return;

    const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1;
    if (novoIdx < 0 || novoIdx >= todasCategoriasSemTodos.length) return;

    const copia = [...todasCategoriasSemTodos];
    const [removida] = copia.splice(idx, 1);
    copia.splice(novoIdx, 0, removida);

    const salva = salvarOrdemLocal(copia);
    setOrdemCategorias(salva);
    toast.success('ordem das categorias atualizada!');
  };

  const handleResetarOrdemCategorias = () => {
    const limpa = salvarOrdemLocal([]);
    setOrdemCategorias(limpa);
    toast.success('ordem restaurada para o padrão!');
  };

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

  const handleToggleGrupoVinculado = (grupoId) => {
    const atuais = form.gruposComplementosIds || [];
    if (atuais.includes(grupoId)) {
      setForm({ ...form, gruposComplementosIds: atuais.filter((id) => id !== grupoId) });
    } else {
      setForm({ ...form, gruposComplementosIds: [...atuais, grupoId] });
    }
  };

  const handleMoverGrupoVinculado = (grupoId, direcao, e) => {
    e.stopPropagation();

    const atuais = [...(form.gruposComplementosIds || [])];
    const idx = atuais.indexOf(grupoId);
    if (idx === -1) return;

    const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1;
    if (novoIdx < 0 || novoIdx >= atuais.length) return;

    const [removido] = atuais.splice(idx, 1);
    atuais.splice(novoIdx, 0, removido);

    setForm({ ...form, gruposComplementosIds: atuais });
  };

  const handleExcluirCategoriaSelecionada = () => {
    if (!form.categoria) {
      toast.error('Selecione uma categoria válida para excluir.');
      return;
    }

    if (window.confirm(`Deseja remover a categoria "${form.categoria}" da lista?`)) {
      const novasCategorias = categoriasDisponiveis.filter((cat) => cat !== form.categoria);
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

    const categoriaFinal = isCriandoNovaCategoria
      ? novaCategoriaInput.trim().toLowerCase()
      : normalizarCat(form.categoria);

    if (!categoriaFinal) {
      toast.error('por favor, informe ou selecione uma categoria.');
      return;
    }

    const qtdEstoque = form.estoque !== '' ? parseInt(form.estoque, 10) : 0;

    const payload = {
      ...form,
      categoria: categoriaFinal,
      preco: parseFloat(form.preco),
      precoOriginal: form.precoOriginal ? parseFloat(form.precoOriginal) : 0,
      estoque: qtdEstoque,
      disponivel: qtdEstoque > 0 ? form.disponivel : false,
      gruposComplementosIds: form.gruposComplementosIds,
    };

    const acao = editandoId
      ? api.atualizarProduto(editandoId, payload)
      : api.criarProduto(payload);

    toast.promise(acao, {
      loading: editandoId ? 'a atualizar produto...' : 'a cadastrar produto...',
      success: () => {
        setForm({
          nome: '',
          descricao: '',
          preco: '',
          precoOriginal: '',
          categoria: categoriasDisponiveis[0] || 'açaí / garrafas',
          imagem: '',
          disponivel: true,
          estoque: '',
          gruposComplementosIds: [],
        });
        setEditandoId(null);
        setProdutoComplementoAtivoId(null);
        setIsCriandoNovaCategoria(false);
        setNovaCategoriaInput('');
        carregarDadosIniciais();
        return editandoId ? 'produto atualizado com sucesso!' : 'produto cadastrado com sucesso!';
      },
      error: (err) => 'erro ao salvar o produto: ' + err.message,
    });
  };

  const handleEdit = (prod) => {
    const pId = prod._id || prod.id;
    setEditandoId(pId);
    setProdutoComplementoAtivoId(pId);

    const catProd = normalizarCat(prod.categoria || prod.category) || 'açaí / garrafas';

    if (!categoriasDisponiveis.includes(catProd)) {
      setCategoriasDisponiveis((prev) => [...prev, catProd]);
    }

    setIsCriandoNovaCategoria(false);
    setForm({
      nome: prod.nome || prod.name || '',
      descricao: prod.descricao || prod.description || '',
      preco: prod.preco || prod.price || '',
      precoOriginal: prod.precoOriginal || prod.precoAntigo || prod.originalPrice || '',
      categoria: catProd,
      imagem: prod.imagem || prod.image || '',
      disponivel: prod.disponivel !== undefined ? prod.disponivel : true,
      estoque: prod.estoque !== undefined ? prod.estoque : '',
      gruposComplementosIds: prod.gruposComplementosIds || prod.complementosIds || [],
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
        precoOriginal: Number(prod.precoOriginal || prod.precoAntigo || 0),
        categoria: prod.categoria || prod.category || 'açaí / garrafas',
        imagem: prod.imagem || prod.image,
        estoque: Number(prod.estoque || 0),
        disponivel: novoStatus,
        gruposComplementosIds: prod.gruposComplementosIds || prod.complementosIds || [],
      };

      await api.atualizarProduto(id, payload);
      toast.success(novoStatus ? 'produto agora está disponível!' : 'produto marcado como esgotado!');
      carregarDadosIniciais();
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
      carregarDadosIniciais();
    } catch (err) {
      console.error(err);
      toast.error('erro ao excluir produto: ' + err.message);
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setProdutoComplementoAtivoId(null);
    setIsCriandoNovaCategoria(false);
    setNovaCategoriaInput('');
    setForm({
      nome: '',
      descricao: '',
      preco: '',
      precoOriginal: '',
      categoria: categoriasDisponiveis[0] || 'açaí / garrafas',
      imagem: '',
      disponivel: true,
      estoque: '',
      gruposComplementosIds: [],
    });
    toast('edição cancelada', { icon: 'ℹ️' });
  };

  const abasCategoriasCardapio = ['todos', ...todasCategoriasSemTodos];

  const produtosFiltrados = produtos.filter((prod) => {
    const catProd = normalizarCat(prod.categoria || prod.category);
    const bateCategoria =
      filtroCategoriaCardapio === 'todos' || catProd === filtroCategoriaCardapio;

    const termo = buscaCardapio.trim().toLowerCase();
    const nomeProd = String(prod.nome || prod.name || '').toLowerCase();
    const descProd = String(prod.descricao || prod.description || '').toLowerCase();
    const bateBusca =
      !termo || nomeProd.includes(termo) || descProd.includes(termo) || catProd.includes(termo);

    return bateCategoria && bateBusca;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-500" />
            Gestão de Produtos e Vínculo de Complementos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre itens, escolha preços e vincule grupos específicos de complementos
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setGerenciadorGlobalAberto(!gerenciadorGlobalAberto);
              setProdutoComplementoAtivoId(null);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
          >
            <Layers className="w-4 h-4" />
            {gerenciadorGlobalAberto ? 'Fechar Gerenciador Geral' : 'Criar/Gerenciar Grupos'}
          </button>

          <button
            type="button"
            onClick={() => setOrdenadorCategoriasAberto(!ordenadorCategoriasAberto)}
            className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition border ${
              ordenadorCategoriasAberto
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {ordenadorCategoriasAberto ? 'Fechar Ordem' : 'Ordenar Categorias'}
          </button>

          <button
            type="button"
            onClick={carregarDadosIniciais}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer shadow-xs"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Painel Admin para Ordenar Categorias do Cardápio */}
      {ordenadorCategoriasAberto && (
        <div className="mb-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Ordem das Categorias no Cardápio (Admin)
              </h2>
              <p className="text-xs text-slate-500">
                Mova as categorias com as setas para definir a ordem em que aparecem para o cliente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetarOrdemCategorias}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Resetar
              </button>
              <button
                type="button"
                onClick={() => setOrdenadorCategoriasAberto(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {todasCategoriasSemTodos.map((cat, idx) => (
              <div
                key={cat}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <span className="font-bold text-slate-800 capitalize truncate pr-2">
                  {idx + 1}. {cat}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoverCategoria(cat, 'cima')}
                    className="p-1 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Subir"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === todasCategoriasSemTodos.length - 1}
                    onClick={() => handleMoverCategoria(cat, 'baixo')}
                    className="p-1 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Descer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gerenciadorGlobalAberto && (
        <div className="mb-8">
          <AdminEditarComplementos
            onFechar={() => {
              setGerenciadorGlobalAberto(false);
              carregarDadosIniciais();
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Cadastro / Edição de Produto */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs h-fit">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              {editandoId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Item</label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Combo Casal 500ml"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Categoria</label>
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
                      title="Excluir categoria selecionada"
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Atual</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco"
                  required
                  value={form.preco}
                  onChange={handleChange}
                  placeholder="35.90"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Original</label>
                <input
                  type="number"
                  step="0.01"
                  name="precoOriginal"
                  value={form.precoOriginal}
                  onChange={handleChange}
                  placeholder="40.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <EstoqueInputForm value={form.estoque} onChange={handleChange} />
              </div>
            </div>

            {/* SELETOR DE VÍNCULO E ORDEM DE GRUPOS DE COMPLEMENTOS */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-2xl shadow-2xs">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                Vincular e Ordenar Grupos de Complementos:
              </label>
              <p className="text-[11px] text-slate-600 mb-2.5">
                Marque os grupos e use as setas nos selecionados para definir a sequência no cardápio.
              </p>

              {gruposDisponiveis.length === 0 ? (
                <p className="text-xs text-rose-600 italic bg-rose-50 p-2 rounded-xl border border-rose-200">
                  Nenhum grupo criado ainda. Clique em "Criar/Gerenciar Grupos" acima.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(() => {
                    const selecionadosIds = form.gruposComplementosIds || [];

                    const gruposSelecionadosOrdenados = selecionadosIds
                      .map((id) => gruposDisponiveis.find((g) => (g._id || g.id) === id))
                      .filter(Boolean);

                    const gruposNaoSelecionados = gruposDisponiveis.filter(
                      (g) => !selecionadosIds.includes(g._id || g.id)
                    );

                    const listaRender = [...gruposSelecionadosOrdenados, ...gruposNaoSelecionados];

                    return listaRender.map((grupo) => {
                      const gId = grupo._id || grupo.id;
                      const posSelecionado = selecionadosIds.indexOf(gId);
                      const selecionado = posSelecionado !== -1;

                      return (
                        <div
                          key={gId}
                          onClick={() => handleToggleGrupoVinculado(gId)}
                          className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                            selecionado
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {selecionado && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 shrink-0">
                                {posSelecionado + 1}º
                              </span>
                            )}
                            <span className="capitalize truncate">{grupo.nome}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                selecionado ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {grupo.categoria}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {selecionado && (
                              <>
                                <button
                                  type="button"
                                  disabled={posSelecionado === 0}
                                  onClick={(e) => handleMoverGrupoVinculado(gId, 'cima', e)}
                                  className="p-1 bg-amber-300/90 hover:bg-amber-200 text-slate-950 rounded-lg border border-amber-600/40 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                  title="Subir na sequência"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={posSelecionado === selecionadosIds.length - 1}
                                  onClick={(e) => handleMoverGrupoVinculado(gId, 'baixo', e)}
                                  className="p-1 bg-amber-300/90 hover:bg-amber-200 text-slate-950 rounded-lg border border-amber-600/40 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                  title="Descer na sequência"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {selecionado ? (
                              <CheckSquare className="w-4 h-4 text-slate-950 ml-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Ingredientes</label>
              <textarea
                name="descricao"
                rows="2"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Detalhes do item..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Foto do Produto</label>
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

        {/* Tabela / Lista de Produtos Cadastrados com Filtro por Categoria */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Itens no Cardápio ({produtosFiltrados.length}
              {filtroCategoriaCardapio !== 'todos' || buscaCardapio.trim() ? ` / ${produtos.length}` : ''})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Cardápio Ativo</span>
          </div>

          {/* Barra de filtro por categoria + busca */}
          <div className="mb-4 space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {abasCategoriasCardapio.map((cat) => {
                const ativa = filtroCategoriaCardapio === cat;
                const qtdNaCat =
                  cat === 'todos'
                    ? produtos.length
                    : produtos.filter(
                        (p) => normalizarCat(p.categoria || p.category) === cat
                      ).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFiltroCategoriaCardapio(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition cursor-pointer border ${
                      ativa
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'todos' ? 'todos' : cat} ({qtdNaCat})
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={buscaCardapio}
                onChange={(e) => setBuscaCardapio(e.target.value)}
                placeholder="Buscar item no cardápio..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-amber-500"
              />
              {(filtroCategoriaCardapio !== 'todos' || buscaCardapio.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroCategoriaCardapio('todos');
                    setBuscaCardapio('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm py-8 text-center">A carregar produtos do banco...</p>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {produtos.length === 0
                  ? 'Nenhum produto cadastrado no banco de dados.'
                  : 'Nenhum item encontrado para essa categoria/busca.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {produtosFiltrados.map((prod) => {
                const id = prod._id || prod.id;
                const preco = Number(prod.preco || prod.price || 0);
                const precoOriginal = Number(prod.precoOriginal || prod.precoAntigo || 0);
                const imagemProd = prod.imagem || prod.image;
                const estoqueAtual = Number(prod.estoque || 0);
                const gruposVinculados = prod.gruposComplementosIds || prod.complementosIds || [];

                const disponivel = prod.disponivel !== false && estoqueAtual > 0;

                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between bg-slate-50 border p-3.5 rounded-xl gap-4 transition shadow-2xs ${
                      disponivel ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30 opacity-70'
                    }`}
                  >
                    {imagemProd ? (
                      <img
                        src={imagemProd}
                        alt={prod.nome}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm capitalize">
                          {prod.nome || prod.name}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">
                          {prod.categoria || prod.category || 'açaí / garrafas'}
                        </span>

                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          {gruposVinculados.length} grupo(s) vinculado(s)
                        </span>

                        <EstoqueBadgeCard estoque={prod.estoque} />

                        {!disponivel && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded uppercase border border-rose-200">
                            Esgotado
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {prod.descricao || prod.description || 'Sem descrição'}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">
                        {precoOriginal > preco && (
                          <span className="text-xs text-slate-400 line-through">
                            R$ {precoOriginal.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-emerald-600">
                          R$ {preco.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDisponibilidadeRapida(prod)}
                        className={`p-2 rounded-lg transition cursor-pointer border shadow-2xs ${
                          disponivel
                            ? 'bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={disponivel ? 'Marcar como esgotado' : 'Marcar como disponível'}
                      >
                        {disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(prod)}
                        className="p-2 text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition cursor-pointer shadow-2xs"
                        title="Editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
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
    </div>
  );
};

export default AdminProdutos;