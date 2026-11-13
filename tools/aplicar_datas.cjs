// Define a data de publicação (publicadoEm) de cada artigo, igual à data programada no YouTube (17:55, horário de Brasília).
// Rode depois de aplicar_links_youtube.cjs. Artigo sem data fica sempre liberado.
const fs = require('fs'), p = 'src/data/artigos.json'
const D = {
  'cerveja': ['enchente-de-cerveja-de-londres', '2026-11-11'], 'ormuz': ['estreito-de-ormuz-a-torneira-do-petroleo', '2026-11-12'],
  'chagas': ['doenca-de-chagas', '2026-11-12'], 'proclamacao': ['proclamacao-da-republica', '2026-11-15'],
  'hiroo': ['hiroo-onoda', '2026-11-18'], 'bandeira': ['bandeira-do-brasil', '2026-11-19'], 'zumbi': ['zumbi-e-palmares', '2026-11-20'],
  'guiana': ['brasil-e-guiana-francesa', '2026-11-21'], 'eua': ['eua-x-china', '2026-11-22'], 'lua': ['por-que-a-lua-nao-cai', '2026-11-23'], 'nasce': ['como-nasce-um-pais', '2026-11-24'],
}
const map = Object.fromEntries(Object.values(D))
const a = JSON.parse(fs.readFileSync(p, 'utf8'))
a.forEach(x => { if (map[x.id]) x.publicadoEm = map[x.id] + 'T17:55:00-03:00' })
fs.writeFileSync(p, JSON.stringify(a, null, 2), 'utf8')
console.log(a.filter(x => x.publicadoEm).length + ' datas; sem data: ' + a.filter(x => !x.publicadoEm).map(x => x.id))
