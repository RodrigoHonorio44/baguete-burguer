import React from 'react';
import { Navigate } from 'react-router-dom';
//
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Lê diretamente do localStorage, mantendo consistência com o Login e a Navbar
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  const isLoggedIn = !!token;
  const isAdmin = role === 'admin' || role === 'adm' || role === 'root';

  if (!isLoggedIn) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Se a rota exige admin mas o usuário logado é comum, manda para a home
    return <Navigate to="/" replace />;
  }

  return children;
};