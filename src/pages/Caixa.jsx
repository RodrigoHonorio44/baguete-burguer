import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, CreditCard, Wallet, QrCode, TrendingUp, RefreshCw, ShoppingBag, Clock, Truck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Caixa = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'enviado', 'concluido', 'andamento'

  const carregarCaixa = async () => {
    setLoading(true);
    try {
      const data = await api.getPedidos();
      // Ordena por data mais recente primeiro
      const pedidosOrdenados = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPedidos(pedidosOrdenados);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar os dados do caixa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCaixa();
    const interval = setInterval(carregarCaixa, 15000); // Atualiza a cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  const alterarStatus = async (id, novoStatus) => {
    try {
      await api.atualizarStatusPedido(id, novoStatus);
      toast.success(`Pedido atualizado para: ${novoStatus}`);
      carregarCaixa();
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

  // Considera apenas pedidos válidos (não recusados) para o faturamento total
  const pedidosValidos = pedidos.filter(p => p.status !== 'recusado');

  const totalGeral = pedidosValidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  
  const totalPix = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento) === 'pix')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalCartao = pedidosValidos
    .filter(p => {
      const pag = p.forma_pagamento || p.pagamento;
      return pag === 'cartao' || pag === 'cartao_credito' || pag === 'cartao_debito';
    })
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalDinheiro = pedidosValidos
    .filter(p => (p.forma_pagamento || p.pagamento) === 'dinheiro')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  // Filtragem da tabela conforme a aba selecionada
  const pedidosFiltrados = pedidos.filter(p => {
    const status = p.status || 'pendente';
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'enviado') return status === 'enviado';
    if (filtroStatus === 'concluido') return status === 'concluido';
    if (filtroStatus === 'andamento') return status !== 'concluido' && status !== 'recusado';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-500" />
            fechamento e controlo de caixa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            resumo financeiro, acompanhamento de entregas dos motoboys e status dos clientes
          </p>
        </div>

        <button
          onClick={carregarCaixa}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          atualizar caixa
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">total faturado</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatarMoeda(totalGeral)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {pedidosValidos.length} pedidos válidos registados
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">pix</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {formatarMoeda(totalPix)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            transferências instantâneas
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">cartão</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400">
            {formatarMoeda(totalCartao)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            crédito / débito
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">dinheiro</span>
            <div className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-200">
            {formatarMoeda(totalDinheiro)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            caixa físico
          </span>
        </div>
      </div>

      {/* Histórico e Acompanhamento de Entregas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>monitoramento de entregas e caixa</span>
            </h2>
            <p className="text-xs text-slate-400">Acompanhe comandas com motoboys e confirme o recebimento pelo cliente</p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filtroStatus === 'todos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltroStatus('enviado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'enviado' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Truck size={13} /> Com os Motoboys
            </button>
            <button 
              onClick={() => setFiltroStatus('concluido')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'concluido' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <CheckCircle2 size={13} /> Entregues / Concluídos
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">a carregar transações e entregas...</p>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">nenhum pedido encontrado para este filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">horário</th>
                  <th className="py-3 px-4">cliente / endereço</th>
                  <th className="py-3 px-4">pagamento</th>
                  <th className="py-3 px-4">status da entrega</th>
                  <th className="py-3 px-4 text-right">valor</th>
                  <th className="py-3 px-4 text-center">ações / confirmar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pedidosFiltrados.map((p, index) => {
                  const statusAtual = p.status || 'pendente';
                  return (
                    <tr key={p._id || index} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-xs text-amber-500 font-bold">
                        #{p._id ? p._id.slice(-4) : index + 1}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatarDataHora(p.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs text-slate-100">{p.cliente_nome || 'Cliente'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {p.rua || p.endereco?.rua ? `${p.rua || p.endereco?.rua}, ${p.numero || p.endereco?.numero} - ${p.bairro || p.endereco?.bairro}` : 'Retirada no balcão'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase font-semibold">
                          {p.forma_pagamento || p.pagamento || 'não inf.'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase inline-flex items-center gap-1 ${
                          statusAtual === 'pendente' ? 'bg-amber-500/20 text-amber-400' :
                          statusAtual === 'preparo' ? 'bg-blue-500/20 text-blue-400' :
                          statusAtual === 'pronto' ? 'bg-emerald-500/20 text-emerald-400' :
                          statusAtual === 'enviado' ? 'bg-purple-500/20 text-purple-400' :
                          statusAtual === 'concluido' ? 'bg-green-500/20 text-green-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {statusAtual === 'enviado' && <Truck size={10} />}
                          {statusAtual === 'concluido' && <CheckCircle2 size={10} />}
                          {statusAtual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatarMoeda(p.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {statusAtual === 'enviado' ? (
                          <button
                            onClick={() => alterarStatus(p._id || p.id, 'concluido')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow"
                            title="Confirmar que o cliente recebeu"
                          >
                            <CheckCircle2 size={12} /> Cliente Recebeu
                          </button>
                        ) : statusAtual === 'concluido' ? (
                          <span className="text-[11px] text-emerald-400 font-medium">Entregue com sucesso</span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Em andamento na cozinha</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};