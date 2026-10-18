import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText } from 'lucide-react';

export const ImpressaoPrestacaoContasTaymix = ({ 
  faturamento, 
  gastos, 
  lucroLiquido, 
  capitalGiro, 
  investimentoInicialPendente, 
  totalInvestido, 
  extrato, 
  retencaoGiro, 
  totalDisponivelDivisao, 
  socio1Valor, 
  socio2Valor, 
  dataInicio, 
  dataFim 
}) => {

  const gerarPDFOficial = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    const periodoStr = `${dataInicio ? new Date(dataInicio).toLocaleDateString('pt-BR') : 'Início'} até ${dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : 'Hoje'}`;

    let y = 15;

    // Cabeçalho Formal
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('TAY MIX — BALANCETE FINANCEIRO OFICIAL', 14, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Açaí Cremoso & Delivery — Demonstrativo Contábil', 14, y + 5);

    doc.text(`Emissão: ${dataAtual} às ${horaAtual}`, 196, y, { align: 'right' });
    doc.text(`Período: ${periodoStr}`, 196, y + 5, { align: 'right' });

    y += 10;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);

    // 1. Resumo Consolidado
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Resumo Consolidado do Período', 14, y);

    y += 4;
    const itensResumo = [
      ['Faturamento (Vendas):', `R$ ${Number(faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Gastos do Mês:', `R$ ${Number(gastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Lucro Líquido:', `R$ ${Number(lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      [`Capital de Giro (${retencaoGiro}%):`, `R$ ${Number(capitalGiro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
    ];

    doc.setFontSize(9);
    itensResumo.forEach(([label, valor]) => {
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'bold');
      doc.text(valor, 196, y, { align: 'right' });
    });

    // 2. Payback / Investimento Inicial
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Recuperação de Investimento Inicial (Payback)', 14, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Acumulado em Notinhas de Abertura:', 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${Number(totalInvestido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 196, y, { align: 'right' });

    y += 6;
    const statusPayback = investimentoInicialPendente > 0 
      ? `Faltam R$ ${Number(investimentoInicialPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para zerar` 
      : 'Investimento Inicial 100% Quitado!';
    
    doc.setFont('helvetica', 'normal');
    doc.text('Status do Payback:', 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(statusPayback, 196, y, { align: 'right' });

    // 3. Partilha de Lucros
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Partilha de Lucros da Sociedade (50% / 50%)', 14, y);

    const itensLucro = [
      ['Total Disponível para Divisão:', `R$ ${Number(totalDisponivelDivisao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Sócio 1 (50%):', `R$ ${Number(socio1Valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Sócio 2 (50%):', `R$ ${Number(socio2Valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
    ];

    doc.setFontSize(9);
    itensLucro.forEach(([label, valor]) => {
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'bold');
      doc.text(valor, 196, y, { align: 'right' });
    });

    // 4. Extrato Detalhado
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Extrato Detalhado de Entradas e Saídas', 14, y);

    y += 6;
    // Cabeçalho da tabela
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Data', 17, y + 5);
    doc.text('Descrição / Estabelecimento', 38, y + 5);
    doc.text('Categoria', 120, y + 5);
    doc.text('Valor', 193, y + 5, { align: 'right' });

    y += 7;
    doc.setTextColor(15, 23, 42);

    if (!extrato || extrato.length === 0) {
      y += 6;
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma movimentação registrada no período selecionado.', 14, y);
    } else {
      extrato.forEach((item, index) => {
        if (y > 275) { // Quebra de página automática se necessário
          doc.addPage();
          y = 20;
        }

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 6, 'F');
        }

        const dataItem = item.data || item.criadoEm ? new Date(item.data || item.criadoEm).toLocaleDateString('pt-BR') : '-';
        const descItem = item.descricao ? item.descricao.toUpperCase() : '-';
        const catItem = item.categoria || '-';
        const tipoSinal = item.tipo === 'Receita' || item.tipo === 'receita' ? '+' : '-';
        const valorItem = `${tipoSinal} R$ ${Number(item.valor || item.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(dataItem, 17, y + 4);
        doc.text(descItem.substring(0, 38), 38, y + 4);
        doc.text(catItem.substring(0, 25), 120, y + 4);
        
        doc.setFont('helvetica', 'bold');
        if (tipoSinal === '+') {
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
    y += 18;
    if (y > 250) {
      doc.addPage();
      y = 40;
    }

    doc.setDrawColor(150, 150, 150);
    doc.line(30, y, 90, y);
    doc.line(120, y, 180, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Responsável Financeiro / Gestão', 60, y + 4, { align: 'center' });
    doc.text('Conferência dos Sócios', 150, y + 4, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Tay Mix Açaí & Delivery', 60, y + 8, { align: 'center' });
    doc.text('Aprovação de Balancete', 150, y + 8, { align: 'center' });

    doc.save(`Balancete_Taymix_${dataAtual.replace(/\//g, '-')}.pdf`);
  };

  return (
    <button 
      onClick={gerarPDFOficial}
      className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 rounded-full font-bold transition-colors cursor-pointer shadow"
    >
      <FileText size={14} /> 📄 Baixar Balancete Oficial em PDF
    </button>
  );
};

export default ImpressaoPrestacaoContasTaymix;