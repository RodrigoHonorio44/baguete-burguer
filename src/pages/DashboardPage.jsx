import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Award, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState('mes'); // 'hoje' | 'semana' | 'mes'
  const [loading, setLoading] = useState(false);

  // Estados de Paginação para os Carros-Chefe
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  // Estados dos Dados das Métricas mapeados com a estrutura da API
  const [resumo, setResumo] = useState({
    faturamentoTotal: 0,
    totalPedidos: 0,
    ticketMedio: 0,
    lucroEstimado: 0,
    
    // Formas de Pagamento
    pagamentos: {
      pix: 0,
      cartao: 0,
      dinheiro: 0
    },

    // Canais de Venda
    canais: {
      lojaPropria: 0,
      ifood: 0,
      noveNoveFood: 0
    },

    // Carros-chefe / Produtos Mais Vendidos
    produtosMaisVendidos: []
  });

  // Resetar página para 1 ao mudar o filtro de período
  useEffect(() => {
    setPaginaAtual(1);
  }, [periodo]);

  // Carregar dados reais da API do MongoDB
  useEffect(() => {
    const buscarDadosDashboard = async () => {
      setLoading(true);
      try {
        const data = await api.getDashboardVendas(periodo);
        if (data) {
          // Varredura inteligente no array vendasPorCanal retornado pelo backend
          let valDirect = 0;
          let valIfood = 0;
          let val99 = 0;

          if (Array.isArray(data.vendasPorCanal)) {
            data.vendasPorCanal.forEach(c => {
              const nome = (c.canal || '').toLowerCase();
              const val = Number(c.total || c.valor || c.faturamento || 0);
              if (nome.includes('tay') || nome.includes('direto') || nome.includes('site') || nome.includes('presencial')) {
                valDirect += val;
              } else if (nome.includes('ifood')) {
                valIfood += val;
              } else if (nome.includes('99')) {
                val99 += val;
              }
            });
          }

          setResumo({
            faturamentoTotal: Number(data.faturamentoTotal || 0),
            totalPedidos: Number(data.totalPedidos || 0),
            ticketMedio: Number(data.ticketMedio || 0),
            lucroEstimado: Number(data.lucroEstimado || 0),
            pagamentos: {
              pix: Number(data.formasPagamento?.pix || 0),
              cartao: Number(data.formasPagamento?.cartao || 0),
              dinheiro: Number(data.formasPagamento?.dinheiro || 0)
            },
            canais: {
              lojaPropria: valDirect || Number(data.canais?.direct || data.canais?.taymix || 0),
              ifood: valIfood || Number(data.canais?.ifood || 0),
              noveNoveFood: val99 || Number(data.canais?.['99food'] || data.canais?.['99Food'] || 0)
            },
            produtosMaisVendidos: Array.isArray(data.carrosChefe) ? data.carrosChefe.map(item => ({
              nome: item.nome,
              qtd: Number(item.quantidade || item.qtd || 0),
              faturamento: Number(item.faturamentoTotal || item.faturamento || 0),
              lucro: Number(item.lucroGerado || item.lucro || 0)
            })) : []
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDashboard();
  }, [periodo]);

  // Lógica de cálculo da Paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const produtosPaginados = resumo.produtosMaisVendidos.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(resumo.produtosMaisVendidos.length / itensPorPagina);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cabeçalho com Filtro de Período */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard de Vendas</h1>
              <p className="text-xs text-gray-500">Visão geral financeira, canais de entrega e produtos mais rentáveis</p>
            </div>
          </div>

          {/* Seletor do Período */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPeriodo('hoje')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'hoje' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'semana' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'mes' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Este Mês
            </button>
          </div>
        </div>

        {/* CARDS PRINCIPAIS (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Faturamento Total */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">R$ {resumo.faturamentoTotal.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Entrada total bruta
            </span>
          </div>

          {/* Card: Lucro Estimado */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Lucro Estimado</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">R$ {resumo.lucroEstimado.toFixed(2)}</p>
            <span className="text-[10px] text-gray-400 font-medium">Margem líquida das vendas</span>
          </div>

          {/* Card: Quantidade de Pedidos */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Total de Pedidos</span>
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{resumo.totalPedidos} <span className="text-xs font-normal text-gray-400">pedidos</span></p>
            <span className="text-[10px] text-gray-400 font-medium">Vendas finalizadas</span>
          </div>

          {/* Card: Ticket Médio */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Ticket Médio</span>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">R$ {resumo.ticketMedio.toFixed(2)}</p>
            <span className="text-[10px] text-gray-400 font-medium">Média por cliente</span>
          </div>

        </div>

        {/* SEÇÃO INTERMEDIÁRIA: FORMAS DE PAGAMENTO E CANAIS DE VENDA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Vendas por Forma de Pagamento */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" /> Formas de Pagamento
            </h2>

            <div className="space-y-3">
              {/* PIX */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Pix</p>
                    <p className="text-[10px] text-gray-500">Aprovação instantânea</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-800">R$ {resumo.pagamentos.pix.toFixed(2)}</span>
              </div>

              {/* Cartão (Débito/Crédito) */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Cartão de Crédito / Débito</p>
                    <p className="text-[10px] text-gray-500">Maquininha e Online</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-blue-800">R$ {resumo.pagamentos.cartao.toFixed(2)}</span>
              </div>

              {/* Dinheiro */}
              <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Dinheiro em Espécie</p>
                    <p className="text-[10px] text-gray-500">Com ou sem troco</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-amber-800">R$ {resumo.pagamentos.dinheiro.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Vendas por Canal (Loja Própria, iFood, 99Food) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" /> Vendas por Plataforma / Canal
            </h2>

            <div className="space-y-3">
              {/* Loja Própria / Cardápio Direto */}
              <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black text-xs">
                    TM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Tay Mix Direct (Site Próprio)</p>
                    <p className="text-[10px] text-gray-500">Sem taxas de intermediação</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900">R$ {resumo.canais.lojaPropria.toFixed(2)}</span>
              </div>

              {/* iFood */}
              <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
                    iF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">iFood</p>
                    <p className="text-[10px] text-gray-500">Plataforma de parceiro</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900">R$ {resumo.canais.ifood.toFixed(2)}</span>
              </div>

              {/* 99Food */}
              <div className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-400 text-gray-900 rounded-lg flex items-center justify-center font-black text-xs">
                    99
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">99Food</p>
                    <p className="text-[10px] text-gray-500">Plataforma de parceiro</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900">R$ {resumo.canais.noveNoveFood.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* TABELA: PRODUTOS MAIS VENDIDOS & CARROS-CHEFE COM PAGINAÇÃO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Carros-Chefe (Produtos Mais Vendidos e Lucrativos)
            </h2>
            <span className="text-xs text-gray-400 font-medium">Rank por volume de saída</span>
          </div>

          <div className="overflow-x-auto">
            {resumo.produtosMaisVendidos.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Nenhuma venda registrada para o período selecionado.</p>
            ) : (
              <>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <th className="p-3 rounded-l-lg">Posição & Produto</th>
                      <th className="p-3">Qtd. Vendida</th>
                      <th className="p-3">Faturamento Total</th>
                      <th className="p-3 rounded-r-lg">Lucro Gerado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {produtosPaginados.map((prod, idx) => {
                      const posicaoReal = indicePrimeiroItem + idx + 1;
                      return (
                        <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                          <td className="p-3 font-semibold text-gray-800 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                              posicaoReal === 1 ? 'bg-amber-400 text-gray-900' :
                              posicaoReal === 2 ? 'bg-gray-300 text-gray-800' :
                              posicaoReal === 3 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {posicaoReal}
                            </span>
                            {prod.nome}
                          </td>
                          <td className="p-3 font-bold text-gray-700">{prod.qtd} un</td>
                          <td className="p-3 font-semibold text-gray-800">R$ {Number(prod.faturamento || 0).toFixed(2)}</td>
                          <td className="p-3 font-bold text-emerald-600">R$ {Number(prod.lucro || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* CONTROLES DE PAGINAÇÃO (SE HOUVER MAIS DE 1 PÁGINA) */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
                    <span className="text-gray-500">
                      Mostrando {indicePrimeiroItem + 1} a {Math.min(indiceUltimoItem, resumo.produtosMaisVendidos.length)} de {resumo.produtosMaisVendidos.length} produtos
                    </span>
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                        disabled={paginaAtual === 1}
                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 font-medium hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 font-bold text-gray-700">
                        {paginaAtual} / {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={paginaAtual === totalPaginas}
                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 font-medium hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}