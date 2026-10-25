import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useCaixa = () => {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  const hojeStr = new Date().toISOString().split('T')[0];
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [fundoCaixa, setFundoCaixa] = useState(0);
  const [valorAbertura, setValorAbertura] = useState('');

  // Modal PDV (Venda Manual)
  const [modalPdvAberto, setModalPdvAberto] = useState(false);
  const [carrinhoPdv, setCarrinhoPdv] = useState([]);
  const [clientePdv, setClientePdv] = useState('');
  const [pagamentoPdv, setPagamentoPdv] = useState('dinheiro');
  const [canalPdv, setCanalPdv] = useState('presencial'); // 'presencial', 'ifood_loja', 'ifood_parceiro', '99food'
  const [tipoRetiradaPdv, setTipoRetiradaPdv] = useState('retirada'); // 'retirada' ou 'entrega'
  const [valorRecebidoPdv, setValorRecebidoPdv] = useState('');

  // 🎯 Efeito para travar a forma de pagamento em 'app_online' quando o canal for aplicativo
  useEffect(() => {
    if (canalPdv === 'ifood_loja' || canalPdv === 'ifood_parceiro' || canalPdv === '99food' || canalPdv.includes('ifood') || canalPdv.includes('99')) {
      setPagamentoPdv('app_online');
    } else if (pagamentoPdv === 'app_online') {
      setPagamentoPdv('dinheiro');
    }
  }, [canalPdv]);

  // --- CÁLCULOS FINANCEIROS ---
  const pedidosValidos = pedidos.filter(p => {
    const status = (p.status || '').toLowerCase();
    return status !== 'recusado' && status !== 'cancelado';
  });

  // 🧮 Função auxiliar para calcular taxas de comissão e repasse líquido de cada pedido
  const calcularValoresPedido = (p) => {
    const totalBruto = Number(p.totalBruto || p.total || 0);
    const canal = (p.canal || '').toLowerCase();

    let comissaoApp = 0;

    if (canal.includes('ifood')) {
      // Regra iFood: 26.2% + R$ 1,50
      const taxaPorcentagem = (totalBruto * 26.2) / 100;
      const taxaFixa = totalBruto > 0 ? 1.50 : 0;
      comissaoApp = taxaPorcentagem + taxaFixa;
    } else if (canal.includes('99') || canal.includes('99food')) {
      // Regra 99Food: 12.1%
      comissaoApp = (totalBruto * 12.1) / 100;
    }

    const repasseLiquido = Math.max(0, totalBruto - comissaoApp);

    return {
      totalBruto,
      comissaoApp,
      repasseLiquido
    };
  };

  // Faturamento contabiliza o valor líquido real repassado pelas vendas
  const faturamentoVendas = pedidosValidos.reduce((acc, p) => {
    const { repasseLiquido } = calcularValoresPedido(p);
    return acc + repasseLiquido;
  }, 0);

  const totalGeral = faturamentoVendas + Number(fundoCaixa || 0);
  
  const totalPix = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento || '').toLowerCase() === 'pix')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalCartao = pedidosValidos
    .filter(p => {
      const pag = (p.forma_pagamento || p.pagamento || '').toLowerCase();
      return pag === 'cartao' || pag === 'cartao_credito' || pag === 'cartao_debito';
    })
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalDinheiroVendas = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento || '').toLowerCase() === 'dinheiro')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);
  
  const totalDinheiroCaixa = totalDinheiroVendas + Number(fundoCaixa || 0);

  const totalPresencial = pedidosValidos
    .filter(p => {
      const canal = (p.canal || p.rua || '').toLowerCase();
      return canal === 'presencial' || canal === 'balcão' || canal.includes('retirada') || !p.canal;
    })
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  // iFood Loja (Entrega Própria)
  const totalIfood = pedidosValidos
    .filter(p => {
      const canal = (p.canal || p.rua || '').toLowerCase();
      const tipo = (p.tipo || p.entrega || '').toLowerCase();
      return canal.includes('ifood') && !tipo.includes('parceira') && !tipo.includes('entregador_ifood') && !tipo.includes('parceiro') && canal !== 'ifood_parceiro';
    })
    .reduce((acc, p) => {
      const { repasseLiquido } = calcularValoresPedido(p);
      return acc + repasseLiquido;
    }, 0);

  // iFood Entrega Parceira
  const totalIfoodEntrega = pedidosValidos
    .filter(p => {
      const canal = (p.canal || '').toLowerCase();
      const tipo = (p.tipo || p.entrega || '').toLowerCase();
      return canal === 'ifood_parceiro' || (canal.includes('ifood') && (tipo.includes('parceira') || tipo.includes('entregador_ifood') || tipo.includes('parceiro')));
    })
    .reduce((acc, p) => {
      const { repasseLiquido } = calcularValoresPedido(p);
      return acc + repasseLiquido;
    }, 0);

  // 99Food (tratando letras maiúsculas/minúsculas e variações)
  const total99Food = pedidosValidos
    .filter(p => {
      const canal = (p.canal || '').toLowerCase();
      return canal.includes('99') || canal.includes('99food');
    })
    .reduce((acc, p) => {
      const { repasseLiquido } = calcularValoresPedido(p);
      return acc + repasseLiquido;
    }, 0);

  // Carrega status do Caixa diretamente do Banco de Dados
  const carregarStatusCaixaBanco = async () => {
    try {
      if (api.getCaixaStatus) {
        const res = await api.getCaixaStatus();
        if (res && res.aberto) {
          setCaixaAberto(true);
          setFundoCaixa(Number(res.fundoCaixa || 0));
        } else {
          setCaixaAberto(false);
          setFundoCaixa(0);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status do caixa no banco:', err);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [dataPedidos, dataProdutos] = await Promise.all([
        api.getPedidos(),
        api.getProdutos ? api.getProdutos() : Promise.resolve([])
      ]);

      setProdutos(dataProdutos || []);
      
      // 🎯 Filtro rigoroso para isolar apenas os pedidos da data atual (hora local)
      const hojeStrLocal = new Date().toLocaleDateString('pt-BR');

      const pedidosHoje = (dataPedidos || []).filter(p => {
        const dataPedido = p.criadoEm || p.createdAt;
        if (!dataPedido) return false;
        
        const dataFormatadaLocal = new Date(dataPedido).toLocaleDateString('pt-BR');
        return dataFormatadaLocal === hojeStrLocal;
      });

      const pedidosOrdenados = pedidosHoje.sort((a, b) => new Date(b.criadoEm || b.createdAt) - new Date(a.criadoEm || a.createdAt));
      setPedidos(pedidosOrdenados);
      
      await carregarStatusCaixaBanco();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar os dados reais do caixa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 15000);
    return () => clearInterval(interval);
  }, []);

  // Abertura do Caixa enviando requisição para o BANCO DE DADOS
  const abrirCaixa = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const valor = parseFloat(valorAbertura);
    if (isNaN(valor) || valor < 0) {
      toast.error('Insira um valor de abertura válido.');
      return;
    }

    try {
      if (api.abrirCaixa) {
        await api.abrirCaixa({ valorAbertura: valor, data: hojeStr });
      }
      
      setFundoCaixa(valor);
      setCaixaAberto(true);
      
      localStorage.setItem(`caixa_aberto_${hojeStr}`, JSON.stringify(true));
      localStorage.setItem(`caixa_fundo_${hojeStr}`, valor.toString());

      toast.success(`Caixa aberto no banco com fundo de ${formatarMoeda(valor)}`);
      carregarDados();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar abertura de caixa no servidor.');
    }
  };

  // Fechamento do Caixa com verificação de comandas/pedidos em aberto
  const fecharCaixaSistema = async () => {
    const comandasAbertas = pedidos.filter(p => {
      const st = (p.status || 'pendente').toLowerCase();
      return st !== 'concluido' && st !== 'entregue' && st !== 'recusado' && st !== 'cancelado';
    });

    if (comandasAbertas.length > 0) {
      toast.error(
        `Não é possível fechar o caixa! Existe(m) ${comandasAbertas.length} comanda(s)/pedido(s) em aberto. Finalize ou cancele antes de encerrar o expediente.`,
        { duration: 6000 }
      );
      return;
    }

    try {
      if (api.fecharCaixa) {
        await api.fecharCaixa({
          status: 'fechado',
          valorAbertura: Number(fundoCaixa),
          faturamentoVendas: Number(faturamentoVendas),
          totalGeral: Number(totalGeral),
          totalPix: Number(totalPix),
          totalCartao: Number(totalCartao),
          totalDinheiroCaixa: Number(totalDinheiroCaixa),
          totalPresencial: Number(totalPresencial),
          totalIfood: Number(totalIfood),
          totalIfoodEntrega: Number(totalIfoodEntrega),
          total99Food: Number(total99Food),
          totalVendasRealizadas: pedidosValidos.length,
          data: hojeStr
        });
      }

      setCaixaAberto(false);
      localStorage.removeItem(`caixa_aberto_${hojeStr}`);
      localStorage.removeItem(`caixa_fundo_${hojeStr}`);
      toast.success('Caixa fechado e todas as transações gravadas no banco com sucesso.');
      carregarDados();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fechar o caixa no banco de dados.');
    }
  };

  const alterarStatus = async (id, novoStatus) => {
    try {
      if (api.atualizarStatusPedido) {
        await api.atualizarStatusPedido(id, novoStatus);
      } else {
        await api.put(`/pedidos/${id}/status`, { status: novoStatus });
      }
      toast.success(`Pedido atualizado para: ${novoStatus}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar o status do pedido.');
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  const formatarDataHora = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const adicionarAoCarrinhoPdv = (produto) => {
    const itemExistente = carrinhoPdv.find(i => (i._id || i.id) === (produto._id || produto.id));
    if (itemExistente) {
      setCarrinhoPdv(carrinhoPdv.map(i => (i._id || i.id) === (produto._id || produto.id) ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      setCarrinhoPdv([...carrinhoPdv, { ...produto, quantidade: 1 }]);
    }
  };

  const totalCarrinhoPdv = carrinhoPdv.reduce((acc, i) => acc + (Number(i.preco) * i.quantidade), 0);
  
  // 🎯 Cálculo dinâmico de taxa e repasse no PDV (Venda Manual)
  let taxaComissaoPdv = 0;
  if (canalPdv === 'ifood_loja' || canalPdv === 'ifood_parceiro' || canalPdv.includes('ifood')) {
    taxaComissaoPdv = (totalCarrinhoPdv * 26.2 / 100) + (totalCarrinhoPdv > 0 ? 1.50 : 0);
  } else if (canalPdv === '99food' || canalPdv.includes('99')) {
    taxaComissaoPdv = (totalCarrinhoPdv * 12.1 / 100);
  }
  const repasseLiquidoPdv = Math.max(0, totalCarrinhoPdv - taxaComissaoPdv);

  const trocoPdv = pagamentoPdv === 'dinheiro' ? Number(valorRecebidoPdv) - totalCarrinhoPdv : 0;

  const finalizarVendaPdv = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (carrinhoPdv.length === 0) {
      toast.error('Adicione produtos ao carrinho.');
      return;
    }
    if (pagamentoPdv === 'dinheiro' && Number(valorRecebidoPdv) < totalCarrinhoPdv) {
      toast.error('O valor recebido em dinheiro é menor do que o total da venda.');
      return;
    }

    try {
      const statusInicial = 'preparo';

      let nomeClientePadrao = 'Cliente Balcão';
      if (canalPdv === 'ifood_loja') nomeClientePadrao = 'Cliente iFood (Loja)';
      if (canalPdv === 'ifood_parceiro') nomeClientePadrao = 'Cliente iFood (Parceiro)';
      if (canalPdv === '99food') nomeClientePadrao = 'Cliente 99Food';

      // 🎯 REGRA EXATA: Se for iFood ou 99Food, o valor financeiro do pedido gravado no caixa é o Repasse Líquido
      const ehApp = canalPdv.includes('ifood') || canalPdv.includes('99') || canalPdv === 'ifood_loja' || canalPdv === 'ifood_parceiro' || canalPdv === '99food';
      const valorFinalCaixa = ehApp ? repasseLiquidoPdv : totalCarrinhoPdv;

      const novoPedido = {
        cliente_nome: clientePdv.trim() || nomeClientePadrao,
        itens: carrinhoPdv,
        totalBruto: totalCarrinhoPdv,
        total: valorFinalCaixa, // 🎯 Salva o líquido oficial (ex: R$ 16,95) ou o total do balcão (ex: R$ 25,00)
        comissaoApp: taxaComissaoPdv,
        repasseLiquido: repasseLiquidoPdv,
        forma_pagamento: pagamentoPdv,
        pagamento: pagamentoPdv,
        status: statusInicial,
        canal: canalPdv,
        tipo: tipoRetiradaPdv,
        rua: tipoRetiradaPdv === 'retirada' ? 'Retirada no Balcão' : 'Delivery',
        criadoEm: new Date().toISOString()
      };

      if (api.criarPedido) {
        await api.criarPedido(novoPedido);
      }

      toast.success('Venda registrada com sucesso!');
      setModalPdvAberto(false);
      setCarrinhoPdv([]);
      setClientePdv('');
      setValorRecebidoPdv('');
      setCanalPdv('presencial');
      setPagamentoPdv('dinheiro');
      carregarDados();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar venda.');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const status = p.status || 'pendente';
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'enviado') return status === 'enviado';
    if (filtroStatus === 'concluido') return status === 'concluido' || status === 'entregue';
    if (filtroStatus === 'andamento') return status !== 'concluido' && status !== 'entregue' && status !== 'recusado' && status !== 'cancelado';
    return true;
  });

  return {
    pedidos, produtos, loading, filtroStatus, setFiltroStatus,
    caixaAberto, valorAbertura, setValorAbertura, abrirCaixa, fecharCaixaSistema,
    fundoCaixa, modalPdvAberto, setModalPdvAberto, carrinhoPdv, clientePdv,
    setClientePdv, pagamentoPdv, setPagamentoPdv, canalPdv, setCanalPdv,
    tipoRetiradaPdv, setTipoRetiradaPdv,
    valorRecebidoPdv, setValorRecebidoPdv, adicionarAoCarrinhoPdv, totalCarrinhoPdv,
    taxaComissaoPdv, repasseLiquidoPdv,
    trocoPdv, finalizarVendaPdv, alterarStatus, formatarMoeda, formatarDataHora,
    pedidosValidos, totalGeral, totalPix, totalCartao, totalDinheiroCaixa,
    totalPresencial, totalIfood, totalIfoodEntrega, total99Food, pedidosFiltrados, carregarDados
  };
};