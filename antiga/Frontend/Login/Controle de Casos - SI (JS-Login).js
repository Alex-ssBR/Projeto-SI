document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  // ATENÇÃO: Em um sistema real, estas credenciais NUNCA estariam no frontend.
  // Elas seriam enviadas a um servidor para validação segura.
  const VALID_USERNAME = "adm";
  const VALID_PASSWORD = "123";

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Simulação de autenticação
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Login bem-sucedido
      errorMessage.classList.remove("show"); // Esconde qualquer mensagem de erro
      
      // Armazena um status de login em localStorage (ou cookie)
      // localStorage é mais simples para este exemplo e persiste entre sessões do navegador.
      localStorage.setItem("isLoggedIn", "true"); 

      // Redireciona para a página principal
      window.location.href = "../Home/Controle de Casos - SI (Home).html";

    } else {
      // Login falhou
      errorMessage.textContent = "Usuário ou senha inválidos.";
      errorMessage.classList.add("show"); // Mostra a mensagem de erro
    }
  });
});