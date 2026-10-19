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

// COMPONENTE DO SIMULADOR EXTRAÍDO (LIGHT MODE)
function PainelSimuladorDinamico({ custoDireto, taxas, precoIFoodIni = '24.90', preco99Ini = '24.90' }) {
  const [modoCalculo, setModoCalculo] = useState('preco');
  const [precoIF, setPrecoIF] = useState(precoIFoodIni);
  const [preco99, setPreco99] = useState(preco99Ini);
  const [margemTarget, setMargemTarget] = useState('40');

  const calcIFood = calcularSimulacao(custoDireto, taxas.ifoodPercentual, taxas.ifoodRateioUnidade, precoIF, margemTarget, modoCalculo);
  const calc99 = calcularSimulacao(custoDireto, taxas.f99Percentual, taxas.f99RateioUnidade, preco99, margemTarget, modoCalculo);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Como deseja simular os valores?</span>
        
        <div className="flex bg-white p-1 rounded-xl gap-1 border border-slate-200">
          <button 
            type="button"
            onClick={() => setModoCalculo('preco')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              modoCalculo === 'preco' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Digitar Preço de Venda
          </button>
          <button 
            type="button"
            onClick={() => setModoCalculo('margem')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              modoCalculo === 'margem' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> Informar Lucro Desejado (%)
          </button>
        </div>
      </div>

      {modoCalculo === 'margem' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-4">
          <div>
            <label className="text-xs text-amber-900 font-bold block">Defina a Margem de Lucro Desejada (%)</label>
            <p className="text-[11px] text-amber-700 font-medium">O sistema ajustará os preços sugeridos no iFood e 99Food.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={margemTarget} 
              onChange={e => setMargemTarget(e.target.value)} 
              className="w-20 bg-white p-2 rounded-xl text-center text-lg font-black text-emerald-600 border border-amber-300 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
            <span className="text-lg font-black text-amber-800">%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IFOOD */}
        <div className="bg-slate-50 p-5 rounded-xl border border-rose-200 space-y-4">
          <div className="flex justify-between items-center border-b border-rose-100 pb-2">
            <span className="font-black text-rose-600 text-base">iFood</span>
            <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold border border-rose-200">
              Taxa: {taxas.ifoodPercentual}% {taxas.ifoodRateioUnidade > 0 ? `+ R$ ${taxas.ifoodRateioUnidade.toFixed(2)}` : ''}
            </span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-bold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={precoIF} 
                onChange={e => setPrecoIF(e.target.value)} 
                className="w-full bg-white p-2.5 rounded-xl text-base text-slate-800 font-black border border-slate-300 focus:outline-none focus:border-amber-500 shadow-2xs" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs font-medium">
            <div className="flex justify-between text-slate-700">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-slate-900 text-sm font-extrabold">R$ {calcIFood.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comissão iFood ({taxas.ifoodPercentual}%):</span>
              <span className="text-rose-600 font-bold">R$ {calcIFood.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-600 text-sm font-extrabold">R$ {calcIFood.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Custo Total Produto + Rateio:</span>
              <span className="text-slate-800 font-semibold">R$ {calcIFood.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
              <span className="text-amber-800 font-extrabold">Lucro Líquido Real:</span>
              <span className="font-black text-emerald-600 text-base">R$ {calcIFood.lucroLiquido.toFixed(2)} ({calcIFood.margemRealPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* 99FOOD */}
        <div className="bg-slate-50 p-5 rounded-xl border border-emerald-200 space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
            <span className="font-black text-emerald-600 text-base">99Food</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-200">
              Taxa: {taxas.f99Percentual}%
            </span>
          </div>

          {modoCalculo === 'preco' && (
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-bold">Preço de Venda Simulado (R$)</label>
              <input 
                type="text" 
                value={preco99} 
                onChange={e => setPreco99(e.target.value)} 
                className="w-full bg-white p-2.5 rounded-xl text-base text-slate-800 font-black border border-slate-300 focus:outline-none focus:border-amber-500 shadow-2xs" 
              />
            </div>
          )}

          <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs font-medium">
            <div className="flex justify-between text-slate-700">
              <span>Preço Final ao Cliente:</span>
              <strong className="text-slate-900 text-sm font-extrabold">R$ {calc99.precoVenda.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comissão 99Food ({taxas.f99Percentual}%):</span>
              <span className="text-rose-600 font-bold">R$ {calc99.descontoApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
              <span>Repasse Líquido (Recebe na Conta):</span>
              <strong className="text-emerald-600 text-sm font-extrabold">R$ {calc99.repasseLiquido.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Custo Total Produto:</span>
              <span className="text-slate-800 font-semibold">R$ {calc99.custoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
              <span className="text-amber-800 font-extrabold">Lucro Líquido Real:</span>
              <span className="font-black text-emerald-600 text-base">R$ {calc99.lucroLiquido.toFixed(2)} ({calc99.margemRealPct.toFixed(0)}%)</span>
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
                <h2 className="text-base font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-2">
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
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Adicionar Ingrediente ou Embalagem</h3>
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
                            {i.nome} (R$ {Number(i.custo).toFixed(2)}/{i.unidade})
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
                    className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-amber-800 font-black p-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-amber-600" /> Incluir este Insumo na Receita
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Itens da Receita Atual ({itensReceita.length}):</h3>
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
                            <span className="font-extrabold text-emerald-600">R$ {item.custoCalculado.toFixed(2)}</span>
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
                  <h3 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider">Resumo da Ficha Técnica</h3>
                  
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                    <p className="text-[11px] text-slate-500 font-bold uppercase">CUSTO DIRETO TOTAL (Insumos):</p>
                    <p className="text-3xl font-black text-emerald-600">R$ {custoDiretoTotalProduto.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200 text-xs font-medium">
                    <p className="text-amber-800 font-extrabold uppercase text-[11px]">Regras Aplicadas:</p>
                    <p className="text-slate-700">iFood: <strong className="text-slate-900 font-bold">{taxas.ifoodPercentual}%</strong> + Rateio <strong className="text-slate-900 font-bold">R$ {taxas.ifoodRateioUnidade.toFixed(2)}</strong></p>
                    <p className="text-slate-700">99Food: <strong className="text-slate-900 font-bold">{taxas.f99Percentual}%</strong> + Rateio <strong className="text-slate-900 font-bold">R$ {taxas.f99RateioUnidade.toFixed(2)}</strong></p>
                  </div>
                </div>

                <button 
                  onClick={handleSalvarProdutoFinal} 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
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
            <h2 className="text-base font-extrabold text-amber-800 uppercase tracking-wider">Produtos Precificados e Fichas Salvas</h2>
            {produtosSalvos.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-500 font-medium shadow-xs">
                Nenhum produto cadastrado ainda. Vá na aba "Montar Ficha Técnica" para criar o primeiro!
              </div>
            ) : (
              produtosSalvos.map((p, index) => (
                <div key={p._id || index} className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 capitalize">{p.nome}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Ingredientes: {p.itensReceita?.map(i => `${i.nome} (${i.qtdUsada}${i.unidadeUsada})`).join(', ')}
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl font-black text-sm border border-emerald-200 self-start md:self-auto shadow-2xs">
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
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
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Preço Pago (R$)</label>
                    <input type="number" step="0.01" value={precoTotalComprado} onChange={e => setPrecoTotalComprado(e.target.value)} placeholder="Ex: 80.00" className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Qtd / Pacote</label>
                    <input type="number" step="0.1" value={qtdEmbalagem} onChange={e => setQtdEmbalagem(e.target.value)} placeholder="Ex: 10" className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500" required />
                  </div>
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl transition mt-2 cursor-pointer shadow-xs text-xs">
                  {editandoInsumoId ? 'Salvar Alterações' : 'Salvar no Banco'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Insumos Salvos</h2>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-extrabold sticky top-0">
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
                        <td className="p-3">R$ {Number(item.precoTotalComprado || item.custo).toFixed(2)}</td>
                        <td className="p-3">{item.qtdEmbalagem || 1} {item.unidade}</td>
                        <td className="p-3 font-black text-amber-700">R$ {Number(item.custo).toFixed(2)} / {item.unidade}</td>
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
            <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" /> Configurar Taxas dos Aplicativos
            </h2>
            <form onSubmit={handleSalvarTaxas} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-rose-200">
                <h3 className="font-extrabold text-rose-600 text-sm">iFood</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.ifoodPercentual} onChange={e => setTaxas({...taxas, ifoodPercentual: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-extrabold focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Rateio por Unidade (R$)</label>
                    <input type="number" step="0.10" value={taxas.ifoodRateioUnidade} onChange={e => setTaxas({...taxas, ifoodRateioUnidade: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-extrabold focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-emerald-200">
                <h3 className="font-extrabold text-emerald-600 text-sm">99Food</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Taxa Total (%)</label>
                    <input type="number" step="0.1" value={taxas.f99Percentual} onChange={e => setTaxas({...taxas, f99Percentual: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-extrabold focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-bold">Rateio por Unidade (R$)</label>
                    <input type="number" step="0.10" value={taxas.f99RateioUnidade} onChange={e => setTaxas({...taxas, f99RateioUnidade: Number(e.target.value)})} className="w-full bg-white border border-slate-300 p-2 rounded-xl text-xs text-slate-800 font-extrabold focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl transition cursor-pointer shadow-xs text-xs">
                Salvar Taxas no Banco
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}