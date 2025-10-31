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

    let casoEditandoId = null; // Para saber se estamos criando ou editando um caso

    const API_BASE_URL = 'http://localhost:5000/api'; // URL base do seu backend Flask

    // --- Verificação de Login ao Carregar a Página ---
    async function checkLoginStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/check_login`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Importante para enviar os cookies de sessão
            });
            const data = await response.json();
            if (!data.logged_in) {
                alert("Você precisa fazer login para acessar esta página.");
                // Altere o caminho se sua página de login não estiver em ../Login/Controle de Casos - SI (Login).html
                window.location.href = "../Login/Controle de Casos - SI (Login).html";
            }
        } catch (error) {
            console.error('Erro ao verificar status de login:', error);
            alert("Erro ao verificar status de login. Redirecionando para a página de login.");
            window.location.href = "../Login/Controle de Casos - SI (Login).html";
        }
    }

    // --- Funções para Casos ---

    // Função para buscar e renderizar a lista de casos do backend
    async function renderCasos(termoBusca = '') {
        listaCasos.innerHTML = "<li>Carregando casos...</li>";
        try {
            const url = termoBusca ? `${API_BASE_URL}/casos?busca=${encodeURIComponent(termoBusca)}` : `${API_BASE_URL}/casos`;
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                    window.location.href = "../Login/Controle de Casos - SI (Login).html";
                }
                throw new Error(`Erro ao buscar casos: ${response.statusText}`);
            }

            const casos = await response.json();
            listaCasos.innerHTML = ""; // Limpa a mensagem de carregamento

            if (casos.length === 0) {
                listaCasos.innerHTML = "<li>Nenhum caso encontrado.</li>";
                return;
            }

            casos.forEach(caso => {
                const li = document.createElement("li");
                li.setAttribute("data-status", caso.status);
                li.setAttribute("data-id", caso.id);

                const statusClass = caso.status === "aberto" ? "aberto" : "fechado";
                const ultimaAtualizacao = caso.ultimaAtualizacao ? new Date(caso.ultimaAtualizacao).toLocaleString() : 'N/A';

                li.innerHTML = `
                    <div>
                        Caso ${caso.id} ${caso.patrimonio ? `(Patrimônio: ${caso.patrimonio})` : ''}
                        <strong>Status:</strong> <span class="${statusClass}">${caso.status.toUpperCase()}</span>
                        <span> (Última atualização: ${ultimaAtualizacao})</span>
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
        } catch (error) {
            console.error("Erro ao carregar casos:", error);
            listaCasos.innerHTML = "<li>Erro ao carregar casos.</li>";
        }
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
    async function abrirPopupEdicao(id = null) {
        casoEditandoId = id;
        formCaso.reset(); // Limpa o formulário

        if (id !== null) {
            popupTitle.textContent = "Editar Caso";
            try {
                const response = await fetch(`${API_BASE_URL}/casos/${id}`, { credentials: 'include' });
                if (!response.ok) {
                     if (response.status === 401) {
                        alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                        window.location.href = "../Login/Controle de Casos - SI (Login).html";
                    }
                    throw new Error(`Erro ao buscar detalhes do caso: ${response.statusText}`);
                }
                const caso = await response.json();
                document.getElementById("nome").value = caso.nome || "";
                document.getElementById("ramal").value = caso.ramal || "";
                document.getElementById("secretaria").value = caso.secretaria || "";
                document.getElementById("departamento").value = caso.departamento || "";
                document.getElementById("patrimonio").value = caso.patrimonio || "";
                document.getElementById("problema").value = caso.problema || "";
                document.getElementById("solucao").value = caso.solucao || "";
                finalizarCasoBtn.style.display = "block"; // Mostra finalizar ao editar
            } catch (error) {
                console.error("Erro ao carregar dados do caso para edição:", error);
                alert("Não foi possível carregar os detalhes do caso.");
                popup.style.display = "none";
                return;
            }
        } else {
            popupTitle.textContent = "Abertura de Caso";
            document.getElementById("patrimonio").value = prompt("Digite o número de patrimônio (ou deixe em branco para 'Sem Patrimônio'):") || "";
            finalizarCasoBtn.style.display = "none"; // Esconde finalizar ao criar
        }
        popup.style.display = "flex";
    }

    // Função para salvar ou atualizar um caso no backend
    async function salvarCaso(status) {
        const nome = document.getElementById("nome").value;
        const ramal = document.getElementById("ramal").value;
        const secretaria = document.getElementById("secretaria").value;
        const departamento = document.getElementById("departamento").value;
        const patrimonio = document.getElementById("patrimonio").value || "Sem Patrimônio";
        const problema = document.getElementById("problema").value;
        const solucao = document.getElementById("solucao").value;

        if (!nome.trim()) {
            alert("O campo 'Nome' é obrigatório.");
            return;
        }
        if (!patrimonio.trim()) {
            alert("O campo 'Nº Patrimônio' é obrigatório.");
            return;
        }

        const caseData = {
            nome, ramal, secretaria, departamento, patrimonio, problema, solucao, status
        };

        try {
            let response;
            if (casoEditandoId !== null) {
                // Editando um caso existente
                response = await fetch(`${API_BASE_URL}/casos/${casoEditandoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(caseData),
                    credentials: 'include'
                });
            } else {
                // Criando um novo caso
                response = await fetch(`${API_BASE_URL}/casos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(caseData),
                    credentials: 'include'
                });
            }

            const data = await response.json();

            if (!response.ok) {
                 if (response.status === 401) {
                    alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                    window.location.href = "../Login/Controle de Casos - SI (Login).html";
                }
                throw new Error(data.message || `Erro ao salvar caso: ${response.statusText}`);
            }

            alert(data.message);
            popup.style.display = "none";
            renderCasos(); // Atualiza a lista de casos
        } catch (error) {
            console.error("Erro ao salvar caso:", error);
            alert(`Erro ao salvar caso: ${error.message}`);
        }
    }

    // Funções de ação para os botões
    async function reabrirCaso(id) {
        if (!confirm(`Tem certeza que deseja reabrir o Caso ${id}?`)) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/casos/${id}/reabrir`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                 if (response.status === 401) {
                    alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                    window.location.href = "../Login/Controle de Casos - SI (Login).html";
                }
                throw new Error(data.message || `Erro ao reabrir caso: ${response.statusText}`);
            }
            alert(data.message);
            renderCasos();
        } catch (error) {
            console.error("Erro ao reabrir caso:", error);
            alert(`Erro ao reabrir caso: ${error.message}`);
        }
    }

    async function baixarCaso(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/casos/${id}/download`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                 if (response.status === 401) {
                    alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                    window.location.href = "../Login/Controle de Casos - SI (Login).html";
                }
                throw new Error(`Erro ao baixar caso: ${response.statusText}`);
            }

            // O backend está retornando um texto simples, então tratamos como texto
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `caso_${id}.txt`; // Nome do arquivo a ser baixado
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert(`Download do Caso ${id} concluído.`);

        } catch (error) {
            console.error("Erro ao baixar caso:", error);
            alert(`Erro ao baixar caso: ${error.message}`);
        }
    }

    // --- Funções para Avisos (Chat Lateral) ---

    // Função para buscar e renderizar os avisos do backend
    async function renderAvisos() {
        avisosContainer.innerHTML = "<div>Carregando avisos...</div>";
        try {
            const response = await fetch(`${API_BASE_URL}/avisos`, { credentials: 'include' });

            if (!response.ok) {
                 if (response.status === 401) {
                    // Se a sessão expirou, podemos recarregar a página ou redirecionar
                    // No caso dos avisos, talvez seja melhor apenas não mostrar avisos ou mostrar uma msg de erro
                    // alert("Sua sessão expirou ao tentar carregar avisos.");
                    console.error("Erro ao carregar avisos: Sessão não autorizada ou expirada.");
                    avisosContainer.innerHTML = "<div>Erro ao carregar avisos (sessão expirada?).</div>";
                    return;
                }
                throw new Error(`Erro ao buscar avisos: ${response.statusText}`);
            }

            const avisos = await response.json();
            avisosContainer.innerHTML = ""; // Limpa o container

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
        } catch (error) {
            console.error("Erro ao carregar avisos:", error);
            avisosContainer.innerHTML = "<div>Erro ao carregar avisos.</div>";
        }
    }

    // Função para enviar uma nova mensagem de aviso para o backend
    async function enviarMensagem() {
        const messageText = campoMensagem.value.trim();
        if (messageText) {
            try {
                const response = await fetch(`${API_BASE_URL}/avisos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                     if (response.status === 401) {
                        alert("Sua sessão expirou ou você não está autorizado. Faça login novamente.");
                        window.location.href = "../Login/Controle de Casos - SI (Login).html";
                    }
                    throw new Error(data.message || `Erro ao enviar aviso: ${response.statusText}`);
                }

                campoMensagem.value = ""; // Limpa o campo de input
                renderAvisos(); // Renderiza novamente para mostrar a nova mensagem
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert(`Erro ao enviar mensagem: ${error.message}`);
            }
        }
    }

    // --- Event Listeners Globais ---

    botaoBusca.addEventListener("click", () => renderCasos(campoBusca.value));
    campoBusca.addEventListener("keyup", (e) => {
        if (e.key === "Enter") renderCasos(campoBusca.value);
    });

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
    checkLoginStatus(); // Verifica o login antes de carregar qualquer coisa
    renderCasos();      // Carrega os casos do backend
    renderAvisos();     // Carrega os avisos do backend

    // Atualiza avisos a cada 30 segundos para simular tempo real
    setInterval(renderAvisos, 30000);
});