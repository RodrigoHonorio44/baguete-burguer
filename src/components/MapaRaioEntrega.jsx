import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { Store, Clock, MapPin, Power, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock, Unlock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ modo, posicaoLoja, setPosicaoLoja, faixasRaio, setFaixasRaio, adicionarZonaProibida }) {
  useMapEvents({
    click(e) {
      if (modo === 'loja') {
        setPosicaoLoja([e.latlng.lat, e.latlng.lng]);
        toast.success('Posição da loja atualizada!');
      } else if (modo.startsWith('raio_')) {
        const index = parseInt(modo.split('_')[1]);
        const novasFaixas = [...faixasRaio];
        novasFaixas[index].posicao = [e.latlng.lat, e.latlng.lng];
        novasFaixas[index].fixo = true;
        setFaixasRaio(novasFaixas);
        toast.success(`Centro do Raio ${index + 1} posicionado independentemente!`);
      } else if (modo === 'bloqueio') {
        adicionarZonaProibida([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export const MapaRaioEntrega = () => {
  const [lojaNome, setLojaNome] = useState('Baguete Burguer');
  const [endereco, setEndereco] = useState('Maricá, RJ');
  const [posicaoLoja, setPosicaoLoja] = useState([-22.9194, -42.8186]); 
  const [isOnline, setIsOnline] = useState(true);
  const [pedidoMinimo, setPedidoMinimo] = useState(20.00); 
  
  const [modoMapa, setModoMapa] = useState('loja');

  const [faixasRaio, setFaixasRaio] = useState([
    { id: 1, ativo: true, km: 3, taxa: 5.00, cor: '#10b981', fixo: false, posicao: null },   
    { id: 2, ativo: true, km: 6, taxa: 9.00, cor: '#2563eb', fixo: false, posicao: null },   
    { id: 3, ativo: false, km: 9, taxa: 14.00, cor: '#d97706', fixo: false, posicao: null },   
    { id: 4, ativo: false, km: 12, taxa: 20.00, cor: '#dc2626', fixo: false, posicao: null }, 
  ]);

  const [zonasProibidas, setZonasProibidas] = useState([]);
  const [horarioAbertura, setHorarioAbertura] = useState('18:00');
  const [horarioFechamento, setHorarioFechamento] = useState('23:30');
  const [diasFuncionamento, setDiasFuncionamento] = useState({
    segunda: false, terça: true, quarta: true, quinta: true, sexta: true, sabado: true, domingo: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        let dadosServer = null;
        if (typeof api.getConfiguracoesLoja === 'function') {
          dadosServer = await api.getConfiguracoesLoja();
        } else if (typeof api.getConfiguracoes === 'function') {
          dadosServer = await api.getConfiguracoes();
        }

        if (dadosServer) {
          preencherEstados(dadosServer);
          return;
        }
      } catch (err) {
        console.error('Erro ao buscar configurações da coleção no servidor:', err);
      }

      const configSalva = localStorage.getItem('configuracoes_loja');
      if (configSalva) {
        try {
          preencherEstados(JSON.parse(configSalva));
        } catch (e) {
          console.error('Erro ao carregar dados locais:', e);
        }
      }
    };

    carregarConfiguracoes();
  }, []);

  const preencherEstados = (dados) => {
    if (dados.posicaoLoja) setPosicaoLoja(dados.posicaoLoja);
    if (dados.faixasRaio) setFaixasRaio(dados.faixasRaio);
    if (dados.zonasProibidas) setZonasProibidas(dados.zonasProibidas);
    if (dados.endereco) setEndereco(dados.endereco);
    if (dados.horarioAbertura) setHorarioAbertura(dados.horarioAbertura);
    if (dados.horarioFechamento) setHorarioFechamento(dados.horarioFechamento);
    if (dados.diasFuncionamento) setDiasFuncionamento(dados.diasFuncionamento);
    if (dados.pedidoMinimo !== undefined) setPedidoMinimo(Number(dados.pedidoMinimo));
    if (dados.isOnline !== undefined) {
      setIsOnline(dados.isOnline);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);

    const config = {
      lojaNome, endereco, posicaoLoja, faixasRaio, zonasProibidas,
      isOnline, horarioAbertura, horarioFechamento, diasFuncionamento,
      pedidoMinimo: Number(pedidoMinimo) || 0
    };

    try {
      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja(config);
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes(config);
      }

      localStorage.setItem('configuracoes_loja', JSON.stringify(config));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações no servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLojaStatus = async () => {
    const novoStatus = !isOnline;
    setIsOnline(novoStatus);

    const config = {
      lojaNome, endereco, posicaoLoja, faixasRaio, zonasProibidas,
      isOnline: novoStatus, horarioAbertura, horarioFechamento, diasFuncionamento,
      pedidoMinimo: Number(pedidoMinimo) || 0
    };

    try {
      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja(config);
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes(config);
      }
      localStorage.setItem('configuracoes_loja', JSON.stringify(config));
      toast.success(novoStatus ? 'Loja aberta manualmente!' : 'Loja fechada manualmente!');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da loja.');
    }
  };

  const atualizarFaixa = (index, campo, valor) => {
    const novasFaixas = [...faixasRaio];
    novasFaixas[index][campo] = valor;
    setFaixasRaio(novasFaixas);
  };

  const alternarFixarRaio = (index) => {
    const novasFaixas = [...faixasRaio];
    const faixa = novasFaixas[index];
    
    if (!faixa.fixo) {
      faixa.posicao = faixa.posicao || [...posicaoLoja];
      faixa.fixo = true;
      toast.success(`Raio ${index + 1} fixado de forma independente.`);
    } else {
      faixa.fixo = false;
      faixa.posicao = null;
      toast.success(`Raio ${index + 1} agora acompanha a loja principal.`);
    }
    setFaixasRaio(novasFaixas);
  };

  const adicionarZonaProibida = (coords) => {
    if (zonasProibidas.length >= 6) {
      toast.error('Limite máximo de zonas atingido.');
      return;
    }
    const novaZona = {
      id: Date.now(),
      lat: coords[0],
      lng: coords[1],
      raioKm: 1.5 
    };
    setZonasProibidas([...zonasProibidas, novaZona]);
    toast.success('Zona proibida adicionada no mapa!');
  };

  const atualizarZonaProibida = (id, campo, valor) => {
    setZonasProibidas(zonasProibidas.map(z => z.id === id ? { ...z, [campo]: valor } : z));
  };

  const removerZona = (id) => {
    setZonasProibidas(zonasProibidas.filter(z => z.id !== id));
    toast.success('Zona proibida removida.');
  };

  const toggleDia = (dia) => {
    setDiasFuncionamento(prev => ({ ...prev, [dia]: !prev[dia] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Store className="text-amber-600" /> Gestão Avançada de Raios Independentes
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Fixe a posição da loja como referência, desvincule e posicione cada raio individualmente no mapa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleLojaStatus}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border shadow-2xs ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
          }`}
        >
          <Power size={16} />
          {isOnline ? 'LOJA ONLINE (Forçado / Aberto)' : 'LOJA OFFLINE (Fechada Manualmente)'}
        </button>
      </div>

      <form onSubmit={handleSalvar} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel Esquerdo */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} /> Referência da Loja
            </h2>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              O marcador principal da loja serve como sua âncora fixa para cálculo de quilometragem e referência visual.
            </p>
          </div>

          {/* Card de Configuração de Pedido Mínimo */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={15} /> Pedido Mínimo de Entrega
            </h2>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Valor Mínimo (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pedidoMinimo}
                onChange={(e) => setPedidoMinimo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-emerald-700 font-extrabold focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Defina o valor mínimo que o carrinho precisa atingir para liberar a finalização do delivery. Se for 0, não haverá limite.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
              <span>Faixas de Raio Independentes</span>
            </h2>
            
            <div className="space-y-3">
              {faixasRaio.map((faixa, index) => (
                <div key={faixa.id} className={`border p-3 rounded-xl transition ${faixa.ativo ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: faixa.cor }}></span>
                      <span className="text-xs font-bold text-slate-800">Raio {index + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title={faixa.fixo ? 'Centro fixado independentemente' : 'Seguindo centro da loja'}
                        onClick={() => alternarFixarRaio(index)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer border transition ${
                          faixa.fixo ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {faixa.fixo ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => atualizarFaixa(index, 'ativo', !faixa.ativo)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          faixa.ativo ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {faixa.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {faixa.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Distância (Km)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={faixa.km}
                        disabled={!faixa.ativo}
                        onChange={(e) => atualizarFaixa(index, 'km', parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Taxa (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={faixa.taxa}
                        disabled={!faixa.ativo}
                        onChange={(e) => atualizarFaixa(index, 'taxa', parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-emerald-700 font-bold focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={15} /> Áreas Proibidas (Km)
            </h2>
            
            {zonasProibidas.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic font-medium">Nenhuma zona bloqueada. Selecione "🚫 Adicionar Zona Proibida" e clique no mapa.</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {zonasProibidas.map((z, idx) => (
                  <div key={z.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-700 font-bold">Zona Bloqueada #{idx + 1}</span>
                      <button type="button" onClick={() => removerZona(z.id)} className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Raio de Bloqueio (Km)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="15"
                        value={z.raioKm}
                        onChange={(e) => atualizarZonaProibida(z.id, 'raioKm', parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-rose-700 font-bold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} /> Funcionamento
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={horarioAbertura} onChange={(e) => setHorarioAbertura(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-semibold" />
              <input type="time" value={horarioFechamento} onChange={(e) => setHorarioFechamento(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-semibold" />
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] pt-1">
              {Object.keys(diasFuncionamento).map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDia(dia)}
                  className={`py-1 rounded-lg border font-bold capitalize transition cursor-pointer ${
                    diasFuncionamento[dia] ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
          >
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>

        </div>

        {/* Painel Direito: Mapa Interativo */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col shadow-xs">
          
          <div className="flex flex-col gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700">Escolha o que deseja posicionar ou alterar ao clicar no mapa:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setModoMapa('loja')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  modoMapa === 'loja' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📍 Fixar Posição da Loja
              </button>

              {faixasRaio.map((f, idx) => f.ativo && (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    const novas = [...faixasRaio];
                    novas[idx].fixo = true;
                    if (!novas[idx].posicao) novas[idx].posicao = [...posicaoLoja];
                    setFaixasRaio(novas);
                    setModoMapa(`raio_${idx}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    modoMapa === `raio_${idx}` ? 'text-white border-slate-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  style={{ backgroundColor: modoMapa === `raio_${idx}` ? f.cor : undefined }}
                >
                  🔵 Mover Centro Raio {idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setModoMapa('bloqueio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  modoMapa === 'bloqueio' ? 'bg-rose-600 text-white border-rose-500 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🚫 Adicionar Zona Proibida
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[550px] rounded-xl overflow-hidden border border-slate-200/80 z-0 shadow-2xs">
            <MapContainer 
              center={posicaoLoja} 
              zoom={12} 
              style={{ height: '100%', width: '100%', background: '#f8fafc' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler 
                modo={modoMapa} 
                posicaoLoja={posicaoLoja}
                setPosicaoLoja={setPosicaoLoja} 
                faixasRaio={faixasRaio}
                setFaixasRaio={setFaixasRaio}
                adicionarZonaProibida={adicionarZonaProibida} 
              />

              <Marker 
                position={posicaoLoja} 
                draggable={true} 
                eventHandlers={{
                  dragend: (e) => {
                    const coord = e.target.getLatLng();
                    setPosicaoLoja([coord.lat, coord.lng]);
                  },
                }} 
              />

              {faixasRaio.map((faixa) => {
                if (!faixa.ativo) return null;
                const centroUsado = (faixa.fixo && faixa.posicao) ? faixa.posicao : posicaoLoja;

                return (
                  <Circle 
                    key={faixa.id}
                    center={centroUsado} 
                    radius={faixa.km * 1000} 
                    pathOptions={{ 
                      fillColor: faixa.cor, 
                      color: faixa.cor, 
                      weight: 2, 
                      fillOpacity: 0.15 
                    }} 
                  />
                );
              })}

              {zonasProibidas.map((z) => (
                <Circle
                  key={z.id}
                  center={[z.lat, z.lng]}
                  radius={z.raioKm * 1000}
                  pathOptions={{
                    fillColor: '#ef4444',
                    color: '#991b1b',
                    weight: 2,
                    fillOpacity: 0.5
                  }}
                />
              ))}

            </MapContainer>
          </div>
        </div>

      </form>
    </div>
  );
};

export default MapaRaioEntrega;