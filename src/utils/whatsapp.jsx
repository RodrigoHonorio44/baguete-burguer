export const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatarDataHora = (dataString) => {
  if (!dataString) return '';
  return new Date(dataString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const enviarParaMotoboy = (pedido) => {
  const itensTexto = pedido.itens.map(i => `- ${i.quantidade}x ${i.nome} (${formatarMoeda(i.preco_unitario || i.preco)})`).join('\n');
  
  const telefoneCliente = pedido.telefone || pedido.cliente_telefone || 'Não informado';
  const formaPagamento = pedido.forma_pagamento || pedido.pagamento || 'Não informado';
  
  const temCoordenadas = pedido.latitude && pedido.longitude;
  
  // Montagem do endereço de forma simples com concatenação para evitar erros de crases aninhadas
  const enderecoTexto = 'Rua ' + (pedido.rua || '') + ', ' + (pedido.numero || '') + ' - ' + (pedido.bairro || '');
  
  const linkMapa = temCoordenadas 
    ? `https://maps.google.com/?q=${pedido.latitude},${pedido.longitude}` 
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(enderecoTexto);

  const mensagem = `🛵 *NOVO PEDIDO PARA ENTREGA* 🛵\n\n` +
    `*Cliente:* ${pedido.cliente_nome} (${telefoneCliente})\n` +
    `*Endereço:* ${enderecoTexto}\n` +
    `*Pagamento:* ${String(formaPagamento).toUpperCase()} ` +
    `${pedido.troco_para ? `(Levar troco para ${formatarMoeda(pedido.troco_para)})` : ''}\n` +
    `*Total a Receber:* ${formatarMoeda(pedido.total)}\n\n` +
    `*Itens do Pedido:*\n${itensTexto}\n\n` +
    `📍 *Abrir Localização no GPS:* \n${linkMapa}`;

  const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
  window.open(urlWhatsApp, '_blank');
};