import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function usePrestacaoContasTaymix() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [caixasFechados, setCaixasFechados] = useState([]); // Coleção Caixa
  
  // 💾 Recupera o percentual salvo no navegador ou usa 20% como padrão inicial
  const [percentualGiro, setPercentualGiro] = useState(() => {
    const salvo = localStorage.getItem('taymix_percentual_giro');
    return salvo !== null ? Number(salvo) : 20;
  });

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
    carregarDadosFinanceiros();
  }, []);

  // 💾 Salva automaticamente no navegador sempre que o percentual de giro mudar
  useEffect(() => {
    localStorage.setItem('taymix_percentual_giro', percentualGiro);
  }, [percentualGiro]);

  const carregarDadosFinanceiros = async () => {
    try {
      const [dadosMovimentacoes, resCaixa] = await Promise.all([
        api.getFinanceiro ? api.getFinanceiro() : Promise.resolve([]),
        api.getHistoricoCaixa ? api.getHistoricoCaixa() : Promise.resolve([])
      ]);

      setMovimentacoes(dadosMovimentacoes || []);

      const listaCaixas = Array.isArray(resCaixa) 
        ? resCaixa 
        : (resCaixa && Array.isArray(resCaixa.data) ? resCaixa.data : []);

      setCaixasFechados(listaCaixas);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros do banco:', error);
      toast.error('Erro ao carregar dados financeiros do caixa.');
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
      carregarDadosFinanceiros();
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
      carregarDadosFinanceiros();
    } catch (error) {
      toast.error('Erro ao excluir lançamento.');
    }
  };

  // --- FILTRAGEM DE MOVIMENTAÇÕES MANUAIS ---
  const movimentacoesFiltradas = movimentacoes.filter((item) => {
    if (item.empresa && item.empresa !== 'Taymix') return false;
    const dataItem = new Date(item.data).toISOString().split('T')[0];
    if (dataInicio && dataItem < dataInicio) return false;
    if (dataFim && dataItem > dataFim) return false;
    return true;
  });

  // --- FILTRAGEM DOS REGISTROS DA COLEÇÃO CAIXA ---
  const caixasFiltrados = caixasFechados.filter((cx) => {
    const statusCaixa = (cx.status || 'fechado').toLowerCase();
    if (statusCaixa !== 'fechado' && statusCaixa !== 'aberto') {
      if (!cx.faturamentoVendas && !cx.totalVendas) return false;
    }

    let dataRegistro = cx.dataFechamentoRegistro;
    if (!dataRegistro && cx.fechadoEm) {
      const d = new Date(cx.fechadoEm);
      if (!isNaN(d.getTime())) {
        dataRegistro = d.toISOString().split('T')[0];
      }
    }

    if (!dataInicio && !dataFim) return true;

    if (dataRegistro) {
      if (dataInicio && dataRegistro < dataInicio) return false;
      if (dataFim && dataRegistro > dataFim) return false;
      return true;
    }

    return true;
  });

  // --- TOTAIS DE VENDAS DA COLEÇÃO CAIXA ---
  const totalVendasCaixa = caixasFiltrados.reduce((acc, cx) => {
    const valor = Number(cx.faturamentoVendas || cx.totalVendas || 0);
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  const totalDinheiroCaixaAcumulado = caixasFiltrados.reduce((acc, cx) => {
    let valorDinheiroVendas = Number(cx.totalDinheiroVendas || 0);

    if (!valorDinheiroVendas && cx.totalDinheiroCaixa !== undefined) {
      const valorTrocoAbertura = Number(cx.valorAbertura || 0);
      valorDinheiroVendas = Number(cx.totalDinheiroCaixa) - valorTrocoAbertura;
    }

    if (valorDinheiroVendas <= 0 && Number(cx.faturamentoVendas || 0) > 0) {
      const outrosMeios = Number(cx.totalCartao || 0) + Number(cx.totalPix || 0) + Number(cx.totalIfood || 0) + Number(cx.totalIfoodEntrega || 0) + Number(cx.total99Food || 0);
      if (outrosMeios === 0) {
        valorDinheiroVendas = Number(cx.faturamentoVendas);
      }
    }

    return acc + (isNaN(valorDinheiroVendas) || valorDinheiroVendas < 0 ? 0 : valorDinheiroVendas);
  }, 0);

  const totalCartaoAcumulado = caixasFiltrados.reduce((acc, cx) => {
    const v = Number(cx.totalCartao || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  const totalPixAcumulado = caixasFiltrados.reduce((acc, cx) => {
    const v = Number(cx.totalPix || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  const totalIfoodAcumulado = caixasFiltrados.reduce((acc, cx) => {
    const v = Number(cx.totalIfood || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  const totalIfoodEntrega = caixasFiltrados.reduce((acc, cx) => {
    const v = Number(cx.totalIfoodEntrega || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  const total99Food = caixasFiltrados.reduce((acc, cx) => {
    const v = Number(cx.total99Food || 0);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  // Total de receitas manuais
  const totalReceitasManuais = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Receita' && m.categoria !== 'Vendas / Pedidos')
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const totalReceitas = totalVendasCaixa + totalReceitasManuais;

  const totalDespesasOperacionais = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Despesa' && !m.ehInvestimentoInicial)
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  // 1. Lucro Bruto Operacional
  const lucroBrutoOperacional = totalReceitas - totalDespesasOperacionais;

  // 2. Retenção do Capital de Giro
  const valorCapitalGiro = lucroBrutoOperacional > 0 ? (lucroBrutoOperacional * Number(percentualGiro)) / 100 : 0;

  // 3. Lucro Líquido Operacional do Mês
  const lucroLiquido = lucroBrutoOperacional > 0 ? lucroBrutoOperacional - valorCapitalGiro : lucroBrutoOperacional;

  // Payback
  const totalNotinhasIniciais = movimentacoes
    .filter((m) => m.empresa === 'Taymix' && (m.ehInvestimentoInicial || m.categoria === 'Aporte de Sócio'))
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const investimentoTotalCalculado = investimentoManual + totalNotinhasIniciais;
  const saldoInvestimentoPendente = investimentoTotalCalculado - lucroBrutoOperacional;
  const investimentoQuitado = investimentoTotalCalculado > 0 && saldoInvestimentoPendente <= 0;

  // 🎯 REGRA RESTRITA: Só divide o lucro com os sócios se o investimento inicial (Payback) estiver 100% quitado!
  const valorParaDividir = investimentoQuitado ? (lucroLiquido > 0 ? lucroLiquido : 0) : 0;

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
    totalVendasCaixa,
    totalDinheiroCaixaAcumulado,
    totalCartaoAcumulado,
    totalPixAcumulado,
    totalIfoodAcumulado,
    totalIfoodEntrega,
    total99Food,
    totalDespesasOperacionais,
    lucroBrutoOperacional,
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