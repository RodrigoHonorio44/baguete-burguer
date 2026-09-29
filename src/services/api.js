// src/services/api.js

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// Defina as URLs da API Node.js da Hamburgueria baseada no Proxmox
const LOCALHOST_API_URL = 'http://192.168.0.71:5000/api'; // IP correto do container no Proxmox
const PUBLIC_API_URL = 'https://api-hamburgueria.rodhonsystem.com.br/api';

const getApiUrl = () => {
  if (isLocalhost || hostname.startsWith('192.168.')) return LOCALHOST_API_URL;
  return PUBLIC_API_URL;
};

const API_URL = getApiUrl();

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
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

  getProdutos: async () => {
    const response = await fetch(`${API_URL}/produtos`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Erro ao buscar cardápio');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  criarProduto: async (payload) => {
    const response = await fetch(`${API_URL}/produtos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Erro ao cadastrar produto');
    return await response.json();
  },

  atualizarProduto: async (id, payload) => {
    const response = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
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

  getPedidos: async (status = '') => {
    const url = status ? `${API_URL}/pedidos?status=${status}` : `${API_URL}/pedidos`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  criarPedido: async (payload) => {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
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

  getCategorias: async () => {
    const response = await fetch(`${API_URL}/categorias`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  }
};