import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Phone, Home } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    latitude: '',
    longitude: '',
  });

  const [loadingGeo, setLoadingGeo] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('geolocalização não é suportada pelo seu navegador.');
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
        alert('localização capturada com sucesso!');
      },
      (error) => {
        console.error(error);
        setLoadingGeo(false);
        alert('não foi possível obter a sua localização. verifique as permissões.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Guarda os dados no localStorage para utilizar nas compras
    localStorage.setItem('usuario_baguete', JSON.stringify(form));
    alert('cadastro realizado com sucesso!');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6 text-center">cadastro de cliente</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">nome</label>
            <input
              type="text"
              name="nome"
              required
              value={form.nome}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">sobrenome</label>
            <input
              type="text"
              name="sobrenome"
              required
              value={form.sobrenome}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">telefone / whatsapp</label>
          <input
            type="text"
            name="telefone"
            required
            value={form.telefone}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">rua</label>
            <input
              type="text"
              name="rua"
              required
              value={form.rua}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">número</label>
            <input
              type="text"
              name="numero"
              required
              value={form.numero}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">bairro</label>
          <input
            type="text"
            name="bairro"
            required
            value={form.bairro}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={capturarLocalizacao}
          className="w-full py-2 bg-slate-800 border border-amber-500/50 hover:border-amber-500 text-amber-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          {loadingGeo ? 'a obter localização...' : 'usar minha localização atual (gps)'}
        </button>

        {form.latitude && (
          <p className="text-[10px] text-emerald-400 text-center">
            localização fixa: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition mt-4"
        >
          salvar cadastro
        </button>
      </form>
    </div>
  );
};