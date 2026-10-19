import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const usePrecificacao = () => {
  const [aba, setAba] = useState('simulador');
  const [insumos, setInsumos] = useState([]);
  const [produtosSalvos, setProdutosSalvos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário de Insumo (Cadastro e Edição)
  const [editandoInsumoId, setEditandoInsumoId] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('acai');
  const [novaUnidade, setNovaUnidade] = useState('kg');
  const [precoTotalComprado, setPrecoTotalComprado] = useState('');
  const [qtdEmbalagem, setQtdEmbalagem] = useState('1');

  // Taxas
  const [taxas, setTaxas] = useState({
    ifoodPercentual: 26.2,
    ifoodRateioUnidade: 1.50,
    f99Percentual: 12.1,
    f99RateioUnidade: 0.00
  });

  // Montador de Ficha Técnica
  const [nomeProdutoFinal, setNomeProdutoFinal] = useState('');
  const [itensReceita, setItensReceita] = useState([]);
  const [insumoSelecionadoId, setInsumoSelecionadoId] = useState('');
  const [qtdUsadaInsumo, setQtdUsadaInsumo] = useState('');
  const [unidadeMedidaSelecionada, setUnidadeMedidaSelecionada] = useState('g');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dadosInsumos = await api.getInsumosPrecificacao();
      setInsumos(Array.isArray(dadosInsumos) ? dadosInsumos : []);

      const configLoja = await api.getConfiguracoesLoja();
      if (configLoja && configLoja.taxasPrecificacao) {
        setTaxas(configLoja.taxasPrecificacao);
      }

      if (api.getProdutosPrecificados) {
        const dadosProds = await api.getProdutosPrecificados();
        setProdutosSalvos(Array.isArray(dadosProds) ? dadosProds : []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados do banco.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAdicionarIngredienteFicha = () => {
    if (!insumoSelecionadoId || !qtdUsadaInsumo || Number(qtdUsadaInsumo) <= 0) {
      toast.error('Selecione um insumo e informe a quantidade usada!');
      return;
    }

    const insumoObj = insumos.find(i => i._id === insumoSelecionadoId);
    if (!insumoObj) return;

    const qtd = Number(qtdUsadaInsumo);
    let custoItem = 0;

    if (unidadeMedidaSelecionada === 'g' || unidadeMedidaSelecionada === 'ml') {
      custoItem = (Number(insumoObj.custo) / 1000) * qtd;
    } else {
      custoItem = Number(insumoObj.custo) * qtd;
    }

    const novoItemFicha = {
      insumoId: insumoObj._id,
      nome: insumoObj.nome,
      qtdUsada: qtd,
      unidadeUsada: unidadeMedidaSelecionada,
      custoCalculado: custoItem
    };

    setItensReceita([...itensReceita, novoItemFicha]);
    setInsumoSelecionadoId('');
    setQtdUsadaInsumo('');
    toast.success(`${insumoObj.nome} adicionado à receita!`);
  };

  const handleRemoverIngredienteFicha = (index) => {
    setItensReceita(itensReceita.filter((_, i) => i !== index));
  };

  const custoDiretoTotalProduto = itensReceita.reduce((acc, curr) => acc + curr.custoCalculado, 0);

  const handleSalvarProdutoFinal = async () => {
    if (!nomeProdutoFinal.trim()) {
      toast.error('Digite o nome do produto final!');
      return;
    }
    if (itensReceita.length === 0) {
      toast.error('Adicione pelo menos um ingrediente ou embalagem!');
      return;
    }

    const novoProduto = {
      nome: nomeProdutoFinal.toLowerCase().trim(),
      itensReceita,
      custoDiretoTotal: custoDiretoTotalProduto,
      criadoEm: new Date().toISOString()
    };

    try {
      if (api.salvarProdutoPrecificado) {
        await api.salvarProdutoPrecificado(novoProduto);
      }
      setProdutosSalvos([novoProduto, ...produtosSalvos]);
      toast.success('Produto precificado salvo no banco!');
      setNomeProdutoFinal('');
      setItensReceita([]);
    } catch (err) {
      toast.error('Erro ao salvar produto precificado.');
    }
  };

  const handleSalvarInsumo = async (e) => {
    e.preventDefault();
    if (!novoNome || !precoTotalComprado || !qtdEmbalagem || Number(qtdEmbalagem) <= 0) {
      toast.error('Preencha todos os campos corretamente!');
      return;
    }

    const precoTotal = Number(precoTotalComprado);
    const quantidade = Number(qtdEmbalagem);
    const custoUnitarioCalculado = precoTotal / quantidade;

    const payload = {
      nome: novoNome.toLowerCase().trim(),
      categoria: novaCategoria,
      unidade: novaUnidade,
      precoTotalComprado: precoTotal,
      qtdEmbalagem: quantidade,
      custo: custoUnitarioCalculado
    };

    try {
      if (editandoInsumoId) {
        if (typeof api.atualizarInsumoPrecificacao === 'function') {
          await api.atualizarInsumoPrecificacao(editandoInsumoId, payload);
        }
        toast.success('Insumo atualizado com sucesso!');
      } else {
        await api.criarInsumoPrecificacao(payload);
        toast.success(`Insumo salvo! Custo: R$ ${custoUnitarioCalculado.toFixed(2)} / ${novaUnidade}`);
      }

      setEditandoInsumoId(null);
      setNovoNome('');
      setPrecoTotalComprado('');
      setQtdEmbalagem('1');
      carregarDados();
    } catch (err) {
      toast.error('Erro ao salvar insumo no banco.');
    }
  };

  const handleEditarInsumo = (item) => {
    setEditandoInsumoId(item._id);
    setNovoNome(item.nome || '');
    setNovaCategoria(item.categoria || 'acai');
    setNovaUnidade(item.unidade || 'kg');
    setPrecoTotalComprado(item.precoTotalComprado || item.custo || '');
    setQtdEmbalagem(item.qtdEmbalagem || '1');
    toast('Modo de edição de insumo ativado', { icon: '✏️' });
  };

  const handleCancelarEdicaoInsumo = () => {
    setEditandoInsumoId(null);
    setNovoNome('');
    setPrecoTotalComprado('');
    setQtdEmbalagem('1');
  };

  const handleExcluirInsumo = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este insumo?')) return;
    try {
      if (typeof api.excluirInsumoPrecificacao === 'function') {
        await api.excluirInsumoPrecificacao(id);
      } else if (typeof api.excluirInsumo === 'function') {
        await api.excluirInsumo(id);
      }
      toast.success('Insumo removido com sucesso!');
      carregarDados();
    } catch (err) {
      toast.error('Erro ao excluir insumo.');
    }
  };

  const handleSalvarTaxas = async (e) => {
    e.preventDefault();
    try {
      const configAtual = await api.getConfiguracoesLoja() || {};
      await api.updateConfiguracoesLoja({ ...configAtual, taxasPrecificacao: taxas });
      toast.success('Taxas salvas no banco!');
    } catch (err) {
      toast.error('Erro ao salvar taxas.');
    }
  };

  return {
    aba, setAba,
    insumos, produtosSalvos, loading,
    editandoInsumoId,
    novoNome, setNovoNome,
    novaCategoria, setNovaCategoria,
    novaUnidade, setNovaUnidade,
    precoTotalComprado, setPrecoTotalComprado,
    qtdEmbalagem, setQtdEmbalagem,
    taxas, setTaxas,
    nomeProdutoFinal, setNomeProdutoFinal,
    itensReceita,
    insumoSelecionadoId, setInsumoSelecionadoId,
    qtdUsadaInsumo, setQtdUsadaInsumo,
    unidadeMedidaSelecionada, setUnidadeMedidaSelecionada,
    custoDiretoTotalProduto,
    handleAdicionarIngredienteFicha,
    handleRemoverIngredienteFicha,
    handleSalvarProdutoFinal,
    handleSalvarInsumo,
    handleEditarInsumo,
    handleCancelarEdicaoInsumo,
    handleExcluirInsumo,
    handleSalvarTaxas
  };
};