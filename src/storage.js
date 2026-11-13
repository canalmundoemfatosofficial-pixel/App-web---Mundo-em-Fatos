const KEY = 'mundo_em_fatos_user_data'
const base = () => ({ versaoSchema: '1.0', ultimaAtualizacao: '', preferencias: { temaEscuro: true, modoLeituraPadrao: 'visual' }, aulasConcluidas: [], favoritos: [], resultadosQuizzes: {} })
export function load() { try { return { ...base(), ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return base() } }
export function save(d) { d.ultimaAtualizacao = new Date().toISOString(); localStorage.setItem(KEY, JSON.stringify(d)); return d }
export function exportar(d) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }))
  a.download = 'progresso-mundo-em-fatos.json'; a.click(); URL.revokeObjectURL(a.href)
}
export async function importar(file) {
  const o = JSON.parse(await file.text())
  if (!o || !Array.isArray(o.aulasConcluidas)) throw new Error('Arquivo inválido')
  return { ...base(), ...o }
}
// Artigo só abre na data programada no YouTube (publicadoEm); sem data = sempre liberado
export const liberado = a => !a.publicadoEm || Date.parse(a.publicadoEm) <= Date.now()
export const dataBreve = a => new Date(a.publicadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
// Algoritmo #Para Você: inéditos primeiro, afinidade por categoria, embaralhamento suave
export function paraVoce(artigos, d) {
  const cont = {}
  artigos.filter(a => d.aulasConcluidas.includes(a.id)).forEach(a => cont[a.categoria] = (cont[a.categoria] || 0) + 1)
  const score = a => (liberado(a) ? 0 : -100) + (d.aulasConcluidas.includes(a.id) ? 0 : 10) + Math.min(cont[a.categoria] || 0, 3) + Math.random() * 3
  return [...artigos].sort((x, y) => score(y) - score(x))
}
export function ytId(url) { const m = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/.exec(url || ''); return m ? m[1] : null }
