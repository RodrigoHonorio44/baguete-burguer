import React from 'react';
import { Settings, Save, ArrowLeft } from 'lucide-react';

export default function ModalConfigTaxas({
  taxaIfoodPct = 26.2,
  setTaxaIfoodPct,
  taxaIfoodMensalidade = 150.0,
  setTaxaIfoodMensalidade,
  limiteIfoodMensalidade = 1800.0,
  setLimiteIfoodMensalidade,
  taxa99FoodPct = 12.1,
  setTaxa99FoodPct,
  taxaCartaoPct = 0,
  setTaxaCartaoPct,
  setAbaAtiva,
  formatarBRL
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-amber-800 flex items-center gap-2">
            <Settings className="text-amber-600" size={22} /> Configuração de Taxas e Regras das Plataformas
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Altere os valores e percentuais abaixo. As alterações serão salvas automaticamente e refletidas no painel de prestação de contas.
          </p>
        </div>
        <button
          onClick={() => setAbaAtiva('prestacao')}
          className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* REGRAS IFOOD */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Regras do iFood
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Comissão / Taxa (%) :</label>
            <input
              type="number"
              step="0.1"
              value={taxaIfoodPct}
              onChange={(e) => setTaxaIfoodPct && setTaxaIfoodPct(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Valor Mensalidade Fixa (R$):</label>
            <input
              type="number"
              step="0.01"
              value={taxaIfoodMensalidade}
              onChange={(e) => setTaxaIfoodMensalidade && setTaxaIfoodMensalidade(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Gatilho de Vendas Mensal (R$):</label>
            <input
              type="number"
              step="100"
              value={limiteIfoodMensalidade}
              onChange={(e) => setLimiteIfoodMensalidade && setLimiteIfoodMensalidade(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              Se as vendas do mês passarem de {formatarBRL(limiteIfoodMensalidade)}, o desconto fixo de {formatarBRL(taxaIfoodMensalidade)} é ativado.
            </p>
          </div>
        </div>

        {/* REGRAS 99FOOD */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Regras do 99Food
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Comissão / Taxa (%) :</label>
            <input
              type="number"
              step="0.1"
              value={taxa99FoodPct}
              onChange={(e) => setTaxa99FoodPct && setTaxa99FoodPct(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* REGRAS MAQUININHA DE CARTÃO */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Regras Cartão / Maquininha
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Taxa Média Crédito/Débito (%) :</label>
            <input
              type="number"
              step="0.1"
              value={taxaCartaoPct}
              onChange={(e) => setTaxaCartaoPct && setTaxaCartaoPct(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => setAbaAtiva('prestacao')}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Save size={16} /> Salvar Regras e Voltar
        </button>
      </div>
    </div>
  );
}