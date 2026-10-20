import React from 'react';
import { usePaginaMarketing } from '../hooks/usePaginaMarketing';
import { 
  Megaphone, Plus, Trash2, Eye, EyeOff, Upload, Sparkles, 
  Image as ImageIcon, Link as LinkIcon, Globe, Tag 
} from 'lucide-react';

export default function PaginaMarketing() {
  const {
    abaAtiva, setAbaAtiva, banners, loading, tipoUpload, setTipoUpload,
    previaImagem, form, setForm, handleFileChange, handleUrlChange,
    handleSubmit, toggleAtivo, deletarBanner
  } = usePaginaMarketing();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Marketing & Promoções</h1>
            <p className="text-xs text-gray-500">Crie banners promocionais e gerencie a vitrine da loja</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setAbaAtiva('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              abaAtiva === 'banners' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Banners e Ofertas
          </button>
          <button
            onClick={() => setAbaAtiva('favicon')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              abaAtiva === 'favicon' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" /> Favicon do Site
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {abaAtiva === 'banners' && (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sparkles className="w-4 h-4 text-amber-500" /> Cadastrar Nova Oferta / Banner
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-amber-500" /> Selo / Badge Superior
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: ⚡ PROMOÇÃO DE SEXTA"
                        value={form.badge}
                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Título Principal</label>
                      <input
                        type="text"
                        placeholder="Ex: Desconto Especial no "
                        value={form.titulo}
                        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Texto em Destaque (Dourado)</label>
                    <input
                      type="text"
                      placeholder="Ex: Combo Açaí + Massa"
                      value={form.destaqueTitulo}
                      onChange={(e) => setForm({ ...form, destaqueTitulo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição / Regras da Promoção</label>
                    <textarea
                      placeholder="Ex: Na compra de um Açaí de 1L ganhe 1 adicional grátis..."
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none h-20 resize-none"
                    />
                  </div>
                </div>

                {/* Upload e Prévia */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700">Imagem da Promoção</label>

                  <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setTipoUpload('arquivo')}
                      className={`flex-1 py-1 rounded-md text-center transition-all ${
                        tipoUpload === 'arquivo' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      Dispositivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoUpload('url')}
                      className={`flex-1 py-1 rounded-md text-center transition-all ${
                        tipoUpload === 'url' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      Link / URL
                    </button>
                  </div>

                  {tipoUpload === 'arquivo' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-amber-400 transition-colors bg-gray-50 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-600">Clique para escolher a foto</p>
                      <p className="text-[10px] text-gray-400">PNG ou JPG (Recomendado: 400x300 px)</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="https://sua-imagem.jpg"
                          value={form.imagemUrl}
                          onChange={handleUrlChange}
                          className="w-full text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {previaImagem && (
                    <div className="mt-2">
                      <p className="text-[10px] text-gray-500 mb-1 font-semibold">Pré-visualização:</p>
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 h-28 bg-gray-900">
                        <img src={previaImagem} alt="Prévia" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
                          <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold w-max">{form.badge}</span>
                          <p className="text-xs font-bold line-clamp-1">{form.titulo} <span className="text-amber-400">{form.destaqueTitulo}</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {loading ? 'Enviando...' : 'Publicar Oferta no Carrossel'}
                </button>
              </div>
            </form>

            {/* Lista de Promoções */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Promoções na Loja</h2>

              {banners.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Nenhuma promoção ativa no momento.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b._id} className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 bg-white hover:border-amber-300 transition-colors shadow-sm">
                      <img src={b.imagemUrl} alt={b.titulo} className="w-24 h-18 object-cover rounded-lg border bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">{b.badge || 'PROMOÇÃO'}</span>
                        <h3 className="font-bold text-xs text-gray-800 mt-1 truncate">
                          {b.titulo} <span className="text-amber-500">{b.destaqueTitulo}</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{b.descricao}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => toggleAtivo(b._id, b.ativo)}
                            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium border ${
                              b.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}
                          >
                            {b.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {b.ativo ? 'Visível' : 'Oculto'}
                          </button>
                          <button
                            onClick={() => deletarBanner(b._id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'favicon' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">Favicon da Loja</h2>
              <p className="text-xs text-gray-500">Ícone exibido na aba do navegador e no atalho de aplicativo do celular</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="w-20 h-20 bg-amber-950 rounded-2xl flex items-center justify-center p-2 shadow-md">
                <img src="/favicon.ico" alt="Favicon" className="w-12 h-12 object-contain" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="font-bold text-xs text-gray-800">Favicon Atual</h3>
                <p className="text-[11px] text-gray-500">Tamanho recomendado: **200x200 px** (Formato PNG ou ICO).</p>
                <button className="flex items-center gap-1.5 bg-gray-800 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Selecionar Novo Favicon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}