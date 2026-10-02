import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useCheckout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadingCancelamento, setLoadingCancelamento] = useState(false);
  const [userDataId, setUserDataId] = useState('');
  const [userDataEmail, setUserDataEmail] = useState('');

  const [form, setForm] = useState({
    cliente_nome: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    observacoes: '',
    forma_pagamento: 'dinheiro',
    troco_para: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      toast('Por favor, faça o seu cadastro para continuar o pedido.', { icon: 'ℹ️' });
      navigate('/cadastro', { state: { fromCheckout: true } });
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUserDataId(userData.id || userData._id || '');
      setUserDataEmail(userData.email || '');

      setForm(prev => ({
        ...prev,
        cliente_nome: userData.nome || '',
        telefone: userData.telefone || '',
        rua: userData.endereco?.rua || userData.rua || '',
        numero: userData.endereco?.numero || userData.numero || '',
        bairro: userData.endereco?.bairro || userData.bairro || '',
        latitude: userData.endereco?.latitude || userData.latitude || '',
        longitude: userData.endereco?.longitude || userData.longitude || ''
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
      },
      { enableHighAccuracy: true }
    );
  };

  const calcularTotal = () => {
    return cart.reduce((acc, item) => acc + (item.preco * item.quantity), 0);
  };

  const handleCancelarPedido = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-100">
          Deseja desistir e cancelar este pedido?
        </span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition cursor-pointer"
          >
            Não
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setLoadingCancelamento(true);
              clearCart();
              toast.error('Pedido cancelado e carrinho limpo.');
              setTimeout(() => {
                navigate('/');
              }, 500);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition cursor-pointer"
          >
            Sim, cancelar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: '#090d16',
        color: '#fff',
        border: '1px solid #1e293b',
      },
    });
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
        userId: userDataId,
        email: userDataEmail,
        total: calcularTotal(),
        troco_para: form.forma_pagamento === 'dinheiro' ? form.troco_para : '',
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
      navigate('/meus-pedidos');
    } catch (error) {
      toast.error(error.message || 'Erro ao finalizar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    form,
    loading,
    loadingGeo,
    loadingCancelamento,
    navigate,
    handleChange,
    capturarLocalizacao,
    calcularTotal,
    handleCancelarPedido,
    handleSubmit,
  };
};