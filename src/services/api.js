// src/services/api.js

// Utiliza a variável de ambiente injetada pelo Vite (.env.development / .env.production)
// Com fallback para a URL pública caso nenhuma esteja definida
const API_URL = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- AUTENTICAÇÃO (Para Área Administrativa / Cozinha) ---
  login: async (telefone, senha) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone: telefone.toLowerCase(), senha })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Falha na autenticação');
    return data;
  },

  // --- PRODUTOS / CARDÁPIO ---
  getProdutos: async () => {
    const response = await fetch(`${API_URL}/produtos`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Erro ao buscar cardápio');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  criarProduto: async (payload) => {
    const payloadFormatado = {
      ...payload,
      ...(payload.nome && { nome: payload.nome.toLowerCase() }),
      ...(payload.descricao && { descricao: payload.descricao.toLowerCase() }),
      ...(payload.categoria && { categoria: payload.categoria.toLowerCase() })
    };

    const response = await fetch(`${API_URL}/produtos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payloadFormatado)
    });

    if (!response.ok) throw new Error('Erro ao cadastrar produto');
    return await response.json();
  },

  atualizarProduto: async (id, payload) => {
    const payloadFormatado = {
      ...payload,
      ...(payload.nome && { nome: payload.nome.toLowerCase() }),
      ...(payload.descricao && { descricao: payload.descricao.toLowerCase() }),
      ...(payload.categoria && { categoria: payload.categoria.toLowerCase() })
    };

    const response = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payloadFormatado)
    });

    if (!response.ok) throw new Error('Erro ao atualizar produto');
    return await response.json();
  },

  excluirProduto: async (id) => {
    const response = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Erro ao excluir produto');
    return await response.json();
  },

  // --- PEDIDOS (CLIENTE & COZINHA) ---
  getPedidos: async (status = '') => {
    const url = status ? `${API_URL}/pedidos?status=${status}` : `${API_URL}/pedidos`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  criarPedido: async (payload) => {
    const payloadFormatado = {
      ...payload,
      ...(payload.cliente_nome && { cliente_nome: payload.cliente_nome.toLowerCase() }),
      ...(payload.bairro && { bairro: payload.bairro.toLowerCase() }),
      ...(payload.rua && { rua: payload.rua.toLowerCase() }),
      ...(payload.observacoes && { observacoes: payload.observacoes.toLowerCase() })
    };

    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payloadFormatado)
    });

    if (!response.ok) throw new Error('Erro ao registrar pedido');
    return await response.json();
  },

  atualizarStatusPedido: async (id, status) => {
    const response = await fetch(`${API_URL}/pedidos/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status: status.toLowerCase() })
    });

    if (!response.ok) throw new Error('Erro ao atualizar status do pedido');
    return await response.json();
  },

  // --- CATEGORIAS ---
  getCategorias: async () => {
    const response = await fetch(`${API_URL}/categorias`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  }
};