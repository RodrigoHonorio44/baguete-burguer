import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { Truck, MapPin, CheckCircle2 } from 'lucide-react';

const SOCKET_URL = 'https://api-hamburgueria.rodhonsystem.com.br';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['polling', 'websocket']
});

export const RastreioCliente = () => {
  const { id } = useParams(); // ID do pedido na URL
  const [pedido, setPedido] = useState(null);
  const [posicaoMotoboy, setPosicaoMotoboy] = useState(null);

  useEffect(() => {
    // Buscar dados do pedido para obter a latitude e longitude de destino (casa do cliente)
    api.getPedidos().then(data => {
      const atual = (data || []).find(p => (p._id || p.id) === id);
      if (atual) setPedido(atual);
    });

    // Escutar a posição do motoboy em tempo real via Socket.io
    socket.on(`posicao_motoboy_${id}`, (coords) => {
      setPosicaoMotoboy([coords.latitude, coords.longitude]);
    });

    return () => {
      socket.off(`posicao_motoboy_${id}`);
    };
  }, [id]);

  if (!pedido) {
    return <div className="text-center text-slate-400 py-20">A carregar dados do rastreio...</div>;
  }

  // Coordenadas da casa do cliente salvas no pedido
  const destinoCliente = [pedido.latitude || -22.9234, pedido.longitude || -42.8166];
  // Posição atual do motoboy ou fallback para a casa do cliente se ainda não iniciou
  const posicaoAtual = posicaoMotoboy || destinoCliente;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-slate-100 min-h-screen flex flex-col">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-amber-500 font-bold">Pedido #{id.slice(-4)}</span>
          <h1 className="text-base font-bold">Acompanhe a sua entrega</h1>
        </div>
        <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-400 font-bold rounded uppercase">
          {pedido.status || 'Em andamento'}
        </span>
      </div>

      {/* MAPA INTERATIVO GRATUITO */}
      <div className="flex-1 w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-10">
        <MapContainer center={posicaoAtual} zoom={15} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {/* Marcador da Casa do Cliente */}
          <Marker position={destinoCliente}>
            <Popup>Endereço de Entrega</Popup>
          </Marker>
          {/* Marcador do Motoboy em Tempo Real */}
          {posicaoMotoboy && (
            <Marker position={posicaoMotoboy}>
              <Popup>Motoboy a caminho!</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};