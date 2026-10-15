import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Checkout } from '../pages/Checkout';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Comandas } from '../pages/Comandas';
import { Caixa } from '../pages/Caixa';
import { AdminProdutos } from '../pages/AdminProdutos';
import AdminPrecificacao from '../pages/AdminPrecificacao';// <--- Importação da tela de Precificação
import { MeusPedidos } from '../pages/MeusPedidos';
import { Motoboy } from '../pages/Motoboy';
import { RastreioCliente } from '../pages/RastreioCliente';
import { MapaRaioEntrega } from '../components/MapaRaioEntrega';
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

      {/* Rotas Restritas/Protegidas (Apenas Administradores) */}
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

      {/* 👉 Rota Protegida de Precificação iFood x 99Food */}
      <Route 
        path="/admin/precificacao" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPrecificacao />
          </ProtectedRoute>
        } 
      />

      {/* Rota de Configuração do Raio e Taxas de Entrega */}
      <Route 
        path="/configuracoes/entrega" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <MapaRaioEntrega />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};