import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Utensils, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const Login = () => {
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utiliza a função de login centralizada no api.js
      const data = await api.login(telefone, senha);

      // Salva as credenciais no localStorage que a Navbar e o restante do app lêem
      localStorage.setItem('token', data.user?.id || data.token || 'ativo');
      localStorage.setItem('role', data.user?.role || 'adm');

      toast.success(`Bem-vindo de volta, ${data.user?.nome || 'Administrador'}!`);
      navigate('/');
      window.location.reload(); // Recarrega para atualizar a Navbar instantaneamente
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Área Administrativa</h1>
          <p className="text-sm text-slate-400 mt-1">Entre com as suas credenciais para aceder ao painel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Telemóvel / Telefone / Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="21975980310"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Palavra-passe / Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50 text-sm cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'A entrar...' : 'Entrar na Administração'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-amber-400 transition">
            ← Voltar para o cardápio principal
          </Link>
        </div>
      </div>
    </div>
  );
};