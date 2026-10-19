import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Save, Sliders, DollarSign, Percent, Edit2 } from 'lucide-react';
import { usePrecificacao } from '../hooks/usePrecificacao';

// FUNÇÃO AUXILIAR DE CÁLCULO
const calcularSimulacao = (custoDireto, pctTaxa, rateioFixo, precoEntrada, margemEntrada, modoCalculo) => {
  const custoTotal = custoDireto + rateioFixo;
  let precoVenda = 0;

  if (modoCalculo === 'preco') {
    precoVenda = Number(String(precoEntrada).replace(',', '.')) || 0;
  } else {
    const margemFracao = (Number(String(margemEntrada).replace(',', '.')) || 0) / 100;
    const taxaFracao = (pctTaxa || 0) / 100;
    const divisor = 1 - taxaFracao - margemFracao;
    precoVenda = divisor > 0 && custoTotal > 0 ? custoTotal / divisor : 0;
  }

  const descontoApp = precoVenda * (pctTaxa / 100);
  const repasseLiquido = precoVenda - descontoApp;
  const lucroLiquido = repasseLiquido - custoTotal;
  const margemRealPct = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;

  return {
    precoVenda,
    descontoApp,
    repasseLiquido,
    custoTotal,
    lucroLiquido,
    margemRealPct
  };
};

// COMPONENTE DO SIMULADOR EXTRAÍDO
function PainelSimuladorDinamico({ custoDireto, taxas, precoIFoodIni = '24.90', preco99Ini = '24.90' }) {
  const [modoCalculo, setModoCalculo] = useState('preco');
  const [precoIF, setPrecoIF] = useState(precoIFoodIni);
  const [preco99, setPreco99] = useState(preco99Ini);
  const [margemTarget, setMargemTarget] = useState('40');

  const calcIFood = calcularSimulacao(custoDireto, taxas.ifoodPercentual, taxas.ifoodRateioUnidade, precoIF, margemTarget, modoCalculo);
  const calc99 = calcularSimulacao(custoDireto, taxas.f99Percentual, taxas.f99RateioUnidade, preco99, margemTarget, modoCalculo);

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-3 rounded-xl border border-slate-700">
        <span className="text-sm font-bold text-amber-400">Como deseja simular os valores?</span>
        
        <div className="flex bg-slate-800 p-1 rounded-lg gap-1 border border-slate-700">
          <button 
            type="button"
            onClick={() => setModoCalculo('preco')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${modoCalculo === 'preco' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Digitar Preço de Venda
          </button>
          <button 
            type="button"
            onClick={() => setModoCalculo('margem')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${modoCalculo === 'margem' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}
          >
            <Percent className="w-3.5 h-3.5" /> Informar Lucro Desejado (%)
          </button>
        </div>
      </div>

      {modoCalculo === 'margem' && (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-amber-500/30 flex items-center justify-between gap-4">
          <div>
            <label className="text-xs text-amber-400 font-bold block">Defina a Margem de Lucro Desejada (%)</label>
            <p className="text-[11px] text-slate-400">O sistema ajustará os preços sugeridos no iFood e 99Food.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={margemTarget} 
              onChange={e => setMargemTarget(e.target.value)} 
              className="w-20 bg-slate-700 p-2 rounded text-center text-lg font-bold text-emerald-400 border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-lg font-bold text-amber-400">%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IFOOD */}
        <div className="bg-slate-900 p-5 rounded-xl border border-red-500/30 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-red-400 text-base">iFood</span>
            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
              Taxa: {taxas.ifoodPercentual}% {taxas.ifoodRateioUnidade > 0 ? `+ R$ ${taxas.ifoodRateioUnidade.toFixed(2)}` : ''}
            </span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={precoIF} 
                onChange={e => setPrecoIF(e.target.value)} 
                className="w-full bg-slate-800 p-2.5 rounded text-base text-white font-bold border border-slate-700 focus:outline-none focus:border-amber-400" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-white text-sm">R$ {calcIFood.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Comissão iFood ({taxas.ifoodPercentual}%):</span>
              <span className="text-rose-400">- R$ {calcIFood.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-400 text-sm">R$ {calcIFood.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Custo Total Produto + Rateio:</span>
              <span className="text-slate-300">R$ {calcIFood.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
              <span className="text-amber-400 font-bold">Lucro Líquido Real:</span>
              <span className="font-bold text-emerald-400 text-base">R$ {calcIFood.lucroLiquido.toFixed(2)} ({calcIFood.margemRealPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* 99FOOD */}
        <div className="bg-slate-900 p-5 rounded-xl border border-emerald-500/30 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400 text-base">99Food</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Taxa: {taxas.f99Percentual}%</span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={preco99} 
                onChange={e => setPreco99(e.target.value)} 
                className="w-full bg-slate-800 p-2.5 rounded text-base text-white font-bold border border-slate-700 focus:outline-none focus:border-amber-400" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-white text-sm">R$ {calc99.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Comissão 99Food ({taxas.f99Percentual}%):</span>
              <span className="text-rose-400">- R$ {calc99.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-400 text-sm">R$ {calc99.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Custo Total Produto:</span>
              <span className="text-slate-300">R$ {calc99.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
              <span className="text-amber-400 font-bold">Lucro Líquido Real:</span>
              <span className="font-bold text-emerald-400 text-base">R$ {calc99.lucroLiquido.toFixed(2)} ({calc99.margemRealPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    handleSalvarInsumo,
    handleEditarInsumo,
    handleCancelarEdicaoInsumo,
    handleExcluirInsumo,
    handleSalvarTaxas
  } = usePrecificacao();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold">Precificação Dinâmica & Lucro Líquido</h1>
          </div>
          
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
            <button onClick={() => setAba('simulador')} className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${aba === 'simulador' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>
              🛠️ Montar Ficha Técnica
            </button>
            <button onClick={() => setAba('produtos')} className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${aba === 'produtos' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>
              📋 Produtos Salvos ({produtosSalvos.length})
            </button>
            <button onClick={() => setAba('insumos')} className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${aba === 'insumos' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>
              📦 Insumos / Ingredientes
            </button>
            <button onClick={() => setAba('taxas')} className={`px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${aba === 'taxas' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>
              ⚙️ Taxas dos Apps
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando dados...</div>
        ) : aba === 'simulador' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MONTAGEM DE RECEITA */}
              <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-5">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Montar Receita do Produto Final
                </h2>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Nome do Produto Final</label>
                  <input 
                    type="text" 
                    value={nomeProdutoFinal} 
                    onChange={e => setNomeProdutoFinal(e.target.value)} 
                    placeholder="Ex: Açaí de Banana 500ml Completo" 
                    className="w-full bg-slate-700 p-2.5 rounded-lg text-sm text-white font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase">Adicionar Ingrediente ou Embalagem</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 block mb-1">Selecione o Insumo</label>
                      <select 
                        value={insumoSelecionadoId} 
                        onChange={e => setInsumoSelecionadoId(e.target.value)} 
                        className="w-full bg-slate-800 p-2 rounded text-sm text-white capitalize cursor-pointer"
                      >
                        <option value="">Selecione ingrediente/embalagem...</option>
                        {insumos.map(i => (
                          <option key={i._id} value={i._id}>
                            {i.nome} (R$ {Number(i.custo).toFixed(2)}/{i.unidade})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Unidade / Medida</label>
                      <select 
                        value={unidadeMedidaSelecionada} 
                        onChange={e => setUnidadeMedidaSelecionada(e.target.value)} 
                        className="w-full bg-slate-800 p-2 rounded text-sm text-white font-bold cursor-pointer"
                      >
                        <option value="g">Gramas (g)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="un">Unidade (un)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Quantidade Usada</label>
                    <input 
                      type="number" 
                      value={qtdUsadaInsumo} 
                      onChange={e => setQtdUsadaInsumo(e.target.value)} 
                      placeholder="Ex: 500, 30 ou 1" 
                      className="w-full bg-slate-800 p-2 rounded text-sm text-white font-bold border border-slate-700"
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAdicionarIngredienteFicha} 
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-400 font-bold p-2.5 rounded-lg transition text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Incluir este Insumo na Receita
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Itens da Receita Atual ({itensReceita.length}):</h3>
                  {itensReceita.length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-4 text-center">Nenhum insumo adicionado ainda.</p>
                  ) : (
                    <div className="divide-y divide-slate-700 bg-slate-900 rounded-xl p-3">
                      {itensReceita.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div>
                            <span className="font-bold text-white capitalize">{item.nome}</span>
                            <span className="text-slate-400 ml-2">({item.qtdUsada} {item.unidadeUsada})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-400">R$ {item.custoCalculado.toFixed(2)}</span>
                            <button onClick={() => handleRemoverIngredienteFicha(idx)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
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
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm uppercase">Resumo da Ficha Técnica</h3>
                  
                  <div className="p-4 bg-slate-900 rounded-xl space-y-2 border border-slate-700">
                    <p className="text-xs text-slate-400">CUSTO DIRETO TOTAL (Insumos):</p>
                    <p className="text-3xl font-bold text-emerald-400">R$ {custoDiretoTotalProduto.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl space-y-2 border border-slate-700 text-xs">
                    <p className="text-amber-400 font-bold uppercase">Regras Aplicadas:</p>
                    <p className="text-slate-300">iFood: <strong className="text-white">{taxas.ifoodPercentual}%</strong> + Rateio <strong className="text-white">R$ {taxas.ifoodRateioUnidade.toFixed(2)}</strong></p>
                    <p className="text-slate-300">99Food: <strong className="text-white">{taxas.f99Percentual}%</strong> + Rateio <strong className="text-white">R$ {taxas.f99RateioUnidade.toFixed(2)}</strong></p>
                  </div>
                </div>

                <button 
                  onClick={handleSalvarProdutoFinal} 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
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
            <h2 className="text-lg font-bold text-amber-400">Produtos Precificados e Fichas Salvas</h2>
            {produtosSalvos.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
                Nenhum produto cadastrado ainda. Vá na aba "Montar Ficha Técnica" para criar o primeiro!
              </div>
            ) : (
              produtosSalvos.map((p, index) => (
                <div key={p._id || index} className="space-y-4">
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white capitalize">{p.nome}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Ingredientes: {p.itensReceita?.map(i => `${i.nome} (${i.qtdUsada}${i.unidadeUsada})`).join(', ')}
                      </p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/30 self-start md:self-auto">
                      Custo Direto: R$ {p.custoDiretoTotal.toFixed(2)}
                    </span>
                  </div>

                  <PainelSimuladorDinamico 
                    custoDireto={p.custoDiretoTotal} 
                    taxas={taxas}
                    precoIFoodIni={p.precoIFood ? String(p.precoIFood) : '24.90'}
                    preco99Ini={p.preco99 ? String(p.preco99) : '24.90'}
                  />
                </div>
              ))
            )}
          </div>
        ) : aba === 'insumos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> {editandoInsumoId ? 'Editar Insumo' : 'Cadastrar Insumo'}
                </h2>
                {editandoInsumoId && (
                  <button 
                    type="button" 
                    onClick={handleCancelarEdicaoInsumo} 
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSalvarInsumo} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome do Item</label>
                  <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Leite em Pó, Granulado..." className="w-full bg-slate-700 p-2 rounded text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                  <select value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-sm text-white cursor-pointer">
                    <option value="acai">Açaí / Insumo</option>
                    <option value="embalagem">Embalagem / Garrafa</option>
                    <option value="adicional">Adicional / Fruta</option>
                    <option value="massa">Massa</option>
                    <option value="molho">Molho</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unidade</label>
                  <select value={novaUnidade} onChange={e => setNovaUnidade(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-sm text-white cursor-pointer">
                    <option value="kg">Quilos (kg)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="l">Litros (L)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Preço Pago (R$)</label>
                    <input type="number" step="0.01" value={precoTotalComprado} onChange={e => setPrecoTotalComprado(e.target.value)} placeholder="Ex: 80.00" className="w-full bg-slate-700 p-2 rounded text-sm text-white" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Qtd / Pacote</label>
                    <input type="number" step="0.1" value={qtdEmbalagem} onChange={e => setQtdEmbalagem(e.target.value)} placeholder="Ex: 10" className="w-full bg-slate-700 p-2 rounded text-sm text-white" required />
                  </div>
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-2.5 rounded-lg transition mt-2 cursor-pointer">
                  {editandoInsumoId ? 'Salvar Alterações' : 'Salvar no Banco'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-amber-400">Insumos Salvos</h2>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs sticky top-0">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Preço Pago</th>
                      <th className="p-3">Qtd Pacote</th>
                      <th className="p-3">Custo Unitário</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {insumos.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-750">
                        <td className="p-3 font-medium capitalize">{item.nome}</td>
                        <td className="p-3 capitalize text-slate-400">{item.categoria}</td>
                        <td className="p-3">R$ {Number(item.precoTotalComprado || item.custo).toFixed(2)}</td>
                        <td className="p-3">{item.qtdEmbalagem || 1} {item.unidade}</td>
                        <td className="p-3 font-bold text-amber-400">R$ {Number(item.custo).toFixed(2)} / {item.unidade}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditarInsumo(item)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirInsumo(item._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition cursor-pointer"
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
          <div className="max-w-xl mx-auto bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Sliders className="w-5 h-5" /> Configurar Taxas dos Aplicativos
            </h2>
            <form onSubmit={handleSalvarTaxas} className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl space-y-3 border border-red-500/20">
                <h3 className="font-bold text-red-400 text-sm">iFood</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.ifoodPercentual} onChange={e => setTaxas({...taxas, ifoodPercentual: Number(e.target.value)})} className="w-full bg-slate-700 p-2 rounded text-sm text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Rateio por Unidade (R$)</label>
                    <input type="number" step="0.10" value={taxas.ifoodRateioUnidade} onChange={e => setTaxas({...taxas, ifoodRateioUnidade: Number(e.target.value)})} className="w-full bg-slate-700 p-2 rounded text-sm text-white font-bold" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl space-y-3 border border-emerald-500/20">
                <h3 className="font-bold text-emerald-400 text-sm">99Food</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.f99Percentual} onChange={e => setTaxas({...taxas, f99Percentual: Number(e.target.value)})} className="w-full bg-slate-700 p-2 rounded text-sm text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Rateio por Unidade (R$)</label>
                    <input type="number" step="0.10" value={taxas.f99RateioUnidade} onChange={e => setTaxas({...taxas, f99RateioUnidade: Number(e.target.value)})} className="w-full bg-slate-700 p-2 rounded text-sm text-white font-bold" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-xl transition cursor-pointer">
                Salvar Taxas no Banco
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}