import React, { useState, useEffect } from 'react';
import { Megaphone, MapPin, Printer, Store, Clock } from 'lucide-react';
import PaginaMarketing from './PaginaMarketing';
import PerfilLojaTab from './PerfilLojaTab';
import HorariosLojaTab from './HorariosLojaTab';
import { MapaRaioEntrega } from './MapaRaioEntrega';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function ConfiguracoesLojaPage() {
  const [abaAtiva, setAbaAtiva] = useState('perfil'); 
  
  const [lojaNome, setLojaNome] = useState('Tay Mix');
  const [endereco, setEndereco] = useState('Maricá, RJ');
  const [posicaoLoja, setPosicaoLoja] = useState([-22.9194, -42.8186]); 
  const [isOnline, setIsOnline] = useState(true);
  const [pedidoMinimo, setPedidoMinimo] = useState(20.00); 

  const [faixasRaio, setFaixasRaio] = useState([
    { id: 1, ativo: true, km: 3, taxa: 5.00, cor: '#10b981', fixo: false, posicao: null },   
    { id: 2, ativo: true, km: 6, taxa: 9.00, cor: '#2563eb', fixo: false, posicao: null },   
    { id: 3, ativo: false, km: 9, taxa: 14.00, cor: '#d97706', fixo: false, posicao: null },   
    { id: 4, ativo: false, km: 12, taxa: 20.00, cor: '#dc2626', fixo: false, posicao: null }, 
  ]);

  const [zonasProibidas, setZonasProibidas] = useState([]);

  const [horariosDias, setHorariosDias] = useState({
    domingo: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    segunda: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    terca: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    quarta: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    quinta: { ativo: false, abertura: '18:00', fechamento: '22:00' },
    sexta: { ativo: true, abertura: '18:15', fechamento: '22:00' },
    sabado: { ativo: true, abertura: '18:15', fechamento: '22:00' },
  });

  const [nomeImpressora, setNomeImpressora] = useState('printer:auto');
  const [loadingPrinter, setLoadingPrinter] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
    carregarConfiguracaoImpressora();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      let dadosServer = null;
      if (typeof api.getConfiguracoesLoja === 'function') {
        dadosServer = await api.getConfiguracoesLoja();
      } else if (typeof api.getConfiguracoes === 'function') {
        dadosServer = await api.getConfiguracoes();
      }
      if (dadosServer) preencherEstados(dadosServer);
    } catch (err) {
      const configSalva = localStorage.getItem('configuracoes_loja');
      if (configSalva) {
        try { preencherEstados(JSON.parse(configSalva)); } catch (e) { console.error(e); }
      }
    }
  };

  const preencherEstados = (dados) => {
    if (dados.lojaNome) setLojaNome(dados.lojaNome);
    if (dados.posicaoLoja) setPosicaoLoja(dados.posicaoLoja);
    if (dados.faixasRaio) setFaixasRaio(dados.faixasRaio);
    if (dados.zonasProibidas) setZonasProibidas(dados.zonasProibidas);
    if (dados.endereco) setEndereco(dados.endereco);
    if (dados.horariosDias) setHorariosDias(dados.horariosDias);
    if (dados.pedidoMinimo !== undefined) setPedidoMinimo(Number(dados.pedidoMinimo));
    if (dados.isOnline !== undefined) setIsOnline(dados.isOnline);
  };

  const handleSalvarGeral = async (horariosNovos) => {
    setLoading(true);
    
    const horariosParaSalvar = (horariosNovos && !horariosNovos.nativeEvent) ? horariosNovos : horariosDias;

    const config = {
      lojaNome, 
      endereco, 
      posicaoLoja, 
      faixasRaio, 
      zonasProibidas,
      isOnline, 
      horariosDias: horariosParaSalvar, 
      pedidoMinimo: Number(pedidoMinimo) || 0
    };

    try {
      if (typeof api.updateConfiguracoesLoja === 'function') {
        await api.updateConfiguracoesLoja(config);
      } else if (typeof api.updateConfiguracoes === 'function') {
        await api.updateConfiguracoes(config);
      }
      localStorage.setItem('configuracoes_loja', JSON.stringify(config));
      
      if (horariosNovos && !horariosNovos.nativeEvent) {
        setHorariosDias(horariosNovos);
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar alterações no servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLojaStatus = async () => {
    const novoStatus = !isOnline;
    setIsOnline(novoStatus);
    await handleSalvarGeral();
    toast.success(novoStatus ? 'Loja aberta manualmente!' : 'Loja fechada manualmente!');
  };

  const carregarConfiguracaoImpressora = async () => {
    try {
      const res = await api.getConfiguracaoImpressora();
      if (res?.nomeImpressora) setNomeImpressora(res.nomeImpressora);
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

  const atualizarHorarioDia = (dia, campo, valor) => {
    setHorariosDias(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor }
    }));
  };

  const listaDias = [
    { key: 'domingo', label: 'Domingo', short: 'Dom' },
    { key: 'segunda', label: 'Segunda-Feira', short: 'Seg' },
    { key: 'terca', label: 'Terça-Feira', short: 'Ter' },
    { key: 'quarta', label: 'Quarta-Feira', short: 'Qua' },
    { key: 'quinta', label: 'Quinta-Feira', short: 'Qui' },
    { key: 'sexta', label: 'Sexta-Feira', short: 'Sex' },
    { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  ];

  const menuItems = [
    { id: 'marketing', label: 'Marketing & Banners', icon: Megaphone },
    { id: 'perfil', label: 'Informações da loja', icon: Store },
    { id: 'horarios', label: 'Horário de funcionamento', icon: Clock },
    { id: 'entrega', label: 'Configurações de entrega', icon: MapPin },
    { id: 'impressora', label: 'Impressora Térmica', icon: Printer },
  ];

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] text-slate-800 flex flex-col min-h-full">
      <div className="flex flex-col lg:flex-row w-full flex-1 items-stretch">
        
        {/* Menu Lateral Esquerdo Fixo */}
        <div className="w-full lg:w-64 shrink-0 bg-white border-r border-slate-200/70 pt-4 px-3 pb-6 flex flex-col gap-1 shadow-xs z-10">
          <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-2">
            Gerenciamento
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAbaAtiva(item.id)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer text-xs font-bold w-full text-left ${
                  isSelected
                    ? 'bg-amber-400/15 text-amber-900 border-l-4 border-amber-500 font-black shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-amber-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Área de Conteúdo Principal à Direita */}
        <div className="flex-1 w-full p-6 lg:p-8 space-y-6 bg-[#f8f9fa]">
          
          {abaAtiva === 'marketing' && <PaginaMarketing />}
          
          {abaAtiva === 'perfil' && (
            <PerfilLojaTab 
              lojaNome={lojaNome} setLojaNome={setLojaNome}
              endereco={endereco} setEndereco={setEndereco}
              pedidoMinimo={pedidoMinimo} setPedidoMinimo={setPedidoMinimo}
              onSalvar={() => handleSalvarGeral()} 
              loading={loading}
              posicaoLoja={posicaoLoja} setPosicaoLoja={setPosicaoLoja}
            />
          )}

          {abaAtiva === 'horarios' && (
            <HorariosLojaTab 
              horariosDias={horariosDias}
              atualizarHorarioDia={atualizarHorarioDia}
              isOnline={isOnline}
              handleToggleLojaStatus={handleToggleLojaStatus}
              onSalvar={(horariosNovos) => handleSalvarGeral(horariosNovos)}
              loading={loading}
              listaDias={listaDias}
            />
          )}

          {abaAtiva === 'entrega' && (
            <MapaRaioEntrega 
              faixasRaio={faixasRaio} setFaixasRaio={setFaixasRaio}
              zonasProibidas={zonasProibidas} setZonasProibidas={setZonasProibidas}
              posicaoLoja={posicaoLoja} setPosicaoLoja={setPosicaoLoja}
              onSalvar={() => handleSalvarGeral()} 
              loading={loading}
            />
          )}

          {abaAtiva === 'impressora' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 space-y-6 w-full">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-500" />
                  Configuração da Impressora de Comandas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Defina como o servidor deve localizar a impressora térmica para emitir as comandas automaticamente ao aceitar os pedidos.
                </p>
              </div>

              <form onSubmit={salvarImpressora} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">
                    Identificação da Impressora (Interface)
                  </label>
                  <input
                    type="text"
                    value={nomeImpressora}
                    onChange={(e) => setNomeImpressora(e.target.value)}
                    placeholder="Ex: printer:auto ou //./POS-58 ou tcp://192.168.1.200"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loadingPrinter}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-xs transition"
                  >
                    <Printer size={16} /> {loadingPrinter ? 'A salvar...' : 'Salvar Configuração'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}