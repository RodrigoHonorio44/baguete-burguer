import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { ProtectedRoute } from '../routes/ProtectedRoute';

const Checkout = lazy(() => import('../pages/Checkout').then(({ Checkout }) => ({ default: Checkout })));
const Register = lazy(() => import('../pages/Register').then(({ Register }) => ({ default: Register })));
const Login = lazy(() => import('../pages/Login').then(({ Login }) => ({ default: Login })));
const Comandas = lazy(() => import('../pages/Comandas').then(({ Comandas }) => ({ default: Comandas })));
const Caixa = lazy(() => import('../pages/Caixa').then(({ Caixa }) => ({ default: Caixa })));
const AdminProdutos = lazy(() => import('../pages/AdminProdutos').then(({ AdminProdutos }) => ({ default: AdminProdutos })));
const AdminPrecificacao = lazy(() => import('../pages/AdminPrecificacao'));
const ConfiguracoesLojaPage = lazy(() => import('../pages/ConfiguracoesLojaPage'));
const ConfiguracoesImpressora = lazy(() => import('../pages/ConfiguracoesImpressora')); // 🖨️ Nova rota da impressora
const PrestacaoContasTaymix = lazy(() => import('../pages/PrestacaoContasTaymix'));
const MeusPedidos = lazy(() => import('../pages/MeusPedidos').then(({ MeusPedidos }) => ({ default: MeusPedidos })));
const Motoboy = lazy(() => import('../pages/Motoboy').then(({ Motoboy }) => ({ default: Motoboy })));
const RastreioCliente = lazy(() => import('../pages/RastreioCliente').then(({ RastreioCliente }) => ({ default: RastreioCliente })));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-500" role="status">Carregando página...</div>}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/rastreio/:id" element={<RastreioCliente />} />

        {/* Rota Exclusiva do Motoboy */}
        <Route
          path="/motoboy"
          element={
            <ProtectedRoute>
              <Motoboy />
            </ProtectedRoute>
          }
        />

        {/* 👉 Rota Raiz do Painel Administrativo (Exige Root/Admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Navigate to="/admin/produtos" replace />
            </ProtectedRoute>
          }
        />

        {/* Rotas Restritas/Protegidas (Apenas Administradores Logados) */}
        <Route
          path="/comandas"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Comandas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/caixa"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Caixa />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminProdutos />
            </ProtectedRoute>
          }
        />

        {/* Rota Protegida de Precificação iFood x 99Food */}
        <Route
          path="/admin/precificacao"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPrecificacao />
            </ProtectedRoute>
          }
        />

        {/* 👉 Rota Centralizada de Configurações da Loja (Marketing + Raio de Entrega) */}
        <Route
          path="/admin/configuracoes"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ConfiguracoesLojaPage />
            </ProtectedRoute>
          }
        />

        {/* 🖨️ 👉 Rota Protegida de Configuração da Impressora Térmica */}
        <Route
          path="/admin/configuracoes/impressora"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ConfiguracoesImpressora />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamentos para garantir compatibilidade caso links antigos sejam acessados */}
        <Route path="/admin/marketing" element={<Navigate to="/admin/configuracoes" replace />} />
        <Route path="/configuracoes/entrega" element={<Navigate to="/admin/configuracoes" replace />} />

        {/* 👉 Rota Protegida do Financeiro (Dashboard Visão Geral + Prestação de Contas unificados em abas) */}
        <Route
          path="/admin/financeiro"
          element={
            <ProtectedRoute requireAdmin={true}>
              <PrestacaoContasTaymix />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};