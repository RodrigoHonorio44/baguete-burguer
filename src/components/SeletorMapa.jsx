import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção padrão para o ícone do marcador no React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para capturar cliques no mapa
const LocalizadorCliques = ({ setPosicao }) => {
  useMapEvents({
    click(e) {
      setPosicao([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

export const SeletorMapa = ({ onLocalizacaoSelecionada }) => {
  // Coordenadas padrão iniciais (ex: Maricá, RJ ou centro padrão)
  const [posicao, setPosicao] = useState([-22.9194, -42.8186]); 
  const [carregandoGPS, setCarregandoGPS] = useState(false);

  useEffect(() => {
    // Notifica o componente pai sempre que a posição mudar
    if (posicao) {
      onLocalizacaoSelecionada(posicao[0], posicao[1]);
    }
  }, [posicao]);

  // Função para pegar a localização atual do telemóvel do cliente automaticamente
  const usarMinhaLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('O seu navegador não suporta geolocalização.');
      return;
    }
    setCarregandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const novaLat = position.coords.latitude;
        const novaLng = position.coords.longitude;
        setPosicao([novaLat, novaLng]);
        setCarregandoGPS(false);
      },
      (error) => {
        console.error(error);
        alert('Não foi possível obter a sua localização. Por favor, clique no mapa.');
        setCarregandoGPS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-300">
          📍 Marque a sua localização exata no mapa (clique no local ou use o botão):
        </label>
        <button
          type="button"
          onClick={usarMinhaLocalizacao}
          disabled={carregandoGPS}
          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded transition-colors"
        >
          {carregandoGPS ? 'Obtendo GPS...' : 'Usar meu GPS 🎯'}
        </button>
      </div>

      <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 z-0">
        <MapContainer 
          center={posicao} 
          zoom={15} 
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={posicao} />
          <LocalizadorCliques setPosicao={setPosicao} />
        </MapContainer>
      </div>
      <span className="text-[10px] text-slate-400 text-center">
        Dica: Arraste o mapa e clique exatamente em cima da sua casa para o motoboy não errar.
      </span>
    </div>
  );
};