// public/js/register.js

// Espera o HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleciona todos os elementos do formulário pelos seus IDs
    const registerForm = document.getElementById('register-form');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const passwordConfirmInput = document.getElementById('password-confirm-input');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');

    // 2. Adiciona um "ouvinte" para o evento de 'submit' do formulário
    registerForm.addEventListener('submit', async (event) => {
        
        // 3. Previne o comportamento padrão (que é recarregar a página)
        event.preventDefault(); 

        // Limpa mensagens de erro ou sucesso anteriores
        errorMessageDiv.textContent = '';
        successMessageDiv.textContent = '';

        // 4. Pega os valores de cada input
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // 5. Validação no lado do cliente (antes de enviar ao servidor)
        
        // Verifica se as senhas são iguais
        if (password !== passwordConfirm) {
            errorMessageDiv.textContent = 'As senhas não coincidem.';
            return; // Para a execução da função aqui
        }
        
        // (Opcional, mas recomendado) Verifica o comprimento da senha
        if (password.length < 6) {
             errorMessageDiv.textContent = 'A senha deve ter pelo menos 6 caracteres.';
             return; // Para a execução
        }

        // 6. Tenta se comunicar com a API de registro
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Envia os dados que a sua API espera (name, email, password)
                body: JSON.stringify({ name, email, password }) 
            });

            const data = await response.json();

            if (response.ok) {
                // 6. SUCESSO!
                // O backend já fez o login e 'data' agora contém os dados do usuário
                successMessageDiv.textContent = `Bem-vindo, ${data.name}! Redirecionando para o painel...`;
                
                // Não precisa mais limpar o formulário, pois a página vai mudar
                
                // 7. Redireciona para a página protegida (ex: /dashboard)
                setTimeout(() => {
                    window.location.href = '/gerador'; 
                }, 1500); // 1.5 segundos é suficiente
            } else {
                // 8. ERRO (enviado pela API)
                // Ex: "Este e-mail já está a ser utilizado."
                errorMessageDiv.textContent = data.message;
            }

        } catch (error) {
            // 9. ERRO DE REDE (servidor offline ou sem conexão)
            console.error('Erro ao tentar registrar:', error);
            errorMessageDiv.textContent = 'Erro de conexão com o servidor. Tente novamente.';
        }
    });
});