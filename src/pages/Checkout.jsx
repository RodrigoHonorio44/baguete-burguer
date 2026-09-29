import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, CreditCard, User, Phone, Home, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const [form, setForm] = useState({
    cliente_nome: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    observacoes: '',
    forma_pagamento: 'pix',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      // Se não estiver logado, avisa e redireciona para o cadastro indicando a origem
      toast('Por favor, faça o seu cadastro para continuar o pedido.', { icon: 'ℹ️' });
      navigate('/cadastro', { state: { fromCheckout: true } });
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setForm(prev => ({
        ...prev,
        cliente_nome: userData.nome || '',
        telefone: userData.telefone || '',
        rua: userData.rua || '',
        numero: userData.numero || '',
        bairro: userData.bairro || '',
        latitude: userData.latitude || '',
        longitude: userData.longitude || ''
      }));
    } catch (e) {
      console.error('Erro ao carregar dados do utilizador:', e);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLoadingGeo(false);
        toast.success('Localização atualizada com sucesso!');
      },
      (error) => {
        console.error(error);
        setLoadingGeo(false);
        toast.error('Não foi possível obter a sua localização.');
      }
    );
  };

  const calcularTotal = () => {
    return cart.reduce((acc, item) => acc + (item.preco * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('O seu carrinho está vazio!');
      return;
    }

    setLoading(true);

    try {
      const pedidoData = {
        ...form,
        total: calcularTotal(),
        itens: cart.map(item => ({
          produtoId: item.id || item._id,
          nome: item.nome,
          quantidade: item.quantity,
          preco: item.preco
        }))
      };

      await api.criarPedido(pedidoData);
      
      toast.success('Pedido realizado com sucesso!');
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Erro ao finalizar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Finalizar Pedido</h1>
        <p className="text-sm text-slate-400">Reveja a morada, personalize o seu hambúrguer e escolha o pagamento</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
        
        {/* Bloco de Dados Cadastrais (Preenchidos automaticamente) */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Dados de Entrega</span>
            <button 
              type="button" 
              onClick={() => navigate('/cadastro')} 
              className="text-xs text-slate-400 hover:text-amber-400 underline"
            >
              Editar dados
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Nome:</span>
              <span className="text-slate-100 font-medium">{form.cliente_nome || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Telefone:</span>
              <span className="text-slate-100 font-medium">{form.telefone || 'Não informado'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 text-xs block">Morada:</span>
              <span className="text-slate-100 font-medium">
                {form.rua ? `${form.rua}, nº ${form.numero} - ${form.bairro}` : 'Endereço não informado'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={capturarLocalizacao}
            className="w-full py-2 bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <MapPin className="w-4 h-4" />
            {loadingGeo ? 'A atualizar GPS...' : 'Atualizar Localização Atual (GPS)'}
          </button>
        </div>

        {/* Observações do Hambúrguer (Tirar ou acrescentar algo) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Observações do Pedido (Ex: sem cebola, ponto da carne, tirar maionese...)
          </label>
          <textarea
            name="observacoes"
            rows="3"
            value={form.observacoes}
            onChange={handleChange}
            placeholder="Deseja retirar ou acrescentar algum ingrediente no hambúrguer?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Forma de Pagamento
          </label>
          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro (com troco)</option>
            <option value="cartao_credito">Cartão de Crédito (na entrega)</option>
            <option value="cartao_debito">Cartão de Débito (na entrega)</option>
          </select>
        </div>

        {/* Resumo e Botão de Finalização */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total a pagar:</span>
            <span className="text-2xl font-bold text-amber-500">R$ {calcularTotal().toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-sm shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'A finalizar...' : 'Finalizar Pedido'}
          </button>
        </div>

      </form>
    </div>
  );
};