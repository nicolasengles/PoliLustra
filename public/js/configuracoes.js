// const alterarNomeInput = document.getElementById("alterar-nome-input");
// alterarNomeInput.value = document.currentScript.dataset.nomeatual;

document.getElementById("alterar-nome-input").value = document.currentScript.dataset.nomeatual;

// Variáveis de referência para o alerta de exclusão
const excluirContaAlert = document.getElementById("excluir-conta-alert");

// 📌 Função para exibir o erro no modal de Excluir Conta
function exibirErroExclusao(message) {
    if (excluirContaAlert) {
        excluirContaAlert.textContent = message;
        excluirContaAlert.classList.remove('d-none', 'alert-success');
        excluirContaAlert.classList.add('alert-danger');
    }
}

// 📌 Função para limpar o erro
function limparErroExclusao() {
    if (excluirContaAlert) {
        excluirContaAlert.classList.add('d-none');
        excluirContaAlert.textContent = '';
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // Ativar/Desativar alert dentro do modal de alterar nome
    const alterarNomeModal = document.getElementById('alterar-nome-modal');

    alterarNomeModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarNomeModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert').remove();
    });

    // Ativar/Desativar alert dentro do modal de alterar email
    const alterarEmailModal = document.getElementById('alterar-email-modal');
    
    alterarEmailModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarEmailModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert').remove();
    });

    // Ativar/Desativar alert dentro do modal de alterar senha
    const alterarSenhaModal = document.getElementById('alterar-senha-modal');
    
    alterarSenhaModal.addEventListener('shown.bs.modal', function (event) {
        const alertDiv = document.createElement('div');
        alertDiv.classList = ('alert mb-2 d-none');
        this.querySelector('form').insertAdjacentElement('afterend', alertDiv);
    });

    alterarSenhaModal.addEventListener('hidden.bs.modal', function (event) {
        this.querySelector('.alert').remove();
    });
    
    // 📌 Limpar o erro do modal de exclusão ao fechar
    const excluirContaModal = document.getElementById('excluir-conta-modal');
    excluirContaModal.addEventListener('hidden.bs.modal', function (event) {
        limparErroExclusao();
        document.getElementById("form-excluir-conta").reset(); // Limpa o formulário também
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

    // Excluir conta
    document.getElementById("form-excluir-conta").addEventListener("submit", async (event) => {
        event.preventDefault();
        limparErroExclusao(); // Limpa alertas antigos antes de uma nova submissão

        const senha = document.getElementById("excluir-conta-senha").value;

        await excluirConta(senha);
    });
});

// A função 'error' precisa ser definida para as outras funções de alteração
// Se as outras funções usam `error(res.message)`, elas precisam de uma função global.
// Se `error` não estiver definida, defina-a aqui ou use uma função específica para cada modal.
// Para este exemplo, vou manter o uso de `error` nas outras funções (pressupondo que ela existe).

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

        // 📌 Adicionado tratamento para status HTTP
        if (!response.ok) {
            const res = await response.json();
            throw new Error(res.message || `Erro HTTP: ${response.status}`);
        }

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            throw new Error(res.message || MENSAGEM_ERRO_PADRAO);
        }

    } catch (error) {
        console.error("error", 'Erro:', error);
        error(error.message || MENSAGEM_ERRO_PADRAO); // Use error.message aqui
    } finally {
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
        error("Os emails não coincidem.");
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
        
        // 📌 Adicionado tratamento para status HTTP
        if (!response.ok) {
            const res = await response.json();
            throw new Error(res.message || `Erro HTTP: ${response.status}`);
        }

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            throw new Error(res.message || MENSAGEM_ERRO_PADRAO);
        }

    } catch (error) {
        console.error('Erro:', error);
        error(error.message || MENSAGEM_ERRO_PADRAO); // Use error.message aqui
    } finally {
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
        error("As senhas não coincidem.");
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
        
        // 📌 Adicionado tratamento para status HTTP
        if (!response.ok) {
            const res = await response.json();
            throw new Error(res.message || `Erro HTTP: ${response.status}`);
        }

        const res = await response.json();

        if (res.success) {
            window.location.reload();
        } else {
            throw new Error(res.message || MENSAGEM_ERRO_PADRAO);
        }

    } catch (error) {
        console.error('Erro:', error);
        error(error.message || MENSAGEM_ERRO_PADRAO); // Use error.message aqui
    } finally {
        alterarSenhaSubmitBtn.classList.remove("d-none");
        alterarSenhaSubmitBtnWait.classList.add("d-none");
    }
}

async function excluirConta(senha) {
    const excluirContaSubmitBtn = document.getElementById("excluir-conta-submit-btn");
    const excluirContaSubmitBtnWait = document.getElementById("excluir-conta-submit-btn-wait");

    excluirContaSubmitBtn.classList.add("d-none");
    excluirContaSubmitBtnWait.classList.remove("d-none");

    try {
        const response = await fetch('/api/users/excluir-conta', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({senha})
        });

        // 🚨 CORREÇÃO CRUCIAL: Captura a resposta 400 (senha incorreta)
        if (!response.ok) {
            const res = await response.json();
            // Lança um erro com a mensagem do backend (ex: "Senha incorreta.")
            throw new Error(res.message || `Erro HTTP: ${response.status}`);
        }

        const res = await response.json();

        if (res.success) {
            // Sucesso: Redireciona
            window.location.href = '/';
        } else {
            throw new Error(res.message || MENSAGEM_ERRO_PADRAO);
        }

    } catch (error) {
        console.error('Erro:', error.message || error);
        // 📌 EXIBE O ERRO NO MODAL
        exibirErroExclusao(error.message || MENSAGEM_ERRO_PADRAO);

    } finally {
        // 📌 GARANTE QUE O SPINNER DESAPAREÇA
        excluirContaSubmitBtn.classList.remove("d-none");
        excluirContaSubmitBtnWait.classList.add("d-none");
    }
}