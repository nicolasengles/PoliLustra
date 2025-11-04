nomeAtual = document.currentScript.dataset.nomeatual;
emailAtual = document.currentScript.dataset.emailatual;

const formAlterarNome = document.getElementById("form-alterar-nome");
const alterarNomeInput = document.getElementById("alterar-nome-input");
const alterarNomeSenhaInput = document.getElementById("alterar-nome-senha-input");

const formAlterarEmail = document.getElementById("form-alterar-email");
const alterarEmailInput = document.getElementById("alterar-email-input");
const alterarEmailSenhaInput = document.getElementById("alterar-email-senha-input");

document.addEventListener("DOMContentLoaded", function() {
    alterarNomeInput.value = nomeAtual;
    alterarEmailInput.value = emailAtual;

    formAlterarNome.addEventListener("submit", function(event) {
        event.preventDefault();
        const novoNome = alterarNomeInput.value;
        const senha = alterarNomeSenhaInput.value;
        fetch('/api/users/alterar-nome', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ novoNome, senha })
        }).then(response => {
            if (response.ok) {
                location.reload();
            }
            else {
                return response.json();
            }
        })
        .then(data => {
            alert(data.message || 'Erro ao alterar nome.'); 
        }).catch(error => {
            console.error('Erro:', error);
            alert('Erro ao alterar nome.');
        });
    });
});
