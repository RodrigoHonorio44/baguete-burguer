import { useState, useEffect } from 'react';

export function usePaginaMarketing() {
  const [abaAtiva, setAbaAtiva] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoUpload, setTipoUpload] = useState('arquivo'); // 'arquivo' | 'url'
  const [previaImagem, setPreviaImagem] = useState('');

  const [form, setForm] = useState({
    badge: '⚡ PROMOÇÃO ESPECIAL',
    titulo: 'O Encontro Perfeito do ',
    destaqueTitulo: 'Açaí e das Massas',
    descricao: 'Ingredientes selecionados para ambas as linhas, frescor diário e combinações perfeitas.',
    imagemUrl: '',
    imagemArquivo: null,
    ativo: true
  });

  // Carregar banners/promoções cadastradas do backend
  const carregarBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners/admin');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error('Erro ao buscar banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarBanners();
  }, []);

  // Manipular seleção de arquivo de imagem local
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imagemArquivo: file, imagemUrl: '' }));
      setPreviaImagem(URL.createObjectURL(file));
    }
  };

  // Manipular link / URL externa de imagem
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setForm((prev) => ({ ...prev, imagemUrl: url, imagemArquivo: null }));
    setPreviaImagem(url);
  };

  // Enviar nova promoção / banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo) {
      alert('Por favor, informe o título da promoção.');
      return;
    }

    if (!form.imagemArquivo && !form.imagemUrl) {
      alert('Selecione uma imagem do seu dispositivo ou informe um link de imagem.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (form.imagemArquivo) {
        // Envio via FormData (arquivo de imagem)
        const formData = new FormData();
        formData.append('badge', form.badge);
        formData.append('titulo', form.titulo);
        formData.append('destaqueTitulo', form.destaqueTitulo);
        formData.append('descricao', form.descricao);
        formData.append('ativo', form.ativo);
        formData.append('imagem', form.imagemArquivo);

        res = await fetch('/api/banners/admin', {
          method: 'POST',
          body: formData
        });
      } else {
        // Envio via JSON (URL direta)
        res = await fetch('/api/banners/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            badge: form.badge,
            titulo: form.titulo,
            destaqueTitulo: form.destaqueTitulo,
            descricao: form.descricao,
            imagemUrl: form.imagemUrl,
            ativo: form.ativo
          })
        });
      }

      if (res.ok) {
        alert('Promoção cadastrada com sucesso!');
        setForm({
          badge: '⚡ PROMOÇÃO ESPECIAL',
          titulo: '',
          destaqueTitulo: '',
          descricao: '',
          imagemUrl: '',
          imagemArquivo: null,
          ativo: true
        });
        setPreviaImagem('');
        carregarBanners();
      } else {
        alert('Erro ao cadastrar promoção.');
      }
    } catch (err) {
      console.error('Erro ao salvar promoção:', err);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Alternar visibilidade (Ativo / Oculto)
  const toggleAtivo = async (id, statusAtual) => {
    try {
      const res = await fetch(`/api/banners/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !statusAtual })
      });
      if (res.ok) carregarBanners();
    } catch (err) {
      alert('Erro ao alterar status da promoção');
    }
  };

  // Excluir banner
  const deletarBanner = async (id) => {
    if (!window.confirm('Deseja realmente apagar esta promoção?')) return;
    try {
      const res = await fetch(`/api/banners/admin/${id}`, { method: 'DELETE' });
      if (res.ok) carregarBanners();
    } catch (err) {
      alert('Erro ao excluir promoção');
    }
  };

  return {
    abaAtiva,
    setAbaAtiva,
    banners,
    loading,
    tipoUpload,
    setTipoUpload,
    previaImagem,
    form,
    setForm,
    handleFileChange,
    handleUrlChange,
    handleSubmit,
    toggleAtivo,
    deletarBanner,
    carregarBanners
  };
}