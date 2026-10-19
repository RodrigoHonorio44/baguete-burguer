import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, UserPlus, Phone, Lock, Loader2, Eye, EyeOff, Navigation } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';

// Imports para o Mapa Interativo (Leaflet)
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para atualizar a vista do mapa
const CentralizadorMapa = ({ centro }) => {
  const map = useMap();
  useEffect(() => {
    if (centro) {
      map.setView(centro, 16);
    }
  }, [centro, map]);
  return null;
};

// Componente auxiliar para capturar cliques no mapa
const LocalizadorCliques = ({ onSelecionarPonto }) => {
  useMapEvents({
    click(e) {
      onSelecionarPonto(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const Register = () => {
  const {
    form,
    loading,
    loadingGeo,
    buscandoEndereco,
    mostrarSenha,
    coordsMapa,
    setMostrarSenha,
    handleChange,
    handleSubmit,
    capturarLocalizacaoGPS,
    lidarComNovaLocalizacao,
  } = useRegister();

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl mb-2">
          <UserPlus className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cadastro de Cliente</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Crie a sua conta segura para finalizar o pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              name="nome"
              required
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: João"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Sobrenome</label>
            <input
              type="text"
              name="sobrenome"
              required
              value={form.sobrenome}
              onChange={handleChange}
              placeholder="Ex: Silva"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Telefone / WhatsApp (Apenas números)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="telefone"
              required
              maxLength={11}
              value={form.telefone}
              onChange={handleChange}
              placeholder="21975980310"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Insira o DDD + Número (Ex: 21999999999)</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Palavra-passe / Senha (Mín. 6 caracteres)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={mostrarSenha ? "text" : "password"}
              name="senha"
              required
              minLength={6}
              value={form.senha}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SEÇÃO DO MAPA INTERATIVO COM AUTOPREENCHIMENTO */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              📍 Marque sua casa no mapa:
              {buscandoEndereco && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
            </label>
            <button
              type="button"
              onClick={capturarLocalizacaoGPS}
              disabled={loadingGeo}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-[11px] font-bold rounded-lg transition border border-amber-300/60 flex items-center gap-1 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              {loadingGeo ? 'A obter...' : 'Meu GPS 🎯'}
            </button>
          </div>

          <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 z-0 shadow-2xs">
            <MapContainer 
              center={coordsMapa} 
              zoom={15} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coordsMapa} />
              <CentralizadorMapa centro={coordsMapa} />
              <LocalizadorCliques onSelecionarPonto={(lat, lng) => lidarComNovaLocalizacao(lat, lng)} />
            </MapContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-medium">
            Clique no mapa ou use o GPS para preencher o endereço automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Rua</label>
            <input
              type="text"
              name="rua"
              required
              value={form.rua}
              onChange={handleChange}
              placeholder="Nome da rua"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Número</label>
            <input
              type="text"
              name="numero"
              required
              value={form.numero}
              onChange={handleChange}
              placeholder="123"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Bairro</label>
          <input
            type="text"
            name="bairro"
            required
            value={form.bairro}
            onChange={handleChange}
            placeholder="Nome do bairro"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Ponto de Referência (Opcional)</label>
          <input
            type="text"
            name="referencia"
            value={form.referencia}
            onChange={handleChange}
            placeholder="Ex: Próximo à padaria, portão preto"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white font-medium transition"
          />
        </div>

        {form.latitude && (
          <p className="text-[10px] text-emerald-600 text-center font-bold">
            ✔ Localização e endereço sincronizados com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition mt-4 text-sm shadow-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? 'A registar...' : 'Salvar Cadastro e Continuar'}
        </button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition">
            Já tem uma conta? <span className="underline font-bold text-amber-600">Faça login</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;