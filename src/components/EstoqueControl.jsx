import React from 'react';

export const EstoqueInputForm = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">qtd estoque</label>
      <input
        type="number"
        min="0"
        name="estoque"
        required
        value={value}
        onChange={onChange}
        placeholder="ex: 5"
        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-amber-500"
      />
    </div>
  );
};

EstoqueInputForm.displayName = 'EstoqueInputForm';

export const EstoqueBadgeCard = ({ estoque }) => {
  const qtd = Number(estoque || 0);

  if (qtd <= 0) {
    return (
      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded uppercase border border-rose-200">
        esgotado (estoque: 0)
      </span>
    );
  }

  return (
    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase border border-emerald-200">
      estoque: {qtd} unid
    </span>
  );
};

EstoqueBadgeCard.displayName = 'EstoqueBadgeCard';