import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Utensils, ClipboardList, DollarSign, Package, UserPlus, LogOut, LogIn, Clock, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [temAlertaPedidos, setTemAlertaPedidos] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    
    if (token) {
      setIsLoggedIn(true);
      const normalizedRole = role ? role.toLowerCase() : '';
      
      // Libera o menu administrativo para root, admin ou adm
      if (['root', 'admin', 'adm'].includes(normalizedRole)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  // Efeito para monitorizar os pedidos do cliente e acender o alerta se houver atualizações/pedidos ativos
  useEffect(() => {
    if (isAdmin || !isLoggedIn) return;

    const verificarPedidosDoCliente = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return;
        const user = JSON.parse(savedUser);
        const userId = user.id || user._id;
        const userEmail = (user.email || '').toLowerCase().trim();
        const userNome = (user.nome || '').toLowerCase().trim();

        const response = await api.getPedidos();
        const todosPedidos = Array.isArray(response) ? response : response?.data || [];

        // Filtra os pedidos do cliente logado usando a mesma lógica robusta
        const meusPedidos = todosPedidos.filter((p) => {
          const pUserId = p.userId || p.cliente_id;
          const pEmail = (p.email || p.cliente_email || '').toLowerCase().trim();
          const pNome = (p.cliente_nome || p.nome || '').toLowerCase().trim();

          const matchId = userId && pUserId && String(pUserId) === String(userId);
          const matchEmail = userEmail && pEmail && pEmail === userEmail;
          const matchNome = userNome && pNome && pNome === userNome;

          return matchId || matchEmail || matchNome;
        });

        // Alerta se houver pedidos pendentes, em preparo, prontos, enviados ou recentemente recusados
        const ativosOuAtualizados = meusPedidos.some(p => {
          const status = (p.status || '').toLowerCase();
          return ['pendente', 'preparo', 'pronto', 'enviado', 'recusado'].includes(status);
        });

        setTemAlertaPedidos(ativosOuAtualizados);
      } catch (error) {
        console.error('Erro ao verificar pedidos para alerta na Navbar:', error);
      }
    };

    verificarPedidosDoCliente();
    const intervalo = setInterval(verificarPedidosDoCliente, 10000); // Verifica a cada 10 segundos
    return () => clearInterval(intervalo);
  }, [isAdmin, isLoggedIn]);

  const handleLogout = () => {
    // Remove todas as chaves de autenticação e cache local
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('carrinho');
    
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
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-300 font-medium">
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
              <Link to="/configuracoes/entrega" className="hover:text-amber-400 transition flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <MapPin className="w-4 h-4" /> raio de entrega
              </Link>
            </>
          ) : (
            <>
              {isLoggedIn && (
                <Link to="/meus-pedidos" className="relative hover:text-amber-400 transition flex items-center gap-1">
                  <Clock className="w-4 h-4" /> meus pedidos
                  
                  {/* Badge de Alerta Pulsante se houver pedidos ativos ou alterados */}
                  {temAlertaPedidos && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                </Link>
              )}
              <Link to="/cadastro" className="hover:text-amber-400 transition flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> cadastro
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Botão de Carrinho */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700 flex items-center gap-2 cursor-pointer"
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
              className="p-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-lg transition border border-rose-900/50 flex items-center gap-1 text-xs font-medium cursor-pointer"
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