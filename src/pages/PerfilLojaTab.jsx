import React, { useState, useEffect } from 'react';
import { Store, Save } from 'lucide-react';

export default function PerfilLojaTab({ 
  lojaNome, 
  setLojaNome, 
  endereco, 
  setEndereco, 
  pedidoMinimo, 
  setPedidoMinimo, 
  onSalvar, 
  loading 
}) {
  // Estados locais para os detalhes do endereço
  const [rua, setRua] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');

  // Sincroniza os campos locais quando o endereço vem do banco de dados
  useEffect(() => {
    if (!endereco) return;

    const enderecoAtualMontado = [rua, complemento, bairro, municipio]
      .filter(Boolean)
      .join(', ');

    // Só preenche se o endereço externo for diferente do que já está nos inputs
    if (endereco !== enderecoAtualMontado) {
      const partes = endereco.split(',').map(p => p.trim());

      if (partes.length >= 4) {
        // Pega os últimos 3 campos (Município, Bairro, Complemento) e junta o início na Rua (caso tenha vírgula no número)
        setMunicipio(partes[partes.length - 1] || '');
        setBairro(partes[partes.length - 2] || '');
        setComplemento(partes[partes.length - 3] || '');
        setRua(partes.slice(0, partes.length - 3).join(', '));
      } else {
        setRua(partes[0] || '');
        setComplemento(partes[1] || '');
        setBairro(partes[2] || '');
        setMunicipio(partes[3] || '');
      }
    }
  }, [endereco]);

  // Atualiza a string principal do endereço sempre que os campos mudarem
  const atualizarEnderecoCompleto = (novaRua, novoComplemento, novoBairro, novoMunicipio) => {
    setRua(novaRua);
    setComplemento(novoComplemento);
    setBairro(novoBairro);
    setMunicipio(novoMunicipio);
    
    const partes = [novaRua, novoComplemento, novoBairro, novoMunicipio].filter(Boolean);
    setEndereco(partes.join(', '));
  };

  const handleValorChange = (e) => {
    let valorLimpo = e.target.value.replace(/\D/g, '');
    if (!valorLimpo) {
      setPedidoMinimo(0);
      return;
    }
    const numero = Number(valorLimpo) / 100;
    setPedidoMinimo(numero);
  };

  const formatarMoeda = (valor) => {
    const num = Number(valor) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full bg-[#f8f9fa] space-y-6">
      
      {/* Cabeçalho Interno Integrado */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900">Informações Gerais & Pedido Mínimo</h1>
          <p className="text-xs text-slate-500">Configure o nome da loja, endereço detalhado e valor mínimo de pedido.</p>
        </div>
      </div>

      {/* Formulário em Pilha */}
      <div className="space-y-5 max-w-2xl w-full">
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Nome da Loja
          </label>
          <input
            type="text"
            value={lojaNome}
            onChange={(e) => setLojaNome(e.target.value)}
            placeholder="Ex: Tay Mix"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
        </div>

        {/* Campos de Endereço Separados */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Rua / Logradouro e Número
          </label>
          <input
            type="text"
            value={rua}
            onChange={(e) => atualizarEnderecoCompleto(e.target.value, complemento, bairro, municipio)}
            placeholder="Ex: Rua Guarapari, 0"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Complemento
            </label>
            <input
              type="text"
              value={complemento}
              onChange={(e) => atualizarEnderecoCompleto(rua, e.target.value, bairro, municipio)}
              placeholder="Ex: lot 01 qd 27 apto 102"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Bairro
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => atualizarEnderecoCompleto(rua, complemento, e.target.value, municipio)}
              placeholder="Ex: São José do Imbassaí"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Município / UF
          </label>
          <input
            type="text"
            value={municipio}
            onChange={(e) => atualizarEnderecoCompleto(rua, complemento, bairro, e.target.value)}
            placeholder="Ex: Maricá - RJ"
            className="w-full sm:w-1/2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Valor Mínimo de Pedido (R$)
          </label>
          <input
            type="text"
            value={formatarMoeda(pedidoMinimo)}
            onChange={handleValorChange}
            placeholder="R$ 0,00"
            className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Defina o valor mínimo que o carrinho precisa atingir para liberar a finalização do delivery. Se for R$ 0,00, não haverá limite.
          </p>
        </div>

        <div className="flex justify-start pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onSalvar}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} /> {loading ? 'A salvar...' : 'Salvar Alterações'}
          </button>
        </div>

      </div>

    </div>
  );
}