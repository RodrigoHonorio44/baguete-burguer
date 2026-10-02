import React from 'react';
import { useCaixa } from '../hooks/useCaixa';
import { DollarSign, CreditCard, Wallet, QrCode, TrendingUp, RefreshCw, ShoppingBag, Clock, Truck, CheckCircle2, Lock, PlusCircle, Store, X, Check } from 'lucide-react';

export const Caixa = () => {
  const {
    produtos, loading, filtroStatus, setFiltroStatus,
    caixaAberto, valorAbertura, setValorAbertura, abrirCaixa, fecharCaixaSistema,
    fundoCaixa, modalPdvAberto, setModalPdvAberto, carrinhoPdv, clientePdv,
    setClientePdv, pagamentoPdv, setPagamentoPdv, canalPdv, setCanalPdv,
    valorRecebidoPdv, setValorRecebidoPdv, adicionarAoCarrinhoPdv, totalCarrinhoPdv,
    trocoPdv, finalizarVendaPdv, alterarStatus, formatarMoeda, formatarDataHora,
    pedidosValidos, totalGeral, totalPix, totalCartao, totalDinheiroCaixa,
    totalPresencial, totalIfood, pedidosFiltrados, carregarDados
  } = useCaixa();

  if (!caixaAberto) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-100 mb-2">abertura de caixa diário</h1>
        <p className="text-xs text-slate-400 mb-6">
          insira o valor inicial de troco disponível no gaveteiro para iniciar as operações de hoje.
        </p>
        <form onSubmit={abrirCaixa} className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-semibold text-slate-300 block mb-1">valor inicial em dinheiro (fundo de troco)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valorAbertura}
                onChange={(e) => setValorAbertura(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-lg"
          >
            abrir caixa agora
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
            onClick={() => setModalPdvAberto(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" /> registar venda (balcão/ifood)
          </button>
          <button
            onClick={fecharCaixaSistema}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-rose-400 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Lock className="w-4 h-4" /> fechar caixa
          </button>
          <button
            onClick={carregarDados}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            atualizar
          </button>
        </div>
      </div>

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
              <span className="text-xs text-slate-400 block uppercase font-semibold">vendas ifood</span>
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
                  <th className="py-3 px-4">cliente / canal</th>
                  <th className="py-3 px-4">pagamento</th>
                  <th className="py-3 px-4">status atual</th>
                  <th className="py-3 px-4 text-right">valor</th>
                  <th className="py-3 px-4 text-center">ações / alterar status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pedidosFiltrados.map((p, index) => {
                  const statusAtual = p.status || 'pendente';
                  const isFinalizado = statusAtual === 'concluido' || statusAtual === 'entregue';
                  const isRecusado = statusAtual === 'recusado' || statusAtual === 'cancelado';

                  return (
                    <tr key={p._id || index} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-xs text-amber-500 font-bold">#{p._id ? p._id.slice(-4) : index + 1}</td>
                      <td className="py-3 px-4 text-xs text-slate-400"><div className="flex items-center gap-1"><Clock size={12} />{formatarDataHora(p.criadoEm || p.createdAt)}</div></td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs text-slate-100">{p.cliente_nome || 'Cliente'}</div>
                        <div className="text-[11px] text-slate-400">{p.canal === 'ifood' ? '🛍️ Canal: iFood' : '🏪 Canal: Balcão'}</div>
                      </td>
                      <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase font-semibold">{p.forma_pagamento || p.pagamento || 'não inf.'}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase inline-flex items-center gap-1 ${
                          isFinalizado ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          isRecusado ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          statusAtual === 'enviado' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {statusAtual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {isRecusado ? '-' : formatarMoeda(p.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isFinalizado ? (
                            <span className="text-[11px] text-emerald-400 font-bold inline-flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 size={13} /> Finalizado
                            </span>
                          ) : isRecusado ? (
                            <span className="text-[11px] text-rose-400 font-medium italic">
                              Cancelado / Recusado
                            </span>
                          ) : (
                            <>
                              {statusAtual !== 'enviado' && (
                                <button
                                  onClick={() => alterarStatus(p._id, 'enviado')}
                                  title="Marcar como Enviado / Com os Motoboys"
                                  className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                >
                                  <Truck size={12} /> Enviar
                                </button>
                              )}
                              <button
                                onClick={() => alterarStatus(p._id, 'concluido')}
                                title="Marcar como Concluído / Entregue"
                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                              >
                                <Check size={12} /> Entregar
                              </button>
                            </>
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

      {/* MODAL DE REGISTO DE VENDA (BALCÃO OU IFOOD) */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Canal de Venda</label>
                  <select
                    value={canalPdv}
                    onChange={(e) => setCanalPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="presencial">Balcão / Presencial</option>
                    <option value="ifood">iFood</option>
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