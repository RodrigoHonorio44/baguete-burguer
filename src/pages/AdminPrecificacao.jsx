import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, Sliders, Edit2, ChevronRight } from 'lucide-react';
import { usePrecificacao } from '../hooks/usePrecificacao';
import PainelSimuladorDinamico from '../components/PainelSimuladorDinamico';

export default function AdminPrecificacao() {
  const {
    aba, setAba,
    insumos, produtosSalvos, loading,
    editandoInsumoId,
    novoNome, setNovoNome,
    novaCategoria, setNovaCategoria,
    novaUnidade, setNovaUnidade,
    precoTotalComprado, setPrecoTotalComprado,
    qtdEmbalagem, setQtdEmbalagem,
    taxas, setTaxas,
    nomeProdutoFinal, setNomeProdutoFinal,
    itensReceita,
    insumoSelecionadoId, setInsumoSelecionadoId,
    qtdUsadaInsumo, setQtdUsadaInsumo,
    unidadeMedidaSelecionada, setUnidadeMedidaSelecionada,
    custoDiretoTotalProduto,
    handleAdicionarIngredienteFicha,
    handleRemoverIngredienteFicha,
    handleSalvarProdutoFinal,
    handleExcluirProdutoFinal,
    handleSalvarInsumo,
    handleEditarInsumo,
    handleCancelarEdicaoInsumo,
    handleExcluirInsumo,
    handleSalvarTaxas
  } = usePrecificacao();

  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState(null);

  useEffect(() => {
    if (produtosSalvos.length > 0 && !produtoSelecionadoId) {
      setProdutoSelecionadoId(produtosSalvos[0]._id);
    }
  }, [produtosSalvos]);

  const produtoAtivo = produtosSalvos.find(p => p._id === produtoSelecionadoId) || produtosSalvos[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Precificação Dinâmica & Lucro Líquido</h1>
          </div>
          
          <div className="flex flex-wrap bg-white p-1 rounded-2xl border border-slate-200/80 gap-1 shadow-2xs">
            <button onClick={() => setAba('simulador')} className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${aba === 'simulador' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}>
              🛠️ Montar Ficha Técnica
            </button>
            <button onClick={() => setAba('produtos')} className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${aba === 'produtos' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}>
              📋 Produtos Salvos ({produtosSalvos.length})
            </button>
            <button onClick={() => setAba('insumos')} className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${aba === 'insumos' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}>
              📦 Insumos / Ingredientes
            </button>
            <button onClick={() => setAba('taxas')} className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${aba === 'taxas' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}`}>
              ⚙️ Taxas dos Apps
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Carregando dados...</div>
        ) : aba === 'simulador' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MONTAGEM DE RECEITA */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 space-y-5 shadow-xs">
                <h2 className="text-base font-bold text-amber-700 tracking-wider flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-600" /> Montar Receita do Produto Final
                </h2>

                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-bold">Nome do Produto Final</label>
                  <input 
                    type="text" 
                    value={nomeProdutoFinal} 
                    onChange={e => setNomeProdutoFinal(e.target.value)} 
                    placeholder="Ex: Açaí de Banana 500ml Completo" 
                    className="w-full bg-slate-50 p-2.5 rounded-xl text-sm text-slate-800 font-bold border border-slate-300 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-amber-800 tracking-wider">Adicionar Ingrediente ou Embalagem</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-600 block mb-1 font-semibold">Selecione o Insumo</label>
                      <select 
                        value={insumoSelecionadoId} 
                        onChange={e => setInsumoSelecionadoId(e.target.value)} 
                        className="w-full bg-white p-2 rounded-xl text-xs text-slate-800 font-bold border border-slate-300 capitalize cursor-pointer focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Selecione ingrediente/embalagem...</option>
                        {insumos.map(i => (
                          <option key={i._id} value={i._id}>
                            {i.nome} (R\$ {Number(i.custo).toFixed(2)}/{i.unidade})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1 font-semibold">Unidade / Medida</label>
                      <select 
                        value={unidadeMedidaSelecionada} 
                        onChange={e => setUnidadeMedidaSelecionada(e.target.value)} 
                        className="w-full bg-white p-2 rounded-xl text-xs text-slate-800 font-bold border border-slate-300 cursor-pointer focus:outline-none focus:border-amber-500"
                      >
                        <option value="g">Gramas (g)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="un">Unidade (un)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-semibold">Quantidade Usada</label>
                    <input 
                      type="number" 
                      value={qtdUsadaInsumo} 
                      onChange={e => setQtdUsadaInsumo(e.target.value)} 
                      placeholder="Ex: 500, 30 ou 1" 
                      className="w-full bg-white p-2 rounded-xl text-xs text-slate-800 font-bold border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAdicionarIngredienteFicha} 
                    className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-amber-800 font-bold p-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-amber-600" /> Incluir este Insumo na Receita
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-600 tracking-wider">Itens da Receita Atual ({itensReceita.length}):</h3>
                  {itensReceita.length === 0 ? (
                    <p className="text-slate-400 text-xs italic py-4 text-center font-medium">Nenhum insumo adicionado ainda.</p>
                  ) : (
                    <div className="divide-y divide-slate-200 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      {itensReceita.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 capitalize">{item.nome}</span>
                            <span className="text-slate-500 font-medium ml-2">({item.qtdUsada} {item.unidadeUsada})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600">R\$ {item.custoCalculado.toFixed(2)}</span>
                            <button onClick={() => handleRemoverIngredienteFicha(idx)} className="text-rose-600 hover:text-rose-800 cursor-pointer transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RESUMO DA FICHA */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-5 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <h3 className="font-bold text-amber-800 text-xs tracking-wider">Resumo da Ficha Técnica</h3>
                  
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                    <p className="text-[11px] text-slate-500 font-bold uppercase">CUSTO DIRETO TOTAL (INSUMOS):</p>
                    <p className="text-3xl font-black text-emerald-600">R\$ {custoDiretoTotalProduto.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200 text-xs font-medium">
                    <p className="text-amber-800 font-bold text-[11px]">REGRAS APLICADAS:</p>
                    <p className="text-slate-700">iFood: <strong className="text-slate-900 font-bold">{taxas.ifoodPercentual}%</strong> + Rateio <strong className="text-slate-900 font-bold">R\$ {taxas.ifoodRateioUnidade.toFixed(2)}</strong></p>
                    <p className="text-slate-700">99Food: <strong className="text-slate-900 font-bold">{taxas.f99Percentual}%</strong> + Rateio <strong className="text-slate-900 font-bold">R\$ {taxas.f99RateioUnidade.toFixed(2)}</strong></p>
                  </div>
                </div>

                <button 
                  onClick={handleSalvarProdutoFinal} 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
                >
                  <Save className="w-5 h-5" /> Cadastrar Produto Precificado
                </button>
              </div>
            </div>

            {/* SIMULADOR INTERATIVO */}
            <PainelSimuladorDinamico custoDireto={custoDiretoTotalProduto} taxas={taxas} />
          </div>
        ) : aba === 'produtos' ? (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-amber-800 tracking-wider">Produtos Precificados e Fichas Salvas</h2>
            
            {produtosSalvos.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-500 font-medium shadow-xs">
                Nenhum produto cadastrado ainda. Vá na aba "Montar Ficha Técnica" para criar o primeiro!
              </div>
            ) : (
              <>
                {/* LISTA COMPACTA DOS PRODUTOS SALVOS */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <p className="text-xs text-slate-500 font-bold px-1 mb-2">Clique em um produto para simular e visualizar seus valores:</p>
                  
                  <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
                    {produtosSalvos.map((p) => {
                      const isSelected = p._id === (produtoAtivo?._id);
                      return (
                        <div 
                          key={p._id}
                          onClick={() => setProdutoSelecionadoId(p._id)}
                          className={`p-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-50/80 border border-amber-300 shadow-2xs' 
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-amber-600 rotate-90' : 'text-slate-400'}`} />
                            <div>
                              <h3 className={`text-sm font-bold capitalize ${isSelected ? 'text-amber-900 font-black' : 'text-slate-800'}`}>{p.nome}</h3>
                              <p className="text-[11px] text-slate-500 font-medium">
                                Ingredientes: {p.itensReceita?.map(i => `${i.nome} (${i.qtdUsada}${i.unidadeUsada})`).join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-200">
                              Custo Direto: R\$ {p.custoDiretoTotal.toFixed(2)}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExcluirProdutoFinal(p._id);
                              }}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition border border-rose-200 cursor-pointer"
                              title="Excluir Produto Salvo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SIMULADOR ÚNICO CONECTADO AO PRODUTO ATIVO */}
                {produtoAtivo && (
                  <PainelSimuladorDinamico 
                    custoDireto={produtoAtivo.custoDiretoTotal} 
                    taxas={taxas}
                    precoIFoodIni={produtoAtivo.precoIFood ? String(produtoAtivo.precoIFood) : '24.90'}
                    preco99Ini={produtoAtivo.preco99 ? String(produtoAtivo.preco99) : '24.90'}
                    produtoNome={produtoAtivo.nome}
                  />
                )}
              </>
            )}
          </div>
        ) : aba === 'insumos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-amber-800 tracking-wider flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-600" /> {editandoInsumoId ? 'Editar Insumo' : 'Cadastrar Insumo'}
                </h2>
                {editandoInsumoId && (
                  <button 
                    type="button" 
                    onClick={handleCancelarEdicaoInsumo} 
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSalvarInsumo} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-bold">Nome do Item</label>
                  <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Leite em Pó, Granulado..." className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition" required />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-bold">Categoria</label>
                  <select value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold cursor-pointer focus:outline-none focus:border-amber-500">
                    <option value="acai">Açaí / Insumo</option>
                    <option value="embalagem">Embalagem / Garrafa</option>
                    <option value="adicional">Adicional / Fruta</option>
                    <option value="massa">Massa</option>
                    <option value="molho">Molho</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-bold">Unidade</label>
                  <select value={novaUnidade} onChange={e => setNovaUnidade(e.target.value)} className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold cursor-pointer focus:outline-none focus:border-amber-500">
                    <option value="kg">Quilos (kg)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="l">Litros (L)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Preço Pago (R\$)</label>
                    <input type="number" step="0.01" value={precoTotalComprado} onChange={e => setPrecoTotalComprado(e.target.value)} placeholder="Ex: 80.00" className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Qtd / Pacote</label>
                    <input type="number" step="0.1" value={qtdEmbalagem} onChange={e => setQtdEmbalagem(e.target.value)} placeholder="Ex: 10" className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500" required />
                  </div>
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3 rounded-xl transition mt-2 cursor-pointer shadow-xs text-xs">
                  {editandoInsumoId ? 'Salvar Alterações' : 'Salvar no Banco'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold text-amber-800 tracking-wider">Insumos Salvos</h2>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Preço Pago</th>
                      <th className="p-3">Qtd Pacote</th>
                      <th className="p-3">Custo Unitário</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-medium text-slate-700">
                    {insumos.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800 capitalize">{item.nome}</td>
                        <td className="p-3 capitalize text-slate-500">{item.categoria}</td>
                        <td className="p-3">R\$ {Number(item.precoTotalComprado || item.custo).toFixed(2)}</td>
                        <td className="p-3">{item.qtdEmbalagem || 1} {item.unidade}</td>
                        <td className="p-3 font-bold text-amber-700">R\$ {Number(item.custo).toFixed(2)} / {item.unidade}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditarInsumo(item)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirInsumo(item._id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Excluir Insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200/80 space-y-6 shadow-xs">
            <h2 className="text-xs font-bold text-amber-800 tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" /> Configurar Taxas dos Aplicativos
            </h2>
            <form onSubmit={handleSalvarTaxas} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-rose-200">
                <h3 className="font-bold text-rose-600 text-sm">iFood</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.ifoodPercentual} onChange={e => setTaxas({...taxas, ifoodPercentual: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Rateio por Unidade (R\$)</label>
                    <input type="number" step="0.10" value={taxas.ifoodRateioUnidade} onChange={e => setTaxas({...taxas, ifoodRateioUnidade: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-emerald-200">
                <h3 className="font-bold text-emerald-600 text-sm">99Food</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.f99Percentual} onChange={e => setTaxas({...taxas, f99Percentual: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Rateio por Unidade (R\$)</label>
                    <input type="number" step="0.10" value={taxas.f99RateioUnidade} onChange={e => setTaxas({...taxas, f99RateioUnidade: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3.5 rounded-xl transition cursor-pointer shadow-xs text-xs">
                Salvar Taxas no Banco
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}