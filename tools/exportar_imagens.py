#!/usr/bin/env python3
"""Exporta as imagens .webp do app a partir dos quadros de um vídeo montado.
uso: python exportar_imagens.py PASTA_MONTAGEM PREFIXO TURNOS [--capa TURNO]
  TURNOS = números dos turnos (ids de data.json), um por página do artigo, ex.: 1,2,4,6,9,11,14,17
  saída: public/assets/aulas/PREFIXO-NN.webp (720x1280) e public/assets/capas/PREFIXO-capa.webp (720x900)"""
import sys, os, json, subprocess
FPS = 30
pasta, prefixo, turnos = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
capa = int(sys.argv[sys.argv.index('--capa') + 1]) if '--capa' in sys.argv else turnos[0]
raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets')
os.makedirs(raiz + '/aulas', exist_ok=True); os.makedirs(raiz + '/capas', exist_ok=True)
T = {t['id']: t for t in json.load(open(pasta + '/data.json', encoding='utf-8'))['turns']}
def quadro(tid):
    t = T[tid]; i = int(round((t['gs'] + t['d'] * 0.65) * FPS))
    return f'{pasta}/quadros/f{i:05d}.jpg'
def webp(src, dst, filtro):
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-vf', filtro, '-quality', '82', dst], check=True)
for n, tid in enumerate(turnos, 1):
    webp(quadro(tid), f'{raiz}/aulas/{prefixo}-{n:02d}.webp', 'scale=720:1280')
webp(quadro(capa), f'{raiz}/capas/{prefixo}-capa.webp', 'crop=1080:1350:0:190,scale=720:900')
print('ok', len(turnos), 'paginas +capa')
