const CHAVE_ORDEM_CATEGORIAS = 'cardapio_ordem_categorias_v1';

export const normalizarCat = (cat) =>
  String(cat || '').trim().toLowerCase();

export const lerOrdemLocal = () => {
  try {
    const raw = localStorage.getItem(CHAVE_ORDEM_CATEGORIAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizarCat).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const gravarOrdemLocal = (ordem) => {
  try {
    const limpa = Array.from(
      new Set((ordem || []).map(normalizarCat).filter(Boolean))
    );
    localStorage.setItem(CHAVE_ORDEM_CATEGORIAS, JSON.stringify(limpa));
    return limpa;
  } catch (err) {
    console.error('Erro ao salvar ordem localmente:', err);
    return [];
  }
};

export const montarListaOrdenada = (categoriasExistentes = [], ordemSalva = []) => {
  const ordemBase = (ordemSalva && ordemSalva.length > 0 ? ordemSalva : lerOrdemLocal())
    .map(normalizarCat)
    .filter((c) => c && c !== 'todos');

  const unicas = Array.from(
    new Set(
      (categoriasExistentes || [])
        .map(normalizarCat)
        .filter((c) => c && c !== 'todos')
    )
  );

  const naOrdem = ordemBase.filter((c) => unicas.includes(c));
  const novas = unicas.filter((c) => !ordemBase.includes(c));

  return [...naOrdem, ...novas];
};

export const moverCategoria = (categoria, direcao, categoriasExistentes = [], ordemAtual = []) => {
  const alvo = normalizarCat(categoria);
  const lista = montarListaOrdenada(categoriasExistentes, ordemAtual);
  const idx = lista.indexOf(alvo);
  if (idx === -1) return lista;

  const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1;
  if (novoIdx < 0 || novoIdx >= lista.length) return lista;

  const copia = [...lista];
  const [item] = copia.splice(idx, 1);
  copia.splice(novoIdx, 0, item);

  gravarOrdemLocal(copia);
  return copia;
};