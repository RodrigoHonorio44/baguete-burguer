import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Utensils, ClipboardList, DollarSign, Package, UserPlus, LogOut, LogIn, Clock, MapPin, Menu, X } from 'lucide-react';
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
  const [pedidosPendentesCount, setPedidosPendentesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    
    if (token) {
      setIsLoggedIn(true);
      const normalizedRole = role ? role.toLowerCase() : '';
      
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

  // Verificação de alertas para Cliente ou Administrador
  useEffect(() => {
    const verificarPedidos = async () => {
      try {
        const response = await api.getPedidos();
        const todosPedidos = Array.isArray(response) ? response : response?.data || [];

        // Filtra apenas pedidos do DIA ATUAL
        const hoje = new Date().toISOString().split('T')[0];

        if (isAdmin) {
          const ativos = todosPedidos.filter(p => {
            const dataBruta = p.criadoEm || p.createdAt;
            if (!dataBruta) return false;
            const dataPedido = new Date(typeof dataBruta === 'object' && dataBruta.$date ? dataBruta.$date : dataBruta).toISOString().split('T')[0];
            if (dataPedido !== hoje) return false;

            const status = (p.status || 'pendente').toLowerCase();
            return status === 'pendente';
          });

          setPedidosPendentesCount(ativos.length);
        } else if (isLoggedIn) {
          const savedUser = localStorage.getItem('user');
          if (!savedUser) return;
          const user = JSON.parse(savedUser);
          const userId = user.id || user._id;
          const userEmail = (user.email || '').toLowerCase().trim();
          const userNome = (user.nome || '').toLowerCase().trim();

          const meusPedidosDoDia = todosPedidos.filter((p) => {
            const dataBruta = p.criadoEm || p.createdAt;
            if (!dataBruta) return false;
            const dataPedido = new Date(typeof dataBruta === 'object' && dataBruta.$date ? dataBruta.$date : dataBruta).toISOString().split('T')[0];
            if (dataPedido !== hoje) return false;

            const pUserId = p.userId || p.cliente_id;
            const pEmail = (p.email || p.cliente_email || '').toLowerCase().trim();
            const pNome = (p.cliente_nome || p.nome || '').toLowerCase().trim();

            const matchId = userId && pUserId && String(pUserId) === String(userId);
            const matchEmail = userEmail && pEmail && pEmail === userEmail;
            const matchNome = userNome && pNome && pNome === userNome;

            return matchId || matchEmail || matchNome;
          });

          const temAtivosEmAndamento = meusPedidosDoDia.some(p => {
            const status = (p.status || 'pendente').toLowerCase();
            return ['pendente', 'preparo', 'pronto', 'enviado'].includes(status);
          });

          setTemAlertaPedidos(temAtivosEmAndamento);
        }
      } catch (error) {
        console.error('Erro ao verificar pedidos para alerta na Navbar:', error);
      }
    };

    verificarPedidos();
    const intervalo = setInterval(verificarPedidos, 6000);
    return () => clearInterval(intervalo);
  }, [isAdmin, isLoggedIn]);

  const handleLogout = () => {
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
        
        {/* Logo e Botão do Menu Mobile */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-amber-400 focus:outline-none"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2 text-amber-500 font-bold text-lg">
            <Utensils className="w-6 h-6" />
            <span>baguete burguer</span>
          </Link>
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-300 font-medium">
          <Link to="/" className="hover:text-amber-400 transition">cardápio</Link>
          
          {isAdmin ? (
            <>
              <Link to="/comandas" className="relative hover:text-amber-400 transition flex items-center gap-1">
                <ClipboardList className="w-4 h-4" /> comandas
                {pedidosPendentesCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                    {pedidosPendentesCount}
                  </span>
                )}
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
                  
                  {temAlertaPedidos && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                </Link>
              )}
              {/* O link de cadastro aparece sempre que o usuário não estiver logado */}
              {!isLoggedIn && (
                <Link to="/cadastro" className="hover:text-amber-400 transition flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> cadastro
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Ações à Direita (Carrinho e Sessão) */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Link 
              to="/comandas" 
              className="md:hidden relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700 flex items-center justify-center"
              title="Comandas"
            >
              <ClipboardList className="w-5 h-5 text-amber-500" />
              {pedidosPendentesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pedidosPendentesCount}
                </span>
              )}
            </Link>
          ) : (
            isLoggedIn && (
              <Link 
                to="/meus-pedidos" 
                className="md:hidden relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700 flex items-center justify-center"
                title="Meus Pedidos"
              >
                <Clock className="w-5 h-5 text-amber-500" />
                {temAlertaPedidos && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </Link>
            )
          )}

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

      {/* Menu Desdobrável para Versão Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2 text-sm text-slate-300 font-medium">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
          >
            cardápio
          </Link>

          {isAdmin ? (
            <>
              <Link 
                to="/comandas" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-500" /> comandas
                </span>
                {pedidosPendentesCount > 0 && (
                  <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pedidosPendentesCount} novos
                  </span>
                )}
              </Link>
              <Link 
                to="/caixa" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
              >
                <DollarSign className="w-4 h-4 text-amber-500" /> caixa
              </Link>
              <Link 
                to="/admin/produtos" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
              >
                <Package className="w-4 h-4 text-amber-500" /> produtos
              </Link>
              <Link 
                to="/configuracoes/entrega" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 transition"
              >
                <MapPin className="w-4 h-4" /> raio de entrega
              </Link>
            </>
          ) : (
            <>
              {isLoggedIn && (
                <Link 
                  to="/meus-pedidos" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" /> meus pedidos
                  </span>
                  {temAlertaPedidos && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </Link>
              )}
              {!isLoggedIn && (
                <Link 
                  to="/cadastro" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
                >
                  <UserPlus className="w-4 h-4 text-amber-500" /> cadastro
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;