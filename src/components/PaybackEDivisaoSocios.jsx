import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';

export default function PaybackEDivisaoSocios({
  totalNotinhasIniciais = 0,
  investimentoTotalCalculado = 0,
  setInvestimentoManual,
  investimentoQuitado = false,
  saldoInvestimentoPendente = 0,
  percentualGiro = 35,
  setPercentualGiro,
  valorParaDividir = 0,
  lucroSocioA = 0,
  lucroSocioB = 0,
  formatarBRL
}) {
  return (
    <div className="space-y-6">
      {/* Payback */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={20} /> Recuperação do Investimento Inicial (Payback)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Notinhas de Abertura Cadastradas: <strong className="text-slate-800">{formatarBRL(totalNotinhasIniciais)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Total Investido (R$):</label>
            <input
              type="number"
              value={investimentoTotalCalculado || 0}
              onChange={(e) => setInvestimentoManual && setInvestimentoManual(Number(e.target.value) - (totalNotinhasIniciais || 0))}
              className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-black text-slate-800 w-36 outline-none focus:border-amber-500"
            />
          </div>

          <div className={`p-3 rounded-xl border text-xs font-bold flex-1 md:flex-initial text-center ${investimentoQuitado ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            {investimentoQuitado ? (
              <span>✅ Investimento 100% Recuperado!</span>
            ) : (
              <span>⏳ Faltam {formatarBRL(saldoInvestimentoPendente)} para zerar</span>
            )}
          </div>
        </div>
      </div>

      {/* Divisão de Lucros */}
      <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-3 border-b border-slate-200 gap-2">
          <h2 className="text-xs font-bold flex items-center gap-2 text-amber-800 uppercase tracking-wider">
            <Users size={18} className="text-amber-600" /> Divisão de Lucros da Sociedade
          </h2>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <label>Retenção Capital de Giro (Fixada):</label>
            <input
              type="number"
              value={percentualGiro || 0}
              onChange={(e) => setPercentualGiro && setPercentualGiro(Number(e.target.value))}
              className="w-16 bg-slate-50 border border-slate-300 text-amber-700 font-bold text-center rounded-lg p-1 focus:outline-none focus:border-amber-500"
            /> %
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Total Disponível para Divisão</p>
            <p className="text-xl font-black text-slate-800">{formatarBRL(valorParaDividir)}</p>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <p className="text-xs text-emerald-800 font-extrabold mb-1 uppercase">Sócio 1 (50%)</p>
            <p className="text-2xl font-black text-emerald-600">{formatarBRL(lucroSocioA)}</p>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <p className="text-xs text-emerald-800 font-extrabold mb-1 uppercase">Sócio 2 (50%)</p>
            <p className="text-2xl font-black text-emerald-600">{formatarBRL(lucroSocioB)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}