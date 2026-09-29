import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MapPin, UserPlus, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    senha: '',
    rua: '',
    numero: '',
    bairro: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLoadingGeo(false);
        toast.success('Localização capturada com sucesso!');
      },
      (error) => {
        console.error(error);
        setLoadingGeo(false);
        toast.error('Não foi possível obter a sua localização.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nomeCompleto = `${form.nome} ${form.sobrenome}`;
      
      // Regista o utilizador na API
      const data = await api.register({
        nome: nomeCompleto,
        telefone: form.telefone,
        senha: form.senha,
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        latitude: form.latitude,
        longitude: form.longitude,
        role: 'cliente'
      });

      // Salva automaticamente a sessão no localStorage para já entrar logado
      const userData = data.user || {
        nome: nomeCompleto,
        telefone: form.telefone,
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        latitude: form.latitude,
        longitude: form.longitude,
        role: 'cliente'
      };

      localStorage.setItem('token', data.token || userData.id || 'ativo');
      localStorage.setItem('role', 'cliente');
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Cadastro realizado com sucesso!');

      // Se veio do checkout, retorna para lá. Senão, vai para o cardápio/home.
      const redirectTo = location.state?.fromCheckout ? '/checkout' : '/';
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl mb-2">
          <UserPlus className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Cadastro de Cliente</h1>
        <p className="text-sm text-slate-400 mt-1">Crie a sua conta para finalizar o pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              name="nome"
              required
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: João"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Sobrenome</label>
            <input
              type="text"
              name="sobrenome"
              required
              value={form.sobrenome}
              onChange={handleChange}
              placeholder="Ex: Silva"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Telefone / WhatsApp</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="telefone"
              required
              value={form.telefone}
              onChange={handleChange}
              placeholder="21975980310"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Palavra-passe / Senha</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="senha"
              required
              value={form.senha}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Rua</label>
            <input
              type="text"
              name="rua"
              required
              value={form.rua}
              onChange={handleChange}
              placeholder="Nome da rua"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Número</label>
            <input
              type="text"
              name="numero"
              required
              value={form.numero}
              onChange={handleChange}
              placeholder="123"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Bairro</label>
          <input
            type="text"
            name="bairro"
            required
            value={form.bairro}
            onChange={handleChange}
            placeholder="Nome do bairro"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={capturarLocalizacao}
          className="w-full py-2.5 bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          {loadingGeo ? 'A obter localização...' : 'Usar minha localização atual (GPS)'}
        </button>

        {form.latitude && (
          <p className="text-[10px] text-emerald-400 text-center">
            Localização GPS capturada com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition mt-4 text-sm shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'A registar...' : 'Salvar Cadastro e Continuar'}
        </button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-400 hover:text-amber-400 transition">
            Já tem uma conta? <span className="underline">Faça login</span>
          </Link>
        </div>
      </form>
    </div>
  );
};