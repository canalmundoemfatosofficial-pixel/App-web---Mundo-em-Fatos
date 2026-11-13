import React, { useEffect, useRef, useState } from 'react'
import { ytId, exportar, importar } from '../storage.js'

export function Foco({ lofi }) {
  const TOTAL = 25 * 60
  const [s, setS] = useState(TOTAL); const [on, setOn] = useState(false)
  const fim = useRef(null)
  useEffect(() => {
    if (!on) return
    fim.current = Date.now() + s * 1000
    const t = setInterval(() => {
      const r = Math.max(0, Math.round((fim.current - Date.now()) / 1000)); setS(r)
      if (r === 0) { setOn(false); try { const c = new AudioContext(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 660; o.start(); o.stop(c.currentTime + 0.6) } catch {} }
    }, 250)
    return () => clearInterval(t)
  }, [on])
  const id = ytId(lofi)
  const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0')
  return (
    <div className="foco">
      <svg viewBox="-100 -100 200 200" className="orbita">
        <circle r="70" fill="none" stroke="#8B5CF6" strokeDasharray="3 5" opacity=".5" />
        <circle r="16" fill="#FFE94D" />
        <g style={{ transformOrigin: '0 0', animation: 'giro 12s linear infinite', animationPlayState: on ? 'running' : 'paused' }}>
          <circle cx="70" r="7" fill="#3b82f6" /><circle cx="68" cy="-2" r="3" fill="#22c55e" />
        </g>
      </svg>
      <div className="tempo">{mm}:{ss}</div>
      <div className="row">
        <button className="pri" onClick={() => setOn(!on)}>{on ? 'Pausar' : s === 0 || s === TOTAL ? 'Iniciar' : 'Continuar'}</button>
        <button onClick={() => { setOn(false); setS(TOTAL) }}>{s === 0 ? 'Iniciar novo ciclo' : 'Reiniciar'}</button>
      </div>
      {id ? <><iframe title="Lofi" src={`https://www.youtube-nocookie.com/embed/${id}`} allow="autoplay; encrypted-media" allowFullScreen /><a href={lofi} target="_blank" rel="noreferrer">Assistir / Reassistir no YouTube</a></>
        : <p className="vazio">Defina <code>lofiYoutubeUrl</code> em config.json para ativar o Lofi oficial.</p>}
    </div>
  )
}

export function Progresso({ artigos, dados, setDados }) {
  const q = Object.values(dados.resultadosQuizzes)
  const ac = q.reduce((x, r) => x + r.acertos, 0), tot = q.reduce((x, r) => x + r.totalPerguntas, 0)
  const areas = {}; artigos.filter(a => dados.aulasConcluidas.includes(a.id)).forEach(a => areas[a.area] = (areas[a.area] || 0) + 1)
  const imp = async e => { try { setDados(await importar(e.target.files[0])); alert('Progresso restaurado.') } catch (x) { alert(x.message) } e.target.value = '' }
  return (
    <div className="prog-tela">
      <h2>Meu Progresso</h2>
      <div className="stat"><b>{dados.aulasConcluidas.length}</b><small>aulas concluídas</small></div>
      <div className="stat"><b>{tot ? Math.round(ac / tot * 100) + '%' : '—'}</b><small>acerto nos quizzes</small></div>
      <div className="stat"><b>{Object.entries(areas).sort((a, b) => b[1] - a[1]).map(x => x[0]).join(', ') || '—'}</b><small>áreas mais estudadas</small></div>
      <div className="row"><button className="pri" onClick={() => exportar(dados)}>Exportar Progresso</button>
        <label className="btn">Importar Progresso<input type="file" accept="application/json" hidden onChange={imp} /></label></div>
    </div>
  )
}
