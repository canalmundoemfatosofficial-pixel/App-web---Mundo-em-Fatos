# Mundo em Fatos (PWA)

App educacional estático (Vite + React), hospedado no GitHub Pages.

## Conteúdo
- `src/data/artigos.json`: artigos (páginas, texto, quiz, `youtubeUrl`).
- `src/data/config.json`: `lofiYoutubeUrl`, `formspreeEndpoint`, categorias.
- `public/assets/capas` e `public/assets/aulas`: imagens `.webp`.
- Para atualizar o conteúdo: edite os arquivos, faça commit na branch `main`; o GitHub Actions publica sozinho.

## Rodar local
```
npm install
npm run dev
```

## Publicar
1. Crie o repositório no GitHub e envie esta pasta (branch `main`).
2. Em Settings > Pages, escolha "Source: GitHub Actions".
3. Domínio próprio (quando houver): crie `public/CNAME` com o domínio (veja `CNAME.exemplo`), configure o DNS e ative "Enforce HTTPS".

## Ferramentas (pasta `tools/`)
- `gerar_artigos.cjs`: converte temas de vídeo em artigos + imagens.
- `adicionar_quizzes.cjs`: grava os quizzes (rode depois do gerador).
- `exportar_imagens.py`: exporta `.webp` dos quadros de um vídeo.