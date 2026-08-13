(function () {
  "use strict";

  // ========== Estado ==========
  let currentFileName = "sem-titulo.html";
  let currentGistId = null;
  let isDirty = false;
  let livePreviewEnabled = true;
  let debounceTimer = null;
  const STORAGE_KEY = "html-editor-pro-projects";
  const TOKEN_KEY = "html-editor-pro-token";

  // ========== Elementos ==========
  const fileInput = document.getElementById("file-input");
  const btnNew = document.getElementById("btn-new");
  const btnDownload = document.getElementById("btn-download");
  const btnSaveGist = document.getElementById("btn-save-gist");
  const btnRun = document.getElementById("btn-run");
  const btnFormat = document.getElementById("btn-format");
  const btnClear = document.getElementById("btn-clear");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnOpenNew = document.getElementById("btn-open-new");
  const btnFullscreen = document.getElementById("btn-fullscreen-preview");
  const btnCloseFullscreen = document.getElementById("btn-close-fullscreen");
  const btnOpenNewFs = document.getElementById("btn-open-new-fs");
  const btnSettings = document.getElementById("btn-settings");
  const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
  const btnRefreshList = document.getElementById("btn-refresh-list");
  const btnLoadGistId = document.getElementById("btn-load-gist-id");
  const livePreviewToggle = document.getElementById("live-preview");
  const fileNameEl = document.getElementById("file-name");
  const statusEl = document.getElementById("status");
  const charCountEl = document.getElementById("char-count");
  const gistLinkEl = document.getElementById("gist-link");
  const preview = document.getElementById("preview");
  const previewFullscreen = document.getElementById("preview-fullscreen");
  const fullscreenOverlay = document.getElementById("fullscreen-overlay");
  const resizer = document.getElementById("resizer");
  const editorPanel = document.getElementById("editor-panel");
  const previewPanel = document.getElementById("preview-panel");
  const sidebar = document.getElementById("sidebar");
  const projectList = document.getElementById("project-list");

  // Modals
  const modalSaveGist = document.getElementById("modal-save-gist");
  const modalSettings = document.getElementById("modal-settings");
  const modalLoadGist = document.getElementById("modal-load-gist");
  const gistFilename = document.getElementById("gist-filename");
  const gistDescription = document.getElementById("gist-description");
  const gistPublic = document.getElementById("gist-public");
  const githubTokenInput = document.getElementById("github-token");
  const gistIdInput = document.getElementById("gist-id-input");
  const btnConfirmSaveGist = document.getElementById("btn-confirm-save-gist");
  const btnSaveToken = document.getElementById("btn-save-token");
  const btnConfirmLoadGist = document.getElementById("btn-confirm-load-gist");

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
      "Ctrl-S": function () { openSaveGistModal(); return false; },
      "Cmd-S": function () { openSaveGistModal(); return false; },
      "Ctrl-Space": "autocomplete",
    },
    value: getDefaultHTML(),
  });

  // ========== Storage ==========
  function getProjects() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveProjects(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    modal.removeAttribute("hidden");
    modal.style.display = "flex";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("hidden", "");
    modal.style.display = "none";
  }

  function closeAllModals() {
    closeModal(modalSaveGist);
    closeModal(modalSettings);
    closeModal(modalLoadGist);
  }

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
    p { color: #8b949e; line-height: 1.6; margin-bottom: 1.5rem; }
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
    <p>Edite este código à esquerda e veja o resultado aqui em tempo real. Use "Salvar Gist" para guardar online.</p>
    <button onclick="alert('Funcionando!')">Clique em mim</button>
  </div>
</body>
</html>`;
  }

  function updatePreview() {
    const code = editor.getValue();
    try {
      const doc = preview.contentDocument || preview.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    } catch (e) {}

    if (!fullscreenOverlay.hidden) {
      try {
        const docFs = previewFullscreen.contentDocument || previewFullscreen.contentWindow.document;
        docFs.open();
        docFs.write(code);
        docFs.close();
      } catch (e) {}
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

  function setGistLink(id, htmlUrl) {
    currentGistId = id;
    if (id && htmlUrl) {
      gistLinkEl.hidden = false;
      gistLinkEl.innerHTML = `<a href="${htmlUrl}" target="_blank" rel="noopener">Gist ↗</a>`;
    } else {
      gistLinkEl.hidden = true;
      gistLinkEl.innerHTML = "";
    }
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
      setGistLink(null);
      isDirty = false;
      setStatus("Arquivo carregado", "saved");
      updatePreview();
      updateCharCount();
      renderProjectList();
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
    if (isDirty && !confirm("Há alterações não salvas. Continuar?")) return;
    editor.setValue(getDefaultHTML());
    setFileName("sem-titulo.html");
    setGistLink(null);
    isDirty = false;
    setStatus("Novo arquivo", "saved");
    updatePreview();
    updateCharCount();
    renderProjectList();
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
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  function openFullscreen() {
    const code = editor.getValue();
    try {
      const doc = previewFullscreen.contentDocument || previewFullscreen.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    } catch (e) {}
    fullscreenOverlay.hidden = false;
  }

  function closeFullscreen() {
    fullscreenOverlay.hidden = true;
  }

  function formatCode() {
    let code = editor.getValue();
    code = code.replace(/[ \t]+$/gm, "");
    if (!code.endsWith("\n")) code += "\n";
    editor.setValue(code);
    setStatus("Formatado", "saved");
    updateCharCount();
  }

  // ========== Gist ==========

  async function createOrUpdateGist(filename, description, isPublic, content) {
    const token = getToken();
    const headers = {
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = "Bearer " + token;

    const body = {
      description: description || "Salvo pelo HTML Editor Pro",
      public: !!isPublic,
      files: {
        [filename]: { content: content },
      },
    };

    let url = "https://api.github.com/gists";
    let method = "POST";

    // Se já temos um gistId e token, tenta atualizar
    if (currentGistId && token) {
      url = "https://api.github.com/gists/" + currentGistId;
      method = "PATCH";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro HTTP " + res.status);
    }

    return res.json();
  }

  async function fetchGist(id) {
    const token = getToken();
    const headers = { "Accept": "application/vnd.github+json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch("https://api.github.com/gists/" + id, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Gist não encontrado");
    }
    return res.json();
  }

  function openSaveGistModal() {
    gistFilename.value = currentFileName;
    gistDescription.value = "";
    gistPublic.checked = false;
    openModal(modalSaveGist);
    setTimeout(() => gistFilename.focus(), 50);
  }

  async function confirmSaveGist() {
    let filename = (gistFilename.value || "sem-titulo.html").trim();
    if (!filename.endsWith(".html") && !filename.endsWith(".htm")) {
      filename += ".html";
    }
    const description = gistDescription.value.trim();
    const isPublic = gistPublic.checked;
    const content = editor.getValue();

    if (!content.trim()) {
      alert("O código está vazio.");
      return;
    }

    btnConfirmSaveGist.disabled = true;
    btnConfirmSaveGist.textContent = "Salvando…";
    setStatus("Salvando no Gist…", "editing");

    try {
      const data = await createOrUpdateGist(filename, description, isPublic, content);
      setFileName(filename);
      setGistLink(data.id, data.html_url);
      isDirty = false;
      setStatus("Salvo no Gist!", "saved");

      // Guarda na lista local
      const projects = getProjects();
      const existing = projects.findIndex((p) => p.id === data.id);
      const entry = {
        id: data.id,
        name: filename,
        description: description || data.description || "",
        html_url: data.html_url,
        updated: new Date().toISOString(),
      };
      if (existing >= 0) projects[existing] = entry;
      else projects.unshift(entry);
      saveProjects(projects);
      renderProjectList();

      closeModal(modalSaveGist);
    } catch (err) {
      setStatus("Erro ao salvar", "error");
      alert("Falha ao salvar Gist:\n" + err.message + "\n\nDica: configure um Token GitHub nas configurações (⚙) para melhores resultados.");
    } finally {
      btnConfirmSaveGist.disabled = false;
      btnConfirmSaveGist.textContent = "Salvar Gist";
    }
  }

  async function loadGistById(idOrUrl) {
    let id = (idOrUrl || "").trim();
    // Extrai ID de URL
    const match = id.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i) ||
                  id.match(/^([a-f0-9]+)$/i);
    if (match) id = match[1];
    if (!id) {
      alert("ID inválido.");
      return;
    }

    setStatus("Carregando Gist…", "editing");
    try {
      const data = await fetchGist(id);
      const files = data.files || {};
      const fileNames = Object.keys(files);
      if (!fileNames.length) throw new Error("Gist sem arquivos");

      // Prefere .html
      let chosen = fileNames.find((n) => n.endsWith(".html") || n.endsWith(".htm")) || fileNames[0];
      const file = files[chosen];
      editor.setValue(file.content || "");
      setFileName(chosen);
      setGistLink(data.id, data.html_url);
      isDirty = false;
      setStatus("Gist carregado", "saved");
      updatePreview();
      updateCharCount();

      // Adiciona à lista se não existir
      const projects = getProjects();
      if (!projects.some((p) => p.id === data.id)) {
        projects.unshift({
          id: data.id,
          name: chosen,
          description: data.description || "",
          html_url: data.html_url,
          updated: new Date().toISOString(),
        });
        saveProjects(projects);
      }
      renderProjectList();
      closeModal(modalLoadGist);
    } catch (err) {
      setStatus("Erro ao carregar", "error");
      alert("Não foi possível carregar o Gist:\n" + err.message);
    }
  }

  function loadProject(entry) {
    if (isDirty && !confirm("Há alterações não salvas. Continuar?")) return;
    loadGistById(entry.id);
  }

  function removeProject(id, e) {
    if (e) e.stopPropagation();
    if (!confirm("Remover este projeto da lista local? (o Gist continua no GitHub)")) return;
    const projects = getProjects().filter((p) => p.id !== id);
    saveProjects(projects);
    if (currentGistId === id) setGistLink(null);
    renderProjectList();
  }

  function renderProjectList() {
    const projects = getProjects();
    projectList.innerHTML = "";

    if (!projects.length) {
      projectList.innerHTML = `<li class="empty">Nenhum projeto salvo ainda.<br><br>Use o botão <strong>Salvar Gist</strong> para guardar online.</li>`;
      return;
    }

    projects.forEach((p) => {
      const li = document.createElement("li");
      if (p.id === currentGistId) li.classList.add("active");
      li.innerHTML = `
        <span class="proj-name" title="${p.name}">${escapeHtml(p.name)}</span>
        <span class="proj-actions">
          <button title="Abrir no GitHub" class="open">↗</button>
          <button title="Remover da lista" class="del">✕</button>
        </span>
      `;
      li.addEventListener("click", (e) => {
        if (e.target.closest(".open")) {
          window.open(p.html_url, "_blank");
          return;
        }
        if (e.target.closest(".del")) {
          removeProject(p.id, e);
          return;
        }
        loadProject(p);
      });
      projectList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      const total = rect.height;
      const top = e.clientY - rect.top;
      const percent = Math.min(Math.max((top / total) * 100, 20), 80);
      editorPanel.style.flex = `0 0 ${percent}%`;
      previewPanel.style.flex = `0 0 ${100 - percent}%`;
    } else {
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
      fileInput.value = "";
    }
  });

  // Drag & drop
  document.querySelector(".app").addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  document.querySelector(".app").addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.match(/\.(html|htm|txt)$/i) || file.type === "text/html" || file.type === "text/plain")) {
      loadFile(file);
    } else {
      alert("Solte um arquivo HTML (.html ou .htm).");
    }
  });

  btnNew.addEventListener("click", newFile);
  btnDownload.addEventListener("click", downloadFile);
  btnSaveGist.addEventListener("click", openSaveGistModal);
  btnRun.addEventListener("click", updatePreview);
  btnFormat.addEventListener("click", formatCode);
  btnClear.addEventListener("click", clearEditor);
  btnRefresh.addEventListener("click", updatePreview);
  btnOpenNew.addEventListener("click", openInNewTab);
  btnFullscreen.addEventListener("click", openFullscreen);
  btnCloseFullscreen.addEventListener("click", closeFullscreen);
  btnOpenNewFs.addEventListener("click", openInNewTab);

  function isMobileLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function setSidebarOpen(open) {
    if (open) {
      sidebar.classList.remove("collapsed");
    } else {
      sidebar.classList.add("collapsed");
    }
    const backdrop = document.getElementById("sidebar-backdrop");
    if (backdrop) {
      backdrop.classList.toggle("visible", open && isMobileLayout());
    }
  }

  btnToggleSidebar.addEventListener("click", () => {
    const willOpen = sidebar.classList.contains("collapsed");
    setSidebarOpen(willOpen);
  });

  btnRefreshList.addEventListener("click", renderProjectList);

  btnLoadGistId.addEventListener("click", () => {
    gistIdInput.value = "";
    openModal(modalLoadGist);
    setTimeout(() => gistIdInput.focus(), 50);
  });

  if (btnSettings) {
    btnSettings.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (githubTokenInput) githubTokenInput.value = getToken();
      openModal(modalSettings);
      setTimeout(() => {
        if (githubTokenInput) githubTokenInput.focus();
      }, 50);
    });
  }

  btnConfirmSaveGist.addEventListener("click", confirmSaveGist);

  if (btnSaveToken) {
    btnSaveToken.addEventListener("click", () => {
      setToken(githubTokenInput ? githubTokenInput.value.trim() : "");
      closeModal(modalSettings);
      setStatus("Token salvo", "saved");
    });
  }

  btnConfirmLoadGist.addEventListener("click", () => {
    loadGistById(gistIdInput.value);
  });

  // Fechar modais (backdrop e botões Cancelar/Fechar)
  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  livePreviewToggle.addEventListener("change", function () {
    livePreviewEnabled = this.checked;
    if (livePreviewEnabled) updatePreview();
  });

  editor.on("change", function () {
    markDirty();
    schedulePreview();
    updateCharCount();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!fullscreenOverlay.hidden) closeFullscreen();
      closeAllModals();
    }
  });

  window.addEventListener("beforeunload", function (e) {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ========== Inicialização ==========
  // No celular a sidebar começa fechada
  if (isMobileLayout()) {
    setSidebarOpen(false);
  }

  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));
  }

  window.addEventListener("resize", () => {
    if (!isMobileLayout()) {
      sidebar.classList.remove("collapsed");
      if (sidebarBackdrop) sidebarBackdrop.classList.remove("visible");
    }
  });

  updatePreview();
  updateCharCount();
  setStatus("Pronto", "saved");
  renderProjectList();
})();
