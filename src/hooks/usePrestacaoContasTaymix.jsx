import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function usePrestacaoContasTaymix() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [caixasFechados, setCaixasFechados] = useState([]); 
  const [pedidosBanco, setPedidosBanco] = useState([]);

  // 💾 Percentual de Giro (Busca do servidor ou usa 20% como padrão)
  const [percentualGiro, setPercentualGiro] = useState(20);

  const [percentualSocioA, setPercentualSocioA] = useState(50);
  const [investimentoManual, setInvestimentoManual] = useState(0);

  // Estados de Taxas das Plataformas
  const [taxaIfoodPct, setTaxaIfoodPct] = useState(26.2);
  const [taxaIfoodMensalidade, setTaxaIfoodMensalidade] = useState(150.0);
  const [limiteIfoodMensalidade, setLimiteIfoodMensalidade] = useState(1800.0);
  const [taxa99FoodPct, setTaxa99FoodPct] = useState(12.1);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState(0.0);

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

  const carregarDadosFinanceiros = async () => {
    try {
      const [dadosMovimentacoes, resCaixa, dadosConfig, dadosPedidos] = await Promise.all([
        api.getFinanceiro ? api.getFinanceiro() : Promise.resolve([]),
        api.getHistoricoCaixa ? api.getHistoricoCaixa() : Promise.resolve([]),
        api.getConfiguracoesLoja ? api.getConfiguracoesLoja().catch(() => null) : (api.getConfiguracoes ? api.getConfiguracoes().catch(() => null) : Promise.resolve(null)),
        api.getPedidos ? api.getPedidos().catch(() => []) : Promise.resolve([])
      ]);

      setMovimentacoes(dadosMovimentacoes || []);

      const listaCaixas = Array.isArray(resCaixa) 
        ? resCaixa 
        : (resCaixa && Array.isArray(resCaixa.data) ? resCaixa.data : []);

      setCaixasFechados(listaCaixas);
      setPedidosBanco(Array.isArray(dadosPedidos) ? dadosPedidos : []);

      // Se houver percentual de giro e taxas salvas nas configurações do servidor
      if (dadosConfig) {
        if (dadosConfig.percentualGiro !== undefined) setPercentualGiro(Number(dadosConfig.percentualGiro));
        if (dadosConfig.taxaIfoodPct !== undefined) setTaxaIfoodPct(Number(dadosConfig.taxaIfoodPct));
        if (dadosConfig.taxa99FoodPct !== undefined) setTaxa99FoodPct(Number(dadosConfig.taxa99FoodPct));
        if (dadosConfig.taxaCartaoPct !== undefined) setTaxaCartaoPct(Number(dadosConfig.taxaCartaoPct));
      } else {
        const salvoLocal = localStorage.getItem('taymix_percentual_giro');
        if (salvoLocal !== null) setPercentualGiro(Number(salvoLocal));
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros do banco:', error);
      toast.error('Erro ao carregar dados financeiros.');
    }
  };

  const alterarPercentualGiro = async (novoValor) => {
    const valorNumerico = Number(novoValor);
    setPercentualGiro(valorNumerico);
    localStorage.setItem('taymix_percentual_giro', valorNumerico);

    try {
      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja({ percentualGiro: valorNumerico });
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes({ percentualGiro: valorNumerico });
      }
    } catch (err) {
      console.error('Erro ao salvar percentual de giro no servidor:', err);
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

  // --- FILTRAGEM DE PEDIDOS INDIVIDUAIS PARA CONTAGEM DE UNIDADES E CANAIS ---
  const statusValidos = ['concluido', 'concluído', 'entregue', 'finalizado'];
  const pedidosFiltrados = pedidosBanco.filter(p => {
    const st = (p.status || '').toLowerCase();
    if (!statusValidos.includes(st)) return false;

    let dataRaw = p.criadoEm || p.createdAt || p.data;
    if (dataRaw && typeof dataRaw === 'object' && dataRaw.$date) dataRaw = dataRaw.$date;
    if (!dataRaw) return true;

    const dataItem = new Date(dataRaw).toISOString().split('T')[0];
    if (dataInicio && dataItem < dataInicio) return false;
    if (dataFim && dataItem > dataFim) return false;
    return true;
  });

  // --- ACUMULADORES E CONTAGEM DE UNIDADES (PEDIDOS) ---
  let qtdPedidosIfood = 0, totalIfoodPedidos = 0;
  let qtdPedidos99Food = 0, total99FoodPedidos = 0;
  let qtdPedidosPix = 0, totalPixPedidos = 0;
  let qtdPedidosDinheiro = 0, totalDinheiroPedidos = 0;
  let qtdPedidosCartao = 0, totalCartaoPedidos = 0;

  pedidosFiltrados.forEach(p => {
    const canal = (p.canal || '').toLowerCase().trim();
    const pagamento = (p.forma_pagamento || p.pagamento || '').toLowerCase().trim();
    const valorBruto = Number(p.totalBruto || p.total || 0);

    if (canal.includes('ifood')) {
      qtdPedidosIfood += 1;
      totalIfoodPedidos += valorBruto;
    } else if (canal.includes('99') || canal.includes('99food')) {
      qtdPedidos99Food += 1;
      total99FoodPedidos += valorBruto;
    }

    if (pagamento.includes('pix')) {
      qtdPedidosPix += 1;
      totalPixPedidos += valorBruto;
    } else if (pagamento.includes('dinheiro')) {
      qtdPedidosDinheiro += 1;
      totalDinheiroPedidos += valorBruto;
    } else if (pagamento.includes('cartao') || pagamento.includes('cartão') || pagamento.includes('crédito') || pagamento.includes('débito')) {
      qtdPedidosCartao += 1;
      totalCartaoPedidos += valorBruto;
    }
  });

  // Totais consolidados do Caixa
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
      const outrosMeios = Number(cx.totalCartao || 0) + Number(cx.totalPix || 0) + Number(cx.totalIfood || 0) + Number(cx.total99Food || 0);
      if (outrosMeios === 0) valorDinheiroVendas = Number(cx.faturamentoVendas);
    }
    return acc + (isNaN(valorDinheiroVendas) || valorDinheiroVendas < 0 ? 0 : valorDinheiroVendas);
  }, 0) || totalDinheiroPedidos;

  const totalCartaoAcumulado = caixasFiltrados.reduce((acc, cx) => acc + (Number(cx.totalCartao) || 0), 0) || totalCartaoPedidos;
  const totalPixAcumulado = caixasFiltrados.reduce((acc, cx) => acc + (Number(cx.totalPix) || 0), 0) || totalPixPedidos;
  
  // Se o caixa não tiver registrado o valor do iFood / 99Food diretamente, usa o total consolidado dos pedidos
  const totalIfoodAcumulado = caixasFiltrados.reduce((acc, cx) => acc + (Number(cx.totalIfood) || 0), 0) || totalIfoodPedidos;
  const totalIfoodEntrega = caixasFiltrados.reduce((acc, cx) => acc + (Number(cx.totalIfoodEntrega) || 0), 0);
  const total99Food = caixasFiltrados.reduce((acc, cx) => acc + (Number(cx.total99Food) || 0), 0) || total99FoodPedidos;

  const totalReceitasManuais = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Receita' && m.categoria !== 'Vendas / Pedidos')
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const totalReceitas = (totalVendasCaixa > 0 ? totalVendasCaixa : (totalIfoodPedidos + total99FoodPedidos + totalPixPedidos + totalDinheiroPedidos + totalCartaoPedidos)) + totalReceitasManuais;

  const totalDespesasOperacionais = movimentacoesFiltradas
    .filter((m) => m.tipo === 'Despesa' && !m.ehInvestimentoInicial)
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const lucroBrutoOperacional = totalReceitas - totalDespesasOperacionais;
  const valorCapitalGiro = lucroBrutoOperacional > 0 ? (lucroBrutoOperacional * Number(percentualGiro)) / 100 : 0;
  const lucroLiquido = lucroBrutoOperacional > 0 ? lucroBrutoOperacional - valorCapitalGiro : lucroBrutoOperacional;

  const totalNotinhasIniciais = movimentacoes
    .filter((m) => m.empresa === 'Taymix' && (m.ehInvestimentoInicial || m.categoria === 'Aporte de Sócio'))
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

  const investimentoTotalCalculado = investimentoManual + totalNotinhasIniciais;
  const saldoInvestimentoPendente = investimentoTotalCalculado - lucroBrutoOperacional;
  const investimentoQuitado = investimentoTotalCalculado > 0 && saldoInvestimentoPendente <= 0;

  const valorParaDividir = investimentoQuitado ? (lucroLiquido > 0 ? lucroLiquido : 0) : 0;

  const lucroSocioA = (valorParaDividir * Number(percentualSocioA)) / 100;
  const lucroSocioB = valorParaDividir - lucroSocioA;

  return {
    dataInicio, setDataInicio,
    dataFim, setDataFim,
    movimentacoesFiltradas,
    percentualGiro, setPercentualGiro: alterarPercentualGiro,
    percentualSocioA, setPercentualSocioA,
    investimentoManual, setInvestimentoManual,
    taxaIfoodPct, setTaxaIfoodPct,
    taxaIfoodMensalidade, setTaxaIfoodMensalidade,
    limiteIfoodMensalidade, setLimiteIfoodMensalidade,
    taxa99FoodPct, setTaxa99FoodPct,
    taxaCartaoPct, setTaxaCartaoPct,
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
    qtdPedidosIfood,
    qtdPedidos99Food,
    qtdPedidosPix,
    qtdPedidosDinheiro,
    qtdPedidosCartao,
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