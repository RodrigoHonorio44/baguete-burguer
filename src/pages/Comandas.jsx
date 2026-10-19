import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, MapPin, Phone, ChefHat, ShoppingBag, Store, Truck, Sparkles } from 'lucide-react';
import { formatarMoeda, formatarDataHora } from '../utils/whatsapp';
import ComandaImpressao from '../components/ComandaImpressao';

// Função auxiliar para lidar com datas que podem vir como string ou como objeto MongoDB {$date: '...'}
const extrairData = (criadoEm, createdAt) => {
  const dataBruta = criadoEm || createdAt;
  if (!dataBruta) return null;
  
  if (typeof dataBruta === 'object' && dataBruta.$date) {
    return dataBruta.$date;
  }
  return dataBruta;
};

export const Comandas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [expandidos, setExpandidos] = useState({});

  const carregarPedidos = async () => {
    try {
      const data = await api.getPedidos();
      
      // Filtrar apenas as comandas do DIA ATUAL
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosDoDia = (data || []).filter(pedido => {
        const dataPedidoStr = extrairData(pedido.criadoEm, pedido.createdAt);
        if (!dataPedidoStr) return false;
        const dataPedido = new Date(dataPedidoStr).toISOString().split('T')[0];
        return dataPedido === hoje;
      });

      // Ordenar por ordem de chegada (mais antigas primeiro)
      const pedidosOrdenados = pedidosDoDia.sort((a, b) => {
        const dataA = new Date(extrairData(a.criadoEm, a.createdAt) || 0);
        const dataB = new Date(extrairData(b.criadoEm, b.createdAt) || 0);
        return dataA - dataB;
      });
      
      setPedidos(pedidosOrdenados);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  // NA COZINHA: Apenas exibe pedidos que já foram aceitos pelo Caixa (status "preparo")
  const pedidosCozinha = pedidos.filter(pedido => {
    const status = pedido.status || 'pendente';
    return status === 'preparo';
  });

  const toggleExpand = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Cozinha diz que terminou (muda para 'pronto' e o pedido vai para o caixa despachar)
  const marcarComoPronto = async (e, id) => {
    e?.stopPropagation();
    try {
      await api.atualizarStatusPedido(id, 'pronto');
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status para pronto:', error);
    }
  };

  // Função auxiliar para definir o badge visual do canal/origem
  const obterBadgeCanal = (pedido) => {
    const canal = (pedido.canal || '').toLowerCase();
    const tipo = (pedido.tipo || '').toLowerCase();
    const temEndereco = Boolean(pedido.rua || pedido.endereco?.rua);

    if (canal === 'ifood' || canal === 'ifood_loja' || canal === 'ifood_parceiro') {
      return (
        <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
          <ShoppingBag size={12} /> iFood
        </span>
      );
    }

    if (canal === '99food') {
      return (
        <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
          <ShoppingBag size={12} /> 99Food
        </span>
      );
    }

    if (canal === 'app' || canal === 'delivery' || tipo === 'entrega' || temEndereco) {
      return (
        <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
          <Truck size={12} /> App Delivery
        </span>
      );
    }

    return (
      <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
        <Store size={12} /> Balcão
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho Limpo no Modo Claro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-amber-500" />
            Tela da Cozinha (Pedidos em Preparo)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe os pedidos aceitos no caixa e marque quando estiverem prontos
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            {pedidosCozinha.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pedidosCozinha.length > 0 ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className="text-xs text-slate-700 font-medium">
            <strong className="text-amber-600 font-bold">{pedidosCozinha.length}</strong> pedido(s) na linha de produção
          </span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {pedidosCozinha.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Nenhum pedido em preparo no momento</h3>
          <p className="text-xs text-slate-500">
            Tudo em dia por aqui! Assim que o caixa aceitar novos pedidos, as comandas aparecerão nesta tela. 👨‍🍳✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pedidosCozinha.map((pedido) => {
            const idPedido = pedido._id || pedido.id;
            const estaExpandido = expandidos[idPedido];
            const dataFormatada = extrairData(pedido.criadoEm, pedido.createdAt);

            const enderecoFormatado = pedido.rua || pedido.endereco?.rua
              ? `${pedido.rua || pedido.endereco?.rua}, ${pedido.numero || pedido.endereco?.numero || 'S/N'} ${pedido.bairro || pedido.endereco?.bairro || ''}`
              : 'Endereço não informado / Balcão';

            return (
              <div 
                key={idPedido} 
                onClick={() => toggleExpand(idPedido)}
                className="bg-white border-2 border-amber-400 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-600 text-xl font-mono">#{idPedido.slice(-4)}</span>
                      <span className="text-xs text-slate-800 font-bold">{pedido.cliente_nome || pedido.nomeCliente || 'Cliente'}</span>
                    </div>
                    
                    {/* Badge do Canal */}
                    {obterBadgeCanal(pedido)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" /> {formatarDataHora(dataFormatada)}
                    </span>
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] uppercase text-slate-700 font-semibold">
                      {pedido.forma_pagamento || pedido.pagamento || 'não inf.'}
                    </span>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200/80 pb-1">
                      Itens do Pedido:
                    </span>
                    {pedido.itens?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-semibold text-slate-800">
                        <span>{item.quantidade || item.quantity || item.qtd || 1}x {item.nome || item.name || item.produto}</span>
                      </div>
                    ))}
                  </div>

                  {(pedido.observacoes || pedido.observacao) && (
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs text-rose-700 font-semibold mb-3">
                      <strong>OBS:</strong> {pedido.observacoes || pedido.observacao}
                    </div>
                  )}

                  {/* Endereço Expansível */}
                  {estaExpandido && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1 animate-fadeIn">
                      <p className="flex items-center gap-1"><Phone size={12} /> {pedido.telefone || pedido.cliente_telefone || 'Sem telefone'}</p>
                      <p className="flex items-start gap-1">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-amber-500" /> 
                        <span>{enderecoFormatado}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="border-t border-slate-100 pt-3 mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => marcarComoPronto(e, idPedido)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle size={15} /> Marcar como Pronto
                  </button>

                  <ComandaImpressao pedido={pedido} iconeApenas={true} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comandas;