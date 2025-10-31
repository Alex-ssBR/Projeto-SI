document.addEventListener("DOMContentLoaded", () => {
  const campoBusca = document.getElementById("campoBusca");
  const botaoBusca = document.getElementById("botaoBusca");
  const listaCasos = document.getElementById("listaCasos");
  const botaoCriarCaso = document.getElementById("botaoCriarCaso");
  const popup = document.getElementById("popupCaso");
  const fecharPopup = document.getElementById("fecharPopup");
  const formCaso = document.getElementById("formCaso");
  const popupTitle = document.getElementById("popupTitle");
  const salvarCasoBtn = document.getElementById("salvarCasoBtn");
  const finalizarCasoBtn = document.getElementById("finalizarCasoBtn");

  // Elementos da janela lateral de avisos (CHAT)
  const avisosContainer = document.getElementById("avisos-container");
  const campoMensagem = document.getElementById("campoMensagem");
  const enviarMensagemBtn = document.getElementById("enviarMensagemBtn");

  let casos = [];
  let avisos = []; // Array para armazenar os avisos do chat
  let casoEditandoId = null; // Para saber se estamos criando ou editando um caso

  // --- Funções para Casos ---

  // Função para obter casos dos cookies
  function getCasosFromCookie() {
    const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)casos\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];
  }

  // Função para salvar casos nos cookies
  function saveCasosToCookie() {
    document.cookie = `casos=${encodeURIComponent(JSON.stringify(casos))}; path=/; max-age=${60 * 60 * 24 * 365}`; // Expira em 1 ano
  }

  // Função para renderizar a lista de casos
  function renderCasos() {
    listaCasos.innerHTML = "";
    casos.sort((a, b) => b.id - a.id); // Ordena pelo ID mais recente primeiro

    casos.forEach(caso => {
      const li = document.createElement("li");
      li.setAttribute("data-status", caso.status);
      li.setAttribute("data-id", caso.id);

      const statusClass = caso.status === "aberto" ? "aberto" : "fechado";

      li.innerHTML = `
        <div>
          Caso ${caso.id} ${caso.patrimonio ? `(Patrimônio: ${caso.patrimonio})` : ''}
          <strong>Status:</strong> <span class="${statusClass}">${caso.status.toUpperCase()}</span>
          ${caso.ultimaAtualizacao ? `<span> (Última atualização: ${new Date(caso.ultimaAtualizacao).toLocaleString()})</span>` : ''}
        </div>
        <div class="case-actions">
          ${caso.status === "aberto" ? `<button class="abrir-caso-btn">Abrir Caso</button>` : ''}
          ${caso.status === "fechado" ? `
            <button class="download-button">Baixar Caso</button>
            <button class="reopen-button">Reabrir Caso</button>
          ` : ''}
        </div>
      `;

      listaCasos.appendChild(li);
    });

    attachEventListenersToCaseButtons();
  }

  // Função para anexar event listeners aos botões da lista de casos
  function attachEventListenersToCaseButtons() {
    document.querySelectorAll(".abrir-caso-btn").forEach(button => {
      button.onclick = (e) => {
        const li = e.target.closest("li");
        const casoId = parseInt(li.getAttribute("data-id"));
        abrirPopupEdicao(casoId);
      };
    });

    document.querySelectorAll(".reopen-button").forEach(button => {
      button.onclick = (e) => {
        const li = e.target.closest("li");
        const casoId = parseInt(li.getAttribute("data-id"));
        reabrirCaso(casoId);
      };
    });

    document.querySelectorAll(".download-button").forEach(button => {
      button.onclick = (e) => {
        const li = e.target.closest("li");
        const casoId = parseInt(li.getAttribute("data-id"));
        baixarCaso(casoId);
      };
    });
  }

  // Função para abrir o popup em modo de criação ou edição
  function abrirPopupEdicao(id = null) {
    casoEditandoId = id;
    formCaso.reset(); // Limpa o formulário

    if (id !== null) {
      popupTitle.textContent = "Editar Caso";
      const caso = casos.find(c => c.id === id);
      if (caso) {
        document.getElementById("nome").value = caso.nome || "";
        document.getElementById("ramal").value = caso.ramal || "";
        document.getElementById("secretaria").value = caso.secretaria || "";
        document.getElementById("departamento").value = caso.departamento || "";
        document.getElementById("patrimonio").value = caso.patrimonio || "";
        document.getElementById("problema").value = caso.problema || "";
        document.getElementById("solucao").value = caso.solucao || "";
      }
      finalizarCasoBtn.style.display = "block"; // Mostra finalizar ao editar
    } else {
      popupTitle.textContent = "Abertura de Caso";
      // Se for um novo caso criado pela navbar, pede patrimônio
      const patrimonioInput = document.getElementById("patrimonio");
      patrimonioInput.value = prompt("Digite o número de patrimônio (ou deixe em branco para 'Sem Patrimônio'):") || "";
      finalizarCasoBtn.style.display = "none"; // Esconde finalizar ao criar
    }
    popup.style.display = "flex";
  }

  // Função para salvar ou atualizar um caso
  function salvarCaso(status) {
    const nome = document.getElementById("nome").value;
    const ramal = document.getElementById("ramal").value;
    const secretaria = document.getElementById("secretaria").value;
    const departamento = document.getElementById("departamento").value;
    const patrimonio = document.getElementById("patrimonio").value || "Sem Patrimônio";
    const problema = document.getElementById("problema").value;
    const solucao = document.getElementById("solucao").value;
    const ultimaAtualizacao = new Date().toISOString();

    if (!nome.trim()) {
      alert("O campo 'Nome' é obrigatório.");
      return;
    }

    if (casoEditandoId !== null) {
      // Editando um caso existente
      const index = casos.findIndex(c => c.id === casoEditandoId);
      if (index !== -1) {
        casos[index] = {
          ...casos[index],
          nome, ramal, secretaria, departamento, patrimonio, problema, solucao,
          status: status, // Atualiza o status
          ultimaAtualizacao
        };
        alert("Caso atualizado com sucesso!");
      }
    } else {
      // Criando um novo caso
      const newId = casos.length > 0 ? Math.max(...casos.map(c => c.id)) + 1 : 1;
      const novoCaso = {
        id: newId,
        nome, ramal, secretaria, departamento, patrimonio, problema, solucao,
        status: status, // Define o status inicial
        ultimaAtualizacao
      };
      casos.push(novoCaso);
      alert("Caso registrado com sucesso!");
    }

    saveCasosToCookie();
    renderCasos();
    popup.style.display = "none";
  }

  // Funções de ação para os botões
  function reabrirCaso(id) {
    const index = casos.findIndex(c => c.id === id);
    if (index !== -1) {
      casos[index].status = "aberto";
      casos[index].ultimaAtualizacao = new Date().toISOString();
      saveCasosToCookie();
      renderCasos();
      alert(`Caso ${id} reaberto com sucesso!`);
    }
  }

  function baixarCaso(id) {
    const caso = casos.find(c => c.id === id);
    if (caso) {
      const caseDetails = `
        Detalhes do Caso ${caso.id}
        ---------------------------
        Nome: ${caso.nome}
        Ramal: ${caso.ramal || 'N/A'}
        Secretaria: ${caso.secretaria || 'N/A'}
        Departamento: ${caso.departamento || 'N/A'}
        Nº Patrimônio: ${caso.patrimonio || 'N/A'}
        Problema: ${caso.problema || 'N/A'}
        Solução: ${caso.solucao || 'N/A'}
        Status: ${caso.status.toUpperCase()}
        Última Atualização: ${new Date(caso.ultimaAtualizacao).toLocaleString()}
      `;
      alert(`Download do Caso ${caso.id} (simulado):\n\n${caseDetails}`);
      const blob = new Blob([caseDetails], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `caso_${caso.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // --- Funções para Avisos (Chat Lateral) ---

  // Função para obter avisos dos cookies
  function getAvisosFromCookie() {
    const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)avisos\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];
  }

  // Função para salvar avisos nos cookies
  function saveAvisosToCookie() {
    document.cookie = `avisos=${encodeURIComponent(JSON.stringify(avisos))}; path=/; max-age=${60 * 60 * 24 * 365}`; // Expira em 1 ano
  }

  // Função para renderizar os avisos na janela lateral
  function renderAvisos() {
    avisosContainer.innerHTML = ""; // Limpa o container
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000); // 2 dias em milissegundos

    // Filtra avisos que não expiraram
    avisos = avisos.filter(aviso => new Date(aviso.timestamp).getTime() > twoDaysAgo);

    if (avisos.length === 0) {
      const defaultMessage = document.createElement("div");
      defaultMessage.classList.add("mensagem-aviso");
      defaultMessage.innerHTML = `* Nenhum aviso no momento *<span></span>`;
      avisosContainer.appendChild(defaultMessage);
    } else {
      avisos.forEach(aviso => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("mensagem-aviso");
        const date = new Date(aviso.timestamp);
        messageDiv.innerHTML = `${aviso.message}<span>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>`;
        avisosContainer.appendChild(messageDiv);
      });
    }
    avisosContainer.scrollTop = avisosContainer.scrollHeight; // Rola para o final
    saveAvisosToCookie(); // Salva os avisos filtrados
  }

  // Função para enviar uma nova mensagem de aviso
  function enviarMensagem() {
    const messageText = campoMensagem.value.trim();
    if (messageText) {
      const newAviso = {
        message: messageText,
        timestamp: new Date().toISOString()
      };
      avisos.push(newAviso);
      campoMensagem.value = ""; // Limpa o campo de input
      renderAvisos(); // Renderiza novamente para mostrar a nova mensagem e aplicar o filtro de tempo
    }
  }

  // --- Event Listeners Globais ---

  // CORREÇÃO PARA O FILTRO DA NAVBAR
  botaoBusca.addEventListener("click", () => filtrarCasos());
  campoBusca.addEventListener("keyup", (e) => {
    if (e.key === "Enter") filtrarCasos();
  });

  function filtrarCasos() {
    const termo = campoBusca.value.toLowerCase();
    // Garante que estamos pegando os elementos LI dentro de UL#listaCasos
    const casosNaLista = Array.from(listaCasos.children); 

    casosNaLista.forEach(casoLi => {
      const texto = casoLi.textContent.toLowerCase();
      casoLi.style.display = texto.includes(termo) ? "flex" : "none";
    });
  }

  botaoCriarCaso.addEventListener("click", () => {
    abrirPopupEdicao(null); // Abre o popup para criar um novo caso
  });

  fecharPopup.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
  });

  salvarCasoBtn.addEventListener("click", () => {
    salvarCaso("aberto"); // Salva o caso como 'aberto'
  });

  finalizarCasoBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Evita que o formulário seja submetido duas vezes
    salvarCaso("fechado"); // Salva o caso como 'fechado'
  });

  formCaso.addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário, pois já estamos tratando com os botões
  });

  // Event listeners para a janela lateral de avisos (chat)
  enviarMensagemBtn.addEventListener("click", enviarMensagem);
  campoMensagem.addEventListener("keyup", (e) => {
    if (e.key === "Enter") enviarMensagem();
  });


  // --- Inicialização ---
  casos = getCasosFromCookie();
  renderCasos();

  avisos = getAvisosFromCookie();
  renderAvisos(); // Renderiza os avisos e remove os expirados
});