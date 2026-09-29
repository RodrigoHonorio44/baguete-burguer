import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_nome: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    observacoes: '',
    forma_pagamento: 'pix',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        cliente_nome: form.cliente_nome,
        telefone: form.telefone,
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        observacoes: form.observacoes,
        forma_pagamento: form.forma_pagamento,
        total: cartTotal,
        itens: cart.map((item) => ({
          produto_id: item.id || item._id,
          nome: (item.nome || item.name || '').toLowerCase(),
          quantidade: item.quantity,
          preco_unitario: item.preco || item.price,
        })),
      };

      await api.criarPedido(payload);

      alert('pedido enviado e registrado com sucesso no servidor!');
      clearCart();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('erro ao enviar o pedido para o servidor: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">seu carrinho está vazio</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg"
        >
          voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">finalizar pedido</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">nome completo</label>
          <input
            type="text"
            name="cliente_nome"
            required
            value={form.cliente_nome}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">telefone / whatsapp</label>
          <input
            type="text"
            name="telefone"
            required
            value={form.telefone}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">rua</label>
            <input
              type="text"
              name="rua"
              required
              value={form.rua}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">número</label>
            <input
              type="text"
              name="numero"
              required
              value={form.numero}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">bairro</label>
          <input
            type="text"
            name="bairro"
            required
            value={form.bairro}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">observações (ex: sem cebola)</label>
          <textarea
            name="observacoes"
            rows="2"
            value={form.observacoes}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">forma de pagamento</label>
          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="pix">pix</option>
            <option value="cartao">cartão de crédito / débito</option>
            <option value="dinheiro">dinheiro</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-slate-100 font-bold">
          <span>total a pagar:</span>
          <span className="text-emerald-400 text-xl">r$ {cartTotal.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition mt-4"
        >
          {submitting ? 'enviando pedido...' : 'confirmar e enviar pedido'}
        </button>
      </form>
    </div>
  );
};