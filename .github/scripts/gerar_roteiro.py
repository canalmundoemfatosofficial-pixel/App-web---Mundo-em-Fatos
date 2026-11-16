import json, os, sys, requests, datetime

with open('public/painel/roteiros.json', 'r', encoding='utf-8-sig') as f:
    roteiros = json.load(f)

api_key = os.environ.get('GEMINI_API_KEY', '')
if not api_key:
    print("ERRO: GEMINI_API_KEY nao configurada!")
    sys.exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
updated = False

for r in roteiros:
    if r.get('status') != 'tema':
        continue

    tema = r.get('tema', r.get('titulo', ''))
    notas = r.get('notas', '')

    prompt = f"""Voce e o roteirista do canal Mundo em Fatos. Crie um roteiro de Short para o tema: "{tema}".

REGRAS:
- Formato: PROF solo, 30 a 45 segundos, 9:16 vertical
- O PROF narra com voz dinamica, didatica e com humor leve
- Estrutura: Gancho -> Explicacao -> Curiosidade -> Conclusao
- Termine SEMPRE com: "Segue para ficar por dentro do Mundo."
- Escreva apenas as falas, sem titulos de secao
- Maximo 4 turnos curtos
{"- Observacao: " + notas if notas else ""}

Responda APENAS com o roteiro em formato JSON assim:
{{"roteiro": "fala completa aqui em texto corrido com cada turno separado por dois saltos de linha"}}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }
    resp = requests.post(url, json=payload, timeout=90)
    if resp.status_code != 200:
        print(f"ERRO API {resp.status_code}: {resp.text[:300]}")
    resp.raise_for_status()

    text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    try:
        data = json.loads(text)
        r['roteiro'] = data.get('roteiro', text)
    except Exception:
        r['roteiro'] = text

    r['status'] = 'roteiro'
    r['atualizado_em'] = datetime.date.today().isoformat()
    updated = True
    print(f"Roteiro gerado para: {r.get('titulo', tema)}")

if updated:
    with open('public/painel/roteiros.json', 'w', encoding='utf-8') as f:
        json.dump(roteiros, f, ensure_ascii=False, indent=2)
    print("roteiros.json atualizado")
else:
    print("Nenhum roteiro com status 'tema' encontrado")
