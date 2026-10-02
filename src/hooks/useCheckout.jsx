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

  // Estados de Entrega Dinâmicos
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [configLoja, setConfigLoja] = useState(null);

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

  // Carrega dados do usuário e configurações de entrega da loja
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

    // Carrega as configurações unificadas da loja (raios, taxas e zonas proibidas)
    const carregarConfiguracoesLoja = async () => {
      try {
        let dadosServer = null;
        if (typeof api.getConfiguracoesLoja === 'function') {
          dadosServer = await api.getConfiguracoesLoja();
        } else if (typeof api.getConfiguracoes === 'function') {
          dadosServer = await api.getConfiguracoes();
        }

        if (dadosServer) {
          setConfigLoja(dadosServer);
          return;
        }
      } catch (err) {
        console.error('Erro ao buscar configurações no servidor:', err);
      }

      // Fallback para o localStorage
      const configSalva = localStorage.getItem('configuracoes_loja');
      if (configSalva) {
        try {
          setConfigLoja(JSON.parse(configSalva));
        } catch (e) {
          console.error('Erro ao analisar configurações locais:', e);
        }
      }
    };

    carregarConfiguracoesLoja();
  }, [navigate]);

  // Função auxiliar para calcular a distância em quilómetros entre duas coordenadas (Fórmula de Haversine)
  const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Efeito para recalcular a taxa de entrega sempre que a latitude/longitude do cliente mudarem
  useEffect(() => {
    if (!configLoja || !form.latitude || !form.longitude) {
      setTaxaEntrega(0);
      return;
    }

    const { posicaoLoja, faixasRaio, zonasProibidas } = configLoja;

    if (!posicaoLoja || !posicaoLoja[0] || !posicaoLoja[1]) return;

    const clienteLat = parseFloat(form.latitude);
    const clienteLon = parseFloat(form.longitude);

    // 1. Verificar se o cliente está dentro de alguma zona proibida (bloqueada)
    if (zonasProibidas && zonasProibidas.length > 0) {
      for (const zona of zonasProibidas) {
        const distanciaZona = calcularDistanciaKm(clienteLat, clienteLon, zona.lat, zona.lng);
        if (distanciaZona <= (zona.raioKm || 1.5)) {
          toast.error('Desculpe, a sua localização encontra-se numa zona de entrega proibida/bloqueada.');
          setTaxaEntrega(0);
          return;
        }
      }
    }

    // 2. Calcular distância da loja até o cliente
    const distanciaLojaCliente = calcularDistanciaKm(posicaoLoja[0], posicaoLoja[1], clienteLat, clienteLon);

    // 3. Avaliar faixas de raio ativas
    const faixasAtivas = (faixasRaio || [])
      .filter(f => f.ativo)
      .sort((a, b) => a.km - b.km);

    if (faixasAtivas.length === 0) {
      toast.error('Nenhuma região de entrega ativa configurada na loja.');
      setTaxaEntrega(0);
      return;
    }

    const faixaEncontrada = faixasAtivas.find(f => {
      // Se a faixa tiver um centro independente fixado, calcula a distância a partir dele, senão usa a loja principal
      let centroRaio = posicaoLoja;
      if (f.fixo && f.posicao) {
        centroRaio = f.posicao;
      }
      const distanciaCentro = calcularDistanciaKm(centroRaio[0], centroRaio[1], clienteLat, clienteLon);
      return distanciaCentro <= f.km;
    });

    if (!faixaEncontrada) {
      toast.error('O seu endereço está fora da nossa área de atendimento.');
      setTaxaEntrega(0);
      return;
    }

    setTaxaEntrega(faixaEncontrada.taxa);
  }, [form.latitude, form.longitude, configLoja]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error('A geolocalização não é suportada pelo seu navegador.');
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
        toast.success('Localização e taxa de entrega calculadas com sucesso!');
      },
      (error) => {
        console.error(error);
        setLoadingGeo(false);
        toast.error('Não foi possível obter a sua localização.');
      },
      { enableHighAccuracy: true }
    );
  };

  const calcularSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.preco * item.quantity), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + taxaEntrega;
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

    if (taxaEntrega === 0 && configLoja) {
      toast.error('Por favor, valide a sua localização/morada para calcular a entrega antes de finalizar.');
      return;
    }

    setLoading(true);

    try {
      const pedidoData = {
        ...form,
        userId: userDataId,
        email: userDataEmail,
        subtotal: calcularSubtotal(),
        taxa_entrega: taxaEntrega,
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
    taxaEntrega,
    navigate,
    handleChange,
    capturarLocalizacao,
    calcularSubtotal,
    calcularTotal,
    handleCancelarPedido,
    handleSubmit,
  };
};