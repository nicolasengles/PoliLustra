document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const dados = {
            email: document.getElementById('email-input').value,
            password: document.getElementById('password-input').value
        }

        await login(dados);
    });
});

async function login(dados) {
    const loginBtn = document.getElementById('login-btn');
    const loginBtnWait = document.getElementById('login-btn-wait');

    loginBtn.classList.add('d-none');
    loginBtnWait.classList.remove('d-none');

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.success) {
            window.location.href = '/gerador';
        } else {
            error(res.message || MENSAGEM_ERRO_PADRAO);
            loginBtn.classList.remove('d-none');
            loginBtnWait.classList.add('d-none');
        }

    } catch (error) {
        console.error('Erro:', error);
        error( MENSAGEM_ERRO_PADRAO);
        loginBtn.classList.remove('d-none');
        loginBtnWait.classList.add('d-none');
    }
}