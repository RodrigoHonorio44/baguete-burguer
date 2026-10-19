import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ClipboardList, DollarSign, Package, UserPlus, LogOut, LogIn, Clock, MapPin, Menu, X, Calculator, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEntregador, setIsEntregador] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [temAlertaPedidos, setTemAlertaPedidos] = useState(false);
  const [pedidosPendentesCount, setPedidosPendentesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados para gerir o status, horário e dias de funcionamento
  const [configLoja, setConfigLoja] = useState({
    horarioAbertura: '08:00',
    horarioFechamento: '23:30',
    diasFuncionamento: {}
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    
    // Tenta obter o nome do usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.nome) setNomeUsuario(parsed.nome);
      } catch (e) {}
    }

    if (token) {
      setIsLoggedIn(true);
      const normalizedRole = role ? role.toLowerCase() : '';
      
      if (['root', 'admin', 'adm'].includes(normalizedRole)) {
        setIsAdmin(true);
        setIsEntregador(false);
      } else if (['entregador', 'motoboy'].includes(normalizedRole)) {
        setIsEntregador(true);
        setIsAdmin(false);
      } else {
        setIsAdmin(false);
        setIsEntregador(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsEntregador(false);
    }
  }, []);

  // Carregar as configurações da loja
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
    if (isEntregador) return;

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
  }, [isAdmin, isLoggedIn, isEntregador]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAdmin(false);
    setIsEntregador(false);
    setIsLoggedIn(false);
    toast.success('Sessão encerrada com sucesso!');
    navigate('/');
    window.location.reload();
  };

  // 🛵 SE FOR ENTREGADOR: Exibe layout limpo para entregadores
  if (isEntregador) {
    return (
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-1 rounded-full border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Tay Mix" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-amber-600 tracking-tight leading-none capitalize">
                painel entregador
              </span>
              <span className="text-xs text-slate-500 font-bold mt-0.5 capitalize">
                {nomeUsuario || 'Entregador Parceiro'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Esquerda: Logo, Menu Hamburguer e Status no PC */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:text-amber-600 focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-0.5 rounded-full border-2 border-amber-400 shadow-xs flex items-center justify-center shrink-0">
                <img
                  src="/logoaçai8.png"
                  alt="Tay Mix Açaí & Massas"
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl md:text-2xl text-slate-900 tracking-tight leading-none capitalize">
                  tay <span className="text-amber-500">mix</span>
                </span>
                <span className="text-[10px] md:text-xs text-slate-500 font-bold tracking-wide uppercase mt-1">
                  açaí &bull; massas &bull; delivery
                </span>
              </div>
            </Link>
          </div>

          {/* Badge de Status da Loja no PC */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-full text-xs ml-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              lojaAberta 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${lojaAberta ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {lojaAberta ? 'ABERTO' : 'FECHADO'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {configLoja.horarioAbertura} às {configLoja.horarioFechamento}
            </span>
          </div>

          {/* Ações no Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItens > 0 && (
                <span className="bg-white text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {totalItens}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
              </button>
            ) : (
              <Link
                to="/login"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                title="Entrar na conta"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Centro: Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-4 text-xs md:text-sm text-slate-600 font-bold">
          <Link to="/" className="hover:text-amber-600 transition">cardápio</Link>
          
          {/* APENAS EXIBE O MENU ADMIN SE ESTIVER LOGADO COMO ADMINISTRADOR */}
          {isLoggedIn && isAdmin && (
            <>
              <Link to="/comandas" className="hover:text-amber-600 transition flex items-center gap-1">
                <ClipboardList className="w-4 h-4 text-slate-400" /> comandas
              </Link>

              <Link to="/caixa" className="relative hover:text-amber-600 transition flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-slate-400" /> caixa
                {pedidosPendentesCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                    {pedidosPendentesCount}
                  </span>
                )}
              </Link>

              <Link to="/admin/produtos" className="hover:text-amber-600 transition flex items-center gap-1">
                <Package className="w-4 h-4 text-slate-400" /> produtos
              </Link>

              <Link to="/configuracoes/entrega" className="hover:text-amber-700 transition flex items-center gap-1 text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200">
                <MapPin className="w-4 h-4 text-amber-600" /> raio de entrega
              </Link>

              <Link to="/admin/precificacao" className="hover:text-emerald-700 transition flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Calculator className="w-4 h-4 text-emerald-600" /> precificação
              </Link>

              <Link to="/admin/financeiro" className="hover:text-amber-800 transition flex items-center gap-1 text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 font-bold">
                <TrendingUp className="w-4 h-4 text-amber-600" /> financeiro
              </Link>
            </>
          )}

          {/* SE NÃO FOR ADMIN */}
          {(!isLoggedIn || !isAdmin) && (
            <>
              {isLoggedIn && (
                <Link to="/meus-pedidos" className="relative hover:text-amber-600 transition flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" /> meus pedidos
                  {temAlertaPedidos && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                </Link>
              )}
              {!isLoggedIn && (
                <Link to="/cadastro" className="hover:text-amber-600 transition flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-slate-400" /> cadastro
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Direita: Carrinho e Sessão Desktop */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>carrinho</span>
            {totalItens > 0 && (
              <span className="bg-white text-emerald-700 text-[11px] font-black px-2 py-0.5 rounded-full">
                {totalItens}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>sair</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Entrar na conta"
            >
              <LogIn className="w-4 h-4" />
              <span>entrar</span>
            </Link>
          )}
        </div>

      </div>

      {/* Linha Inferior Mobile Centralizada */}
      <div className="flex md:hidden w-full bg-slate-50 border-t border-slate-200 py-1.5 px-3 items-center justify-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          lojaAberta ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${lojaAberta ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {lojaAberta ? 'ABERTO' : 'FECHADO'}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-600 flex items-center gap-1 font-semibold text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" /> {configLoja.horarioAbertura} às {configLoja.horarioFechamento}
        </span>
      </div>

      {/* Menu Mobile Expandido */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 text-sm text-slate-700 font-bold shadow-lg">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
            cardápio
          </Link>
          
          {/* SÓ MOSTRA SE ESTIVER LOGADO COMO ADMINISTRADOR */}
          {isLoggedIn && isAdmin && (
            <>
              <Link to="/comandas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
                <ClipboardList className="w-4 h-4 text-slate-400" /> comandas
              </Link>
              
              <Link to="/caixa" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" /> caixa</span>
                {pedidosPendentesCount > 0 && <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">{pedidosPendentesCount} novos</span>}
              </Link>

              <Link to="/admin/produtos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
                <Package className="w-4 h-4 text-slate-400" /> produtos
              </Link>
              <Link to="/configuracoes/entrega" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-amber-50 text-amber-800 transition">
                <MapPin className="w-4 h-4 text-amber-600" /> raio de entrega
              </Link>
              <Link to="/admin/precificacao" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 transition">
                <Calculator className="w-4 h-4 text-emerald-600" /> precificação
              </Link>
              <Link to="/admin/financeiro" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-amber-100 text-amber-900 font-bold transition">
                <TrendingUp className="w-4 h-4 text-amber-600" /> financeiro
              </Link>
            </>
          )}

          {/* SE NÃO FOR ADMIN */}
          {(!isLoggedIn || !isAdmin) && (
            <>
              {isLoggedIn && (
                <Link to="/meus-pedidos" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> meus pedidos</span>
                </Link>
              )}
              {!isLoggedIn && (
                <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">
                  <UserPlus className="w-4 h-4 text-slate-400" /> cadastro
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