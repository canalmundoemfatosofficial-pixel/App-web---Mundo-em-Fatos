import React, { useEffect, useMemo, useState } from 'react'
import artigos from './data/artigos.json'
import config from './data/config.json'
import { load, save, paraVoce } from './storage.js'
import { Card, Sugestoes, Leitor } from './components/partes.jsx'
import { Foco, Progresso } from './components/telas.jsx'

const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const ICONES = { 'História': '🏛️', 'Ciência': '🔬', 'Astronomia': '🌌', 'Geopolítica': '🌍', 'Curiosidades': '💡' }

export default function App() {
  const [dados, setDados] = useState(load)
  const [aba, setAba] = useState('inicio'); const [aberto, setAberto] = useState(null)
  const [filtro, setFiltro] = useState('Para Você'); const [busca, setBusca] = useState('')
  useEffect(() => { save(dados); document.documentElement.dataset.tema = dados.preferencias.temaEscuro ? 'escuro' : 'claro' }, [dados])
  const ordem = useMemo(() => paraVoce(artigos, dados), [aba === 'inicio'])
  const lista = filtro === 'Para Você' ? ordem : artigos.filter(a => a.categoria === filtro)
  const achados = busca ? artigos.filter(a => norm([a.titulo, a.categoria, a.area, a.textoCompletoBackup].join(' ')).includes(norm(busca))) : null
  const areas = [...new Set(artigos.map(a => a.area))]
  const abrir = id => setAberto(artigos.find(a => a.id === id))
  const feito = a => dados.aulasConcluidas.includes(a.id)

  if (aberto) return <Leitor a={aberto} dados={dados} setDados={setDados} onVoltar={() => setAberto(null)} />
  const grade = l => <div className="grade">{l.map(a => <Card key={a.id} a={a} done={feito(a)} onOpen={abrir} />)}</div>
  return (
    <div className="app">
      <main>
        {aba === 'inicio' && <>
          <div className="banner"><h1>Mundo em Fatos</h1><p>{config.assinatura}</p></div>
          <div className="pilulas">{['Para Você', ...config.categorias].map(c => <button key={c} className={c === filtro ? 'on' : ''} onClick={() => setFiltro(c)}>{c === 'Para Você' ? '🔥 #Para Você' : `${ICONES[c]} ${c}`}</button>)}</div>
          {lista.length ? grade(lista) : <p className="vazio">Nada aqui ainda.</p>}
          <Sugestoes endpoint={config.formspreeEndpoint} />
        </>}
        {aba === 'explorar' && <>
          <input className="busca" placeholder="🔎 Buscar por título, categoria ou palavra" value={busca} onChange={e => setBusca(e.target.value)} />
          {achados ? (achados.length ? grade(achados) : <p className="vazio">Nenhum resultado.</p>)
            : areas.map(ar => <section key={ar}><h3>{ar}</h3>{[...new Set(artigos.filter(a => a.area === ar).map(a => a.categoria))].map(c => <div key={c}><h4>{c}</h4>{grade(artigos.filter(a => a.area === ar && a.categoria === c))}</div>)}</section>)}
          <Sugestoes endpoint={config.formspreeEndpoint} />
        </>}
        {aba === 'foco' && <Foco lofi={config.lofiYoutubeUrl} />}
        {aba === 'progresso' && <Progresso artigos={artigos} dados={dados} setDados={setDados} />}
      </main>
      <nav>{[['inicio', '🏠', 'Início'], ['explorar', '🔎', 'Explorar'], ['foco', '⏱️', 'Foco'], ['progresso', '📈', 'Progresso']].map(([k, i, t]) => <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}><span>{i}</span>{t}</button>)}</nav>
    </div>
  )
}
