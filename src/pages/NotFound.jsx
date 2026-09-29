import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-extrabold text-amber-500 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-100 mb-4">página não encontrada</h2>
      <p className="text-slate-400 text-sm mb-6">
        parece que você tentou acessar uma página que não existe.
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition text-sm"
      >
        voltar para o início
      </Link>
    </div>
  );
};