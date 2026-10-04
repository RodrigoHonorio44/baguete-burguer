import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { Store, Clock, MapPin, Power, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
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
  const [isOnline, setIsOnline] = useState(true); // Botão manual de abrir/fechar
  
  const [modoMapa, setModoMapa] = useState('loja');

  const [faixasRaio, setFaixasRaio] = useState([
    { id: 1, ativo: true, km: 3, taxa: 5.00, cor: '#10b981', fixo: false, posicao: null },   
    { id: 2, ativo: true, km: 6, taxa: 9.00, cor: '#3b82f6', fixo: false, posicao: null },   
    { id: 3, ativo: false, km: 9, taxa: 14.00, cor: '#f59e0b', fixo: false, posicao: null },   
    { id: 4, ativo: false, km: 12, taxa: 20.00, cor: '#ef4444', fixo: false, posicao: null }, 
  ]);

  const [zonasProibidas, setZonasProibidas] = useState([]);
  const [horarioAbertura, setHorarioAbertura] = useState('18:00');
  const [horarioFechamento, setHorarioFechamento] = useState('23:30');
  const [diasFuncionamento, setDiasFuncionamento] = useState({
    segunda: false, terça: true, quarta: true, quinta: true, sexta: true, sabado: true, domingo: true,
  });

  const [loading, setLoading] = useState(false);

  // Função auxiliar para verificar se a loja deveria estar aberta com base no dia e hora atuais
  const verificarStatusAutomatico = (abertura, fechamento, dias) => {
    const agora = new Date();
    const diasSemanaMap = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaAtualStr = diasSemanaMap[agora.getDay()];

    // Valida se o dia atual está ativo
    if (!dias[diaAtualStr]) return false;

    // Valida o horário
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
    
    const [hAb, mAb] = abertura.split(':').map(Number);
    const minAbertura = hAb * 60 + mAb;

    const [hFech, mFech] = fechamento.split(':').map(Number);
    const minFechamento = hFech * 60 + mFech;

    // Se o fechamento for no dia seguinte (ex: 02:00), a lógica pode ser adaptada, 
    // mas considerando o intervalo normal do mesmo dia:
    return horaAtualMinutos >= minAbertura && horaAtualMinutos <= minFechamento;
  };

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
    
    // Se o status manual estiver salvo, respeita ele; caso contrário, calcula pelo horário
    if (dados.isOnline !== undefined) {
      setIsOnline(dados.isOnline);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);

    const config = {
      lojaNome, endereco, posicaoLoja, faixasRaio, zonasProibidas,
      isOnline, horarioAbertura, horarioFechamento, diasFuncionamento
    };

    try {
      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja(config);
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes(config);
      }

      localStorage.setItem('configuracoes_loja', JSON.stringify(config));
      toast.success('Configurações salvas com sucesso na coleção configuracoes_loja!');
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
      isOnline: novoStatus, horarioAbertura, horarioFechamento, diasFuncionamento
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Store className="text-amber-500" /> Gestão Avançada de Raios Independentes
          </h1>
          <p className="text-sm text-slate-400">Fixe a posição da loja como referência, desvincule e posicione cada raio individualmente no mapa.</p>
        </div>

        <button
          type="button"
          onClick={handleToggleLojaStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
            isOnline 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' 
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
          }`}
        >
          <Power size={16} />
          {isOnline ? 'LOJA ONLINE (Forçado / Aberto)' : 'LOJA OFFLINE (Fechada Manualmente)'}
        </button>
      </div>

      <form onSubmit={handleSalvar} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel Esquerdo */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} /> Referência da Loja
            </h2>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O marcador principal da loja serve como sua âncora fixa para cálculo de quilometragem e referência visual.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Faixas de Raio Independentes</span>
            </h2>
            
            <div className="space-y-3">
              {faixasRaio.map((faixa, index) => (
                <div key={faixa.id} className={`border p-2.5 rounded-xl transition ${faixa.ativo ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: faixa.cor }}></span>
                      <span className="text-xs font-bold text-slate-200">Raio {index + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title={faixa.fixo ? 'Centro fixado independentemente' : 'Seguindo centro da loja'}
                        onClick={() => alternarFixarRaio(index)}
                        className={`p-1 rounded text-[10px] font-bold cursor-pointer border ${
                          faixa.fixo ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {faixa.fixo ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => atualizarFaixa(index, 'ativo', !faixa.ativo)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          faixa.ativo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {faixa.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {faixa.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">Distância (Km)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={faixa.km}
                        disabled={!faixa.ativo}
                        onChange={(e) => atualizarFaixa(index, 'km', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Taxa (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={faixa.taxa}
                        disabled={!faixa.ativo}
                        onChange={(e) => atualizarFaixa(index, 'taxa', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={15} /> Áreas Proibidas (Km)
            </h2>
            
            {zonasProibidas.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Nenhuma zona bloqueada. Selecione "🚫 Adicionar Zona Proibida" e clique no mapa.</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {zonasProibidas.map((z, idx) => (
                  <div key={z.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">Zona Bloqueada #{idx + 1}</span>
                      <button type="button" onClick={() => removerZona(z.id)} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Raio de Bloqueio (Km)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="15"
                        value={z.raioKm}
                        onChange={(e) => atualizarZonaProibida(z.id, 'raioKm', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-rose-300 font-bold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} /> Funcionamento
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={horarioAbertura} onChange={(e) => setHorarioAbertura(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200" />
              <input type="time" value={horarioFechamento} onChange={(e) => setHorarioFechamento(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] pt-1">
              {Object.keys(diasFuncionamento).map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDia(dia)}
                  className={`py-1 rounded border font-medium capitalize transition cursor-pointer ${
                    diasFuncionamento[dia] ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-600'
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
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs"
          >
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>

        </div>

        {/* Painel Direito: Mapa Interativo */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col shadow-md">
          
          <div className="flex flex-col gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-300">Escolha o que deseja posicionar ou alterar ao clicar no mapa:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setModoMapa('loja')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  modoMapa === 'loja' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    modoMapa === `raio_${idx}` ? 'text-slate-950 border-white' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  style={{ backgroundColor: modoMapa === `raio_${idx}` ? f.cor : undefined }}
                >
                  🔵 Mover Centro Raio {idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setModoMapa('bloqueio')}
                className={`px-3 py-1 nested-btn px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  modoMapa === 'bloqueio' ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🚫 Adicionar Zona Proibida
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[550px] rounded-xl overflow-hidden border border-slate-800 z-0">
            <MapContainer 
              center={posicaoLoja} 
              zoom={12} 
              style={{ height: '100%', width: '100%', background: '#090d16' }}
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