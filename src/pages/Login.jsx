import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Utensils, Phone, Lock, ArrowLeft } from 'lucide-react';
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
      const data = await api.login(telefone, senha);

      const userRole = data.user?.role || data.role || 'cliente';
      localStorage.setItem('token', data.token || data.user?.id || 'ativo');
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (userRole === 'entregador' || userRole === 'motoboy') {
        localStorage.setItem('motoboy_nome', data.user?.nome || 'Entregador');
      }

      toast.success(`Bem-vindo de volta, ${data.user?.nome || 'Utilizador'}!`);

      const pendingItem = sessionStorage.getItem('pending_cart_item');
      const redirectPath = sessionStorage.getItem('redirect_after_auth');

      if (pendingItem && redirectPath) {
        sessionStorage.removeItem('pending_cart_item');
        sessionStorage.removeItem('redirect_after_auth');
        navigate(redirectPath);
        window.location.reload();
        return;
      }

      if (userRole === 'admin' || userRole === 'adm' || userRole === 'root') {
        navigate('/comandas');
      } else if (userRole === 'entregador' || userRole === 'motoboy') {
        navigate('/motoboy');
      } else {
        navigate('/');
      }

      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm transition-all">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Entrar na Conta</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Introduza as suas credenciais para continuar</p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Telemóvel / Telefone / Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="21975980310"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Palavra-passe / Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 text-sm cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        {/* Links de Acesso Rápido */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold">
          <Link to="/cadastro" className="text-slate-500 hover:text-amber-600 transition">
            Não tem uma conta? <span className="font-bold text-amber-600">Cadastre-se</span>
          </Link>
          <Link to="/recuperar-senha" className="text-slate-500 hover:text-amber-600 transition">
            Esqueceu a senha?
          </Link>
        </div>

        {/* Retorno ao Cardápio */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition">
            <ArrowLeft className="w-4 h-4" /> Voltar para o cardápio principal
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;