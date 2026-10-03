import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { Navigation } from 'lucide-react';

const SOCKET_URL = 'https://api-hamburgueria.rodhonsystem.com.br';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['polling', 'websocket']
});

// Ícone SVG detalhado da Motocicleta Vermelha para o Leaflet
const iconeMotoSvg = L.divIcon({
  className: 'custom-moto-icon',
  html: `
    <div style="filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.4)); display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="46px" height="46px">
        <!-- Sombra Projetada do Veículo -->
        <ellipse cx="60" cy="65" rx="18" ry="32" fill="rgba(0, 0, 0, 0.25)" />

        <!-- Rodas Traseiras (Aparecendo sob a rabeta) -->
        <rect x="42" y="85" width="8" height="18" rx="4" fill="#0f172a" />
        <rect x="70" y="85" width="8" height="18" rx="4" fill="#0f172a" />

        <!-- Baú de Entrega Traseiro -->
        <rect x="48" y="76" width="24" height="20" rx="4" fill="#1e293b" />
        <rect x="51" y="79" width="18" height="14" rx="2" fill="#334155" />

        <!-- Corpo Principal / Carenagem Inferior -->
        <path d="M60 22 C72 28, 76 45, 74 72 C73 84, 68 92, 60 95 C52 92, 47 84, 46 72 C44 45, 48 28, 60 22 Z" fill="#b91c1c"/>
        
        <!-- Carenagem Superior -->
        <path d="M60 25 C70 30, 72 45, 71 68 C70 78, 65 86, 60 88 C55 86, 50 78, 49 68 C48 45, 50 30, 60 25 Z" fill="#ef4444"/>

        <!-- Brilho / Reflexo na Carenagem -->
        <path d="M60 28 C66 32, 68 45, 67 65 C66 74, 63 80, 60 82 C57 80, 54 74, 53 65 C52 45, 54 32, 60 28 Z" fill="#f87171" opacity="0.6"/>

        <!-- Banco / Assento do Piloto -->
        <path d="M53 50 C53 44, 67 44, 67 50 C67 62, 66 72, 60 76 C54 72, 53 62, 53 50 Z" fill="#0f172a"/>
        <path d="M56 52 C56 48, 64 48, 64 52 C64 60, 64 68, 60 71 C56 68, 56 60, 56 52 Z" fill="#1e293b"/>

        <!-- Painel de Instrumentos / Carenagem do Farol -->
        <path d="M53 32 L67 32 L65 24 L55 24 Z" fill="#1e293b"/>
        <circle cx="60" cy="23" r="3.5" fill="#facc15" />

        <!-- Guidão Ergonômico -->
        <path d="M36 38 Q60 32 84 38 C87 38, 88 35, 85 33 C73 28, 47 28, 35 33 C32 35, 33 38, 36 38 Z" fill="#0f172a"/>
        <circle cx="34" cy="36" r="3.5" fill="#334155"/>
        <circle cx="86" cy="36" r="3.5" fill="#334155"/>

        <!-- Espelhos Retrovisores Laterais -->
        <path d="M30 33 L26 26 C25 24, 28 22, 31 25 Z" fill="#1e293b"/>
        <ellipse cx="25" cy="24" rx="3.5" ry="2" transform="rotate(-30 25 24)" fill="#475569"/>

        <path d="M90 33 L94 26 C95 24, 92 22, 89 25 Z" fill="#1e293b"/>
        <ellipse cx="95" cy="24" rx="3.5" ry="2" transform="rotate(30 95 24)" fill="#475569"/>
      </svg>
    </div>
  `,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -20]
});

// Componente auxiliar para recentrar o mapa automaticamente
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

export const RastreioCliente = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [posicaoMotoboy, setPosicaoMotoboy] = useState(null);

  useEffect(() => {
    api.getPedidos().then(data => {
      const atual = (data || []).find(p => (p._id || p.id) === id);
      if (atual) setPedido(atual);
    });

    socket.on(`posicao_motoboy_${id}`, (coords) => {
      if (coords && coords.latitude && coords.longitude) {
        setPosicaoMotoboy([coords.latitude, coords.longitude]);
      }
    });

    return () => {
      socket.off(`posicao_motoboy_${id}`);
    };
  }, [id]);

  if (!pedido) {
    return <div className="text-center text-slate-400 py-20 text-sm">A carregar dados do rastreio...</div>;
  }

  const destinoCliente = [
    Number(pedido.latitude) || -22.9194, 
    Number(pedido.longitude) || -42.8189
  ];
  
  const posicaoAtual = posicaoMotoboy || destinoCliente;

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-slate-100 min-h-screen flex flex-col">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-amber-500 font-bold">Pedido #{id.slice(-4)}</span>
          <h1 className="text-base font-bold text-slate-100">Acompanhe a sua entrega</h1>
        </div>
        <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-400 font-bold rounded uppercase">
          {pedido.status || 'Em andamento'}
        </span>
      </div>

      {!posicaoMotoboy && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-xs mb-3 flex items-center gap-2">
          <Navigation size={15} className="shrink-0 animate-spin" />
          <span>A aguardar que o motoboy inicie a rota e transmita a localização...</span>
        </div>
      )}

      <div className="w-full h-[430px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
        <MapContainer 
          center={posicaoAtual} 
          zoom={16} 
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          <RecenterMap center={posicaoAtual} />

          {/* Marcador da Casa do Cliente */}
          <Marker position={destinoCliente}>
            <Popup>📍 Endereço de Entrega (Sua Casa)</Popup>
          </Marker>
          
          {/* Marcador com o SVG detalhado da Motocicleta Vermelha */}
          {posicaoMotoboy && (
            <Marker position={posicaoMotoboy} icon={iconeMotoSvg}>
              <Popup>🛵 Motoboy a caminho!</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};