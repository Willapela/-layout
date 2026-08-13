# HTML Editor Pro

Site completo para **upload**, **edição** e **visualização** de arquivos HTML — tudo no navegador.

## Como usar

1. Abra o arquivo `index.html` no seu navegador (duplo clique ou arraste para o Chrome/Firefox/Edge).
2. Ou hospede a pasta em qualquer servidor estático (Netlify, Vercel, GitHub Pages, etc.).

### Funcionalidades

- **Upload** de arquivos `.html` / `.htm` (botão ou arrastar e soltar)
- **Editor** com syntax highlighting (CodeMirror + tema Dracula)
- **Preview ao vivo** (atualiza enquanto você digita)
- **Baixar** o HTML editado
- **Abrir em nova aba**
- **Preview em tela cheia**
- Redimensionar painéis (arraste a barra do meio)
- Atalhos:
  - `Ctrl + Enter` → Atualizar preview
  - `Ctrl + S` → Baixar arquivo
  - `Esc` → Fechar tela cheia

### Privacidade

Seus arquivos **nunca saem do seu dispositivo**. Tudo roda localmente no navegador.

## Estrutura

```
html-editor/
├── index.html   ← abra este arquivo
├── styles.css
├── app.js
└── README.md
```
