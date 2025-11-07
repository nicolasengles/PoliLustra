document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const dados = {
            name: document.getElementById('name-input').value,
            email: document.getElementById('email-input').value,
            password: document.getElementById('password-input').value,
            passwordConfirm: document.getElementById('password-confirm-input').value
        };

        await cadastrar(dados);
    });
});

async function cadastrar(dados) {
    const cadastrarBtn = document.getElementById('cadastrar-btn');
    const cadastrarBtnWait = document.getElementById('cadastrar-btn-wait');

    cadastrarBtn.classList.add('d-none');
    cadastrarBtnWait.classList.remove('d-none');

    if (dados.password !== dados.passwordConfirm) {
        alert('As senhas não coincidem.');
        cadastrarBtn.classList.remove('d-none');
        cadastrarBtnWait.classList.add('d-none');
        return;
    }

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados) 
        });

        const res = await response.json();

        console.log(res)

        if (res.success) {
            window.location.href = '/gerador'; 
        } else {
            alert(res.message || MENSAGEM_ERRO_PADRAO);
            cadastrarBtn.classList.remove('d-none');
            cadastrarBtnWait.classList.add('d-none');
        }

    } catch (error) {
        console.log('Erro:', error);
        alert(MENSAGEM_ERRO_PADRAO);
        cadastrarBtn.classList.remove('d-none');
        cadastrarBtnWait.classList.add('d-none');
    }
}