import React, { useState } from 'react';
import { useCaixa } from '../hooks/useCaixa';
import { 
  DollarSign, CreditCard, Wallet, QrCode, TrendingUp, RefreshCw, 
  ShoppingBag, Clock, Truck, CheckCircle2, Lock, PlusCircle, Store, 
  Check, AlertTriangle, Bell, ChefHat 
} from 'lucide-react';
import ComandaImpressao, { dispararImpressao } from '../components/ComandaImpressao';
import ModalPdv from '../components/ModalPdv';

export const Caixa = () => {
  const {
    produtos, loading, filtroStatus, setFiltroStatus,
    caixaAberto, valorAbertura, setValorAbertura, abrirCaixa, fecharCaixaSistema,
    fundoCaixa, modalPdvAberto, setModalPdvAberto, carrinhoPdv, clientePdv,
    setClientePdv, pagamentoPdv, setPagamentoPdv, canalPdv, setCanalPdv,
    tipoRetiradaPdv, setTipoRetiradaPdv,
    valorRecebidoPdv, setValorRecebidoPdv, adicionarAoCarrinhoPdv, totalCarrinhoPdv,
    taxaComissaoPdv, repasseLiquidoPdv,
    trocoPdv, finalizarVendaPdv, alterarStatus, formatarMoeda, formatarDataHora,
    pedidosValidos, totalGeral, totalPix, totalCartao, totalDinheiroCaixa,
    totalPresencial, totalIfood, totalIfoodEntrega, total99Food, pedidosFiltrados, carregarDados, pedidos
  } = useCaixa();

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalAbrirCaixaAberto, setModalAbrirCaixaAberto] = useState(false);

  const pedidosPendentesApp = (pedidos || []).filter(p => (p.status || 'pendente') === 'pendente');

  const tentarAbrirModalPdv = () => {
    if (!caixaAberto) {
      setModalAbrirCaixaAberto(true);
      return;
    }
    setModalPdvAberto(true);
  };

  const handleAbrirCaixaComTroco = async (e) => {
    e.preventDefault();
    await abrirCaixa(e);
    setModalAbrirCaixaAberto(false);
  };

  const aceitarPedidoEEnviarCozinha = async (pedido) => {
    try {
      await alterarStatus(pedido._id, 'preparo');
      dispararImpressao(pedido);
    } catch (err) {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-500" />
            Fechamento e Controlo de Caixa (Hoje)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fundo Inicial: <span className="text-emerald-600 font-bold">{formatarMoeda(fundoCaixa)}</span> | Dados reais sincronizados do dia
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={tentarAbrirModalPdv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Registrar Venda (Balcão/iFood)
          </button>
          
          {!caixaAberto ? (
            <button
              onClick={() => setModalAbrirCaixaAberto(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Abrir Caixa Hoje
            </button>
          ) : (
            <button
              onClick={() => setModalConfirmacaoAberto(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 text-xs font-semibold transition cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Fechar Caixa
            </button>
          )}

          <button
            onClick={carregarDados}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Alerta de Pedidos do App */}
      {pedidosPendentesApp.length > 0 && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 animate-pulse shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-amber-200 pb-2">
            <h3 className="text-amber-800 font-bold text-sm flex items-center gap-2">
              <Bell className="w-5 h-5 animate-bounce text-amber-600" />
              {pedidosPendentesApp.length} NOVO(S) PEDIDO(S) DO APP CHEGANDO!
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold">Aceite no caixa para mandar para a cozinha</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pedidosPendentesApp.map(p => (
              <div key={p._id} className="bg-white p-4 rounded-xl border border-amber-200 flex justify-between items-center shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-600 font-bold">#{p._id?.slice(-4)}</span>
                    <span className="text-slate-800 font-semibold text-xs">{p.cliente_nome || 'Cliente App'}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase font-bold border border-amber-200">
                      {p.canal || 'App Delivery'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {p.itens?.length || 0} itens • Total: <span className="text-emerald-600 font-bold">{formatarMoeda(p.total)}</span> ({p.forma_pagamento || 'Dinheiro'})
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alterarStatus(p._id, 'recusado')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => aceitarPedidoEEnviarCozinha(p)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition cursor-pointer"
                  >
                    <ChefHat size={14} /> Aceitar e Mandar Cozinha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total em Caixa (com troco)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{formatarMoeda(totalGeral)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">{pedidosValidos.length} vendas reais hoje</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PIX</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{formatarMoeda(totalPix)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Recebidos via PIX</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cartão (Créd./Déb.)</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-600">{formatarMoeda(totalCartao)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Maquininha</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dinheiro Físico</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{formatarMoeda(totalDinheiroCaixa)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Inclui {formatarMoeda(fundoCaixa)} inicial</span>
        </div>
      </div>

      {/* Canais de Venda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"><Store className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Balcão / Presencial</span>
              <span className="text-base font-bold text-slate-800">{formatarMoeda(totalPresencial)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">iFood (Loja)</span>
              <span className="text-base font-bold text-slate-800">{formatarMoeda(totalIfood)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100"><Truck className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">iFood (Parceiro)</span>
              <span className="text-base font-bold text-slate-800">{formatarMoeda(totalIfoodEntrega)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">99Food</span>
              <span className="text-base font-bold text-slate-800">{formatarMoeda(total99Food)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Comandas */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Comandas e Vendas de Hoje</h2>
            <p className="text-xs text-slate-500">Acompanhe comandas, atualize status e gerencie entregas em tempo real</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFiltroStatus('todos')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filtroStatus === 'todos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Todos</button>
            <button onClick={() => setFiltroStatus('andamento')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filtroStatus === 'andamento' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Em Andamento</button>
            <button onClick={() => setFiltroStatus('enviado')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'enviado' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><Truck size={13} /> Com os Motoboys</button>
            <button onClick={() => setFiltroStatus('concluido')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'concluido' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><CheckCircle2 size={13} /> Entregues / Concluídos</button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm py-8 text-center">A carregar dados reais...</p>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Nenhum pedido registrado hoje ainda. Registre uma venda no botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4">Cliente / Tipo</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Status Atual</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações / Despacho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosFiltrados.map((p, index) => {
                  const statusAtual = p.status || 'pendente';
                  const isFinalizado = statusAtual === 'concluido' || statusAtual === 'entregue';
                  const isRecusado = statusAtual === 'recusado' || statusAtual === 'cancelado';
                  const isBalcaoRetirada = p.tipo === 'retirada' || p.canal === 'presencial';

                  return (
                    <tr key={p._id || index} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-xs text-amber-600 font-bold">#{p._id ? p._id.slice(-4) : index + 1}</td>
                      <td className="py-3 px-4 text-xs text-slate-500"><div className="flex items-center gap-1"><Clock size={12} />{formatarDataHora(p.criadoEm || p.createdAt)}</div></td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs text-slate-800">{p.cliente_nome || 'Cliente'}</div>
                        <div className="text-[11px] text-slate-500">
                          {isBalcaoRetirada ? '🏪 Balcão (Retirada)' : '🛵 Delivery / Motoboy'}
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded uppercase font-semibold">{p.forma_pagamento || p.pagamento || 'não inf.'}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase inline-flex items-center gap-1 ${
                          isFinalizado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isRecusado ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          statusAtual === 'enviado' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          statusAtual === 'pronto' ? 'bg-teal-50 text-teal-700 border border-teal-200 animate-pulse' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {statusAtual === 'pronto' && isBalcaoRetirada ? 'Pronto (Retirada)' : statusAtual === 'pronto' ? 'Pronto na Cozinha' : statusAtual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {isRecusado ? '-' : formatarMoeda(p.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ComandaImpressao pedido={p} iconeApenas={true} />

                          {statusAtual === 'pendente' && (
                            <button
                              onClick={() => aceitarPedidoEEnviarCozinha(p)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <ChefHat size={12} /> Cozinha
                            </button>
                          )}

                          {statusAtual === 'preparo' && (
                            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                              <Clock size={12} className="animate-spin text-amber-600" /> Na Cozinha...
                            </span>
                          )}

                          {statusAtual === 'pronto' && isBalcaoRetirada && (
                            <button
                              onClick={() => alterarStatus(p._id, 'concluido')}
                              title="Marcar como Retirado no Balcão"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check size={12} /> Cliente Retirou
                            </button>
                          )}

                          {statusAtual === 'pronto' && !isBalcaoRetirada && (
                            <button
                              onClick={() => alterarStatus(p._id, 'enviado')}
                              title="Enviar com o Motoboy"
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Truck size={12} /> Despachar Moto
                            </button>
                          )}

                          {statusAtual === 'enviado' && (
                            <button
                              onClick={() => alterarStatus(p._id, 'concluido')}
                              title="Marcar como Concluído / Entregue"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <Check size={12} /> Entregue
                            </button>
                          )}

                          {isFinalizado && (
                            <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 size={13} /> Finalizado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Abertura Caixa */}
      {modalAbrirCaixaAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3 mb-4">
              <AlertTriangle size={24} />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Caixa Fechado ou Não Iniciado</h3>
                <p className="text-[11px] text-slate-500">Informe o fundo de troco inicial para abrir o caixa.</p>
              </div>
            </div>
            <form onSubmit={handleAbrirCaixaComTroco} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Valor do Fundo de Troco (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50.00"
                  value={valorAbertura}
                  onChange={(e) => setValorAbertura(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalAbrirCaixaAberto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Abrir Caixa e Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechamento Caixa */}
      {modalConfirmacaoAberto && (() => {
        const pedidosAbertos = (pedidos || []).filter(p => {
          const st = (p.status || 'pendente').toLowerCase();
          return st !== 'concluido' && st !== 'entregue' && st !== 'recusado' && st !== 'cancelado';
        });

        const temPendencias = pedidosAbertos.length > 0;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl p-6 text-center">
              {temPendencias ? (
                <>
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-amber-800 mb-1">Não é possível fechar o caixa!</h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Existe(m) <strong className="text-amber-700">{pedidosAbertos.length} pedido(s)/comanda(s)</strong> em aberto. Finalize ou cancele todos antes de encerrar o expediente.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left mb-6 space-y-2 max-h-36 overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Pedidos Pendentes:</span>
                    {pedidosAbertos.map((p) => (
                      <div key={p._id} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1">
                        <span className="font-mono text-amber-700 font-bold">#{p._id?.slice(-4)}</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[150px]">{p.cliente_nome || 'Cliente'}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">{p.status}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setModalConfirmacaoAberto(false)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
                  >
                    Entendido, Voltar para as Comandas
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Fechar Caixa de Hoje</h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Todas as comandas estão concluídas! Tens a certeza de que pretendes encerrar as operações e fechar o caixa?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setModalConfirmacaoAberto(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setModalConfirmacaoAberto(false);
                        fecharCaixaSistema();
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition"
                    >
                      Sim, Fechar Caixa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Componente Modular do PDV */}
      <ModalPdv
        modalPdvAberto={modalPdvAberto}
        setModalPdvAberto={setModalPdvAberto}
        canalPdv={canalPdv}
        setCanalPdv={setCanalPdv}
        tipoRetiradaPdv={tipoRetiradaPdv}
        setTipoRetiradaPdv={setTipoRetiradaPdv}
        clientePdv={clientePdv}
        setClientePdv={setClientePdv}
        produtos={produtos}
        adicionarAoCarrinhoPdv={adicionarAoCarrinhoPdv}
        formatarMoeda={formatarMoeda}
        carrinhoPdv={carrinhoPdv}
        totalCarrinhoPdv={totalCarrinhoPdv}
        taxaComissaoPdv={taxaComissaoPdv}
        repasseLiquidoPdv={repasseLiquidoPdv}
        pagamentoPdv={pagamentoPdv}
        setPagamentoPdv={setPagamentoPdv}
        valorRecebidoPdv={valorRecebidoPdv}
        setValorRecebidoPdv={setValorRecebidoPdv}
        trocoPdv={trocoPdv}
        finalizarVendaPdv={finalizarVendaPdv}
      />
    </div>
  );
};

export default Caixa;