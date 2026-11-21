import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, AlertCircle, Copy } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIAS_DISPONIVEIS = [
  'açaí / garrafas',
  'açaí / copos',
  'sorvete',
  'hambúrgueres / baguetes',
  'bebidas',
  'porções / acompanhamentos'
];

export const AdminComplementos = ({ onFechar }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clonando, setClonando] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Estados para criação de Grupo
  const [novaCategoria, setNovaCategoria] = useState('açaí / garrafas');
  const [novoNomeGrupo, setNovoNomeGrupo] = useState('');
  const [novoMinimo, setNovoMinimo] = useState(0);
  const [novoMaximo, setNovoMaximo] = useState(1);

  // Estados para criação de Item
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState('');
  const [novoNomeItem, setNovoNomeItem] = useState('');
  const [novoPrecoItem, setNovoPrecoItem] = useState('0,00');

  // Estados para Clonar / Reaproveitar Grupo Existente
  const [grupoOrigemClonarId, setGrupoOrigemClonarId] = useState('');
  const [categoriaDestinoClonar, setCategoriaDestinoClonar] = useState('sorvete');
  const [nomeClonado, setNomeClonado] = useState('');
  const [minimoClonar, setMinimoClonar] = useState(0);
  const [maximoClonar, setMaximoClonar] = useState(2);

  // Estados de Edição inline
  const [editandoGrupoId, setEditandoGrupoId] = useState(null);
  const [edicaoGrupoData, setEdicaoGrupoData] = useState({ nome: '', minimo: 0, maximo: 1 });

  const [editandoItemId, setEditandoItemId] = useState(null);
  const [edicaoItemData, setEdicaoItemData] = useState({ nome: '', preco: 0 });

  const getId = (obj) => {
    if (!obj) return '';
    if (typeof obj._id === 'object' && obj._id !== null) {
      return obj._id.$oid || obj._id.toString();
    }
    return obj._id || obj.id || '';
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complementos/grupos');
      if (res.data) {
        const lista = Array.isArray(res.data) ? res.data : [];
        setGrupos(lista);
        if (lista.length > 0) {
          const primeiroId = getId(lista[0]);
          if (!grupoSelecionadoId) setGrupoSelecionadoId(primeiroId);
          if (!grupoOrigemClonarId) {
            setGrupoOrigemClonarId(primeiroId);
            setNomeClonado(lista[0].nome || '');
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      showToast('Erro ao carregar complementos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSelecionarGrupoOrigem = (id) => {
    setGrupoOrigemClonarId(id);
    const encontrado = grupos.find((g) => getId(g) === id);
    if (encontrado) {
      setNomeClonado(encontrado.nome || '');
      setMinimoClonar(Number(encontrado.minimo || 0));
      setMaximoClonar(Number(encontrado.maximo || 1));
    }
  };

  const handlePrepararClonagemRapida = (grupo) => {
    const id = getId(grupo);
    setGrupoOrigemClonarId(id);
    setNomeClonado(grupo.nome || '');
    setMinimoClonar(Number(grupo.minimo || 0));
    setMaximoClonar(Number(grupo.maximo || 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Grupo "${grupo.nome}" carregado para clonar!`);
  };

  const handleClonarGrupo = async (e) => {
    e.preventDefault();
    const grupoOrigem = grupos.find((g) => getId(g) === grupoOrigemClonarId);

    if (!grupoOrigem) {
      showToast('Selecione um grupo existente para reaproveitar.');
      return;
    }

    const nomeFinal = (nomeClonado || grupoOrigem.nome || '').trim().toLowerCase();
    if (!nomeFinal) {
      showToast('Informe o nome do grupo na nova categoria.');
      return;
    }

    setClonando(true);
    try {
      // 1. Cria o novo grupo na categoria alvo com o mínimo e máximo configurados
      const payloadGrupo = {
        categoria: categoriaDestinoClonar.trim().toLowerCase(),
        nome: nomeFinal,
        minimo: Number(minimoClonar),
        maximo: Number(maximoClonar)
      };

      const resGrupo = await api.post('/complementos/grupos', payloadGrupo);
      const novoGrupoId =
        getId(resGrupo?.data) ||
        getId(resGrupo?.data?.grupo) ||
        resGrupo?.data?.insertedId;

      if (!novoGrupoId) {
        showToast('Grupo criado, mas não foi possível obter o ID para copiar os itens.');
        carregarDados();
        return;
      }

      // 2. Copia todos os itens do grupo original para o novo grupo
      const itensOrigem = Array.isArray(grupoOrigem.itens) ? grupoOrigem.itens : [];
      for (const item of itensOrigem) {
        await api.post('/complementos/itens', {
          grupoId: novoGrupoId,
          nome: String(item.nome || '').trim().toLowerCase(),
          preco: Number(item.preco || 0),
          disponivel: item.disponivel !== undefined ? Boolean(item.disponivel) : true
        });
      }

      showToast(
        `Grupo "${nomeFinal}" anexado em "${categoriaDestinoClonar}" com ${itensOrigem.length} item(ns)!`
      );
      carregarDados();
    } catch (err) {
      console.error('Erro ao clonar grupo:', err);
      showToast('Erro ao reaproveitar grupo para outra categoria.');
    } finally {
      setClonando(false);
    }
  };

  const handleCriarGrupo = async (e) => {
    e.preventDefault();
    if (!novoNomeGrupo.trim()) {
      showToast('Digite o nome do grupo.');
      return;
    }

    try {
      const payload = {
        categoria: novaCategoria.trim().toLowerCase(),
        nome: novoNomeGrupo.trim().toLowerCase(),
        minimo: Number(novoMinimo),
        maximo: Number(novoMaximo)
      };

      const res = await api.post('/complementos/grupos', payload);

      if (res.status === 200 || res.status === 201) {
        showToast('Grupo criado com sucesso!');
        setNovoNomeGrupo('');
        setNovoMinimo(0);
        setNovoMaximo(1);
        carregarDados();
      } else {
        showToast('Erro ao criar grupo.');
      }
    } catch (err) {
      showToast('Erro de conexão ao criar grupo.');
    }
  };

  const handleCriarItem = async (e) => {
    e.preventDefault();
    if (!grupoSelecionadoId || !novoNomeItem.trim()) {
      showToast('Selecione um grupo e informe o nome do item.');
      return;
    }

    const precoFormatado = Number(String(novoPrecoItem).replace(',', '.')) || 0;

    try {
      const payload = {
        grupoId: grupoSelecionadoId,
        nome: novoNomeItem.trim().toLowerCase(),
        preco: precoFormatado,
        disponivel: true
      };

      const res = await api.post('/complementos/itens', payload);

      if (res.status === 200 || res.status === 201) {
        showToast('Item adicionado com sucesso!');
        setNovoNomeItem('');
        setNovoPrecoItem('0,00');
        carregarDados();
      } else {
        showToast('Erro ao adicionar item.');
      }
    } catch (err) {
      showToast('Erro de conexão ao adicionar item.');
    }
  };

  const handleExcluirGrupo = async (grupoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo e todos os seus itens?')) return;
    try {
      const res = await api.delete(`/complementos/grupos/${grupoId}`);
      if (res.status === 200) {
        showToast('Grupo excluído com sucesso!');
        carregarDados();
      }
    } catch (e) {
      showToast('Erro ao excluir grupo.');
    }
  };

  const handleExcluirItem = async (itemId) => {
    try {
      const res = await api.delete(`/complementos/itens/${itemId}`);
      if (res.status === 200) {
        showToast('Item excluído com sucesso!');
        carregarDados();
      }
    } catch (e) {
      showToast('Erro ao excluir item.');
    }
  };

  const handleToggleItemDisponivel = async (item) => {
    const itemId = getId(item);
    const statusAtual = item.disponivel !== undefined ? Boolean(item.disponivel) : true;
    const novoStatus = !statusAtual;

    try {
      const payload = {
        grupoId: item.grupoId,
        nome: String(item.nome || '').trim().toLowerCase(),
        preco: Number(item.preco || 0),
        disponivel: novoStatus
      };

      const res = await api.put(`/complementos/itens/${itemId}`, payload);

      if (res.status === 200) {
        showToast(novoStatus ? 'Item marcado como disponível' : 'Item marcado como esgotado');
        carregarDados();
      } else {
        showToast('Erro ao atualizar status do item.');
      }
    } catch (e) {
      showToast('Erro de conexão ao atualizar item.');
    }
  };

  const handleSalvarEdicaoGrupo = async (grupoId) => {
    try {
      const payload = {
        ...edicaoGrupoData,
        nome: String(edicaoGrupoData.nome || '').trim().toLowerCase()
      };
      const res = await api.put(`/complementos/grupos/${grupoId}`, payload);
      if (res.status === 200) {
        showToast('Grupo atualizado com sucesso!');
        setEditandoGrupoId(null);
        carregarDados();
      }
    } catch (e) {
      showToast('Erro ao atualizar grupo.');
    }
  };

  const handleSalvarEdicaoItem = async (itemId) => {
    try {
      const payload = {
        ...edicaoItemData,
        nome: String(edicaoItemData.nome || '').trim().toLowerCase()
      };
      const res = await api.put(`/complementos/itens/${itemId}`, payload);
      if (res.status === 200) {
        showToast('Item atualizado com sucesso!');
        setEditandoItemId(null);
        carregarDados();
      }
    } catch (e) {
      showToast('Erro ao atualizar item.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 relative">
      {toastMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Gerenciar e Editar Categorias e Adicionais Cadastrados</h2>
          <p className="text-xs text-slate-500">Crie novos grupos, adicione itens ou reaproveite grupos prontos em outras categorias.</p>
        </div>
        {onFechar && (
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* BLOCO DE AÇÕES: 1. CRIAR | 2. ADICIONAR ITEM | 3. CLONAR / REAPROVEITAR GRUPO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70">
        {/* 1. Criar Novo Grupo */}
        <form onSubmit={handleCriarGrupo} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={16} className="text-amber-600" />
            1. Criar Novo Grupo
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria Alvo:</label>
            <select
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500"
            >
              {CATEGORIAS_DISPONIVEIS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Novo Grupo:</label>
            <input
              type="text"
              placeholder="Ex: escolha sua calda"
              value={novoNomeGrupo}
              onChange={(e) => setNovoNomeGrupo(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mínimo:</label>
              <input
                type="number"
                min="0"
                value={novoMinimo}
                onChange={(e) => setNovoMinimo(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Máximo:</label>
              <input
                type="number"
                min="1"
                value={novoMaximo}
                onChange={(e) => setNovoMaximo(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer"
          >
            + Criar Grupo
          </button>
        </form>

        {/* 2. Adicionar Item */}
        <form onSubmit={handleCriarItem} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={16} className="text-emerald-600" />
            2. Adicionar Item ao Grupo
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Grupo Destino:</label>
            <select
              value={grupoSelecionadoId}
              onChange={(e) => setGrupoSelecionadoId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-amber-500"
            >
              <option value="">Selecione um grupo...</option>
              {grupos.map((g) => {
                const gId = getId(g);
                return (
                  <option key={gId} value={gId}>
                    {g.nome} ({g.categoria})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Item:</label>
            <input
              type="text"
              placeholder="Ex: calda de chocolate"
              value={novoNomeItem}
              onChange={(e) => setNovoNomeItem(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Preço (R$):</label>
            <input
              type="text"
              placeholder="0,00"
              value={novoPrecoItem}
              onChange={(e) => setNovoPrecoItem(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer"
          >
            + Incluir Item no Grupo
          </button>
        </form>

        {/* 3. Reaproveitar / Clonar Grupo Pronto */}
        <form onSubmit={handleClonarGrupo} className="space-y-4 bg-indigo-50/70 p-4 rounded-xl border border-indigo-200/80">
          <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <Copy size={16} className="text-indigo-600" />
            3. Reaproveitar Grupo Pronto
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Copiar Itens do Grupo:</label>
            <select
              value={grupoOrigemClonarId}
              onChange={(e) => handleSelecionarGrupoOrigem(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="">Escolha um grupo já criado...</option>
              {grupos.map((g) => {
                const gId = getId(g);
                const qtd = Array.isArray(g.itens) ? g.itens.length : 0;
                return (
                  <option key={gId} value={gId}>
                    {g.nome} ({g.categoria} • {qtd} itens)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Anexar na Categoria:</label>
              <select
                value={categoriaDestinoClonar}
                onChange={(e) => setCategoriaDestinoClonar(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              >
                {CATEGORIAS_DISPONIVEIS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nome na Nova Categoria:</label>
              <input
                type="text"
                value={nomeClonado}
                onChange={(e) => setNomeClonado(e.target.value)}
                placeholder="Ex: escolha sua calda"
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Novo Mínimo:</label>
              <input
                type="number"
                min="0"
                value={minimoClonar}
                onChange={(e) => setMinimoClonar(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Novo Máximo:</label>
              <input
                type="number"
                min="1"
                value={maximoClonar}
                onChange={(e) => setMaximoClonar(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={clonando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Copy size={14} />
            {clonando ? 'Copiando itens...' : 'Anexar Grupo e Copiar Itens'}
          </button>
        </form>
      </div>

      {/* LISTAGEM DE GRUPOS CADASTRADOS */}
      <div className="space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Grupos Cadastrados</h3>

        {loading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Carregando grupos...</p>
        ) : grupos.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">Nenhum grupo cadastrado até o momento.</p>
        ) : (
          grupos.map((grupo) => {
            const grupoId = getId(grupo);
            const isEditingGroup = editandoGrupoId === grupoId;

            return (
              <div key={grupoId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {isEditingGroup ? (
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <input
                        type="text"
                        value={edicaoGrupoData.nome}
                        onChange={(e) => setEdicaoGrupoData({ ...edicaoGrupoData, nome: e.target.value })}
                        className="text-xs bg-white border rounded-lg px-2.5 py-1.5 outline-none font-bold"
                      />
                      <span className="text-xs text-slate-500">Mín:</span>
                      <input
                        type="number"
                        value={edicaoGrupoData.minimo}
                        onChange={(e) => setEdicaoGrupoData({ ...edicaoGrupoData, minimo: Number(e.target.value) })}
                        className="w-16 text-xs bg-white border rounded-lg px-2 py-1.5 outline-none"
                      />
                      <span className="text-xs text-slate-500">Máx:</span>
                      <input
                        type="number"
                        value={edicaoGrupoData.maximo}
                        onChange={(e) => setEdicaoGrupoData({ ...edicaoGrupoData, maximo: Number(e.target.value) })}
                        className="w-16 text-xs bg-white border rounded-lg px-2 py-1.5 outline-none"
                      />
                      <button
                        onClick={() => handleSalvarEdicaoGrupo(grupoId)}
                        className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-500 cursor-pointer"
                        title="Salvar"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setEditandoGrupoId(null)}
                        className="bg-slate-300 text-slate-700 p-1.5 rounded-lg hover:bg-slate-400 cursor-pointer"
                        title="Cancelar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{grupo.nome}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                          {grupo.categoria || 'geral'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mín: {grupo.minimo || 0} | Máx: {grupo.maximo || 1}
                      </p>
                    </div>
                  )}

                  {!isEditingGroup && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePrepararClonagemRapida(grupo)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                        title="Reaproveitar este grupo em outra categoria"
                      >
                        <Copy size={12} /> Usar em outra categoria
                      </button>
                      <button
                        onClick={() => {
                          setEditandoGrupoId(grupoId);
                          setEdicaoGrupoData({ nome: grupo.nome, minimo: grupo.minimo || 0, maximo: grupo.maximo || 1 });
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 size={12} /> Editar Grupo
                      </button>
                      <button
                        onClick={() => handleExcluirGrupo(grupoId)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                        title="Excluir Grupo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-2">
                  {(grupo.itens || []).map((item) => {
                    const itemId = getId(item);
                    const isEditingItem = editandoItemId === itemId;
                    const isDisponivel = item.disponivel !== undefined ? Boolean(item.disponivel) : true;

                    return (
                      <div
                        key={itemId}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${
                          isDisponivel ? 'bg-white border-slate-200' : 'bg-rose-50/40 border-rose-200 opacity-75'
                        }`}
                      >
                        {isEditingItem ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={edicaoItemData.nome}
                              onChange={(e) => setEdicaoItemData({ ...edicaoItemData, nome: e.target.value })}
                              className="w-full text-xs bg-white border rounded-lg px-2 py-1 outline-none font-semibold"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={edicaoItemData.preco}
                              onChange={(e) => setEdicaoItemData({ ...edicaoItemData, preco: Number(e.target.value) })}
                              className="w-full text-xs bg-white border rounded-lg px-2 py-1 outline-none"
                            />
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleSalvarEdicaoItem(itemId)} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs">
                                Salvar
                              </button>
                              <button onClick={() => setEditandoItemId(null)} className="bg-slate-300 px-2 py-1 rounded text-xs">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">{item.nome}</span>
                                <span className="text-[11px] font-semibold text-emerald-600">
                                  {Number(item.preco || 0) > 0 ? `+ R$ ${Number(item.preco).toFixed(2)}` : 'Grátis'}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  isDisponivel ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isDisponivel ? 'Disponível' : 'Esgotado'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleToggleItemDisponivel(item)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                                  isDisponivel
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                                title={isDisponivel ? 'Marcar como Esgotado' : 'Tornar Disponível'}
                              >
                                {isDisponivel ? <EyeOff size={12} /> : <Eye size={12} />}
                                {isDisponivel ? 'Esgotar' : 'Ativar'}
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditandoItemId(itemId);
                                    setEdicaoItemData({ nome: item.nome, preco: item.preco || 0 });
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Editar Item"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExcluirItem(itemId)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Excluir Item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminComplementos;