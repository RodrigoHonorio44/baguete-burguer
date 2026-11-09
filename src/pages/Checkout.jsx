import React, { useState, useEffect } from 'react';
import { MapPin, Trash2, AlertCircle, ShoppingBag, Plus } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const {
    cart,
    form,
    setForm,
    loading,
    loadingGeo,
    loadingCancelamento,
    taxaEntrega,
    pedidoMinimo,
    navigate,
    handleChange,
    capturarLocalizacao,
    calcularSubtotal,
    calcularTotal,
    handleCancelarPedido,
    handleSubmit,
  } = useCheckout();

  const [enderecosCliente, setEnderecosCliente] = useState([]);
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState('');
  const [modoNovoEndereco, setModoNovoEndereco] = useState(false);
  
  const [novoApelido, setNovoApelido] = useState('');
  const [novaRua, setNovaRua] = useState('');
  const [novoNumero, setNovoNumero] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novaReferencia, setNovaReferencia] = useState('');

  // Carrega e normaliza os dados do usuário salvos no login ou buscados na API
  useEffect(() => {
    const carregarPerfilUsuario = async () => {
      try {
        const userSalvoStr = localStorage.getItem('user');
        let dadosUser = userSalvoStr ? JSON.parse(userSalvoStr) : null;

        const userId = localStorage.getItem('token') || dadosUser?.id || dadosUser?._id;

        if (userId && api.getUsuarioPorId) {
          try {
            const resApi = await api.getUsuarioPorId(userId);
            if (resApi) dadosUser = resApi;
          } catch (e) {
            console.log('Usando dados do localStorage:', e);
          }
        }

        if (dadosUser) {
          // Trata o nome de forma robusta (buscando em todas as variações possíveis)
          const nomePuro = dadosUser.nome || dadosUser.cliente_nome || '';
          const sobrenomePuro = dadosUser.sobrenome || '';
          const nomeCompleto = nomePuro ? `${nomePuro} ${sobrenomePuro}`.trim() : 'Cliente';
            
          const tel = dadosUser.telefone || dadosUser.celular || '';
          
          // Trata múltiplos endereços, objeto único ou campos planos legados
          let listaEnd = [];
          if (dadosUser.enderecos && Array.isArray(dadosUser.enderecos) && dadosUser.enderecos.length > 0) {
            listaEnd = dadosUser.enderecos;
          } else if (dadosUser.endereco && Object.keys(dadosUser.endereco).length > 0) {
            listaEnd = [{ id: '1', apelido: 'Casa', ...dadosUser.endereco }];
          } else if (dadosUser.rua) {
            listaEnd = [{
              id: '1',
              apelido: 'Casa',
              rua: dadosUser.rua,
              numero: dadosUser.numero,
              bairro: dadosUser.bairro,
              referencia: dadosUser.referencia,
              latitude: dadosUser.latitude,
              longitude: dadosUser.longitude
            }];
          }

          setEnderecosCliente(listaEnd);

          if (listaEnd.length > 0) {
            const principal = listaEnd[0];
            setEnderecoSelecionadoId(principal.id || '1');
            setForm(prev => ({
              ...prev,
              cliente_nome: nomeCompleto,
              telefone: tel,
              rua: principal.rua || '',
              numero: principal.numero || '',
              bairro: principal.bairro || '',
              referencia: principal.referencia || '',
              latitude: principal.latitude || '',
              longitude: principal.longitude || ''
            }));
          } else {
            setForm(prev => ({
              ...prev,
              cliente_nome: nomeCompleto,
              telefone: tel
            }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário no checkout:", err);
      }
    };

    carregarPerfilUsuario();
  }, [setForm]);

  const handleTrocarEndereco = (e) => {
    const idEscolhido = e.target.value;
    setEnderecoSelecionadoId(idEscolhido);

    const endEncontrado = enderecosCliente.find(item => String(item.id) === String(idEscolhido));
    if (endEncontrado) {
      setForm(prev => ({
        ...prev,
        rua: endEncontrado.rua || '',
        numero: endEncontrado.numero || '',
        bairro: endEncontrado.bairro || '',
        referencia: endEncontrado.referencia || '',
        latitude: endEncontrado.latitude || '',
        longitude: endEncontrado.longitude || ''
      }));
      toast.success(`Endereço "${endEncontrado.apelido || 'Selecionado'}" aplicado!`);
    }
  };

  const handleSalvarNovoEndereco = async (e) => {
    e.preventDefault();
    if (!novaRua || !novoNumero || !novoBairro) {
      toast.error('Preencha os campos obrigatórios do endereço.');
      return;
    }

    try {
      const userSalvoStr = localStorage.getItem('user');
      const dadosUser = userSalvoStr ? JSON.parse(userSalvoStr) : null;
      const userId = localStorage.getItem('token') || dadosUser?.id || dadosUser?._id;

      const novoEndObj = {
        apelido: novoApelido || 'Trabalho / Outro',
        rua: novaRua,
        numero: novoNumero,
        bairro: novoBairro,
        referencia: novaReferencia,
        latitude: form.latitude || -22.9194,
        longitude: form.longitude || -42.8186
      };

      if (userId && api.adicionarEnderecoUsuario) {
        await api.adicionarEnderecoUsuario(userId, novoEndObj);
      }

      const idGerado = Date.now().toString();
      const endComId = { id: idGerado, ...novoEndObj };
      const atualizados = [...enderecosCliente, endComId];
      
      setEnderecosCliente(atualizados);
      setEnderecoSelecionadoId(idGerado);
      setModoNovoEndereco(false);

      setForm(prev => ({
        ...prev,
        rua: novoEndObj.rua,
        numero: novoEndObj.numero,
        bairro: novoEndObj.bairro,
        referencia: novoEndObj.referencia
      }));

      toast.success('Novo endereço adicionado e selecionado!');
    } catch (err) {
      toast.error('Erro ao salvar novo endereço.');
    }
  };

  const subtotalProdutos = calcularSubtotal();
  const totalGeral = calcularTotal();
  const atingePedidoMinimo = pedidoMinimo <= 0 || subtotalProdutos >= pedidoMinimo;
  const faltaValor = pedidoMinimo > 0 && subtotalProdutos < pedidoMinimo ? pedidoMinimo - subtotalProdutos : 0;

  const itemEstoqueInsuficiente = cart.find(
    (item) => item.estoque !== undefined && item.quantidade > item.estoque
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-12">
      {/* CABEÇALHO COM ALTA VISIBILIDADE */}
      <div className="text-center mb-8 space-y-1.5">
        <h1 className="text-3xl font-black text-amber-500 tracking-tight">Finalizar Pedido</h1>
        <p className="text-sm text-slate-300 font-medium">Reveja a morada, personalize o seu hambúrguer e escolha o pagamento</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
        
        {/* Bloco de Dados Cadastrais e Múltiplos Endereços */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Dados de Entrega</span>
            <button 
              type="button" 
              onClick={() => setModoNovoEndereco(!modoNovoEndereco)} 
              className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> {modoNovoEndereco ? 'Usar salvos' : 'Adicionar outro endereço'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Nome:</span>
              <span className="text-slate-100 font-bold capitalize text-base">{form.cliente_nome || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Telefone:</span>
              <span className="text-slate-100 font-bold text-base">{form.telefone || 'Não informado'}</span>
            </div>

            {/* SELETOR DE MÚLTIPLOS ENDEREÇOS OU CADASTRO RÁPIDO */}
            <div className="md:col-span-2 space-y-2 pt-1">
              <span className="text-slate-400 text-xs block">Morada de Entrega:</span>
              
              {!modoNovoEndereco ? (
                <div className="space-y-2">
                  {enderecosCliente.length > 0 ? (
                    <select
                      value={enderecoSelecionadoId}
                      onChange={handleTrocarEndereco}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                    >
                      {enderecosCliente.map((end) => (
                        <option key={end.id || Math.random()} value={end.id}>
                          [{end.apelido || 'Endereço'}] {end.rua}, {end.numero} - {end.bairro}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {/* CAIXA DE RESUMO DO ENDEREÇO E REFERÊNCIA */}
                  <div className="text-slate-100 font-medium text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div>📍 <strong className="text-amber-400">{form.rua || 'Endereço não informado'}</strong>, nº {form.numero || 'S/N'}</div>
                    <div>Bairro: {form.bairro || 'Não informado'}</div>
                    {/* EXIBIÇÃO CORRETA DA REFERÊNCIA */}
                    <div className="text-amber-300/90 italic font-semibold">
                      Ref: {form.referencia && form.referencia.trim() !== '' ? form.referencia : 'Nenhuma referência informada'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">Cadastrar Novo Local (Ex: Trabalho)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Apelido (Ex: Trabalho)"
                      value={novoApelido}
                      onChange={(e) => setNovoApelido(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={novoNumero}
                      onChange={(e) => setNovoNumero(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Rua / Logradouro"
                    value={novaRua}
                    onChange={(e) => setNovaRua(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={novoBairro}
                    onChange={(e) => setNovoBairro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ponto de Referência (Opcional)"
                    value={novaReferencia}
                    onChange={(e) => setNovaReferencia(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSalvarNovoEndereco}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer"
                  >
                    Salvar e Usar Este Endereço
                  </button>
                </div>
              )}

              {form.latitude ? (
                <p className="text-[11px] text-emerald-400 font-bold mt-1">
                  ✔ Coordenadas GPS sincronizadas para o motoboy.
                </p>
              ) : (
                <p className="text-xs text-amber-400 mt-1">Clique em "Atualizar Localização Atual (GPS)" para garantir a rota exata da entrega.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={capturarLocalizacao}
            disabled={loadingGeo}
            className="w-full py-2 bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <MapPin className="w-4 h-4" />
            {loadingGeo ? 'A atualizar GPS...' : 'Atualizar Localização Atual (GPS)'}
          </button>
        </div>

        {/* ALERTA DE ESTOQUE */}
        {itemEstoqueInsuficiente && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300">
              <span className="font-bold block text-sm">Estoque alterado!</span>
              <span>O item <strong className="text-white">{itemEstoqueInsuficiente.nome}</strong> tem apenas <strong className="text-white">{itemEstoqueInsuficiente.estoque} unidades</strong> disponíveis.</span>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Observações do Pedido (Ex: sem cebola, ponto da carne...)
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

        {/* Pagamento */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Forma de Pagamento
          </label>
          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="pix">Pix</option>
            <option value="dinheiro_certo">Dinheiro (sem troco)</option>
            <option value="dinheiro_troco">Dinheiro (com troco)</option>
            <option value="cartao_credito">Cartão de Crédito (na entrega)</option>
            <option value="cartao_debito">Cartão de Débito (na entrega)</option>
          </select>
        </div>

        {form.forma_pagamento === 'dinheiro_troco' && (
          <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <label className="block text-xs font-medium text-amber-400">
              Precisa de troco para quanto?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                name="troco_para"
                placeholder="Ex: 100.00"
                value={form.troco_para || ''}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal dos produtos:</span>
            <span>R$ {subtotalProdutos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxa de entrega:</span>
            <span className="text-amber-400">
              {taxaEntrega > 0 ? `R$ ${taxaEntrega.toFixed(2)}` : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* Ações Finais */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total a pagar:</span>
              <span className="text-2xl font-bold text-amber-500">R$ {totalGeral.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={
                loading || 
                cart.length === 0 || 
                !atingePedidoMinimo || 
                taxaEntrega === 0 || 
                !!itemEstoqueInsuficiente
              }
              className={`py-3 px-6 font-bold rounded-xl transition text-sm shadow-lg cursor-pointer ${
                atingePedidoMinimo && !itemEstoqueInsuficiente
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {loading ? 'A finalizar...' : 'Finalizar Pedido'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCancelarPedido}
            disabled={loadingCancelamento}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loadingCancelamento ? 'A cancelar...' : 'Desistir / Cancelar Pedido'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;