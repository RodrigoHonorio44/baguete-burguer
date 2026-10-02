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

export const enviarParaMotoboy = (pedido, telefoneMotoboy = '') => {
  const itensTexto = pedido.itens.map(i => 
    `- ${i.quantidade || i.quantity || 1}x ${i.nome} (${formatarMoeda(i.preco_unitario || i.preco)})`
  ).join('\n');
  
  const telefoneCliente = pedido.telefone || pedido.cliente_telefone || 'Não informado';
  const formaPagamento = pedido.forma_pagamento || pedido.pagamento || 'Não informado';
  
  // Verifica coordenadas tanto diretas quanto no objeto endereco
  const lat = pedido.latitude || pedido.endereco?.latitude;
  const lng = pedido.longitude || pedido.endereco?.longitude;
  const temCoordenadas = lat && lng;
  
  // Pega o endereço considerando formato plano ou aninhado
  const rua = pedido.rua || pedido.endereco?.rua || '';
  const numero = pedido.numero || pedido.endereco?.numero || '';
  const bairro = pedido.bairro || pedido.endereco?.bairro || '';
  const enderecoTexto = (rua || numero || bairro) ? `Rua ${rua}, ${numero} - ${bairro}` : 'Endereço não informado';
  
  const linkMapa = temCoordenadas 
    ? `https://maps.google.com/?q=${lat},${lng}` 
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(enderecoTexto);

  const idPedidoFormatado = pedido._id ? pedido._id.slice(-4) : (pedido.id ? pedido.id.slice(-4) : 'Geral');

  const mensagem = `🛵 *NOVO PEDIDO PARA ENTREGA* 🛵\n\n` +
    `📌 *Pedido:* #${idPedidoFormatado}\n` +
    `*Cliente:* ${pedido.cliente_nome || 'Cliente'} (${telefoneCliente})\n` +
    `*Endereço:* ${enderecoTexto}\n` +
    `*Pagamento:* ${String(formaPagamento).toUpperCase()} ` +
    `${pedido.troco_para ? `(Levar troco para ${formatarMoeda(pedido.troco_para)})` : ''}\n` +
    `*Total a Receber:* ${formatarMoeda(pedido.total)}\n\n` +
    `*Itens do Pedido:*\n${itensTexto}\n\n` +
    `${pedido.observacoes ? `📝 *Observações:* ${pedido.observacoes}\n\n` : ''}` +
    `📍 *Abrir Localização no GPS:* \n${linkMapa}`;

  // Se houver número do motoboy configurado/passado, envia direto para o contato dele
  let urlWhatsApp = '';
  const numeroLimpo = telefoneMotoboy ? String(telefoneMotoboy).replace(/\D/g, '') : '';
  
  if (numeroLimpo) {
    urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${encodeURIComponent(mensagem)}`;
  } else {
    urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
  }

  window.open(urlWhatsApp, '_blank');
};