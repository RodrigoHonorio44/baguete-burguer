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

  // Modal PDV
  const [modalPdvAberto, setModalPdvAberto] = useState(false);
  const [carrinhoPdv, setCarrinhoPdv] = useState([]);
  const [clientePdv, setClientePdv] = useState('');
  const [pagamentoPdv, setPagamentoPdv] = useState('dinheiro');
  const [canalPdv, setCanalPdv] = useState('presencial');
  const [valorRecebidoPdv, setValorRecebidoPdv] = useState('');

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
      
      const pedidosHoje = (dataPedidos || []).filter(p => {
        const dataPedido = p.criadoEm || p.createdAt;
        if (!dataPedido) return false;
        const dataFormatada = new Date(dataPedido).toISOString().split('T')[0];
        return dataFormatada === hojeStr;
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
    e.preventDefault();
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
      
      // Armazena cópia local de segurança
      localStorage.setItem(`caixa_aberto_${hojeStr}`, JSON.stringify(true));
      localStorage.setItem(`caixa_fundo_${hojeStr}`, valor.toString());

      toast.success(`Caixa aberto no banco com fundo de ${formatarMoeda(valor)}`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar abertura de caixa no servidor.');
    }
  };

  // Fechamento do Caixa enviando requisição para o BANCO DE DADOS
  const fecharCaixaSistema = async () => {
    if (window.confirm('Tens a certeza que pretendes fechar o caixa de hoje?')) {
      try {
        if (api.fecharCaixa) {
          await api.fecharCaixa({
            faturamentoVendas,
            totalGeral,
            totalDinheiroCaixa,
            data: hojeStr
          });
        }

        setCaixaAberto(false);
        localStorage.removeItem(`caixa_aberto_${hojeStr}`);
        localStorage.removeItem(`caixa_fundo_${hojeStr}`);
        toast.success('Caixa fechado e salvo no banco com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao fechar o caixa no banco de dados.');
      }
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
    const itemExistente = carrinhoPdv.find(i => i._id === produto._id);
    if (itemExistente) {
      setCarrinhoPdv(carrinhoPdv.map(i => i._id === produto._id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      setCarrinhoPdv([...carrinhoPdv, { ...produto, quantidade: 1 }]);
    }
  };

  const totalCarrinhoPdv = carrinhoPdv.reduce((acc, i) => acc + (Number(i.preco) * i.quantidade), 0);
  const trocoPdv = Number(valorRecebidoPdv) - totalCarrinhoPdv;

  const finalizarVendaPdv = async (e) => {
    e.preventDefault();
    if (carrinhoPdv.length === 0) {
      toast.error('Adicione produtos ao carrinho.');
      return;
    }
    if (pagamentoPdv === 'dinheiro' && Number(valorRecebidoPdv) < totalCarrinhoPdv) {
      toast.error('O valor recebido em dinheiro é menor do que o total da venda.');
      return;
    }

    try {
      const novoPedido = {
        cliente_nome: clientePdv.trim() || (canalPdv === 'ifood' ? 'Cliente iFood' : 'Cliente Balcão'),
        itens: carrinhoPdv,
        total: totalCarrinhoPdv,
        forma_pagamento: pagamentoPdv,
        pagamento: pagamentoPdv,
        status: 'concluido',
        canal: canalPdv,
        rua: canalPdv === 'ifood' ? 'Pedido iFood' : 'Retirada no balcão',
        criadoEm: new Date().toISOString()
      };

      if (api.criarPedido) {
        await api.criarPedido(novoPedido);
      }

      toast.success('Venda registrada com sucesso no caixa!');
      setModalPdvAberto(false);
      setCarrinhoPdv([]);
      setClientePdv('');
      setValorRecebidoPdv('');
      carregarDados();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar venda.');
    }
  };

  // Cálculos financeiros
  const pedidosValidos = pedidos.filter(p => p.status !== 'recusado' && p.status !== 'cancelado');
  const faturamentoVendas = pedidosValidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalGeral = faturamentoVendas + fundoCaixa;
  
  const totalPix = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento) === 'pix')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalCartao = pedidosValidos
    .filter(p => {
      const pag = p.forma_pagamento || p.pagamento;
      return pag === 'cartao' || pag === 'cartao_credito' || pag === 'cartao_debito';
    })
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalDinheiroVendas = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento) === 'dinheiro')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalDinheiroCaixa = totalDinheiroVendas + fundoCaixa;

  const totalPresencial = pedidosValidos
    .filter(p => p.canal === 'presencial' || !p.canal || p.rua === 'Retirada no balcão')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalIfood = pedidosValidos
    .filter(p => p.canal === 'ifood' || p.rua === 'Pedido iFood')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

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
    valorRecebidoPdv, setValorRecebidoPdv, adicionarAoCarrinhoPdv, totalCarrinhoPdv,
    trocoPdv, finalizarVendaPdv, alterarStatus, formatarMoeda, formatarDataHora,
    pedidosValidos, totalGeral, totalPix, totalCartao, totalDinheiroCaixa,
    totalPresencial, totalIfood, pedidosFiltrados, carregarDados
  };
};