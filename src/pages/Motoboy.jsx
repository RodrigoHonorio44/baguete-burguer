import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatarMoeda } from '../utils/whatsapp';
import { Truck, MapPin, Phone, Navigation, Clock, User, CheckCircle2, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SOCKET_URL = 'https://api-hamburgueria.rodhonsystem.com.br';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['polling', 'websocket']
});

export const Motoboy = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entregaAtivaId, setEntregaAtivaId] = useState(null);
  
  const [motoboyLogado, setMotoboyLogado] = useState(() => {
    return localStorage.getItem('motoboy_nome') || '';
  });
  const [nomeInput, setNomeInput] = useState('');

  const fazerLoginMotoboy = (e) => {
    e.preventDefault();
    if (!nomeInput.trim()) {
      toast.error('Insere o teu nome para entrar.');
      return;
    }
    localStorage.setItem('motoboy_nome', nomeInput.trim());
    setMotoboyLogado(nomeInput.trim());
    toast.success(`Sessão iniciada como: ${nomeInput.trim()}`);
  };

  const fazerLogoutMotoboy = () => {
    localStorage.removeItem('motoboy_nome');
    setMotoboyLogado('');
    setNomeInput('');
    toast.success('Sessão encerrada.');
  };

  const carregarPedidosMotoboy = async () => {
    try {
      const data = await api.getPedidos();
      const hoje = new Date().toISOString().split('T')[0];
      
      const pedidosFiltrados = (data || []).filter(p => {
        const dataPedido = p.criadoEm || p.createdAt;
        if (!dataPedido) return false;
        const dataFormatada = new Date(dataPedido).toISOString().split('T')[0];
        const status = p.status || 'pendente';
        
        return dataFormatada === hoje && (status === 'pronto' || status === 'enviado');
      });

      setPedidos(pedidosFiltrados);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (motoboyLogado) {
      carregarPedidosMotoboy();
      const interval = setInterval(carregarPedidosMotoboy, 10000);
      return () => clearInterval(interval);
    }
  }, [motoboyLogado]);

  // Transmissão de GPS em tempo real via Socket.io
  useEffect(() => {
    let watchId;
    if (entregaAtivaId && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('atualizar_posicao', {
            pedidoId: entregaAtivaId,
            latitude,
            longitude
          });
        },
        (error) => console.error('Erro no GPS:', error),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [entregaAtivaId]);

  const aceitarEIniciarRota = (pedido) => {
    const id = pedido._id || pedido.id;
    setEntregaAtivaId(id);

    const rua = pedido.rua || pedido.endereco?.rua || '';
    const numero = pedido.numero || pedido.endereco?.numero || '';
    const bairro = pedido.bairro || pedido.endereco?.bairro || '';
    const queryMorada = encodeURIComponent(`${rua}, ${numero}\n\n${bairro}, Maricá - RJ`);

    api.atualizarStatusPedido(id, 'enviado').then(() => {
      toast.success('Entrega aceite! A transmitir GPS e abrir o Google Maps...');
      carregarPedidosMotoboy();
      window.open(`https://www.google.com/maps/search/?api=1&query=${queryMorada}`, '_blank');
    }).catch(err => {
      console.error(err);
      toast.error('Erro ao aceitar entrega.');
    });
  };

  const finalizarEntregaMotoboy = async (id) => {
    try {
      await api.atualizarStatusPedido(id, 'concluido');
      setEntregaAtivaId(null);
      toast.success('Entrega concluída com sucesso!');
      carregarPedidosMotoboy();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao finalizar entrega.');
    }
  };

  if (!motoboyLogado) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-slate-100 min-h-screen flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">acesso do entregador</h1>
          <p className="text-xs text-slate-400 mb-6">
            insere o teu nome ou identificação para começar a receber as entregas do dia.
          </p>
          <form onSubmit={fazerLoginMotoboy} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">nome do motoboy</label>
              <input
                type="text"
                placeholder="Ex: João Motoboy"
                value={nomeInput}
                onChange={(e) => setNomeInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-slate-100 min-h-screen">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold">olá, {motoboyLogado}</h1>
            <p className="text-xs text-slate-400">painel de entregas ativo</p>
          </div>
        </div>
        <button 
          onClick={fazerLogoutMotoboy}
          title="Sair da sessão"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-12 text-sm">a carregar entregas...</p>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner">
          <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">nenhuma entrega pendente no momento.</p>
          <span className="text-xs text-slate-500 mt-1 block">assim que a cozinha marcar um pedido como pronto, ele aparecerá aqui.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const id = pedido._id || pedido.id;
            const status = pedido.status || 'pronto';
            const emRota = entregaAtivaId === id || status === 'enviado';

            return (
              <div 
                key={id} 
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition relative overflow-hidden ${
                  emRota ? 'border-purple-500/50 shadow-purple-950/20' : 'border-slate-800'
                }`}
              >
                {emRota && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    em rota / ativo
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-500 font-bold">#{id.slice(-4)}</span>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                      <User size={15} className="text-slate-400" /> {pedido.cliente_nome || 'Cliente'}
                    </h2>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">{formatarMoeda(pedido.total)}</span>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-200">Endereço de Entrega:</span>
                      <span>
                        {pedido.rua || pedido.endereco?.rua 
                          ? `${pedido.rua || pedido.endereco?.rua}, ${pedido.numero || pedido.endereco?.numero || 'S/N'}\n\n${pedido.bairro || pedido.endereco?.bairro || ''}` 
                          : 'Morada não informada'}
                      </span>
                    </div>
                  </div>

                  {(pedido.telefone || pedido.cliente_telefone) && (
                    <div className="flex items-center gap-2 text-slate-300 pt-1 border-t border-slate-800/50">
                      <Phone size={14} className="text-sky-400 shrink-0" />
                      <a href={`tel:${pedido.telefone || pedido.cliente_telefone}`} className="text-sky-400 font-semibold hover:underline">
                        {pedido.telefone || pedido.cliente_telefone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-800/50">
                    <Clock size={14} className="shrink-0" />
                    <span>Pagamento: <strong className="text-slate-200 uppercase">{pedido.forma_pagamento || pedido.pagamento || 'Dinheiro/Outro'}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!emRota ? (
                    <button
                      onClick={() => aceitarEIniciarRota(pedido)}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Navigation size={16} /> Aceitar e Abrir Maps
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const rua = pedido.rua || pedido.endereco?.rua || '';
                          const numero = pedido.numero || pedido.endereco?.numero || '';
                          const bairro = pedido.bairro || pedido.endereco?.bairro || '';
                          const queryMorada = encodeURIComponent(`${rua}, ${numero}\n\n${bairro}, Maricá - RJ`);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${queryMorada}`, '_blank');
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                      >
                        <Navigation size={15} className="text-amber-400" /> Reabrir Maps
                      </button>

                      <button
                        onClick={() => finalizarEntregaMotoboy(id)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 size={15} /> Finalizar Entrega
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};