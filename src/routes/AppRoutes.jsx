import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Checkout } from '../pages/Checkout';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Comandas } from '../pages/Comandas';
import { Caixa } from '../pages/Caixa';
import { AdminProdutos } from '../pages/AdminProdutos';
import { MeusPedidos } from '../pages/MeusPedidos';
import { Motoboy } from '../pages/Motoboy'; // <--- Importação da tela do motoboy
import { RastreioCliente } from '../pages/RastreioCliente'; // <--- Importação da tela de rastreio do cliente
import { MapaRaioEntrega } from '../components/MapaRaioEntrega';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas (Acessíveis a qualquer utilizador) */}
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rota do Cliente para Acompanhar os Pedidos em Tempo Real */}
      <Route path="/meus-pedidos" element={<MeusPedidos />} />

      {/* Rota de Rastreio ao Vivo do Cliente via Mapa */}
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

      {/* Rotas Restritas/Protegidas (Apenas para administradores logados) */}
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

      {/* Rota de Configuração do Raio e Taxas de Entrega (Apenas Admin/Root) */}
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