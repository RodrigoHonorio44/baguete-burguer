import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Save, Plus, Trash2, CheckCircle, AlertTriangle, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const ConfiguracaoEntrega = () => {
  const [faixasRaio, setFaixasRaio] = useState([
    { id: 1, ativo: true, km: 3, taxa: 5.00, cor: '#10b981' },
    { id: 2, ativo: true, km: 6, taxa: 9.00, cor: '#3b82f6' },
    { id: 3, ativo: false, km: 9, taxa: 14.00, cor: '#f59e0b' },
    { id: 4, ativo: false, km: 12, taxa: 20.00, cor: '#ef4444' },
  ]);

  const [zonasProibidas, setZonasProibidas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        let dadosServer = null;
        if (typeof api.getConfiguracoesLoja === 'function') {
          dadosServer = await api.getConfiguracoesLoja();
        } else if (typeof api.getConfiguracoes === 'function') {
          dadosServer = await api.getConfiguracoes();
        }

        if (dadosServer) {
          if (dadosServer.faixasRaio) setFaixasRaio(dadosServer.faixasRaio);
          if (dadosServer.zonasProibidas) setZonasProibidas(dadosServer.zonasProibidas);
          return;
        }
      } catch (err) {
        console.error('Erro ao buscar do servidor:', err);
      }

      // Fallback para localStorage
      const configSalva = localStorage.getItem('configuracoes_loja');
      if (configSalva) {
        try {
          const parsed = JSON.parse(configSalva);
          if (parsed.faixasRaio) setFaixasRaio(parsed.faixasRaio);
          if (parsed.zonasProibidas) setZonasProibidas(parsed.zonasProibidas);
        } catch (e) {
          console.error('Erro ao carregar do localStorage:', e);
        }
      }
    };

    carregarConfiguracoes();
  }, []);

  const atualizarFaixa = (index, campo, valor) => {
    const novasFaixas = [...faixasRaio];
    novasFaixas[index][campo] = valor;
    setFaixasRaio(novasFaixas);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pega o que já existe salvo para não sobrescrever outros campos (como mapa/horários)
      let configExistente = {};
      const local = localStorage.getItem('configuracoes_loja');
      if (local) configExistente = JSON.parse(local);

      const configAtualizada = {
        ...configExistente,
        faixasRaio,
        zonasProibidas
      };

      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja(configAtualizada);
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes(configAtualizada);
      }

      localStorage.setItem('configuracoes_loja', JSON.stringify(configAtualizada));
      toast.success('Configurações de entrega salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-amber-500" /> Gerenciamento de Raios e Taxas de Entrega
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Defina as faixas de quilometragem, taxas correspondentes e áreas atendidas baseadas na coleção unificada.
        </p>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* Tabela de Faixas de Raio */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Faixas de Quilometragem e Taxas</h2>
          
          <div className="space-y-3">
            {faixasRaio.map((faixa, index) => (
              <div key={faixa.id} className={`grid grid-cols-1 md:grid-cols-4 gap-3 items-center border p-3 rounded-xl ${faixa.ativo ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: faixa.cor }}></span>
                  <span className="text-xs font-bold text-slate-200">Raio {index + 1}</span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Distância (Km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={faixa.km}
                    disabled={!faixa.ativo}
                    onChange={(e) => atualizarFaixa(index, 'km', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Taxa (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={faixa.taxa}
                    disabled={!faixa.ativo}
                    onChange={(e) => atualizarFaixa(index, 'taxa', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => atualizarFaixa(index, 'ativo', !faixa.ativo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      faixa.ativo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {faixa.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs"
        >
          <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};