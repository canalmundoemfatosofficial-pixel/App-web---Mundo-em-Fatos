import json, os, sys, traceback, requests, datetime

print("=== INICIO gerar_roteiro.py ===")

try:
    with open('public/painel/roteiros.json', 'r', encoding='utf-8-sig') as f:
        roteiros = json.load(f)
    print(f"JSON carregado: {type(roteiros).__name__}, itens: {len(roteiros) if isinstance(roteiros, list) else 'N/A (nao e lista!)'}")
except Exception as e:
    print(f"ERRO ao ler JSON: {e}")
    sys.exit(1)

api_key = os.environ.get('GEMINI_API_KEY', '')
if not api_key:
    print("ERRO: GEMINI_API_KEY nao encontrada nas variaveis de ambiente!")
    sys.exit(1)
print(f"GEMINI_API_KEY encontrada (tamanho: {len(api_key)})")

# Listar modelos disponíveis
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
list_resp = requests.get(list_url, timeout=10)
if list_resp.status_code == 200:
    models = [m['name'] for m in list_resp.json().get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
    print(f"Modelos para generateContent: {models[:10]}")
else:
    print(f"Nao foi possivel listar modelos: {list_resp.status_code}")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
updated = False

for r in roteiros:
    if r.get('status') != 'tema':
        continue

    tema = r.get('tema', r.get('titulo', ''))
    notas = r.get('notas', '')
    print(f"Gerando roteiro para: {tema}")

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

    try:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(url, json=payload, timeout=90)
        print(f"Status HTTP: {resp.status_code}")
        if resp.status_code != 200:
            err = resp.text[:1200]
            # Print each line as annotation for visibility
            for line in err.split('\n')[:8]:
                if line.strip():
                    print(f"::error::{line}")
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
    except Exception as e:
        print(f"ERRO na geracao: {e}")
        traceback.print_exc()
        sys.exit(1)

if updated:
    with open('public/painel/roteiros.json', 'w', encoding='utf-8') as f:
        json.dump(roteiros, f, ensure_ascii=False, indent=2)
    print("roteiros.json atualizado")
else:
    print("Nenhum roteiro com status 'tema' encontrado")

print("=== FIM gerar_roteiro.py ===")
