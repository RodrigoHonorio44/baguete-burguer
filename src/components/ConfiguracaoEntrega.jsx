import React, { useState } from 'react';
import { MapPin, DollarSign, Plus, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ConfiguracaoEntrega = () => {
  const [bairros, setBairros] = useState([
    { id: 1, nome: 'Centro', taxa: 5.00, raioKm: 3 },
    { id: 2, nome: 'Flamengo', taxa: 7.00, raioKm: 5 },
    { id: 3, nome: 'Inoã', taxa: 12.00, raioKm: 10 },
    { id: 4, nome: 'Itaipuaçu', taxa: 15.00, raioKm: 15 },
  ]);

  const [novoBairro, setNovoBairro] = useState('');
  const [novaTaxa, setNovaTaxa] = useState('');
  const [novoRaio, setNovoRaio] = useState('');

  const adicionarRegiao = (e) => {
    e.preventDefault();
    if (!novoBairro || !novaTaxa) {
      toast.error('Preencha o nome do bairro e a taxa.');
      return;
    }

    const item = {
      id: Date.now(),
      nome: novoBairro,
      taxa: Number(novaTaxa),
      raioKm: Number(novoRaio) || 5
    };

    setBairros([...bairros, item]);
    setNovoBairro('');
    setNovaTaxa('');
    setNovoRaio('');
    toast.success('Região de entrega adicionada com sucesso!');
  };

  const removerRegiao = (id) => {
    setBairros(bairros.filter(b => b.id !== id));
    toast.success('Região removida.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-amber-500" /> gerenciamento de raio e taxas de entrega
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          defina quais áreas sua loja atende e quanto custa a taxa de entrega para cada região (estilo iFood)
        </p>
      </div>

      {/* Formulário para adicionar nova zona */}
      <form onSubmit={adicionarRegiao} className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Bairro / Região</label>
          <input 
            type="text" 
            placeholder="Ex: Jaconé" 
            value={novoBairro}
            onChange={(e) => setNovoBairro(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Taxa (R$)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            value={novaTaxa}
            onChange={(e) => setNovaTaxa(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Raio Aproximado (Km)</label>
          <input 
            type="number" 
            placeholder="Ex: 5" 
            value={novoRaio}
            onChange={(e) => setNovoRaio(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button 
          type="submit" 
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer h-10"
        >
          <Plus size={16} /> Adicionar Área
        </button>
      </form>

      {/* Tabela de Áreas Atendidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Região / Bairro</th>
              <th className="py-3 px-4">Raio Estimado</th>
              <th className="py-3 px-4">Taxa de Entrega</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {bairros.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 font-medium text-slate-200">{b.nome}</td>
                <td className="py-3 px-4 text-slate-400 text-xs">{b.raioKm} km do estabelecimento</td>
                <td className="py-3 px-4 font-bold text-emerald-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.taxa)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                    <CheckCircle size={10} /> Ativo
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => removerRegiao(b.id)}
                    className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition cursor-pointer"
                    title="Remover região"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};