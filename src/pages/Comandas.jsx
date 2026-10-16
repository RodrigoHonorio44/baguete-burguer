import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, MapPin, Phone, ChefHat, ShoppingBag, Store, Truck } from 'lucide-react';
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

    if (canal === 'ifood') {
      return (
        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
          <ShoppingBag size={12} /> iFood
        </span>
      );
    }

    if (canal === 'app' || canal === 'delivery' || tipo === 'entrega' || temEndereco) {
      return (
        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
          <Truck size={12} /> App Delivery
        </span>
      );
    }

    return (
      <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
        <Store size={12} /> Balcão
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-amber-500" />
            tela da cozinha (pedidos em preparo)
          </h1>
        </div>
        <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
          {pedidosCozinha.length} pedido(s) na linha de produção
        </span>
      </div>

      {pedidosCozinha.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Nenhum pedido em preparo na cozinha no momento. Tudo em dia! 👨‍🍳✨
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
                className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition shadow-xl hover:border-amber-400"
              >
                <div>
                  {/* CABEÇALHO */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-400 text-xl font-mono">#{idPedido.slice(-4)}</span>
                      <span className="text-xs text-slate-100 font-bold">{pedido.cliente_nome || pedido.nomeCliente || 'Cliente'}</span>
                    </div>
                    
                    {/* SELO DE CANAL DINÂMICO */}
                    {obterBadgeCanal(pedido)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatarDataHora(dataFormatada)}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase text-slate-300 font-semibold">
                      {pedido.forma_pagamento || pedido.pagamento || 'não inf.'}
                    </span>
                  </div>

                  {/* ITENS PARA A COZINHA */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Itens do Pedido:
                    </span>
                    {pedido.itens?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-semibold text-slate-100">
                        <span>{item.quantidade || item.quantity || 1}x {item.nome || item.name || item.produto}</span>
                      </div>
                    ))}
                  </div>

                  {pedido.observacoes && (
                    <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl text-xs text-rose-300 font-semibold mb-3">
                      <strong>OBS:</strong> {pedido.observacoes}
                    </div>
                  )}

                  {/* ENDEREÇO (Exibido ao expandir ou se for delivery) */}
                  {estaExpandido && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1 animate-fadeIn">
                      <p className="flex items-center gap-1"><Phone size={12} /> {pedido.telefone || pedido.cliente_telefone || 'Sem telefone'}</p>
                      <p className="flex items-start gap-1">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-amber-400" /> 
                        <span>{enderecoFormatado}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* BOTÃO DA COZINHA: DIZER QUE TERMINOU */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => marcarComoPronto(e, idPedido)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
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