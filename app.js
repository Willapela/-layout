(function () {
  "use strict";

  // ========== Estado ==========
  let currentFileName = "sem-titulo.html";
  let isDirty = false;
  let livePreviewEnabled = true;
  let debounceTimer = null;

  // ========== Elementos ==========
  const fileInput = document.getElementById("file-input");
  const btnNew = document.getElementById("btn-new");
  const btnDownload = document.getElementById("btn-download");
  const btnRun = document.getElementById("btn-run");
  const btnFormat = document.getElementById("btn-format");
  const btnClear = document.getElementById("btn-clear");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnOpenNew = document.getElementById("btn-open-new");
  const btnFullscreen = document.getElementById("btn-fullscreen-preview");
  const btnCloseFullscreen = document.getElementById("btn-close-fullscreen");
  const livePreviewToggle = document.getElementById("live-preview");
  const fileNameEl = document.getElementById("file-name");
  const statusEl = document.getElementById("status");
  const charCountEl = document.getElementById("char-count");
  const preview = document.getElementById("preview");
  const previewFullscreen = document.getElementById("preview-fullscreen");
  const fullscreenOverlay = document.getElementById("fullscreen-overlay");
  const resizer = document.getElementById("resizer");
  const editorPanel = document.getElementById("editor-panel");
  const previewPanel = document.getElementById("preview-panel");

  // ========== CodeMirror ==========
  const editor = CodeMirror(document.getElementById("editor-container"), {
    mode: "htmlmixed",
    theme: "dracula",
    lineNumbers: true,
    lineWrapping: true,
    autoCloseTags: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    extraKeys: {
      "Ctrl-Enter": updatePreview,
      "Cmd-Enter": updatePreview,
      "Ctrl-S": function (cm) {
        downloadFile();
        return false;
      },
      "Cmd-S": function (cm) {
        downloadFile();
        return false;
      },
      "Ctrl-Space": "autocomplete",
    },
    value: getDefaultHTML(),
  });

  // ========== Funções principais ==========

  function getDefaultHTML() {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #eaeaea;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.75rem;
      background: linear-gradient(90deg, #58a6ff, #a371f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #8b949e;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    button {
      background: #58a6ff;
      color: #0d1117;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(88,166,255,0.35);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Olá, mundo! 👋</h1>
    <p>Edite este código à esquerda e veja o resultado aqui em tempo real.</p>
    <button onclick="alert('Funcionando!')">Clique em mim</button>
  </div>
</body>
</html>`;
  }

  function updatePreview() {
    const code = editor.getValue();
    const doc = preview.contentDocument || preview.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();

    // Atualiza também o fullscreen se estiver aberto
    if (!fullscreenOverlay.hidden) {
      const docFs = previewFullscreen.contentDocument || previewFullscreen.contentWindow.document;
      docFs.open();
      docFs.write(code);
      docFs.close();
    }

    setStatus("Atualizado", "saved");
    updateCharCount();
  }

  function schedulePreview() {
    if (!livePreviewEnabled) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, 350);
  }

  function setStatus(text, type = "") {
    statusEl.textContent = text;
    statusEl.className = "status " + type;
  }

  function setFileName(name) {
    currentFileName = name || "sem-titulo.html";
    fileNameEl.textContent = currentFileName;
  }

  function markDirty() {
    isDirty = true;
    setStatus("Editando…", "editing");
  }

  function updateCharCount() {
    const len = editor.getValue().length;
    charCountEl.textContent = len.toLocaleString("pt-BR") + " caracteres";
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      editor.setValue(e.target.result);
      setFileName(file.name);
      isDirty = false;
      setStatus("Arquivo carregado", "saved");
      updatePreview();
      updateCharCount();
    };
    reader.onerror = function () {
      setStatus("Erro ao ler arquivo", "error");
      alert("Não foi possível ler o arquivo.");
    };
    reader.readAsText(file, "UTF-8");
  }

  function downloadFile() {
    const code = editor.getValue();
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName.endsWith(".html") || currentFileName.endsWith(".htm")
      ? currentFileName
      : currentFileName + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    isDirty = false;
    setStatus("Baixado!", "saved");
  }

  function newFile() {
    if (isDirty && !confirm("Há alterações não salvas. Deseja continuar e perder as mudanças?")) {
      return;
    }
    editor.setValue(getDefaultHTML());
    setFileName("sem-titulo.html");
    isDirty = false;
    setStatus("Novo arquivo", "saved");
    updatePreview();
    updateCharCount();
  }

  function clearEditor() {
    if (!confirm("Limpar todo o código?")) return;
    editor.setValue("");
    markDirty();
    updatePreview();
    updateCharCount();
  }

  function openInNewTab() {
    const code = editor.getValue();
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Não revoga imediatamente para a aba conseguir carregar
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function openFullscreen() {
    const code = editor.getValue();
    const doc = previewFullscreen.contentDocument || previewFullscreen.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
    fullscreenOverlay.hidden = false;
  }

  function closeFullscreen() {
    fullscreenOverlay.hidden = true;
  }

  // Formatação simples (indentação básica)
  function formatCode() {
    try {
      let code = editor.getValue();
      // Remove espaços extras no final das linhas
      code = code.replace(/[ \t]+$/gm, "");
      // Garante quebra de linha no final
      if (!code.endsWith("\n")) code += "\n";
      editor.setValue(code);
      setStatus("Formatado", "saved");
      updateCharCount();
    } catch (e) {
      setStatus("Erro ao formatar", "error");
    }
  }

  // ========== Resizer ==========
  let isResizing = false;

  resizer.addEventListener("mousedown", function (e) {
    isResizing = true;
    resizer.classList.add("active");
    document.body.style.cursor = window.innerWidth <= 768 ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    const workspace = document.querySelector(".workspace");
    const rect = workspace.getBoundingClientRect();

    if (window.innerWidth <= 768) {
      // Vertical
      const total = rect.height;
      const top = e.clientY - rect.top;
      const percent = Math.min(Math.max((top / total) * 100, 20), 80);
      editorPanel.style.flex = `0 0 ${percent}%`;
      previewPanel.style.flex = `0 0 ${100 - percent}%`;
    } else {
      // Horizontal
      const total = rect.width;
      const left = e.clientX - rect.left;
      const percent = Math.min(Math.max((left / total) * 100, 20), 80);
      editorPanel.style.flex = `0 0 ${percent}%`;
      previewPanel.style.flex = `0 0 ${100 - percent}%`;
    }
  });

  document.addEventListener("mouseup", function () {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove("active");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  // ========== Eventos ==========
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      loadFile(file);
      fileInput.value = ""; // permite re-upload do mesmo arquivo
    }
  });

  // Drag & drop
  const app = document.querySelector(".app");
  app.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  app.addEventListener("drop", function (e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".html") || file.name.endsWith(".htm") || file.type === "text/html" || file.type === "text/plain")) {
      loadFile(file);
    } else {
      alert("Por favor, solte um arquivo HTML (.html ou .htm).");
    }
  });

  btnNew.addEventListener("click", newFile);
  btnDownload.addEventListener("click", downloadFile);
  btnRun.addEventListener("click", updatePreview);
  btnFormat.addEventListener("click", formatCode);
  btnClear.addEventListener("click", clearEditor);
  btnRefresh.addEventListener("click", updatePreview);
  btnOpenNew.addEventListener("click", openInNewTab);
  btnFullscreen.addEventListener("click", openFullscreen);
  btnCloseFullscreen.addEventListener("click", closeFullscreen);

  livePreviewToggle.addEventListener("change", function () {
    livePreviewEnabled = this.checked;
    if (livePreviewEnabled) updatePreview();
  });

  editor.on("change", function () {
    markDirty();
    schedulePreview();
    updateCharCount();
  });

  // Atalhos
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !fullscreenOverlay.hidden) {
      closeFullscreen();
    }
  });

  // Aviso ao sair com alterações
  window.addEventListener("beforeunload", function (e) {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ========== Inicialização ==========
  updatePreview();
  updateCharCount();
  setStatus("Pronto", "saved");
})();
