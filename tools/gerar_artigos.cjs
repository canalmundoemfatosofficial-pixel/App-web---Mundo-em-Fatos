// uso: node tools/gerar_artigos.js   (converte os temas de Postados/ em artigos.json + imagens .webp)
const fs=require('fs'),path=require('path'),cp=require('child_process');
const POST='C:/Users/Win11/Desktop/Mundo em Fatos v2/Postados/';
const TEMAS=[
 ['2026-11-12 - Doenca de Chagas - o medico que olhou de perto','04-davi-direcao/montagem','Ciência','Ciência','doenca-de-chagas'],
 ['2026-11-15 - Proclamacao da Republica - a republica que ninguem pediu','04-davi-direcao/montagem_9x16_v2','História','História','proclamacao-da-republica'],
 ['2026-11-18 - Hiroo Onoda - o soldado que nao sabia','04-davi-direcao/montagem_9x16_v2','História','História','hiroo-onoda'],
 ['2026-11-19 - Bandeira do Brasil - a bandeira de quatro dias','04-davi-direcao/montagem_9x16_v2','História','História','bandeira-do-brasil'],
 ['2026-11-20 - Zumbi e Palmares - o quilombo que resistiu','04-davi-direcao/montagem_9x16','História','História','zumbi-e-palmares'],
 ['2026-11-21 - Brasil e Guiana Francesa - a invasao e a papelada','04-davi-direcao/montagem_9x16','Geopolítica','Geopolítica','brasil-e-guiana-francesa'],
 ['2026-11-22 - EUA x China - a disputa pelo topo do mundo','04-davi-direcao/montagem_9x16','Geopolítica','Geopolítica','eua-x-china'],
 ['Enchente de Cerveja de Londres - a rua inundada','04-davi-direcao/montagem_9x16','Curiosidades','Curiosidades','enchente-de-cerveja-de-londres'],
];
const out='src/data/artigos.json';const lista=JSON.parse(fs.readFileSync(out,'utf8').replace(/^\uFEFF/,''));
for(const [pasta,mont,area,cat,pre] of TEMAS){
 const base=POST+pasta+'/',roteiro=base+'04-davi-direcao/roteiro_motor_9x16.md',md=base+mont;
 if(!fs.existsSync(roteiro)||!fs.existsSync(md+'/data.json')){console.log('PULA (sem arquivos):',pre);continue}
 const txt=fs.readFileSync(roteiro,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/);
 const dj=JSON.parse(fs.readFileSync(md+'/data.json','utf8').replace(/^\uFEFF/,''));const ids=new Set(dj.turns.map(t=>t.id));
 let titulo=(txt.find(l=>/^TEMA:/i.test(l))||'').replace(/^TEMA:\s*/i,'').split(/\s+[—-]\s+Mundo/)[0].replace(/\s*\(.*$/,'').trim()||pre;
 const T=[];let cur=null,cena='';
 for(const raw of txt){const l=raw.trim();let m;
  if(m=l.match(/^CENA:\s*(.+)$/i)){cena=m[1];continue}
  if(m=l.match(/^TURNO\s+(\d+)/i)){cur={id:+m[1],cena,fala:'',nums:[]};T.push(cur);continue}
  if(!cur)continue;
  if(m=l.match(/^FALA:\s*(.+)$/i)){cur.fala+=(cur.fala?' ':'')+m[1];continue}
  if(m=l.match(/^NA CENA:\s*(.+?)\s*\|\s*(.+)$/i)){cur.nums.push([m[1],m[2]])}}
 const turns=T.filter(t=>t.fala&&ids.has(t.id));if(turns.length<4){console.log('PULA (poucos turnos):',pre);continue}
 const G=Math.min(8,turns.length),grupos=[];for(let i=0;i<G;i++)grupos.push(turns.slice(Math.floor(i*turns.length/G),Math.floor((i+1)*turns.length/G)));
 const frase=s=>{const m=s.match(/^(.+?[.!?])(\s|$)/);return m?m[1]:s};
 const curto=s=>s.length>230?frase(s).slice(0,230):s;
 const paginas=grupos.map((g,i)=>{const n=g.flatMap(t=>t.nums)[0];const f=g[0].fala;
  const cl=(()=>{const w=f.split(' ');let i=w.findIndex((x,k)=>k>=2&&/[,;:.!?]$/.test(x));if(i<0||i>8)i=Math.min(6,w.length-1);return w.slice(0,i+1).join(' ').replace(/[,;:.!?]$/,'')})();
  const tit=n?(n[1]?n[0]+' · '+n[1]:n[0]):cl;
  return {ordem:i+1,cenario:g[0].cena,imagemUrl:`./assets/aulas/${pre}-${String(i+1).padStart(2,'0')}.webp`,tituloCard:tit,textoCard:curto(g.map(t=>t.fala).join(' '))}});
 const palavras=turns.map(t=>t.fala).join(' ').split(/\s+/).length;
 const backup=grupos.map((g,i)=>`## ${paginas[i].tituloCard}\n\n${g.map(t=>t.fala).join(' ')}`).join('\n\n');
 const turnosImg=grupos.map(g=>g[0].id).join(',');
 const r=cp.spawnSync('python',['-I','tools/exportar_imagens.py',md,pre,turnosImg,'--capa',String(grupos[Math.min(1,G-1)][0].id)],{encoding:'utf8'});
 if(r.status!==0){console.log('ERRO imagens',pre,r.stderr);continue}
 const data=(pasta.match(/^(\d{4}-\d{2}-\d{2})/)||[])[1]||'2026-11-10';
 const art={id:pre,titulo,area,categoria:cat,tempoLeituraMinutos:Math.max(1,Math.round(palavras/200)),dataPublicacao:data,imagemCapa:`./assets/capas/${pre}-capa.webp`,textoCompletoBackup:backup,paginas,youtubeUrl:'',quiz:[],pontosAConfirmar:['Quiz ainda não escrito','youtubeUrl pendente']};
 const k=lista.findIndex(a=>a.id===pre);if(k>=0)lista[k]=art;else lista.push(art);
 console.log('ok',pre,paginas.length+' paginas');
}
fs.writeFileSync(out,JSON.stringify(lista,null,2));console.log('total',lista.length);