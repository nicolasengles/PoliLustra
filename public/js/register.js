// public/js/register.js

// Espera o HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleciona todos os elementos do formulário pelos seus IDs
    const registerForm = document.getElementById('register-form');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const passwordConfirmInput = document.getElementById('password-confirm-input');

    // 2. Adiciona um "ouvinte" para o evento de 'submit' do formulário
    registerForm.addEventListener('submit', async (event) => {
        
        // 3. Previne o comportamento padrão (que é recarregar a página)
        event.preventDefault(); 

        // 4. Pega os valores de cada input
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // 5. Validação no lado do cliente (antes de enviar ao servidor)
        
        // Verifica se as senhas são iguais
        if (password !== passwordConfirm) {
            alert('As senhas não coincidem.');
            return;
        }
        
        // (Opcional, mas recomendado) Verifica o comprimento da senha
        if (password.length < 8) {
             alert('A senha deve ter pelo menos 8 caracteres.');
             return;
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
                // 7. Redireciona para a página protegida (ex: /dashboard)
                setTimeout(() => {
                    window.location.href = '/gerador'; 
                }, 1500); // 1.5 segundos é suficiente
            } else {
                // 8. ERRO (enviado pela API)
                // Ex: "Este e-mail já está a ser utilizado."
                alert(data.message);
            }

        } catch (error) {
            // 9. ERRO DE REDE (servidor offline ou sem conexão)
            console.error('Erro ao tentar registrar:', error);
            alert('Erro de conexão com o servidor. Tente novamente.');
        }
    });
});