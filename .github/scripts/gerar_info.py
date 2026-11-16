import json, os, requests, datetime

with open('public/painel/roteiros.json', 'r', encoding='utf-8-sig') as f:
    roteiros = json.load(f)

api_key = os.environ['GEMINI_API_KEY']
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
updated = False

for r in roteiros:
    if r.get('status') != 'audio_aprovado':
        continue

    roteiro_text = r.get('roteiro', '')
    tema = r.get('tema', r.get('titulo', ''))

    prompt = f"""Voce e o diretor de arte e produtor do canal Mundo em Fatos.

Com base neste roteiro de Short:
"{roteiro_text}"

Gere um JSON com as seguintes informacoes:

{{
  "cenarios": "descricao das cenas do video -- uma por linha, formato: CENA N: [descricao do fundo/ambiente] | [acao do PROF] | [duracao aprox em seg]",
  "sugestoes_titulo": ["titulo 1 chamativo (max 60 chars)", "titulo 2 com curiosidade", "titulo 3 mais direto"],
  "descricao": "descricao completa para YouTube/TikTok (2-3 paragrafos, inclui #hashtags no final)",
  "tags": "tag1, tag2, tag3, tag4, tag5, mundoemfatos, historiacuriosa",
  "instrucao_capa": "descricao objetiva para criar a capa: cor de fundo, elemento visual principal, texto em destaque"
}}

Responda APENAS com o JSON, sem markdown."""

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()

    text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    try:
        data = json.loads(text)
        r['cenarios'] = data.get('cenarios', '')
        r['sugestoes_titulo'] = data.get('sugestoes_titulo', [])
        if not r.get('publicacao'):
            r['publicacao'] = {}
        r['publicacao']['descricao'] = data.get('descricao', '')
        r['publicacao']['tags'] = data.get('tags', '')
        r['publicacao']['instrucao_capa'] = data.get('instrucao_capa', '')
    except Exception as e:
        print(f"Erro ao parsear JSON: {e}")
        r['cenarios'] = text

    r['status'] = 'montagem'
    r['atualizado_em'] = datetime.date.today().isoformat()
    updated = True
    print(f"Info gerada para: {r.get('titulo', tema)}")

if updated:
    with open('public/painel/roteiros.json', 'w', encoding='utf-8') as f:
        json.dump(roteiros, f, ensure_ascii=False, indent=2)
    print("roteiros.json atualizado")
else:
    print("Nenhum roteiro com status 'audio_aprovado' encontrado")
