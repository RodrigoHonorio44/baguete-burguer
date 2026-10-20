import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Checkout } from '../pages/Checkout';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Comandas } from '../pages/Comandas';
import { Caixa } from '../pages/Caixa';
import { AdminProdutos } from '../pages/AdminProdutos';
import AdminPrecificacao from '../pages/AdminPrecificacao';
import ConfiguracoesLojaPage from '../pages/ConfiguracoesLojaPage'; // <--- Nova Página Centralizada (Marketing + Raio de Entrega em abas)
import PrestacaoContasTaymix from '../pages/PrestacaoContasTaymix'; // <--- Contém o Dashboard + Prestação de Contas em abas
import { MeusPedidos } from '../pages/MeusPedidos';
import { Motoboy } from '../pages/Motoboy';
import { RastreioCliente } from '../pages/RastreioCliente';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const AppRoutes = () => {
  return (
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
  );
};