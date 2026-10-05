import React from 'react';
import { Menu } from '../components/Menu';
import Banner from '../components/Banner';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden w-full max-w-full">
      
      {/* BANNER PRINCIPAL (TEMA AÇAI & DELIVERY) */}
      <Banner />

      {/* COMPONENTE DE CARDÁPIO */}
      <Menu />

    </div>
  );
};

export default Home;