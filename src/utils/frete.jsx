// Tabela de bairros e taxas predefinidas (você pode carregar de uma API ou do banco)
const TABELA_BAIRROS = {
  "centro": { taxa: 5.00, ativo: true },
  "flamengo": { taxa: 7.00, ativo: true },
  "inoã": { taxa: 12.00, ativo: true },
  "itaipuaçu": { taxa: 15.00, ativo: true },
  "ponta negra": { taxa: 20.00, ativo: true }
};

export const calcularTaxaEntrega = (bairroCliente) => {
  if (!bairroCliente) return { valido: false, taxa: 0, mensagem: "Bairro não informado" };

  const bairroFormatado = bairroCliente.toLowerCase().trim();
  const configBairro = TABELA_BAIRROS[bairroFormatado];

  if (!configBairro || !configBairro.ativo) {
    return { 
      valido: false, 
      taxa: 0, 
      mensagem: "Desculpe, não entregamos nesta região ou o bairro não foi encontrado." 
    };
  }

  return {
    valido: true,
    taxa: configBairro.taxa,
    mensagem: "Entrega disponível!"
  };
};