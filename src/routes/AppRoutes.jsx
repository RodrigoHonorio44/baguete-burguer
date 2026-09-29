import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Checkout } from '../pages/Checkout';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Comandas } from '../pages/Comandas';
import { Caixa } from '../pages/Caixa';
import { AdminProdutos } from '../pages/AdminProdutos';
import { ProtectedRoute } from '../routes/ProtectedRoute'; // <--- Importação da rota protegida

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas (Acessíveis a qualquer utilizador) */}
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/login" element={<Login />} />

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
    </Routes>
  );
};