import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Printer, Save } from 'lucide-react';

export default function ConfiguracoesImpressora() {
  const [nomeImpressora, setNomeImpressora] = useState('printer:auto');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      const res = await api.getConfiguracaoImpressora();
      if (res && res.nomeImpressora) {
        setNomeImpressora(res.nomeImpressora);
      }
    } catch (err) {
      console.log('Usando configuração padrão.');
    }
  };

  const salvarConfiguracao = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envia o valor mantendo o formato digitado (sem forçar uppercase/lowercase pois impressoras dependem de maiúsculas/minúsculas exatas)
      const valorParaSalvar = nomeImpressora.trim();
      await api.salvarConfiguracaoImpressora(valorParaSalvar);
      toast.success('Impressora configurada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar configuração da impressora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Printer className="w-6 h-6 text-amber-500" />
          Configuração da Impressora Térmica
        </h1>

        <form onSubmit={salvarConfiguracao} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nome da Impressora no Sistema ou IP de Rede
            </label>
            <input
              type="text"
              value={nomeImpressora}
              onChange={(e) => setNomeImpressora(e.target.value)}
              placeholder="Ex: //./POS-58 ou printer:auto ou tcp://192.168.1.200"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Dica: Use <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-600">printer:auto</code> para detecção automática ou o nome exato da impressora no Windows (ex: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-600">//./Elgin_i9</code>).
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
            >
              <Save size={16} /> {loading ? 'A salvar...' : 'Salvar Configuração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}