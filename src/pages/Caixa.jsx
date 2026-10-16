import React, { useState } from 'react';
import { useCaixa } from '../hooks/useCaixa';
import { DollarSign, CreditCard, Wallet, QrCode, TrendingUp, RefreshCw, ShoppingBag, Clock, Truck, CheckCircle2, Lock, PlusCircle, Store, X, Check, AlertTriangle, Bell, ChefHat } from 'lucide-react';
import ComandaImpressao, { dispararImpressao } from '../components/ComandaImpressao';

export const Caixa = () => {
  const {
    produtos, loading, filtroStatus, setFiltroStatus,
    caixaAberto, valorAbertura, setValorAbertura, abrirCaixa, fecharCaixaSistema,
    fundoCaixa, modalPdvAberto, setModalPdvAberto, carrinhoPdv, clientePdv,
    setClientePdv, pagamentoPdv, setPagamentoPdv, canalPdv, setCanalPdv,
    tipoRetiradaPdv, setTipoRetiradaPdv,
    valorRecebidoPdv, setValorRecebidoPdv, adicionarAoCarrinhoPdv, totalCarrinhoPdv,
    trocoPdv, finalizarVendaPdv, alterarStatus, formatarMoeda, formatarDataHora,
    pedidosValidos, totalGeral, totalPix, totalCartao, totalDinheiroCaixa,
    totalPresencial, totalIfood, pedidosFiltrados, carregarDados, pedidos
  } = useCaixa();

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalAbrirCaixaAberto, setModalAbrirCaixaAberto] = useState(false);

  // Pedidos vindos do App/Site que estão aguardando confirmação do Caixa
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

  // Aceitar pedido do App e enviar para a Cozinha
  const aceitarPedidoEEnviarCozinha = async (pedido) => {
    try {
      await alterarStatus(pedido._id, 'preparo');
      dispararImpressao(pedido); // Imprime a comanda para a cozinha/balcão
    } catch (err) {
      // O tratamento de erro já é feito via toast no hook
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-500" />
            fechamento e controlo de caixa (hoje)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            fundo inicial: <span className="text-emerald-400 font-bold">{formatarMoeda(fundoCaixa)}</span> | dados reais sincronizados do dia
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={tentarAbrirModalPdv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" /> registar venda (balcão/ifood)
          </button>
          
          {!caixaAberto ? (
            <button
              onClick={() => setModalAbrirCaixaAberto(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer shadow"
            >
              Abrir Caixa Hoje
            </button>
          ) : (
            <button
              onClick={() => setModalConfirmacaoAberto(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-rose-400 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Lock className="w-4 h-4" /> fechar caixa
            </button>
          )}

          <button
            onClick={carregarDados}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            atualizar
          </button>
        </div>
      </div>

      {/* SEÇÃO DE ALERTAS: PEDIDOS NOVOS DO APP AGUARDANDO ACEITE DO CAIXA */}
      {pedidosPendentesApp.length > 0 && (
        <div className="mb-8 bg-amber-500/10 border-2 border-amber-500/80 rounded-2xl p-5 animate-pulse shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2">
            <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
              <Bell className="w-5 h-5 animate-bounce" />
              {pedidosPendentesApp.length} NOVO(S) PEDIDO(S) DO APP CHEGANDO!
            </h3>
            <span className="text-[11px] text-amber-300 font-semibold">Aceite no caixa para mandar para a cozinha</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pedidosPendentesApp.map(p => (
              <div key={p._id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">#{p._id?.slice(-4)}</span>
                    <span className="text-slate-100 font-semibold text-xs">{p.cliente_nome || 'Cliente App'}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded uppercase font-bold">
                      {p.canal || 'App Delivery'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {p.itens?.length || 0} itens • Total: <span className="text-emerald-400 font-bold">{formatarMoeda(p.total)}</span> ({p.forma_pagamento || 'Dinheiro'})
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alterarStatus(p._id, 'recusado')}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => aceitarPedidoEEnviarCozinha(p)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow transition cursor-pointer"
                  >
                    <ChefHat size={14} /> Aceitar e Mandar Cozinha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards de Resumo Financeiro Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">total em caixa (com troco)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{formatarMoeda(totalGeral)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">{pedidosValidos.length} vendas reais hoje</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">pix</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{formatarMoeda(totalPix)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">recebidos via pix</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">cartão (créd./déb.)</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400">{formatarMoeda(totalCartao)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">maquininha</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">dinheiro físico</span>
            <div className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-200">{formatarMoeda(totalDinheiroCaixa)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">inclui {formatarMoeda(fundoCaixa)} inicial</span>
        </div>
      </div>

      {/* Canais de Venda Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20"><Store className="w-5 h-5" /></div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">vendas balcão / presencial</span>
              <span className="text-lg font-bold text-slate-100">{formatarMoeda(totalPresencial)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">vendas ifood / app</span>
              <span className="text-lg font-bold text-slate-100">{formatarMoeda(totalIfood)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Comandas Reais */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">comandas e vendas de hoje</h2>
            <p className="text-xs text-slate-400">Acompanhe comandas, atualize status e gerencie entregas em tempo real</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFiltroStatus('todos')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filtroStatus === 'todos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Todos</button>
            <button onClick={() => setFiltroStatus('andamento')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filtroStatus === 'andamento' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Em Andamento</button>
            <button onClick={() => setFiltroStatus('enviado')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'enviado' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><Truck size={13} /> Com os Motoboys</button>
            <button onClick={() => setFiltroStatus('concluido')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${filtroStatus === 'concluido' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><CheckCircle2 size={13} /> Entregues / Concluídos</button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">a carregar dados reais...</p>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">nenhum pedido registado hoje ainda. Regista uma venda no botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">horário</th>
                  <th className="py-3 px-4">cliente / tipo</th>
                  <th className="py-3 px-4">pagamento</th>
                  <th className="py-3 px-4">status atual</th>
                  <th className="py-3 px-4 text-right">valor</th>
                  <th className="py-3 px-4 text-center">ações / despacho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pedidosFiltrados.map((p, index) => {
                  const statusAtual = p.status || 'pendente';
                  const isFinalizado = statusAtual === 'concluido' || statusAtual === 'entregue';
                  const isRecusado = statusAtual === 'recusado' || statusAtual === 'cancelado';
                  const isBalcaoRetirada = p.tipo === 'retirada' || p.canal === 'presencial';

                  return (
                    <tr key={p._id || index} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-xs text-amber-500 font-bold">#{p._id ? p._id.slice(-4) : index + 1}</td>
                      <td className="py-3 px-4 text-xs text-slate-400"><div className="flex items-center gap-1"><Clock size={12} />{formatarDataHora(p.criadoEm || p.createdAt)}</div></td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs text-slate-100">{p.cliente_nome || 'Cliente'}</div>
                        <div className="text-[11px] text-slate-400">
                          {isBalcaoRetirada ? '🏪 Balcão (Retirada)' : '🛵 Delivery / Motoboy'}
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase font-semibold">{p.forma_pagamento || p.pagamento || 'não inf.'}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase inline-flex items-center gap-1 ${
                          isFinalizado ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          isRecusado ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          statusAtual === 'enviado' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          statusAtual === 'pronto' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {statusAtual === 'pronto' && isBalcaoRetirada ? 'Pronto (Retirada)' : statusAtual === 'pronto' ? 'Pronto na Cozinha' : statusAtual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {isRecusado ? '-' : formatarMoeda(p.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ComandaImpressao pedido={p} iconeApenas={true} />

                          {statusAtual === 'pendente' && (
                            <button
                              onClick={() => aceitarPedidoEEnviarCozinha(p)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <ChefHat size={12} /> Cozinha
                            </button>
                          )}

                          {/* SE FOR RETIRADA NO BALCÃO E ESTIVER PRONTO, VAI DIRETO PARA CONCLUÍDO (SEM MOTOBOY) */}
                          {(statusAtual === 'preparo' || statusAtual === 'pronto') && isBalcaoRetirada && (
                            <button
                              onClick={() => alterarStatus(p._id, 'concluido')}
                              title="Marcar como Retirado no Balcão"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow"
                            >
                              <Check size={12} /> Cliente Retirou
                            </button>
                          )}

                          {/* SE FOR DELIVERY, SEGUE PARA O MOTOBOY */}
                          {(statusAtual === 'preparo' || statusAtual === 'pronto') && !isBalcaoRetirada && (
                            <button
                              onClick={() => alterarStatus(p._id, 'enviado')}
                              title="Enviar com o Motoboy"
                              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <Truck size={12} /> Despachar Moto
                            </button>
                          )}

                          {statusAtual === 'enviado' && (
                            <button
                              onClick={() => alterarStatus(p._id, 'concluido')}
                              title="Marcar como Concluído / Entregue"
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <Check size={12} /> Entregue
                            </button>
                          )}

                          {isFinalizado && (
                            <span className="text-[11px] text-emerald-400 font-bold inline-flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
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

      {/* MODAL: AVISO E ABERTURA DE CAIXA COM TROCO */}
      {modalAbrirCaixaAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3 mb-4">
              <AlertTriangle size={24} />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Caixa Fechado ou Não Iniciado</h3>
                <p className="text-[11px] text-slate-400">Informe o fundo de troco inicial para abrir o caixa.</p>
              </div>
            </div>
            <form onSubmit={handleAbrirCaixaComTroco} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Valor do Fundo de Troco (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50.00"
                  value={valorAbertura}
                  onChange={(e) => setValorAbertura(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalAbrirCaixaAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow"
                >
                  Abrir Caixa e Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE FECHO DE CAIXA */}
      {modalConfirmacaoAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Fechar Caixa</h3>
            <p className="text-xs text-slate-400 mb-6">
              Tens a certeza que pretendes fechar o caixa de hoje? Esta ação irá encerrar as operações.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModalConfirmacaoAberto(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Não
              </button>
              <button
                onClick={() => {
                  setModalConfirmacaoAberto(false);
                  fecharCaixaSistema();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow"
              >
                Sim, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTO DE VENDA (BALCÃO OU IFOOD) COM OPÇÃO DE RETIRADA */}
      {modalPdvAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" /> Registar Venda Manual (Caixa)
              </h2>
              <button onClick={() => setModalPdvAberto(false)} className="text-slate-400 hover:text-slate-100 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Canal de Venda</label>
                  <select
                    value={canalPdv}
                    onChange={(e) => setCanalPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="presencial">Balcão / Presencial</option>
                    <option value="ifood">iFood / App</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Atendimento</label>
                  <select
                    value={tipoRetiradaPdv}
                    onChange={(e) => setTipoRetiradaPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="retirada">Retirada no Balcão</option>
                    <option value="entrega">Delivery / Motoboy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    placeholder="Ex: Nome do cliente"
                    value={clientePdv}
                    onChange={(e) => setClientePdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Selecionar Produtos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                  {produtos.map((prod) => (
                    <button
                      key={prod._id || prod.id}
                      type="button"
                      onClick={() => adicionarAoCarrinhoPdv(prod)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition cursor-pointer"
                    >
                      <div className="font-semibold text-xs text-slate-100 truncate">{prod.nome}</div>
                      <div className="text-emerald-400 text-xs font-bold mt-1">{formatarMoeda(prod.preco)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Itens Adicionados</label>
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 max-h-28 overflow-y-auto space-y-2">
                  {carrinhoPdv.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-2">Nenhum produto selecionado.</p>
                  ) : (
                    carrinhoPdv.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                        <span>{item.quantidade}x {item.nome}</span>
                        <span className="font-bold text-emerald-400">{formatarMoeda(item.preco * item.quantidade)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Forma de Pagamento</label>
                  <select
                    value={pagamentoPdv}
                    onChange={(e) => setPagamentoPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                  </select>
                </div>

                {pagamentoPdv === 'dinheiro' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Valor Recebido (Dinheiro)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={valorRecebidoPdv}
                      onChange={(e) => setValorRecebidoPdv(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {pagamentoPdv === 'dinheiro' && valorRecebidoPdv && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-emerald-300 font-semibold uppercase">Troco a devolver:</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {trocoPdv >= 0 ? formatarMoeda(trocoPdv) : 'Valor insuficiente'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div>
                <span className="text-xs text-slate-400 block">Total da Venda</span>
                <span className="text-xl font-extrabold text-emerald-400">{formatarMoeda(totalCarrinhoPdv)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalPdvAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={finalizarVendaPdv}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow"
                >
                  Registar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};