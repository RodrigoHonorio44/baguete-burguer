import React from 'react';
import { Printer } from 'lucide-react';

/**
 * Função utilitária global ou interna para disparar a impressão da comanda.
 * Você pode importá-la diretamente se precisar chamar de outro lugar, 
 * ou usar o botão renderizado por este componente.
 */
export const dispararImpressao = (pedido) => {
  const janelaImpressao = window.open('', '_blank', 'width=400,height=600');
  
  if (!janelaImpressao) {
    alert('Permita pop-ups no navegador para conseguir imprimir a comanda.');
    return;
  }

  const itensHtml = pedido.itens && pedido.itens.length > 0
    ? pedido.itens.map(item => `
        <tr>
          <td>${item.quantidade || 1}x ${item.nome || item.produto || 'Item'}</td>
          <td class="right">R$ ${((item.preco || 0) * (item.quantidade || 1)).toFixed(2)}</td>
        </tr>
        ${item.observacao ? `<tr><td colspan="2" style="font-size: 10px; font-style: italic; padding-bottom: 4px;">Obs: ${item.observacao}</td></tr>` : ''}
      `).join('')
    : '<tr><td colspan="2">Sem itens detalhados</td></tr>';

  const conteudoHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Comanda #${pedido._id ? pedido._id.slice(-4) : '---'}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            width: 270px;
            margin: 0;
            padding: 5px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; font-size: 12px; padding: 2px 0; }
          .right { text-align: right; }
          .footer { font-size: 10px; margin-top: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 14px;">TAY MIX AÇAÍ</div>
        <div class="center">Comanda Cozinha / Delivery</div>
        <div class="line"></div>
        <div><strong>Pedido:</strong> #${pedido._id ? pedido._id.slice(-4) : '---'}</div>
        <div><strong>Cliente:</strong> ${pedido.nomeCliente || pedido.cliente || 'Balcão'}</div>
        <div><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</div>
        <div class="line"></div>
        <table>
          <thead>
            <tr>
              <th>Qtd / Item</th>
              <th class="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itensHtml}
          </tbody>
        </table>
        <div class="line"></div>
        <div><strong>Forma de Pagto:</strong> ${pedido.formaPagamento || pedido.pagamento || 'Dinheiro'}</div>
        <div class="bold" style="font-size: 14px; margin-top: 4px;">Total: R$ ${Number(pedido.total || 0).toFixed(2)}</div>
        <div class="line"></div>
        <div class="footer">Impresso via Sistema Tay Mix</div>
      </body>
    </html>
  `;

  janelaImpressao.document.write(conteudoHtml);
  janelaImpressao.document.close();
  janelaImpressao.focus();
  
  setTimeout(() => {
    janelaImpressao.print();
    janelaImpressao.close();
  }, 400);
};

/**
 * Componente de Botão de Impressão para reutilizar onde quiser no painel
 */
export default function ComandaImpressao({ pedido, iconeApenas = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => dispararImpressao(pedido)}
      title="Imprimir Comanda Térmica"
      className={className}
      style={{
        background: '#374151',
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        padding: iconeApenas ? '10px 12px' : '8px 14px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'background 0.2s'
      }}
    >
      <Printer size={18} />
      {!iconeApenas && <span>Imprimir</span>}
    </button>
  );
}