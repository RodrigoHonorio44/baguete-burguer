import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ClipboardList, DollarSign, Package, UserPlus, LogOut, LogIn, Clock, MapPin, Menu, X } from 'lucide-react';
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

  // Estados para gerir o status e o horário da loja na Navbar
  const [configLoja, setConfigLoja] = useState({
    horarioAbertura: '08:00',
    horarioFechamento: '23:30',
    diasFuncionamento: {}
  });

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

  // Carregar as configurações da loja para o status em tempo real
  useEffect(() => {
    const carregarConfig = async () => {
      try {
        if (typeof api.getConfiguracoesLoja === 'function') {
          const dadosServer = await api.getConfiguracoesLoja();
          if (dadosServer && Object.keys(dadosServer).length > 0) {
            setConfigLoja(dadosServer);
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar config da loja:', err);
      }
      const salvo = localStorage.getItem('configuracoes_loja');
      if (salvo) {
        try { setConfigLoja(JSON.parse(salvo)); } catch (e) {}
      }
    };
    carregarConfig();
  }, []);

  // Cálculo automático se a loja está aberta
  const calcularStatusAutomatico = () => {
    const agora = new Date();
    const diasSemanaMap = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaAtualStr = diasSemanaMap[agora.getDay()];
    const diasFuncionamento = configLoja.diasFuncionamento || {};
    
    if (diasFuncionamento[diaAtualStr] === false) return false;

    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
    const [hAb, mAb] = (configLoja.horarioAbertura || '08:00').split(':').map(Number);
    const minAbertura = hAb * 60 + mAb;

    const [hFech, mFech] = (configLoja.horarioFechamento || '23:30').split(':').map(Number);
    const minFechamento = hFech * 60 + mFech;

    return horaAtualMinutos >= minAbertura && horaAtualMinutos <= minFechamento;
  };

  const lojaAberta = calcularStatusAutomatico();

  // Verificação de alertas para pedidos
  useEffect(() => {
    const verificarPedidos = async () => {
      try {
        const response = await api.getPedidos();
        const todosPedidos = Array.isArray(response) ? response : response?.data || [];
        const hoje = new Date().toISOString().split('T')[0];

        if (isAdmin) {
          const ativos = todosPedidos.filter(p => {
            const dataBruta = p.criadoEm || p.createdAt;
            if (!dataBruta) return false;
            const dataPedido = new Date(dataBruta).toISOString().split('T')[0];
            return dataPedido === hoje && (p.status || 'pendente').toLowerCase() === 'pendente';
          });
          setPedidosPendentesCount(ativos.length);
        } else if (isLoggedIn) {
          const savedUser = localStorage.getItem('user');
          if (!savedUser) return;
          const user = JSON.parse(savedUser);
          const userId = user.id || user._id;

          const meusPedidosDoDia = todosPedidos.filter((p) => {
            const dataBruta = p.criadoEm || p.createdAt;
            if (!dataBruta) return false;
            const dataPedido = new Date(dataBruta).toISOString().split('T')[0];
            if (dataPedido !== hoje) return false;
            const pUserId = p.userId || p.cliente_id;
            return userId && pUserId && String(pUserId) === String(userId);
          });

          const temAtivosEmAndamento = meusPedidosDoDia.some(p => {
            const status = (p.status || 'pendente').toLowerCase();
            return ['pendente', 'preparo', 'pronto', 'enviado'].includes(status);
          });
          setTemAlertaPedidos(temAtivosEmAndamento);
        }
      } catch (error) {
        console.error('Erro ao verificar pedidos:', error);
      }
    };

    verificarPedidos();
    const intervalo = setInterval(verificarPedidos, 6000);
    return () => clearInterval(intervalo);
  }, [isAdmin, isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAdmin(false);
    setIsLoggedIn(false);
    toast.success('Sessão encerrada com sucesso!');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        
        {/* Logo Tay Mix e Status/Horário da Loja */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-amber-400 focus:outline-none"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-white p-1 rounded-full border-3 border-amber-500 shadow-xl flex items-center justify-center shrink-0">
              <img
                src="/logoaçai.jpg"
                alt="Tay Mix Açaí"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover transition-transform group-hover:scale-105 shadow-inner"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl md:text-3xl text-amber-400 tracking-tight leading-none capitalize drop-shadow-md">
                tay mix
              </span>
              <span className="text-xs md:text-sm text-slate-100 font-bold tracking-wide mt-1.5">
                açaí cremoso & delivery
              </span>
            </div>
          </Link>

          {/* Badge de Status da Loja na Navbar */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl ml-4 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              {lojaAberta && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${lojaAberta ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`font-extrabold ${lojaAberta ? 'text-emerald-400' : 'text-rose-400'}`}>
              {lojaAberta ? 'ABERTO' : 'FECHADO'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-amber-500" /> {configLoja.horarioAbertura} às {configLoja.horarioFechamento}
            </span>
          </div>
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
              {!isLoggedIn && (
                <Link to="/cadastro" className="hover:text-amber-400 transition flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> cadastro
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Ações à Direita */}
        <div className="flex items-center gap-3">
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

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2 text-sm text-slate-300 font-medium">
          <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg text-xs mb-2">
            <span className={`font-bold ${lojaAberta ? 'text-emerald-400' : 'text-rose-400'}`}>
              {lojaAberta ? '● Aberto Agora' : '● Fechado'}
            </span>
            <span className="text-slate-300">{configLoja.horarioAbertura} às {configLoja.horarioFechamento}</span>
          </div>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
            cardápio
          </Link>
          {isAdmin ? (
            <>
              <Link to="/comandas" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
                <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-500" /> comandas</span>
                {pedidosPendentesCount > 0 && <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">{pedidosPendentesCount} novos</span>}
              </Link>
              <Link to="/caixa" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
                <DollarSign className="w-4 h-4 text-amber-500" /> caixa
              </Link>
              <Link to="/admin/produtos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
                <Package className="w-4 h-4 text-amber-500" /> produtos
              </Link>
              <Link to="/configuracoes/entrega" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 text-amber-400 transition">
                <MapPin className="w-4 h-4" /> raio de entrega
              </Link>
            </>
          ) : (
            <>
              {isLoggedIn && (
                <Link to="/meus-pedidos" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> meus pedidos</span>
                </Link>
              )}
              {!isLoggedIn && (
                <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition">
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