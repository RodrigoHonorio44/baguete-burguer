import React, { useState, useEffect } from 'react';
import { Store, Save, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function CentralizadorMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) {
      map.setView(centro, 16);
    }
  }, [centro, map]);
  return null;
}

function LocalizadorCliques({ onSelecionarPonto }) {
  useMapEvents({
    click(e) {
      onSelecionarPonto(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function PerfilLojaTab({ 
  lojaNome, 
  setLojaNome, 
  endereco, 
  setEndereco, 
  pedidoMinimo, 
  setPedidoMinimo, 
  onSalvar, 
  loading,
  posicaoLoja,       
  setPosicaoLoja    
}) {
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');

  const [positionLocal, setPositionLocal] = useState([-22.9189, -42.8186]);

  const currentPosition = (posicaoLoja && posicaoLoja.length === 2) ? posicaoLoja : positionLocal;
  const updatePosition = setPosicaoLoja || setPositionLocal;

  // Sincroniza os campos locais quando o endereço completo vem do banco de dados
  useEffect(() => {
    if (!endereco) return;

    const partes = endereco.split(',').map(p => p.trim());
    if (partes.length >= 4) {
      setMunicipio(partes[partes.length - 1] || '');
      setBairro(partes[partes.length - 2] || '');
      setComplemento(partes[partes.length - 3] || '');
      // Tenta separar rua e número se houver vírgula ou espaço
      const ruaNumeroPartes = partes.slice(0, partes.length - 3).join(', ');
      const subPartes = ruaNumeroPartes.split(',');
      if (subPartes.length > 1) {
        setRua(subPartes[0].trim());
        setNumero(subPartes[1].trim());
      } else {
        setRua(ruaNumeroPartes);
      }
    } else {
      setRua(partes[0] || '');
      setComplemento(partes[1] || '');
      setBairro(partes[2] || '');
      setMunicipio(partes[3] || '');
    }
  }, [endereco]);

  const atualizarCamposEString = (novaRua, novoNumero, novoComplemento, novoBairro, novoMunicipio) => {
    setRua(novaRua);
    setNumero(novoNumero);
    setComplemento(novoComplemento);
    setBairro(novoBairro);
    setMunicipio(novoMunicipio);
    
    // Monta a string do endereço consolidada para salvar no banco
    const parteRuaNum = [novaRua, novoNumero].filter(Boolean).join(', ');
    const partes = [parteRuaNum, novoComplemento, novoBairro, novoMunicipio].filter(Boolean);
    setEndereco(partes.join(', '));
  };

  const buscarCoordenadasPorEndereco = async () => {
    const query = [rua, numero, bairro, municipio].filter(Boolean).join(', ');
    if (!query) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const novaLat = parseFloat(data[0].lat);
        const novaLon = parseFloat(data[0].lon);
        updatePosition([novaLat, novaLon]);
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
  };

  // Ao arrastar ou clicar no mapa: pega a coordenada exata e preenche a rua, número (se houver), bairro e município
  const handleMapClickOrDrag = async (lat, lng) => {
    updatePosition([lat, lng]);
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`);
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        const nomeRuaAPI = addr.road || addr.pedestrian || addr.suburb || addr.hamlet || addr.quarter || '';
        const numeroAPI = addr.house_number || '';
        
        // Se a API trouxer a rua, usa ela. Senão, mantém a que já estava digitada.
        const ruaEncontrada = nomeRuaAPI ? nomeRuaAPI : rua;
        
        // Se a API trouxer o número exato da casa, usa ele. Senão, preserva o número que você já tinha digitado!
        const numeroEncontrado = numeroAPI ? numeroAPI : numero;

        // Bairro com varredura ampla para garantir que encontre na região (ex: Maricá)
        const bairroEncontrado = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.city_district || bairro;
        
        // Município / UF
        const cidade = addr.city || addr.town || addr.municipality || addr.village || '';
        const estado = addr.state ? ` - ${addr.state}` : '';
        const municipioEncontrado = cidade ? `${cidade}${estado}` : municipio;

        atualizarCamposEString(
          ruaEncontrada, 
          numeroEncontrado, 
          complemento, 
          bairroEncontrado, 
          municipioEncontrado
        );
      }
    } catch (error) {
      console.error("Erro no reverse geocoding:", error);
    }
  };

  const handleValorChange = (e) => {
    let valorLimpo = e.target.value.replace(/\D/g, '');
    if (!valorLimpo) {
      setPedidoMinimo(0);
      return;
    }
    const numeroVal = Number(valorLimpo) / 100;
    setPedidoMinimo(numeroVal);
  };

  const formatarMoeda = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSalvarComPosicao = () => {
    if (setPosicaoLoja) {
      setPosicaoLoja(currentPosition);
    }
    if (onSalvar) {
      onSalvar();
    }
  };

  return (
    <div className="w-full bg-[#f8f9fa] space-y-6">
      
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900">Informações Gerais & Pedido Mínimo</h1>
          <p className="text-xs text-slate-500">Configure o nome da loja, endereço detalhado e valor mínimo de pedido.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Nome da Loja
            </label>
            <input
              type="text"
              value={lojaNome}
              onChange={(e) => setLojaNome(e.target.value)}
              placeholder="Ex: Tay Mix"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Rua / Logradouro
              </label>
              <input
                type="text"
                value={rua}
                onChange={(e) => atualizarCamposEString(e.target.value, numero, complemento, bairro, municipio)}
                placeholder="Ex: Rua Guarapari"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Número
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => atualizarCamposEString(rua, e.target.value, complemento, bairro, municipio)}
                  placeholder="Ex: 0 ou S/N"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={buscarCoordenadasPorEndereco}
                  title="Localizar no mapa"
                  className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 px-3 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <MapPin size={14} /> Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Complemento
              </label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => atualizarCamposEString(rua, numero, e.target.value, bairro, municipio)}
                placeholder="Ex: Lote 01, Qd 27, Apto 102"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => atualizarCamposEString(rua, numero, complemento, e.target.value, municipio)}
                placeholder="Ex: São José do Imbassaí"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Município / UF
            </label>
            <input
              type="text"
              value={municipio}
              onChange={(e) => atualizarCamposEString(rua, numero, complemento, bairro, e.target.value)}
              placeholder="Ex: Maricá - RJ"
              className="w-full sm:w-1/2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Valor Mínimo de Pedido (R$)
            </label>
            <input
              type="text"
              value={formatarMoeda(pedidoMinimo)}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex justify-start pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleSalvarComPosicao}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} /> {loading ? 'A salvar...' : 'Salvar Alterações'}
            </button>
          </div>

        </div>

        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin size={15} className="text-amber-600" /> Posição da Loja no Mapa
            </span>
            <span className="text-[10px] text-slate-400">Arraste o pino para fixar</span>
          </div>

          <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 z-0">
            <MapContainer 
              center={currentPosition} 
              zoom={16} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <Marker 
                position={currentPosition} 
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const coords = marker.getLatLng();
                    handleMapClickOrDrag(coords.lat, coords.lng);
                  },
                }}
              />
              <CentralizadorMapa centro={currentPosition} />
              <LocalizadorCliques onSelecionarPonto={(lat, lng) => handleMapClickOrDrag(lat, lng)} />
            </MapContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Arraste o balão para fixar a localização exata do seu estabelecimento.
          </p>
        </div>

      </div>

    </div>
  );
}