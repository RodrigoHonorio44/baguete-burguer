import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const useRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Coordenadas padrão iniciais (Maricá, RJ)
  const [coordsMapa, setCoordsMapa] = useState([-22.9194, -42.8186]);

  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    senha: '',
    rua: '',
    numero: '',
    bairro: '',
    referencia: '',
    latitude: '',
    longitude: '',
  });

  // Função para sanitizar entradas e bloquear caracteres maliciosos (anti-hacker básico)
  const sanitizarTexto = (texto) => {
    return texto.replace(/[<>]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefone') {
      const apenasNumeros = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: apenasNumeros }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: sanitizarTexto(value) }));
  };

  // Função que busca o endereço através da Latitude e Longitude (Geocodificação Reversa)
  const buscarEnderecoPorCoordenadas = async (lat, lng) => {
    setBuscandoEndereco(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DeliveryApp/1.0'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        
        const ruaEncontrada = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
        const numeroEncontrado = addr.house_number || '';
        const bairroEncontrado = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || '';

        setForm((prev) => ({
          ...prev,
          rua: sanitizarTexto(ruaEncontrada),
          numero: numeroEncontrado ? sanitizarTexto(numeroEncontrado) : prev.numero,
          bairro: sanitizarTexto(bairroEncontrado),
          latitude: lat,
          longitude: lng,
        }));

        toast.success('Endereço atualizado pelo mapa!');
      } else {
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    } finally {
      setBuscandoEndereco(false);
    }
  };

  const lidarComNovaLocalizacao = (lat, lng) => {
    setCoordsMapa([lat, lng]);
    buscarEnderecoPorCoordenadas(lat, lng);
  };

  const capturarLocalizacaoGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLoadingGeo(false);
        lidarComNovaLocalizacao(lat, lng);
        toast.success('GPS capturado com sucesso!');
      },
      (error) => {
        console.error(error);
        setLoadingGeo(false);
        toast.error('Não foi possível obter a sua localização. Verifique as permissões do GPS.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.telefone.length < 10 || form.telefone.length > 11) {
      toast.error('O telefone/WhatsApp deve conter o DDD seguido do número (10 ou 11 dígitos).');
      return;
    }

    if (form.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres por segurança.');
      return;
    }

    setLoading(true);

    try {
      const nomeCompleto = `${form.nome} ${form.sobrenome}`;
      
      const data = await api.register({
        nome: nomeCompleto,
        telefone: form.telefone,
        senha: form.senha,
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        referencia: form.referencia,
        latitude: form.latitude,
        longitude: form.longitude,
        role: 'cliente'
      });

      const userData = data.user || {
        nome: nomeCompleto,
        telefone: form.telefone,
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        referencia: form.referencia,
        latitude: form.latitude,
        longitude: form.longitude,
        role: 'cliente'
      };

      localStorage.setItem('token', data.token || userData.id || 'ativo');
      localStorage.setItem('role', 'cliente');
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Cadastro realizado com sucesso!');

      const redirectTo = location.state?.fromCheckout ? '/checkout' : '/';
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    loadingGeo,
    buscandoEndereco,
    mostrarSenha,
    coordsMapa,
    setMostrarSenha,
    handleChange,
    handleSubmit,
    capturarLocalizacaoGPS,
    lidarComNovaLocalizacao,
  };
};