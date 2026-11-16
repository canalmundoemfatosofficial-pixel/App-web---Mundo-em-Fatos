import json, os, requests, base64, datetime

with open('public/painel/roteiros.json', 'r', encoding='utf-8') as f:
    roteiros = json.load(f)

api_key = os.environ['GEMINI_API_KEY']
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={api_key}"
updated = False

os.makedirs('public/painel/audios', exist_ok=True)

for r in roteiros:
    if r.get('status') != 'roteiro_aprovado':
        continue

    roteiro_text = r.get('roteiro', '')
    if not roteiro_text:
        print(f"Roteiro vazio para {r.get('id')} -- pulando")
        continue

    payload = {
        "contents": [{"parts": [{"text": roteiro_text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": "Fenrir"}
                }
            }
        }
    }

    resp = requests.post(url, json=payload, timeout=60)
    resp.raise_for_status()

    audio_b64 = resp.json()['candidates'][0]['content']['parts'][0]['inlineData']['data']
    audio_bytes = base64.b64decode(audio_b64)

    filename = f"{r['id']}.mp3"
    filepath = f"public/painel/audios/{filename}"
    with open(filepath, 'wb') as f_out:
        f_out.write(audio_bytes)

    r['audio_url'] = f"/App-web---Mundo-em-Fatos/painel/audios/{filename}"
    r['status'] = 'audio_gerado'
    r['atualizado_em'] = datetime.date.today().isoformat()
    updated = True
    print(f"Audio gerado: {filename} ({len(audio_bytes)} bytes)")

if updated:
    with open('public/painel/roteiros.json', 'w', encoding='utf-8') as f:
        json.dump(roteiros, f, ensure_ascii=False, indent=2)
    print("roteiros.json atualizado")
else:
    print("Nenhum roteiro com status 'roteiro_aprovado' encontrado")
