import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { formatarMoeda } from '../utils/whatsapp';
import { Truck, MapPin, Phone, Navigation, Clock, User, CheckCircle2, LogIn, LogOut, DollarSign, Award, Bell } from 'lucide-react';
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
  const audioRef = useRef(null);
  
  const [motoboyLogado, setMotoboyLogado] = useState(() => {
    return localStorage.getItem('motoboy_nome') || '';
  });
  const [nomeInput, setNomeInput] = useState('');

  // Mantém registrada a quantidade de pedidos prontos anterior para detectar novos pedidos
  const totalProntosAnteriorRef = useRef(0);

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
        const status = (p.status || 'pendente').toLowerCase();
        
        // 1. Data deve ser de hoje e status válido para motoboy
        const dataValida = dataFormatada === hoje;
        const statusValido = status === 'pronto' || status === 'enviado' || status === 'concluido';

        if (!dataValida || !statusValido) return false;

        // 2. REGRA EXATA: Exclui pedidos de retirada no balcão
        const tipo = (p.tipo || p.entrega || '').toLowerCase();
        const ehRetirada = tipo.includes('retirada') || (p.canal || '').toLowerCase().includes('presencial');
        if (ehRetirada) return false;

        // 3. REGRA EXATA: Exclui entregas parceiras de apps cujos entregadores são terceirizados
        const canal = (p.canal || '').toLowerCase();
        const ehEntregaTerceirizada = canal.includes('ifood_parceiro') || canal.includes('99') || canal.includes('99food') || tipo.includes('parceira');
        if (ehEntregaTerceirizada) return false;

        return true;
      });

      // Contar quantos estão com status 'pronto' atualmente
      const prontosAgora = pedidosFiltrados.filter(p => p.status === 'pronto').length;

      // Se houver mais pedidos prontos do que na verificação anterior, toca o alarme!
      if (totalProntosAnteriorRef.current > 0 && prontosAgora > totalProntosAnteriorRef.current) {
        tocarAlarmeNovoPedido();
      }
      totalProntosAnteriorRef.current = prontosAgora;

      setPedidos(pedidosFiltrados);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  const tocarAlarmeNovoPedido = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Erro ao reproduzir áudio automaticamente:", e));
    }
    toast('🔔 Nova comanda pronta para entrega!', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#f59e0b',
        color: '#0f172a',
        fontWeight: 'bold',
      },
    });
  };

  useEffect(() => {
    if (motoboyLogado) {
      carregarPedidosMotoboy();
      const interval = setInterval(carregarPedidosMotoboy, 8000); // Polling a cada 8s para sincronizar
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

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('atualizar_posicao', {
              pedidoId: id,
              latitude,
              longitude
            });
          },
          (error) => console.error('Erro ao obter GPS imediato:', error),
          { enableHighAccuracy: true }
        );
      }

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

  // Cálculos de métricas do dia para o motoboy
  const entregasConcluidasLista = pedidos.filter(p => p.status === 'concluido');
  const totalEntregasFeitas = entregasConcluidasLista.length;
  
  const valorTaxaPorEntrega = 8.00; 
  const valorTotalFretes = entregasConcluidasLista.reduce((acc, p) => {
    const taxaPedido = Number(p.taxa_entrega || p.frete) || valorTaxaPorEntrega;
    return acc + taxaPedido;
  }, 0);

  const pedidosAtivos = pedidos.filter(p => p.status === 'pronto' || p.status === 'enviado');

  if (!motoboyLogado) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-slate-800 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xs w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2 text-slate-800">Acesso do Entregador</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Insere o teu nome ou identificação para gerir as entregas e taxas do dia.
          </p>
          <form onSubmit={fazerLoginMotoboy} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Nome do Motoboy
              </label>
              <input
                type="text"
                placeholder="Ex: João Motoboy"
                value={nomeInput}
                onChange={(e) => setNomeInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-slate-800 min-h-screen bg-slate-50">
      {/* Elemento de áudio escondido para tocar a notificação sonora */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* NAVBAR EXCLUSIVA DO MOTOBOY */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl mb-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 relative">
            <Truck className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800">Painel do Entregador</h1>
            <p className="text-xs text-amber-700 font-bold">Driver: {motoboyLogado}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão de teste manual de som */}
          <button 
            onClick={tocarAlarmeNovoPedido}
            title="Testar som de alerta"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Bell size={16} />
          </button>
          <button 
            onClick={fazerLogoutMotoboy}
            title="Sair da sessão"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-rose-600 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>

      {/* PAINEL DE MÉTRICAS E GANHOS DO DIA */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Concluídas</span>
            <span className="text-lg font-extrabold text-slate-800">{totalEntregasFeitas}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Total Fretes</span>
            <span className="text-base font-extrabold text-amber-700">{formatarMoeda(valorTotalFretes)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Entregas Disponíveis / Em Rota</h2>
        <span className="text-[11px] bg-white text-amber-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-2xs">
          {pedidosAtivos.length} ativa(s)
        </span>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-12 text-sm font-medium">A carregar entregas...</p>
      ) : pedidosAtivos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
          <p className="text-slate-800 text-sm font-bold">Nenhuma entrega pendente no momento.</p>
          <span className="text-xs text-slate-500 mt-1 block font-medium">O som tocará automaticamente quando a cozinha finalizar uma nova comanda.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosAtivos.map((pedido) => {
            const id = pedido._id || pedido.id;
            const status = pedido.status || 'pronto';
            const emRota = entregaAtivaId === id || status === 'enviado';

            return (
              <div 
                key={id} 
                className={`bg-white border rounded-2xl p-5 shadow-xs transition relative overflow-hidden ${
                  emRota ? 'border-purple-300 shadow-purple-100' : 'border-amber-400 animate-pulse'
                }`}
              >
                {emRota ? (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Em Rota / Ativo
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-2xs">
                    Pronto na Cozinha! 🚀
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-700 font-bold">Pedido #{id.slice(-4)}</span>
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <User size={15} className="text-slate-400" /> {pedido.cliente_nome || 'Cliente'}
                    </h2>
                  </div>
                  <span className="text-base font-black text-emerald-600">{formatarMoeda(pedido.total)}</span>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4 text-xs font-medium">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-800">Endereço de Entrega:</span>
                      <span>
                        {pedido.rua || pedido.endereco?.rua 
                          ? `${pedido.rua || pedido.endereco?.rua}, ${pedido.numero || pedido.endereco?.numero || 'S/N'}\n\n${pedido.bairro || pedido.endereco?.bairro || ''}` 
                          : 'Morada não informada'}
                      </span>
                    </div>
                  </div>

                  {(pedido.telefone || pedido.cliente_telefone) && (
                    <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200">
                      <Phone size={14} className="text-sky-600 shrink-0" />
                      <a href={`tel:${pedido.telefone || pedido.cliente_telefone}`} className="text-sky-600 font-bold hover:underline">
                        {pedido.telefone || pedido.cliente_telefone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-200">
                    <Clock size={14} className="shrink-0 text-slate-400" />
                    <span>Pagamento: <strong className="text-slate-800 uppercase font-bold">{pedido.forma_pagamento || pedido.pagamento || 'Dinheiro/Outro'}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!emRota ? (
                    <button
                      onClick={() => aceitarEIniciarRota(pedido)}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
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
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                      >
                        <Navigation size={15} className="text-amber-600" /> Reabrir Maps
                      </button>

                      <button
                        onClick={() => finalizarEntregaMotoboy(id)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
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

export default Motoboy;