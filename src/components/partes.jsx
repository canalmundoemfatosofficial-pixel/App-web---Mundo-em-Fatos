import React, { useMemo, useState } from 'react'
import { ytId, liberado, dataBreve } from '../storage.js'

export function Img({ src, titulo, className }) {
  const [ok, setOk] = useState(true)
  return ok ? <img className={className} src={src} alt={titulo} loading="lazy" onError={() => setOk(false)} />
    : <div className={'ph ' + (className || '')}><span>{titulo}</span></div>
}

export function Card({ a, done, onOpen }) {
  const ok = liberado(a)
  return (
    <button className={'card' + (ok ? '' : ' breve')} onClick={() => ok && onOpen(a.id)} aria-disabled={!ok}>
      <Img className="capa" src={a.imagemCapa} titulo={a.titulo} />
      <span className="badge tl">{a.categoria}</span>
      <span className="badge tr">{!ok ? '⏳ Em breve' : done ? '✅ Estudado' : '✨ Novo'}</span>
      <div className="info"><b>{a.titulo}</b><small>{ok ? `⏱️ ${a.tempoLeituraMinutos} min` : `Chega em ${dataBreve(a)}`}</small></div>
    </button>
  )
}

export function Sugestoes({ endpoint }) {
  const [t, setT] = useState(''); const [s, setS] = useState('')
  const enviar = async e => {
    e.preventDefault(); if (!t.trim()) return
    if (!endpoint) { setS('Envio ainda não configurado.'); return }
    try { const r = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ sugestao: t }) }); setS(r.ok ? 'Obrigado! 💜' : 'Falhou, tente de novo.'); if (r.ok) setT('') } catch { setS('Sem conexão.') }
  }
  return (
    <form className="sug" onSubmit={enviar}>
      <b>O que você gostaria de aprender hoje? Nós explicamos de forma rápida e ilustrada! 💡</b>
      <input value={t} onChange={e => setT(e.target.value)} placeholder="Sua ideia de tema" />
      <button>Enviar sugestão</button>{s && <small>{s}</small>}
    </form>
  )
}

export function Quiz({ perguntas, onFim }) {
  const [i, setI] = useState(0); const [sel, setSel] = useState(null); const [ac, setAc] = useState(0)
  if (!perguntas?.length) return null
  if (i >= perguntas.length) return <div className="quiz"><b>Quiz: {ac}/{perguntas.length} 🎯</b></div>
  const q = perguntas[i]
  const escolher = k => { if (sel !== null) return; setSel(k); if (k === q.indiceCorreto) setAc(ac + 1) }
  const prox = () => { const fim = i + 1 >= perguntas.length; const total = ac; setSel(null); setI(i + 1); if (fim) onFim(total, perguntas.length) }
  return (
    <div className="quiz"><b>{q.pergunta}</b>
      {q.opcoes.map((o, k) => <button key={k} className={sel === null ? '' : k === q.indiceCorreto ? 'ok' : k === sel ? 'no' : ''} onClick={() => escolher(k)}>{o}</button>)}
      {sel !== null && <><p>{q.explicacao}</p><button className="pri" onClick={prox}>{i + 1 >= perguntas.length ? 'Ver resultado' : 'Próxima'}</button></>}</div>
  )
}

function md(t) { return t.split('\n\n').map((p, k) => p.startsWith('## ') ? <h3 key={k}>{p.slice(3)}</h3> : <p key={k} dangerouslySetInnerHTML={{ __html: p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />) }

export function Leitor({ a, dados, setDados, onVoltar }) {
  const [modo, setModo] = useState(dados.preferencias.modoLeituraPadrao)
  const [pg, setPg] = useState(1)
  const n = a.paginas.length + 1
  const feito = dados.aulasConcluidas.includes(a.id)
  const yt = ytId(a.youtubeUrl)
  const onScroll = e => setPg(Math.min(n, Math.round(e.target.scrollTop / e.target.clientHeight) + 1))
  const tema = () => setDados({ ...dados, preferencias: { ...dados.preferencias, temaEscuro: !dados.preferencias.temaEscuro } })
  const fim = (ac, tot) => setDados(d => ({ ...d, resultadosQuizzes: { ...d.resultadosQuizzes, [a.id]: { acertos: ac, totalPerguntas: tot, data: new Date().toISOString().slice(0, 10) } } }))
  const concluir = () => !feito && setDados({ ...dados, aulasConcluidas: [...dados.aulasConcluidas, a.id] })
  const final = <>
    {yt && <a className="yt" href={a.youtubeUrl} target="_blank" rel="noreferrer"><img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" onError={e => { if (!e.target.dataset.fb) { e.target.dataset.fb = 1; e.target.src = a.imagemCapa } }} /><span>▶ Assistir vídeo completo no YouTube</span></a>}
    <Quiz perguntas={a.quiz} onFim={fim} />
    <button className="pri" onClick={concluir}>{feito ? '✅ Aula concluída' : 'Marcar aula como concluída'}</button>
  </>
  return (
    <div className="leitor">
      <header className="topo">
        <button onClick={onVoltar}>←</button>
        <div className="prog"><i style={{ width: (modo === 'visual' ? pg / n : 1) * 100 + '%' }} /></div>
        {modo === 'visual' && <small>{pg}/{n}</small>}
        <button onClick={() => setModo(modo === 'visual' ? 'texto' : 'visual')}>{modo === 'visual' ? '📄' : '🖼️'}</button>
        <button onClick={tema}>🌓</button>
      </header>
      {modo === 'visual' ? (
        <div className="snap" onScroll={onScroll}>
          {a.paginas.map((p, k) => (
            <section key={p.ordem} className="slide">
              <Img className="slide-img" src={p.imagemUrl} titulo={p.tituloCard} />
              <div className="slide-txt"><h2>{p.tituloCard}</h2><p>{p.textoCard}</p>{k === 0 && <small className="dica">↑ Deslize para cima para continuar</small>}</div>
            </section>
          ))}
          <section className="slide final">{final}</section>
        </div>
      ) : (
        <div className="texto"><h2>{a.titulo}</h2>{md(a.textoCompletoBackup)}{final}</div>
      )}
    </div>
  )
}
