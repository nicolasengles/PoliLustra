// Espera o HTML ser totalmente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleciona os elementos do formulário
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');

    // 2. Adiciona um "ouvinte" para o evento de 'submit' do formulário
    loginForm.addEventListener('submit', async (event) => {
        
        // 3. Previne o comportamento padrão (que é recarregar a página)
        event.preventDefault(); 

        // 4. Pega os valores dos inputs
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // 5. Envia os dados para a sua API de login
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }) 
            });

            const data = await response.json();

            if (response.ok) {
                // 6. SUCESSO: Login bem-sucedido
                // O backend criou o cookie de autenticação.
                // Agora, redirecionamos o usuário para o painel.
                window.location.href = '/gerador'; // Ou '/perfil', ou qualquer página protegida
            } else {
                // 7. ERRO: Exibe a mensagem de erro vinda da API
                // (ex: "E-mail ou senha inválidos.")
                alert(data.message);
            }

        } catch (error) {
            // 8. ERRO DE REDE: O servidor pode estar offline
            console.error('Erro ao tentar fazer login:', error);
            alert('Erro de conexão. Tente novamente mais tarde.');
        }
    });
});