import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Printer } from 'lucide-react';

export function ImprimirBalancete({ movimentacoes = [], formatarBRL }) {
  const totalReceitas = movimentacoes.filter(m => m.tipo === 'Receita').reduce((a, b) => a + Number(b.valor || 0), 0);
  const totalOpex = movimentacoes.filter(m => m.tipo === 'Despesa' && !m.ehInvestimentoInicial).reduce((a, b) => a + Number(b.valor || 0), 0);
  const totalCapex = movimentacoes.filter(m => m.tipo === 'Despesa' && m.ehInvestimentoInicial).reduce((a, b) => a + Number(b.valor || 0), 0);
  const resultado = totalReceitas - totalOpex;

  const gerarPDFOficial = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');

    let y = 15;

    // Cabeçalho Formal
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAY MIX — BALANCETE FINANCEIRO OFICIAL', 14, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Açaí Cremoso & Delivery | Maricá - RJ', 14, y + 5);

    doc.text(`Emissão: ${dataAtual} às ${horaAtual}`, 196, y, { align: 'right' });

    y += 10;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);

    // Resumo Executivo em Cards (Simulados no PDF)
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Resumo Executivo do Período', 14, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const fmt = (val) => formatarBRL ? formatarBRL(val) : `R$ ${Number(val || 0).toFixed(2)}`;

    const itensResumo = [
      ['Faturamento Bruto:', fmt(totalReceitas)],
      ['Gastos OPEX:', fmt(totalOpex)],
      ['Investimento Inicial:', fmt(totalCapex)],
      ['Resultado Líquido:', fmt(resultado)]
    ];

    itensResumo.forEach(([label, valor]) => {
      doc.text(label, 14, y);
      doc.font = 'bold';
      doc.text(valor, 196, y, { align: 'right' });
      y += 6;
    });

    // Tabela de Lançamentos
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento de Movimentações', 14, y);

    y += 4;
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('DATA', 17, y + 5);
    doc.text('TIPO', 38, y + 5);
    doc.text('DESCRIÇÃO / CATEGORIA', 65, y + 5);
    doc.text('CLASSIFICAÇÃO', 140, y + 5, { align: 'center' });
    doc.text('VALOR', 193, y + 5, { align: 'right' });

    y += 7;
    doc.setTextColor(15, 23, 42);

    if (!movimentacoes || movimentacoes.length === 0) {
      y += 6;
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma movimentação registrada no período.', 14, y);
    } else {
      movimentacoes.forEach((item, index) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 6, 'F');
        }

        const dataItem = item.dataLancamento ? item.dataLancamento.split('-').reverse().join('/') : '-';
        const tipoItem = item.tipo ? item.tipo.toUpperCase() : '-';
        const descItem = item.descricao ? item.descricao.toUpperCase() : '-';
        const catItem = item.categoria || '-';
        const classificacao = item.ehInvestimentoInicial ? 'Investimento Inicial' : 'Operacional';
        const tipoSinal = item.tipo === 'Receita' ? '+ ' : '- ';
        const valorItem = `${tipoSinal}${fmt(item.valor)}`;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(dataItem, 17, y + 4);
        doc.text(tipoItem, 38, y + 4);
        doc.text(descItem.substring(0, 32), 65, y + 4);
        doc.text(classificacao, 140, y + 4, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        if (item.tipo === 'Receita') {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(225, 29, 72);
        }
        doc.text(valorItem, 193, y + 4, { align: 'right' });
        doc.setTextColor(15, 23, 42);

        y += 6;
      });
    }

    // Rodapé com Assinaturas
    y += 22;
    if (y > 250) {
      doc.addPage();
      y = 40;
    }

    doc.setDrawColor(150, 150, 150);
    doc.line(30, y, 90, y);
    doc.line(120, y, 180, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Responsável Financeiro — Tay Mix', 60, y + 4, { align: 'center' });
    doc.text('Sócia / Gerência — Erica Oliveira', 150, y + 4, { align: 'center' });

    doc.save(`Balancete_Taymix_${dataAtual.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botão de Geração de PDF Oficial */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={gerarPDFOficial}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
        >
          <FileText size={16} /> 📄 Baixar Balancete Oficial em PDF
        </button>
      </div>

      {/* ÁREA DO BALANCETE NA TELA */}
      <div className="p-8 bg-white text-slate-900 space-y-6 font-sans rounded-2xl border border-slate-200 shadow-xs">
        
        {/* CABEÇALHO OFICIAL */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900">
              TAY MIX — Balancete Financeiro Oficial
            </h1>
            <p className="text-xs text-slate-600 font-semibold">Açaí Cremoso & Delivery | Maricá - RJ</p>
          </div>
          <div className="text-right text-xs font-bold text-slate-500">
            <p>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* RESUMO EXECUTIVO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-slate-300 p-4 rounded-xl bg-slate-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Faturamento Bruto</span>
            <span className="text-sm font-black text-slate-900">
              {formatarBRL ? formatarBRL(totalReceitas) : `R$ ${totalReceitas.toFixed(2)}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Gastos OPEX</span>
            <span className="text-sm font-black text-rose-700">
              {formatarBRL ? formatarBRL(totalOpex) : `R$ ${totalOpex.toFixed(2)}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Investimento Inicial</span>
            <span className="text-sm font-black text-amber-700">
              {formatarBRL ? formatarBRL(totalCapex) : `R$ ${totalCapex.toFixed(2)}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Resultado Líquido</span>
            <span className={`text-sm font-black ${resultado >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatarBRL ? formatarBRL(resultado) : `R$ ${resultado.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* TABELA DE LANÇAMENTOS */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-800 text-slate-700">
              <th className="py-2.5">DATA</th>
              <th className="py-2.5">TIPO</th>
              <th className="py-2.5">DESCRIÇÃO / CATEGORIA</th>
              <th className="py-2.5 text-center">CLASSIFICAÇÃO</th>
              <th className="py-2.5 text-right">VALOR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {movimentacoes.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                  Nenhuma movimentação registrada no período.
                </td>
              </tr>
            ) : (
              movimentacoes.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 text-slate-600 font-medium">
                    {item.dataLancamento ? item.dataLancamento.split('-').reverse().join('/') : '-'}
                  </td>
                  <td className="py-2.5 font-bold uppercase">{item.tipo}</td>
                  <td className="py-2.5">
                    <span className="font-bold text-slate-900 block">{item.descricao}</span>
                    <span className="text-[10px] text-slate-500">{item.categoria}</span>
                  </td>
                  <td className="py-2.5 text-center font-medium">
                    {item.ehInvestimentoInicial ? 'Investimento Inicial' : 'Operacional'}
                  </td>
                  <td className={`py-2.5 text-right font-black ${item.tipo === 'Receita' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {item.tipo === 'Receita' ? '+ ' : '- '}
                    {formatarBRL ? formatarBRL(item.valor) : `R$ ${Number(item.valor || 0).toFixed(2)}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ASSINATURAS */}
        <div className="pt-20 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
            Responsável Financeiro — Tay Mix
          </div>
          <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
            Sócia / Gerência — Erica Oliveira
          </div>
        </div>

      </div>
    </div>
  );
}

export default ImprimirBalancete;