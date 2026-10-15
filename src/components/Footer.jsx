import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-6 mt-12 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 text-center text-xs">
        <p className="font-medium text-slate-300">
          © {new Date().getFullYear()} TAY MIX - Açaí & Massas. Todos os direitos reservados.
        </p>
        <p className="mt-1 text-slate-500">
          O equilíbrio perfeito entre o sabor do açaí e a tradição das massas. • Maricá - RJ
        </p>
      </div>
    </footer>
  );
};

export default Footer;