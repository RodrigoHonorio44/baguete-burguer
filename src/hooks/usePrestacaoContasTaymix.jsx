import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function usePrestacaoContasTaymix() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [percentualGiro, setPercentualGiro] = useState(20);
  const [percentualSocioA, setPercentualSocioA] = useState(50);
  const [investimentoManual, setInvestimentoManual] = useState(0);

  const [tipo, setTipo] = useState('Receita');
  const [categoria, setCategoria] = useState('Vendas / Pedidos');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [ehInvestimentoInicial, setEhInvestimentoInicial] = useState(false);
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);
  const [lendoNota, setLendoNota] = useState(false);
  const [manualAberto, setManualAberto] = useState(false);

  const categoriasReceita = ['Vendas / Pedidos', 'Aporte de Sócio', 'Outros Recebimentos'];
  const categoriasDespesa = ['Insumos / Ingredientes', 'Embalagens', 'Mão de Obra / Pessoal', 'Gás / Energia / Água', 'Combustível / Entrega', 'Manutenção / Ferramentas', 'Outras Despesas'];

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  const carregarMovimentacoes = async () => {
    try {
      const dados = await api.getFinanceiro();
      setMovimentacoes(dados || []);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      toast.error('Erro ao carregar dados financeiros.');
    }
  };

  const handleScanNota = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLendoNota(true);
    const toastId = toast.loading('Analisando foto da notinha com IA...');

    const formData = new FormData();
    formData.append('fotoNota', file);

    try {
      const res = await api.lerNotaFiscal(formData);
      if (res) {
        if (res.descricao) setDescricao(res.descricao);
        if (res.valorTotal) setValor(res.valorTotal);
        if (res.categoria) setCategoria(res.categoria);
        setTipo('Despesa');
        toast.success('Notinha lida com sucesso!', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao escanear nota:', error);
      toast.error('Não foi possível ler a nota. Preencha manualmente.', { id: toastId });
    } finally {
      setLendoNota(false);
    }
  };

  const adicionarLancamento = async (e) => {
    e.preventDefault();
    if (!descricao.trim() || !valor || Number(valor) <= 0) {
      toast.error('Preencha a descrição e um valor válido!');
      return;
    }

    const novoRegistro = {
      empresa: 'Taymix',
      tipo,
      categoria,
      descricao: descricao.trim().toLowerCase(),
      valor: Number(valor),
      ehInvestimentoInicial: tipo === 'Despesa' ? ehInvestimentoInicial : false,
      data: dataLancamento ? new Date(dataLancamento) : new Date(),
    };

    try {
      await api.criarMovimentacaoFinanceira(novoRegistro);
      toast.success('Lançamento registrado!');
      setDescricao('');
      setValor('');
      setEhInvestimentoInicial(false);
      carregarMovimentacoes();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      toast.error('Erro ao salvar no banco de dados.');
    }
  };

  const excluirLancamento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await api.excluirMovimentacaoFinanceira(id);
      toast.success('Lançamento removido!');
      carregarMovimentacoes();
    } catch (error) {
      toast.error('Erro ao excluir lançamento.');
    }
  };

  const movimentacoesFiltradas = movimentacoes.filter((item) => {
    if (item.empresa && item.empresa !== 'Taymix') return false;
    const dataItem = new Date(item.data).toISOString().split('T')[0];
    if (dataInicio && dataItem < dataInicio) return false;
    if (dataFim && dataItem > dataFim) return false;
    return true;
  });

  const totalReceitas = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Receita')
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const totalDespesasOperacionais = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Despesa' && !m.ehInvestimentoInicial)
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const lucroLiquido = totalReceitas - totalDespesasOperacionais;

  const totalNotinhasIniciais = movimentacoes
    .filter((m) => m.empresa === 'Taymix' && (m.ehInvestimentoInicial || m.categoria === 'Aporte de Sócio'))
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const investimentoTotalCalculado = investimentoManual + totalNotinhasIniciais;
  const saldoInvestimentoPendente = investimentoTotalCalculado - lucroLiquido;
  const investimentoQuitado = investimentoTotalCalculado > 0 && saldoInvestimentoPendente <= 0;

  const valorCapitalGiro = lucroLiquido > 0 ? (lucroLiquido * Number(percentualGiro)) / 100 : 0;
  const valorParaDividir = lucroLiquido > 0 ? lucroLiquido - valorCapitalGiro : 0;

  const lucroSocioA = (valorParaDividir * Number(percentualSocioA)) / 100;
  const lucroSocioB = valorParaDividir - lucroSocioA;

  return {
    dataInicio, setDataInicio,
    dataFim, setDataFim,
    movimentacoesFiltradas,
    percentualGiro, setPercentualGiro,
    percentualSocioA, setPercentualSocioA,
    investimentoManual, setInvestimentoManual,
    tipo, setTipo,
    categoria, setCategoria,
    descricao, setDescricao,
    valor, setValor,
    ehInvestimentoInicial, setEhInvestimentoInicial,
    dataLancamento, setDataLancamento,
    lendoNota,
    manualAberto, setManualAberto,
    categoriasReceita, categoriasDespesa,
    handleScanNota,
    adicionarLancamento,
    excluirLancamento,
    totalReceitas,
    totalDespesasOperacionais,
    lucroLiquido,
    totalNotinhasIniciais,
    investimentoTotalCalculado,
    saldoInvestimentoPendente,
    investimentoQuitado,
    valorCapitalGiro,
    valorParaDividir,
    lucroSocioA,
    lucroSocioB
  };
}