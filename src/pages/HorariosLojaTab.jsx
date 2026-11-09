import React, { useState } from 'react';
import { Power, Clock, Edit3, X } from 'lucide-react';

export default function HorariosLojaTab({ 
  horariosDias, 
  atualizarHorarioDia, 
  isOnline, 
  handleToggleLojaStatus, 
  onSalvar, 
  loading, 
  listaDias 
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [diasSelecionados, setDiasSelecionados] = useState({
    segunda: false, terca: false, quarta: false, quinta: false, sexta: false, sabado: false, domingo: false
  });
  const [fechadoTodo, setFechadoTodo] = useState(false);
  const [horaInicio, setHoraInicio] = useState('18:00');
  const [horaTermino, setHoraTermino] = useState('22:00');

  const horasGrade = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:59'];

  const handleToggleCheckDia = (key) => {
    setDiasSelecionados(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSalvarModal = () => {
    // Cria uma cópia profunda dos horários atuais para manipularmos com segurança
    const novosHorarios = JSON.parse(JSON.stringify(horariosDias));

    Object.keys(diasSelecionados).forEach((key) => {
      if (diasSelecionados[key]) {
        if (fechadoTodo) {
          // Garante que o dia fique explicitamente desativado e zerado
          novosHorarios[key] = { ativo: false, abertura: '00:00', fechamento: '00:00' };
        } else {
          // Ativa o dia com os novos horários
          novosHorarios[key] = { ativo: true, abertura: horaInicio, fechamento: horaTermino };
        }
      }
    });

    // Atualiza cada dia individualmente usando a prop do pai para sincronizar os estados
    Object.keys(novosHorarios).forEach((key) => {
      atualizarHorarioDia(key, 'ativo', novosHorarios[key].ativo);
      atualizarHorarioDia(key, 'abertura', novosHorarios[key].abertura);
      atualizarHorarioDia(key, 'fechamento', novosHorarios[key].fechamento);
    });

    setModalAberto(false);
    
    // Reseta as seleções do modal
    setDiasSelecionados({
      segunda: false, terca: false, quarta: false, quinta: false, sexta: false, sabado: false, domingo: false
    });
    setFechadoTodo(false);

    // Dispara o salvamento enviando o objeto atualizado diretamente para evitar atraso de estado
    if (onSalvar) {
      onSalvar(novosHorarios);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fa] space-y-6">
      
      {/* Cabeçalho de Topo Integrado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Configurar horário de funcionamento</h1>
            <p className="text-xs text-slate-500">Determina quando sua loja pode abrir e aceitar pedidos automaticamente.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleLojaStatus}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border shadow-2xs ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
          }`}
        >
          <Power size={16} />
          {isOnline ? 'LOJA ONLINE (Forçado / Aberto)' : 'LOJA OFFLINE (Fechada Manualmente)'}
        </button>
      </div>

      {/* Secção de Horário Normal */}
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Horário de funcionamento normal</h2>
            <p className="text-xs text-slate-500">Quando o modo Automático estiver selecionado, sua loja se conectará de acordo com as configurações.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
            >
              <Edit3 size={14} className="text-amber-600" /> Editar horário de funcionamento
            </button>
          </div>
        </div>

        {/* Grelha Visual Estilo iFood / 99Food */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs w-full overflow-x-auto">
          
          <div className="grid grid-cols-8 gap-2 border-b border-slate-200 pb-3 mb-3 min-w-[700px] text-center">
            <div className="text-xs font-bold text-slate-400 text-left pl-2">Horas</div>
            {listaDias.map(({ key, label }) => {
              const ativo = horariosDias[key]?.ativo;
              return (
                <div key={key} className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 block">{label.split('-')[0]}</span>
                  <span className={`text-[10px] font-bold block ${ativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {ativo ? `Aberto` : 'Fechado'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 min-w-[700px]">
            {horasGrade.map((horaStr) => {
              const horaNum = parseInt(horaStr.split(':')[0]);

              return (
                <div key={horaStr} className="grid grid-cols-8 gap-2 items-center">
                  <span className="text-[11px] font-bold text-slate-400 pl-2">{horaStr}</span>
                  
                  {listaDias.map(({ key }) => {
                    const dia = horariosDias[key];
                    const horaAberturaNum = dia?.ativo ? parseInt(dia.abertura.split(':')[0]) : -1;
                    const horaFechamentoNum = dia?.ativo ? parseInt(dia.fechamento.split(':')[0]) : 24;
                    const estaAbertoNestaHora = dia?.ativo && horaNum >= horaAberturaNum && horaNum < horaFechamentoNum;

                    return (
                      <div 
                        key={key} 
                        className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                          estaAbertoNestaHora 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs' 
                            : 'bg-slate-50/50 text-transparent border border-slate-100'
                        }`}
                      >
                        {estaAbertoNestaHora && horaNum === horaAberturaNum ? `${dia.abertura}\n${dia.fechamento}` : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Modal Idêntico à Referência */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900">Editar horário de funcionamento normal</h3>
              <button 
                type="button" 
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ao ajustar o horário de funcionamento, verifique se o horário de venda dos itens relevantes é compatível com o horário configurado.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-2">Selecionar data</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {listaDias.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diasSelecionados[key]}
                        onChange={() => handleToggleCheckDia(key)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      {label.split('-')[0]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="fechadoDiaTodo"
                  checked={fechadoTodo}
                  onChange={(e) => setFechadoTodo(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="fechadoDiaTodo" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Fechado o dia todo
                </label>
              </div>

              {!fechadoTodo && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Hora de início</label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Hora de término</label>
                    <input
                      type="time"
                      value={horaTermino}
                      onChange={(e) => setHoraTermino(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarModal}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-xs transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}