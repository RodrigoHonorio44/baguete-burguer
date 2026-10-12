import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck } from 'lucide-react';

export const TopAnnouncementBar = () => {
  const [pedidoMinimo, setPedidoMinimo] = useState(20);

  useEffect(() => {
    try {
      const configSalva = localStorage.getItem('configuracoes_loja');
      if (configSalva) {
        const parsed = JSON.parse(configSalva);
        if (parsed.pedidoMinimo !== undefined) {
          setPedidoMinimo(Number(parsed.pedidoMinimo));
        }
      }
    } catch (e) {
      console.error('Erro ao ler pedido mínimo para a TopBar:', e);
    }
  }, []);

  if (pedidoMinimo <= 0) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2">
      <Truck className="w-4 h-4 shrink-0" />
      <span>
        Entregas em Maricá &bull; Pedido mínimo para delivery: <strong className="underline">R$ {pedidoMinimo.toFixed(2)}</strong>
      </span>
    </div>
  );
};

export default TopAnnouncementBar;