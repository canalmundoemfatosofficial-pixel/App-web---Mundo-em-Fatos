import React, { useEffect, useRef, useState } from 'react'
import { ytId, exportar, importar } from '../storage.js'

let ytPronto
function carregarYT() {
  if (ytPronto) return ytPronto
  ytPronto = new Promise(res => {
    if (window.YT && window.YT.Player) return res(window.YT)
    const a = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { a && a(); res(window.YT) }
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s)
  })
  return ytPronto
}
// Aviso sonoro suave (3 notas, duas vezes) quando o ciclo acaba
function tocarAviso(ctxRef) {
  try {
    const c = ctxRef.current || (ctxRef.current = new AudioContext()); c.resume()
    ;[0, 1.8].forEach(base => [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => {
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + base + k * 0.3
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination)
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
      o.start(t); o.stop(t + 1.2)
    }))
  } catch {}
}

export function Foco({ lofi }) {
  const TOTAL = Number(new URLSearchParams(location.search).get('foco')) || 25 * 60, id = ytId(lofi) // ?foco=15 encurta o ciclo só para testes
  const [s, setS] = useState(TOTAL); const [on, setOn] = useState(false); const [acabou, setAcabou] = useState(false); const [pronto, setPronto] = useState(false)
  const box = useRef(null), pl = useRef(null), ctx = useRef(null), fim = useRef(null), tocou = useRef(false)

  const terminar = () => {
    if (tocou.current) return; tocou.current = true
    setOn(false); setAcabou(true); setS(0)
    try { pl.current && pl.current.pauseVideo() } catch {}
    tocarAviso(ctx); try { navigator.vibrate && navigator.vibrate([300, 150, 300]) } catch {}
    try { if (window.Notification && Notification.permission === 'granted') new Notification('Mundo em Fatos', { body: 'Ciclo de foco concluído! Hora de uma pausa de 5 minutos.' }) } catch {}
  }
  const zerar = () => { tocou.current = false; setAcabou(false) }
  const preparar = () => { // gesto do usuário: libera som e pede permissão de aviso
    try { ctx.current = ctx.current || new AudioContext(); ctx.current.resume() } catch {}
    try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission() } catch {}
  }

  // Com vídeo: o relógio É o tempo do vídeo (play/pause/arrastar acompanham), então só existe uma contagem
  useEffect(() => {
    if (!id) return
    let morto = false, iv
    carregarYT().then(YT => {
      if (morto || !box.current) return
      const el = document.createElement('div'); box.current.appendChild(el)
      pl.current = new YT.Player(el, {
        videoId: id, host: 'https://www.youtube-nocookie.com', playerVars: { rel: 0, playsinline: 1 },
        events: {
          onReady: () => setPronto(true),
          onStateChange: e => { if (e.data === 1) { zerar(); setOn(true) } else if (e.data === 2) setOn(false); else if (e.data === 0) terminar() },
        },
      })
      iv = setInterval(() => {
        try {
          const t = pl.current.getCurrentTime(); if (typeof t !== 'number') return
          const r = Math.max(0, TOTAL - Math.ceil(t)); setS(r); if (r === 0 && t > 1) terminar()
        } catch {}
      }, 250)
    })
    return () => { morto = true; clearInterval(iv); try { pl.current && pl.current.destroy() } catch {}; pl.current = null; if (box.current) box.current.innerHTML = '' }
  }, [id])

  // Sem vídeo configurado: relógio próprio
  useEffect(() => {
    if (id || !on) return
    fim.current = Date.now() + s * 1000
    const t = setInterval(() => {
      const r = Math.max(0, Math.round((fim.current - Date.now()) / 1000)); setS(r); if (r === 0) terminar()
    }, 250)
    return () => clearInterval(t)
  }, [on, id])

  const principal = () => {
    preparar()
    if (id) { if (!pl.current) return; if (acabou) { zerar(); pl.current.seekTo(0, true) } on ? pl.current.pauseVideo() : pl.current.playVideo() }
    else { if (acabou || s === 0) { zerar(); setS(TOTAL); setOn(true) } else setOn(!on) }
  }
  const reiniciar = () => {
    zerar(); setOn(false); setS(TOTAL)
    if (id && pl.current) { pl.current.seekTo(0, true); pl.current.pauseVideo() }
  }
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
      {acabou && <p className="aviso">✅ Ciclo concluído! Faça uma pausa de 5 minutos.</p>}
      <div className="row">
        <button className="pri" onClick={principal} disabled={!!id && !pronto}>{acabou ? 'Novo ciclo' : on ? 'Pausar' : s === TOTAL ? 'Iniciar' : 'Continuar'}</button>
        <button onClick={reiniciar}>Reiniciar</button>
      </div>
      {id ? <><div ref={box} className="ytbox" /><small className="dica">O relógio acompanha o vídeo: ao dar play, o ciclo de 25 min começa.</small><a href={lofi} target="_blank" rel="noreferrer">Assistir / Reassistir no YouTube</a></>
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
