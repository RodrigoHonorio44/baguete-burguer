import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Utensils, ClipboardList, DollarSign, Package, UserPlus, LogOut, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    
    if (token) {
      setIsLoggedIn(true);
      if (role === 'admin' || role === 'adm') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsAdmin(false);
    setIsLoggedIn(false);
    toast.success('Sessão encerrada com sucesso!');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-amber-500 font-bold text-lg">
          <Utensils className="w-6 h-6" />
          <span>baguete burguer</span>
        </Link>

        {/* Navegação condicional baseada no perfil */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <Link to="/" className="hover:text-amber-400 transition">cardápio</Link>
          
          {isAdmin ? (
            <>
              <Link to="/comandas" className="hover:text-amber-400 transition flex items-center gap-1">
                <ClipboardList className="w-4 h-4" /> comandas
              </Link>
              <Link to="/caixa" className="hover:text-amber-400 transition flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> caixa
              </Link>
              <Link to="/admin/produtos" className="hover:text-amber-400 transition flex items-center gap-1">
                <Package className="w-4 h-4" /> produtos
              </Link>
            </>
          ) : (
            <Link to="/cadastro" className="hover:text-amber-400 transition flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> cadastro
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Botão de Carrinho */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700 flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold hidden sm:inline">carrinho</span>
            {totalItens > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </button>

          {/* Botão Dinâmico: Sair (se logado) ou Entrar (se deslogado) */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-lg transition border border-rose-900/50 flex items-center gap-1 text-xs font-medium"
              title="terminar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">sair</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg transition border border-slate-700 flex items-center gap-1 text-xs font-medium"
              title="entrar na conta"
            >
              <LogIn className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};