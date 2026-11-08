import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { Store, Clock, MapPin, Power, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock, Unlock, Users } from 'lucide-react';
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

export function MapaRaioEntrega() {
  const [abaAtiva, setAbaAtiva] = useState('horarios');

  const [lojaNome, setLojaNome] = useState('Tay Mix');
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

  const [horariosDias, setHorariosDias] = useState({
    domingo: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    segunda: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    terca: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    quarta: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    quinta: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    sexta: { ativo: true, abertura: '18:15', fechamento: '22:00' },
    sabado: { ativo: true, abertura: '18:15', fechamento: '22:00' },
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
        console.error('Erro ao buscar configurações:', err);
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
    if (dados.lojaNome) setLojaNome(dados.lojaNome);
    if (dados.posicaoLoja) setPosicaoLoja(dados.posicaoLoja);
    if (dados.faixasRaio) setFaixasRaio(dados.faixasRaio);
    if (dados.zonasProibidas) setZonasProibidas(dados.zonasProibidas);
    if (dados.endereco) setEndereco(dados.endereco);
    if (dados.horariosDias) setHorariosDias(dados.horariosDias);
    if (dados.pedidoMinimo !== undefined) setPedidoMinimo(Number(dados.pedidoMinimo));
    if (dados.isOnline !== undefined) setIsOnline(dados.isOnline);
  };

  const handleSalvar = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const config = {
      lojaNome, endereco, posicaoLoja, faixasRaio, zonasProibidas,
      isOnline, horariosDias,
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
      isOnline: novoStatus, horariosDias,
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

  const atualizarHorarioDia = (dia, campo, valor) => {
    setHorariosDias(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const listaDias = [
    { key: 'domingo', label: 'Domingo', short: 'Dom' },
    { key: 'segunda', label: 'Segunda-Feira', short: 'Seg' },
    { key: 'terca', label: 'Terça-Feira', short: 'Ter' },
    { key: 'quarta', label: 'Quarta-Feira', short: 'Qua' },
    { key: 'quinta', label: 'Quinta-Feira', short: 'Qui' },
    { key: 'sexta', label: 'Sexta-Feira', short: 'Sex' },
    { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  ];

  return (
    <div className="w-full min-h-screen px-4 xl:px-12 py-6 text-slate-800 space-y-6">
      
      {/* CABEÇALHO */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-xs gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Store className="text-amber-600" /> Configurações Gerais — Tay Mix
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Gerenciamento completo de perfil, horários em grade visual, raios de entrega e regras operacionais.
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

      {/* GRID PRINCIPAL RESPONSIVO */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* MENU LATERAL (3 COLUNAS) */}
        <div className="xl:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1 w-full">
          <button
            onClick={() => setAbaAtiva('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              abaAtiva === 'perfil' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Store size={18} /> Perfil da Loja
          </button>

          <button
            onClick={() => setAbaAtiva('horarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              abaAtiva === 'horarios' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock size={18} /> Horários
          </button>

          <button
            onClick={() => setAbaAtiva('entrega')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              abaAtiva === 'entrega' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin size={18} /> Entrega & Mapa
          </button>

          <button
            onClick={() => setAbaAtiva('socios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              abaAtiva === 'socios' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={18} /> Sócios & Partilha
          </button>
        </div>

        {/* PAINEL DE CONTEÚDO (9 COLUNAS) */}
        <div className="xl:col-span-9 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs w-full">
          <form onSubmit={handleSalvar} className="space-y-6 w-full">

            {/* ABA 1: PERFIL */}
            {abaAtiva === 'perfil' && (
              <div className="space-y-6 w-full">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Informações Gerais & Pedido Mínimo</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Nome da Loja</label>
                    <input
                      type="text"
                      value={lojaNome}
                      onChange={(e) => setLojaNome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Endereço de Referência</label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2 md:col-span-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Valor Mínimo de Pedido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pedidoMinimo}
                      onChange={(e) => setPedidoMinimo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-emerald-700 font-extrabold focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">Defina o valor mínimo que o carrinho precisa atingir para liberar a finalização do delivery. Se for 0, não haverá limite.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: HORÁRIOS ESTILO IFOOD PROPORCIONAL */}
            {abaAtiva === 'horarios' && (
              <div className="space-y-6 w-full">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 w-full">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Configuração de Horários da Loja</h2>
                    <p className="text-xs text-slate-500">Configure os turnos de atendimento por dia com visualização em grade idêntica ao portal de entregas.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    {loading ? 'Salvando...' : 'Salvar Horários'}
                  </button>
                </div>

                <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start w-full">
                  
                  {/* ESQUERDA: DIAS DA SEMANA (5 COLUNAS) */}
                  <div className="2xl:col-span-5 space-y-3 w-full">
                    {listaDias.map(({ key, label }) => {
                      const diaInfo = horariosDias[key] || { ativo: false, abertura: '18:00', fechamento: '22:00' };

                      return (
                        <div key={key} className={`p-4 rounded-2xl border transition w-full ${diaInfo.ativo ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-50/70 border-slate-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{label}</span>
                              <span className={`text-[10px] font-bold ${diaInfo.ativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {diaInfo.ativo ? `Aberta das ${diaInfo.abertura} às ${diaInfo.fechamento}` : 'Loja fechada'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => atualizarHorarioDia(key, 'ativo', !diaInfo.ativo)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition ${
                                diaInfo.ativo ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {diaInfo.ativo ? 'Aberta' : 'Fechada'}
                            </button>
                          </div>

                          {diaInfo.ativo && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Abertura</label>
                                <input
                                  type="time"
                                  value={diaInfo.abertura}
                                  onChange={(e) => atualizarHorarioDia(key, 'abertura', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Fechamento</label>
                                <input
                                  type="time"
                                  value={diaInfo.fechamento}
                                  onChange={(e) => atualizarHorarioDia(key, 'fechamento', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* DIREITA: GRADE DE HORAS (7 COLUNAS PROPORCIONAIS) */}
                  <div className="2xl:col-span-7 bg-slate-50 border border-slate-200 p-4 rounded-2xl w-full">
                    <div className="w-full">
                      <div className="grid grid-cols-7 gap-2 text-center border-b border-slate-200 pb-2 mb-2 w-full">
                        {listaDias.map(({ key, short }) => {
                          const ativo = horariosDias[key]?.ativo;
                          return (
                            <div key={key} className="space-y-0.5">
                              <span className="text-xs font-black text-slate-800 block">{short}</span>
                              <span className={`text-[9px] font-bold block ${ativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {ativo ? 'Aberta' : 'Fechada'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 w-full">
                        {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((hora) => (
                          <div key={hora} className="grid grid-cols-7 gap-2 items-center w-full">
                            {listaDias.map(({ key }) => {
                              const dia = horariosDias[key];
                              const horaAberturaNum = dia?.ativo ? parseInt(dia.abertura.split(':')[0]) : -1;
                              const horaFechamentoNum = dia?.ativo ? parseInt(dia.fechamento.split(':')[0]) : -1;
                              const estaAbertoNestaHora = dia?.ativo && hora >= horaAberturaNum && hora < horaFechamentoNum;

                              return (
                                <div 
                                  key={key} 
                                  className={`h-11 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                                    estaAbertoNestaHora 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs' 
                                      : 'bg-white text-slate-300 border border-slate-200/60'
                                  }`}
                                >
                                  {estaAbertoNestaHora ? `${dia.abertura}-${dia.fechamento}` : ''}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ABA 3: ENTREGA & MAPA */}
            {abaAtiva === 'entrega' && (
              <div className="space-y-6 w-full">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Gestão de Raios e Zonas de Entrega</h2>

                <div className="space-y-3 w-full">
                  <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Faixas de Raio Independentes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {faixasRaio.map((faixa, index) => (
                      <div key={faixa.id} className={`border p-3.5 rounded-xl transition w-full ${faixa.ativo ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: faixa.cor }}></span>
                            <span className="text-xs font-bold text-slate-800">Raio {index + 1}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
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
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
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
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-emerald-700 font-bold focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 w-full">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={15} /> Áreas Proibidas (Km)
                  </h3>
                  
                  {zonasProibidas.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic font-medium">Nenhuma zona bloqueada. Selecione "🚫 Adicionar Zona Proibida" e clique no mapa.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto w-full">
                      {zonasProibidas.map((z, idx) => (
                        <div key={z.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-2 text-xs w-full">
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
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-rose-700 font-bold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 w-full">
                  <span className="text-xs font-bold text-slate-700 block">Escolha o que deseja posicionar ou alterar ao clicar no mapa:</span>
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
                        🔵 Mover Raio {idx + 1}
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

                  <div className="h-[540px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 shadow-2xs">
                    <MapContainer 
                      center={posicaoLoja} 
                      zoom={12} 
                      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                    >
                      <TileLayer
                        attribution='© OpenStreetMap contributors'
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
              </div>
            )}

            {/* ABA 4: SÓCIOS & PARTILHA */}
            {abaAtiva === 'socios' && (
              <div className="space-y-4 w-full">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Sócios e Partilha (50% / 50%)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Sócio 1</span>
                    <span className="text-xs font-black text-slate-900">Erica Oliveira dos Santos</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Sócio 2 / Gestão</span>
                    <span className="text-xs font-black text-slate-900">Tatiane / Rodrigo da Silva</span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTÃO DE SALVAR GERAL */}
            {abaAtiva !== 'horarios' && (
              <div className="pt-6 border-t border-slate-100 flex justify-end w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs text-xs"
                >
                  <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}

export default MapaRaioEntrega;