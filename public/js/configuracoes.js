// const alterarNomeInput = document.getElementById("alterar-nome-input");
// alterarNomeInput.value = document.currentScript.dataset.nomeatual;

document.getElementById("alterar-nome-input").value = document.currentScript.dataset.nomeatual;

// const alterarEmailInput = document.getElementById("alterar-email-input");

document.addEventListener("DOMContentLoaded", function() {
    // Ativar/Desativar alert dentro do modal de alterar nome
    const alterarNomeModal = document.getElementById('alterar-nome-modal');

    alterarNomeModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert alert-danger mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarNomeModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert.alert-danger').remove();
    });

    // Ativar/Desativar alert dentro do modal de alterar email
    const alterarEmailModal = document.getElementById('alterar-email-modal');
    
    alterarEmailModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert alert-danger mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarEmailModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert.alert-danger').remove();
    });

    // Ativar/Desativar alert dentro do modal de alterar senha
    const alterarSenhaModal = document.getElementById('alterar-senha-modal');
    
    alterarSenhaModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert alert-danger mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarSenhaModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert.alert-danger').remove();
    });
    
    // Alterar nome
    document.getElementById("form-alterar-nome").addEventListener("submit", async (event) => {
        event.preventDefault();

        const dados = {
            novoNome: document.getElementById("alterar-nome-input").value,
            senha: document.getElementById("alterar-nome-senha-input").value
        };

        await alterarNome(dados);
    });

    // Alterar email
    document.getElementById("form-alterar-email").addEventListener("submit", async (event) => {
        event.preventDefault();

        const dados = {
            novoEmail: document.getElementById("alterar-email-input").value,
            senha: document.getElementById("alterar-email-senha-input").value
        };

        await alterarEmail(dados);
    });

    // Alterar senha
    document.getElementById("form-alterar-senha").addEventListener("submit", async (event) => {
        event.preventDefault();

        const dados = {
            senha: document.getElementById("senha-atual-input").value,
            novaSenha: document.getElementById("alterar-senha-input").value
        };

        await alterarSenha(dados);
    });
});

async function alterarNome(dados) {
    const alterarNomeSubmitBtn = document.getElementById("alterar-nome-submit-btn");
    const alterarNomeSubmitBtnWait = document.getElementById("alterar-nome-submit-btn-wait");

    alterarNomeSubmitBtn.classList.add("d-none");
    alterarNomeSubmitBtnWait.classList.remove("d-none");

    try {
        const response = await fetch('/api/users/alterar-nome', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            alert(res.message || MENSAGEM_ERRO_PADRAO);
            alterarNomeSubmitBtn.classList.remove("d-none");
            alterarNomeSubmitBtnWait.classList.add("d-none");
        }

    } catch (error) {
        console.error('Erro:', error);
        alert(MENSAGEM_ERRO_PADRAO);
        alterarNomeSubmitBtn.classList.remove("d-none");
        alterarNomeSubmitBtnWait.classList.add("d-none");
    }
}

async function alterarEmail(dados) {
    const alterarEmailSubmitBtn = document.getElementById("alterar-email-submit-btn");
    const alterarEmailSubmitBtnWait = document.getElementById("alterar-email-submit-btn-wait");

    alterarEmailSubmitBtn.classList.add("d-none");
    alterarEmailSubmitBtnWait.classList.remove("d-none");

    if (document.getElementById("alterar-email-input").value !== document.getElementById("alterar-email-input-confirmar").value) {
        alert("Os emails não coincidem.");
        alterarEmailSubmitBtn.classList.remove("d-none");
        alterarEmailSubmitBtnWait.classList.add("d-none");
        return;
    }

    try {
        const response = await fetch('/api/users/alterar-email', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            alert(res.message || MENSAGEM_ERRO_PADRAO);
            alterarEmailSubmitBtn.classList.remove("d-none");
            alterarEmailSubmitBtnWait.classList.add("d-none");
        }

    } catch (error) {
        console.error('Erro:', error);
        alert(MENSAGEM_ERRO_PADRAO);
        alterarEmailSubmitBtn.classList.remove("d-none");
        alterarEmailSubmitBtnWait.classList.add("d-none");
    }
}

async function alterarSenha(dados) {
    const alterarSenhaSubmitBtn = document.getElementById("alterar-senha-submit-btn");
    const alterarSenhaSubmitBtnWait = document.getElementById("alterar-senha-submit-btn-wait");

    alterarSenhaSubmitBtn.classList.add("d-none");
    alterarSenhaSubmitBtnWait.classList.remove("d-none");

    if (document.getElementById("alterar-senha-input").value !== document.getElementById("alterar-senha-input-confirmar").value) {
        alert("As senhas não coincidem.");
        alterarSenhaSubmitBtn.classList.remove("d-none");
        alterarSenhaSubmitBtnWait.classList.add("d-none");
        return;
    }

    try {
        const response = await fetch('/api/users/alterar-senha', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            alert(res.message || MENSAGEM_ERRO_PADRAO);
            alterarSenhaSubmitBtn.classList.remove("d-none");
            alterarSenhaSubmitBtnWait.classList.add("d-none");
        }

    } catch (error) {
        console.error('Erro:', error);
        alert(MENSAGEM_ERRO_PADRAO);
        alterarSenhaSubmitBtn.classList.remove("d-none");
        alterarSenhaSubmitBtnWait.classList.add("d-none");
    }
}