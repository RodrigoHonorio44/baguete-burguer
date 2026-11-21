import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const useAdminEditarComplementos = (produtoId, categoriaId) => {
  const [gruposComItens, setGruposComItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([
    'açaí / garrafas',
    'açaí / copos',
    'sorvete',
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

  // Estados para reaproveitar / anexar grupo já criado em outra categoria
  const [grupoOrigemClonarId, setGrupoOrigemClonarId] = useState('');
  const [categoriaDestinoClonar, setCategoriaDestinoClonar] = useState('sorvete');
  const [nomeGrupoClonar, setNomeGrupoClonar] = useState('');
  const [minimoClonar, setMinimoClonar] = useState(0);
  const [maximoClonar, setMaximoClonar] = useState(2);
  const [clonandoGrupo, setClonandoGrupo] = useState(false);

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

  const extrairId = (obj) => obj?._id?.$oid || obj?._id || obj?.id || '';

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

      const res = await fetch(url, {
        headers: {
          ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        }
      });
      const data = await res.json();
      const listaGrupos = Array.isArray(data) ? data : (data.data || []);

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

        const primeiroId = extrairId(gruposFiltrados[0]);
        if (!grupoSelecionadoId) {
          setGrupoSelecionadoId(primeiroId);
        }
        if (!grupoOrigemClonarId) {
          setGrupoOrigemClonarId(primeiroId);
          setNomeGrupoClonar(String(gruposFiltrados[0].nome || '').toLowerCase());
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

  const handleSelecionarGrupoClonar = (id) => {
    setGrupoOrigemClonarId(id);
    const encontrado = gruposComItens.find(g => extrairId(g) === id);
    if (encontrado) {
      setNomeGrupoClonar(String(encontrado.nome || '').toLowerCase());
      setMinimoClonar(Number(encontrado.minimo ?? 0));
      setMaximoClonar(Number(encontrado.maximo ?? 2));
    }
  };

  const handlePrepararClonagemCard = (grupo) => {
    const id = extrairId(grupo);
    setGrupoOrigemClonarId(id);
    setNomeGrupoClonar(String(grupo.nome || '').toLowerCase());
    setMinimoClonar(Number(grupo.minimo ?? 0));
    setMaximoClonar(Number(grupo.maximo ?? 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`Grupo "${grupo.nome}" pronto para anexar em outra categoria.`);
  };

  const handleAnexarGrupoEmCategoria = async (e) => {
    e.preventDefault();
    const grupoOrigem = gruposComItens.find(g => extrairId(g) === grupoOrigemClonarId);
    if (!grupoOrigem) {
      toast.error('Selecione um grupo já criado para reaproveitar.');
      return;
    }

    const nomeFinal = (nomeGrupoClonar || grupoOrigem.nome || '').trim().toLowerCase();
    const categoriaFinal = (categoriaDestinoClonar || '').trim().toLowerCase();
    if (!nomeFinal || !categoriaFinal) {
      toast.error('Informe o nome do grupo e a categoria destino.');
      return;
    }

    setClonandoGrupo(true);
    try {
      const resGrupo = await api.criarGrupoComplemento({
        produtoId: produtoId || null,
        categoria: categoriaFinal,
        nome: nomeFinal,
        minimo: Number(minimoClonar),
        maximo: Number(maximoClonar)
      });

      const novoGrupoId =
        extrairId(resGrupo) ||
        extrairId(resGrupo?.data) ||
        extrairId(resGrupo?.grupo) ||
        extrairId(resGrupo?.data?.grupo) ||
        resGrupo?.insertedId ||
        resGrupo?.data?.insertedId;

      const itensOrigem = Array.isArray(grupoOrigem.itens) ? grupoOrigem.itens : [];
      if (novoGrupoId) {
        for (const item of itensOrigem) {
          const fotoItem = item.foto || item.imagem || item.img || item.url || '';
          await api.criarItemComplemento({
            grupoId: novoGrupoId,
            nome: String(item.nome || '').trim().toLowerCase(),
            preco: Number(item.preco ?? 0),
            foto: fotoItem,
            imagem: fotoItem,
            disponivel: item.disponivel !== undefined ? Boolean(item.disponivel) : true
          });
        }
      }

      toast.success(`Grupo "${nomeFinal}" anexado em "${categoriaFinal}" com ${itensOrigem.length} item(ns)!`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao anexar grupo na categoria.');
    } finally {
      setClonandoGrupo(false);
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
        nome: novoNomeGrupo.trim().toLowerCase(),
        minimo: Number(novoMinimo),
        maximo: Number(novoMaximo)
      };

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
        nome: novoNomeItem.trim().toLowerCase(),
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
          nome: grupoNomeEdit.trim().toLowerCase(),
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
        nome: itemNomeEdit.trim().toLowerCase(),
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
        nome: novoItemForm.nome.trim().toLowerCase(),
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
    grupoOrigemClonarId,
    categoriaDestinoClonar,
    setCategoriaDestinoClonar,
    nomeGrupoClonar,
    setNomeGrupoClonar,
    minimoClonar,
    setMinimoClonar,
    maximoClonar,
    setMaximoClonar,
    clonandoGrupo,
    handleSelecionarGrupoClonar,
    handlePrepararClonagemCard,
    handleAnexarGrupoEmCategoria,
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