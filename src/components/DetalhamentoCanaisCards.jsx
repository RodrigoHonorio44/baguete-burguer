import React from 'react';
import { Wallet } from 'lucide-react';

export default function DetalhamentoCanaisCards({
  // Totais
  totalIfoodAcumulado = 0,
  total99Food = 0,
  totalPixAcumulado = 0,
  totalDinheiroCaixaAcumulado = 0,
  totalCartaoAcumulado = 0,
  // Pedidos
  qtdPedidosIfood = 0,
  qtdPedidos99Food = 0,
  qtdPedidosPix = 0,
  qtdPedidosDinheiro = 0,
  qtdPedidosCartao = 0,
  // Taxas
  taxaIfoodPct = 26.2,
  taxaIfoodMensalidade = 150.0,
  limiteIfoodMensalidade = 1800.0,
  taxa99FoodPct = 12.1,
  taxaCartaoPct = 0,
  formatarBRL
}) {
  // Cálculos do iFood
  const ifoodUltrapassouLimite = totalIfoodAcumulado > limiteIfoodMensalidade;
  const comissaoIfoodVal = totalIfoodAcumulado * (taxaIfoodPct / 100);
  const mensalidadeIfoodVal = ifoodUltrapassouLimite ? taxaIfoodMensalidade : 0;
  const liquidoIfood = totalIfoodAcumulado - comissaoIfoodVal - mensalidadeIfoodVal;

  // Cálculos do 99Food
  const comissao99Val = total99Food * (taxa99FoodPct / 100);
  const liquido99Food = total99Food - comissao99Val;

  // Demais canais
  const comissaoCartaoVal = totalCartaoAcumulado * (taxaCartaoPct / 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
      <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Wallet size={18} className="text-amber-600" /> Detalhamento de Vendas por Meio e Canal
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. iFood */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600">iFood</span>
              {ifoodUltrapassouLimite && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300">
                  -R$150
                </span>
              )}
            </div>
            <p className="text-xl font-black text-slate-900">{formatarBRL(liquidoIfood)}</p>
            <span className="text-[10px] font-semibold text-slate-400 block mb-3">Valor Líquido</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Bruto:</span>
              <span className="font-bold text-slate-800">{formatarBRL(totalIfoodAcumulado)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Comissões:</span>
              <span className="font-bold text-rose-600">-{formatarBRL(comissaoIfoodVal)}</span>
            </div>
            {ifoodUltrapassouLimite && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="text-amber-800 font-bold">Mensalidade:</span>
                <span className="font-bold text-amber-800">-{formatarBRL(mensalidadeIfoodVal)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Pedidos:</span>
              <span className="font-semibold text-slate-600">{qtdPedidosIfood} un</span>
            </div>
          </div>
        </div>

        {/* 2. 99Food */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600">99Food</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatarBRL(liquido99Food)}</p>
            <span className="text-[10px] font-semibold text-slate-400 block mb-3">Valor Líquido</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Bruto:</span>
              <span className="font-bold text-slate-800">{formatarBRL(total99Food)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Comissões:</span>
              <span className="font-bold text-rose-600">-{formatarBRL(comissao99Val)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Pedidos:</span>
              <span className="font-semibold text-slate-600">{qtdPedidos99Food} un</span>
            </div>
          </div>
        </div>

        {/* 3. Pix */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600">Pix</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatarBRL(totalPixAcumulado)}</p>
            <span className="text-[10px] font-semibold text-slate-400 block mb-3">Valor Líquido</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Bruto:</span>
              <span className="font-bold text-slate-800">{formatarBRL(totalPixAcumulado)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Comissões:</span>
              <span className="font-bold text-rose-600">-R$ 0,00</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Pedidos:</span>
              <span className="font-semibold text-slate-600">{qtdPedidosPix} un</span>
            </div>
          </div>
        </div>

        {/* 4. Dinheiro */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600">Dinheiro (Espécie)</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatarBRL(totalDinheiroCaixaAcumulado)}</p>
            <span className="text-[10px] font-semibold text-slate-400 block mb-3">Valor Líquido</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Bruto:</span>
              <span className="font-bold text-slate-800">{formatarBRL(totalDinheiroCaixaAcumulado)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Comissões:</span>
              <span className="font-bold text-rose-600">-R$ 0,00</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Pedidos:</span>
              <span className="font-semibold text-slate-600">{qtdPedidosDinheiro} un</span>
            </div>
          </div>
        </div>

        {/* 5. Cartão */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600">Cartão (Créd/Déb)</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatarBRL(totalCartaoAcumulado - comissaoCartaoVal)}</p>
            <span className="text-[10px] font-semibold text-slate-400 block mb-3">Valor Líquido</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Bruto:</span>
              <span className="font-bold text-slate-800">{formatarBRL(totalCartaoAcumulado)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Comissões:</span>
              <span className="font-bold text-rose-600">-{formatarBRL(comissaoCartaoVal)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Pedidos:</span>
              <span className="font-semibold text-slate-600">{qtdPedidosCartao} un</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}