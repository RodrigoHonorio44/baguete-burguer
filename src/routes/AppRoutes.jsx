import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Checkout } from '../pages/Checkout';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login'; // <--- Importação da página de login
import { Comandas } from '../pages/Comandas';
import { Caixa } from '../pages/Caixa';
import { AdminProdutos } from '../pages/AdminProdutos';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/login" element={<Login />} /> {/* <--- Rota de login adicionada */}
      <Route path="/comandas" element={<Comandas />} />
      <Route path="/caixa" element={<Caixa />} />
      <Route path="/admin/produtos" element={<AdminProdutos />} />
    </Routes>
  );
};