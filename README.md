# HTML Editor Pro

Site completo para **upload**, **edição**, **salvar online (Gist)** e **visualização** de arquivos HTML — tudo no navegador.

## Como usar

1. Abra o arquivo `index.html` no seu navegador.
2. Ou hospede a pasta (GitHub Pages, Netlify, Vercel, etc.).

### Funcionalidades

- **Upload** de arquivos `.html` / `.htm` (botão ou arrastar e soltar)
- **Editor** com syntax highlighting (CodeMirror + tema Dracula)
- **Preview ao vivo** (atualiza enquanto você digita)
- **Ver completo** — visualização em tela cheia do HTML
- **Salvar Gist** — grava o projeto online no GitHub Gist
- **Barra lateral** com a lista dos projetos salvos
- **Carregar Gist por ID** ou URL
- **Baixar** o HTML editado
- **Abrir em nova aba**
- Redimensionar painéis
- Atalhos:
  - `Ctrl + Enter` → Atualizar preview
  - `Ctrl + S` → Abrir modal de Salvar Gist
  - `Esc` → Fechar tela cheia / modais

### Salvar online (Gist)

1. Clique em **Salvar Gist**
2. (Opcional) Configure um **Token GitHub** no botão ⚙  
   - Crie em: https://github.com/settings/tokens?type=beta  
   - Permissão necessária: `gist`
3. Sem token os Gists são anônimos (públicos e com limite de taxa)

Os projetos salvos aparecem na **barra lateral esquerda**. A lista fica no `localStorage` do navegador.

### Privacidade

- O código só é enviado ao GitHub quando você clica em **Salvar Gist**.
- Token fica apenas no seu navegador (`localStorage`).

## Estrutura

```
html-editor/
├── index.html
├── styles.css
├── app.js
└── README.md
```
