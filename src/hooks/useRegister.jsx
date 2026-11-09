import { useState } from 'react';
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

  // ESTADO INICIAL COMPLETO COM 'referencia' E 'apelido'
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    senha: '',
    apelido: 'Casa',
    rua: '',
    numero: '',
    bairro: '',
    referencia: '',
    latitude: '',
    longitude: '',
  });

  const sanitizarTexto = (texto) => {
    return texto ? texto.replace(/[<>]/g, '') : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefone') {
      const apenasNumeros = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: apenasNumeros }));
      return;
    }

    const valorSanitizado = sanitizarTexto(value);
    
    // LOG PARA TESTAR SE O CAMPO DE REFERÊNCIA ESTÁ CAPTURANDO O TEXTO
    if (name === 'referencia') {
      console.log('Digitando na Referência:', valorSanitizado);
    }

    setForm((prev) => ({ ...prev, [name]: valorSanitizado }));
  };

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
          referencia: prev.referencia, // Mantém o que foi digitado na referência
          latitude: Number(lat),
          longitude: Number(lng),
        }));

        toast.success('Endereço e GPS atualizados pelo mapa!');
      } else {
        setForm((prev) => ({ 
          ...prev, 
          latitude: Number(lat), 
          longitude: Number(lng) 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      setForm((prev) => ({ 
        ...prev, 
        latitude: Number(lat), 
        longitude: Number(lng) 
      }));
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
      const latFinal = form.latitude !== '' && form.latitude !== null ? Number(form.latitude) : Number(coordsMapa[0]);
      const lngFinal = form.longitude !== '' && form.longitude !== null ? Number(form.longitude) : Number(coordsMapa[1]);

      // Envia o payload completo incluindo explicitamente a referencia
      const payload = {
        nome: form.nome.trim(),
        sobrenome: form.sobrenome.trim(),
        telefone: form.telefone,
        senha: form.senha,
        role: 'cliente',
        rua: form.rua || 'Rua não informada',
        numero: form.numero || 'S/N',
        bairro: form.bairro || 'Centro',
        referencia: form.referencia ? form.referencia.trim() : '',
        latitude: latFinal,
        longitude: lngFinal,
        apelido: form.apelido || 'Casa',
        endereco: {
          apelido: form.apelido || 'Casa',
          rua: form.rua || 'Rua não informada',
          numero: form.numero || 'S/N',
          bairro: form.bairro || 'Centro',
          referencia: form.referencia ? form.referencia.trim() : '',
          latitude: latFinal,
          longitude: lngFinal
        }
      };

      // 👀 LOG EXATO DO PAYLOAD ANTES DE ENVIAR PARA A API
      //console.log('🚀 PAYLOAD COMPLETO ENVIADO PARA A API:', payload);

      const data = await api.register(payload);

      const userData = data.user || {
        nome: `${form.nome} ${form.sobrenome}`.trim(),
        telefone: form.telefone,
        role: 'cliente',
        endereco: payload.endereco,
        enderecos: [payload.endereco]
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

export default useRegister;