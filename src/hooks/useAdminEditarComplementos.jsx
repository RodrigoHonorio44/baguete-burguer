import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const useAdminEditarComplementos = (produtoId, categoriaId) => {
  const [gruposComItens, setGruposComItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([
    'açaí / garrafas',
    'açaí / copos',
    'hambúrgueres / baguetes',
    'bebidas',
    'porções / acompanhamentos'
  ]);

  const [isCriandoNovaCategoria, setIsCriandoNovaCategoria] = useState(false);
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');

  const [novaCategoria, setNovaCategoria] = useState('açaí / garrafas');
  const [novoNomeGrupo, setNovoNomeGrupo] = useState('');
  const [novoMinimo, setNovoMinimo] = useState(0);
  const [novoMaximo, setNovoMaximo] = useState(1);

  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState('');
  const [novoNomeItem, setNovoNomeItem] = useState('');
  const [novoPrecoItem, setNovoPrecoItem] = useState('0.00');
  const [novoFotoItem, setNovoFotoItem] = useState('');

  const [editandoGrupoId, setEditandoGrupoId] = useState(null);
  const [grupoNomeEdit, setGrupoNomeEdit] = useState('');
  const [grupoMinEdit, setGrupoMinEdit] = useState(0);
  const [grupoMaxEdit, setGrupoMaxEdit] = useState(1);

  const [editandoItemId, setEditandoItemId] = useState(null);
  const [itemNomeEdit, setItemNomeEdit] = useState('');
  const [itemPrecoEdit, setItemPrecoEdit] = useState(0);
  const [itemFotoEdit, setItemFotoEdit] = useState('');

  const [adicionandoNoGrupoId, setAdicionandoNoGrupoId] = useState(null);
  const [novoItemForm, setNovoItemForm] = useState({ nome: '', preco: '0.00', foto: '' });

  // URL base padronizada para produção
  const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || 'https://api-impressora.rodhonsystem.com.br';
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (produtoId) params.append('produtoId', produtoId);
      if (categoriaId) params.append('categoriaId', categoriaId);

      const urlClean = getApiBaseUrl();
      const url = params.toString() ? `${urlClean}/complementos/grupos?${params.toString()}` : `${urlClean}/complementos/grupos`;

      console.log('🔍 Buscando grupos de complementos para URL:', url);

      const res = await fetch(url, {
        headers: {
          ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        }
      });
      const data = await res.json();
      const listaGrupos = Array.isArray(data) ? data : (data.data || []);
      
      // Se tivermos um produtoId, filtramos rigorosamente para garantir que apareçam apenas os globais OU os do produto específico
      const gruposFiltrados = produtoId 
        ? listaGrupos.filter(g => !g.produtoId || g.produtoId === produtoId || g.produtoId?.$oid === produtoId)
        : listaGrupos;

      setGruposComItens(gruposFiltrados);

      if (gruposFiltrados.length > 0) {
        const catsDoBanco = gruposFiltrados.map(g => g.categoria).filter(Boolean);
        setCategoriasDisponiveis(prev => {
          const combinadas = new Set([...prev, ...catsDoBanco]);
          return Array.from(combinadas);
        });

        if (!grupoSelecionadoId) {
          const primeiroId = gruposFiltrados[0]._id?.$oid || gruposFiltrados[0]._id;
          setGrupoSelecionadoId(primeiroId);
        }
      }
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

  const handleFotoArquivo = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCriarGrupo = async (e) => {
    e.preventDefault();
    const categoriaFinal = isCriandoNovaCategoria
      ? novaCategoriaInput.trim().toLowerCase()
      : novaCategoria.trim().toLowerCase();

    if (!categoriaFinal || !novoNomeGrupo.trim()) {
      toast.error('Preencha todos os campos obrigatórios do grupo.');
      return;
    }

    try {
      const payload = {
        produtoId: produtoId || null,
        categoria: categoriaFinal,
        nome: novoNomeGrupo.trim(),
        minimo: Number(novoMinimo),
        maximo: Number(novoMaximo)
      };

      console.log('📦 Criando grupo de complemento com payload:', payload);

      await api.criarGrupoComplemento(payload);

      toast.success('Grupo criado com sucesso!');
      if (isCriandoNovaCategoria && !categoriasDisponiveis.includes(categoriaFinal)) {
        setCategoriasDisponiveis(prev => [...prev, categoriaFinal]);
        setNovaCategoria(categoriaFinal);
      }

      setNovoNomeGrupo('');
      setNovoMinimo(0);
      setNovoMaximo(1);
      setIsCriandoNovaCategoria(false);
      setNovaCategoriaInput('');
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao criar grupo.');
    }
  };

  const handleCriarItemSuperior = async (e) => {
    e.preventDefault();
    if (!grupoSelecionadoId || !novoNomeItem.trim()) {
      toast.error('Selecione um grupo e informe o nome.');
      return;
    }

    const precoNum = parseFloat(String(novoPrecoItem).replace(',', '.')) || 0;

    try {
      await api.criarItemComplemento({
        grupoId: grupoSelecionadoId,
        nome: novoNomeItem.trim(),
        preco: precoNum,
        foto: novoFotoItem,
        imagem: novoFotoItem,
        disponivel: true
      });

      toast.success('Item adicionado!');
      setNovoNomeItem('');
      setNovoPrecoItem('0.00');
      setNovoFotoItem('');
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao adicionar item.');
    }
  };

  const handleSalvarGrupo = async (grupoId) => {
    try {
      const urlClean = getApiBaseUrl();
      const res = await fetch(`${urlClean}/complementos/grupos/${grupoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          nome: grupoNomeEdit.trim(),
          minimo: parseInt(grupoMinEdit) || 0,
          maximo: parseInt(grupoMaxEdit) || 1,
        })
      });

      if (!res.ok) throw new Error();
      toast.success('Grupo atualizado!');
      setEditandoGrupoId(null);
      carregarDados();
    } catch (err) {
      toast.error('Erro ao salvar grupo.');
    }
  };

  const handleExcluirGrupo = async (grupoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo e todos os seus itens?')) return;
    try {
      await api.excluirGrupoComplemento(grupoId);
      toast.success('Grupo excluído!');
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir grupo.');
    }
  };

  const handleSalvarItem = async (itemId, grupoIdAtual) => {
    const precoFinal = parseFloat(String(itemPrecoEdit).replace(',', '.')) || 0;
    try {
      await api.atualizarItemComplemento(itemId, {
        grupoId: grupoIdAtual,
        nome: itemNomeEdit.trim(),
        preco: precoFinal,
        foto: itemFotoEdit,
        imagem: itemFotoEdit,
      });

      toast.success('Item atualizado!');
      setEditandoItemId(null);
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar item.');
    }
  };

  const handleAtualizarFotoItemDireto = async (item, novaFotoBase64) => {
    const itemId = item._id?.$oid || item._id;
    try {
      await api.atualizarItemComplemento(itemId, {
        grupoId: item.grupoId,
        nome: item.nome,
        preco: Number(item.preco ?? 0),
        foto: novaFotoBase64,
        imagem: novaFotoBase64,
      });

      toast.success('Foto atualizada!');
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar foto.');
    }
  };

  const handleExcluirItem = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await api.excluirItemComplemento(itemId);
      toast.success('Item removido!');
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir item.');
    }
  };

  const handleCriarItemNoGrupo = async (e, grupoId) => {
    e.preventDefault();
    const precoNum = parseFloat(String(novoItemForm.preco).replace(',', '.')) || 0;
    try {
      await api.criarItemComplemento({
        grupoId,
        nome: novoItemForm.nome.trim(),
        preco: precoNum,
        foto: novoItemForm.foto,
        imagem: novoItemForm.foto,
      });

      toast.success('Item adicionado!');
      setNovoItemForm({ nome: '', preco: '0.00', foto: '' });
      setAdicionandoNoGrupoId(null);
      carregarDados();
    } catch (err) {
      toast.error(err.message || 'Erro ao adicionar item.');
    }
  };

  return {
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
    itemFotoEdit,
    setItemFotoEdit,
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
  };
};

export default useAdminEditarComplementos;