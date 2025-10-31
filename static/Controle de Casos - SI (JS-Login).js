document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login bem-sucedido
                errorMessage.classList.remove("show"); // Esconde qualquer mensagem de erro
                errorMessage.textContent = "";

                // Não armazenamos mais um "isLoggedIn" simples.
                // O servidor gerencia a sessão. Se a requisição for bem-sucedida,
                // significa que a sessão no backend foi estabelecida (via cookies de sessão).

                // Redireciona para a página principal
                // Importante: Altere o caminho se sua Home não estiver em ../Home/Controle de Casos - SI (Home).html
                window.location.href = "../Home/Controle de Casos - SI (Home).html";

            } else {
                // Login falhou
                errorMessage.textContent = data.message || "Erro desconhecido no login.";
                errorMessage.classList.add("show"); // Mostra a mensagem de erro
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            errorMessage.textContent = "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
            errorMessage.classList.add("show");
        }
    });
});