import React, { useState, useEffect } from 'react';
import { Settings, Megaphone, MapPin, Printer, Save } from 'lucide-react';
import PaginaMarketing from './PaginaMarketing';
import { MapaRaioEntrega } from '../components/MapaRaioEntrega';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function ConfiguracoesLojaPage() {
  const [abaAtiva, setAbaAtiva] = useState('marketing'); // 'marketing' | 'entrega' | 'impressora'
  
  // Estados para a aba da Impressora
  const [nomeImpressora, setNomeImpressora] = useState('printer:auto');
  const [loadingPrinter, setLoadingPrinter] = useState(false);

  // Carrega a configuração da impressora salva ao abrir a página
  useEffect(() => {
    carregarConfiguracaoImpressora();
  }, []);

  const carregarConfiguracaoImpressora = async () => {
    try {
      const res = await api.getConfiguracaoImpressora();
      if (res && res.nomeImpressora) {
        setNomeImpressora(res.nomeImpressora);
      }
    } catch (err) {
      console.log('Usando valor padrão para impressora.');
    }
  };

  const salvarImpressora = async (e) => {
    e.preventDefault();
    setLoadingPrinter(true);
    try {
      await api.salvarConfiguracaoImpressora(nomeImpressora.trim());
      toast.success('Configuração da impressora salva com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar configuração da impressora.');
    } finally {
      setLoadingPrinter(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Cabeçalho Unificado de Configurações */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Configurações da Loja</h1>
              <p className="text-xs text-slate-500">Gerencie marketing, promoções, raio de entrega e impressora térmica</p>
            </div>
          </div>

          {/* Seletor de Abas Interno */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold gap-1 flex-wrap">
            <button
              onClick={() => setAbaAtiva('marketing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                abaAtiva === 'marketing' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone size={16} /> Marketing & Banners
            </button>

            <button
              onClick={() => setAbaAtiva('entrega')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                abaAtiva === 'entrega' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin size={16} /> Raio de Entrega
            </button>

            <button
              onClick={() => setAbaAtiva('impressora')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                abaAtiva === 'impressora' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer size={16} /> Impressora Térmica
            </button>
          </div>
        </div>

        {/* EXIBIÇÃO DO CONTEÚDO CONFORME A ABA SELECIONADA */}
        {abaAtiva === 'marketing' && <PaginaMarketing />}
        {abaAtiva === 'entrega' && <MapaRaioEntrega />}
        
        {abaAtiva === 'impressora' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
              <Printer className="w-5 h-5 text-amber-500" />
              Configuração da Impressora de Comandas
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Defina como o servidor deve localizar a impressora térmica para emitir as comandas automaticamente ao aceitar os pedidos.
            </p>

            <form onSubmit={salvarImpressora} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Identificação da Impressora (Interface)
                </label>
                <input
                  type="text"
                  value={nomeImpressora}
                  onChange={(e) => setNomeImpressora(e.target.value)}
                  placeholder="Ex: printer:auto ou //./POS-58 ou tcp://192.168.1.200"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <div className="text-[11px] text-slate-500 mt-2 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p>
                    <code className="text-amber-600 font-bold">printer:auto</code>: Tenta localizar a impressora térmica padrão automaticamente.
                  </p>
                  <p>
                    <code className="text-amber-600 font-bold">//./NomeDaImpressora</code>: Nome exato configurado no Windows (ex: <code className="text-slate-700">`//./Elgin_i9`</code>).
                  </p>
                  <p>
                    <code className="text-amber-600 font-bold">tcp://IP_DA_IMPRESSORA</code>: Caso seja uma impressora conectada via rede Wi-Fi/Cabo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingPrinter}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
                >
                  <Save size={16} /> {loadingPrinter ? 'A salvar...' : 'Salvar Configuração'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}