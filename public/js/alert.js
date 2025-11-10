const MENSAGEM_ERRO_PADRAO = "Ops! Ocorreu um erro. Entre em contato conosco caso o problema persista.";

function error(message) {
    alertBox = document.getElementsByClassName('alert')[0];
    alertBox.classList.add("alert-danger");
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
    document.body.addEventListener('input', hideError);
    document.body.addEventListener('change', hideError);
}

function hideError() {
    alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.add('d-none');
    alertBox.classList.remove("alert-danger");
    alertBox.textContent = "";
    document.body.removeEventListener('input', hideError);
    document.body.removeEventListener('change', hideError);
}

function success(message) {
    alertBox = document.getElementsByClassName('alert')[0];
    alertBox.classList.add("alert-success");
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
    document.body.addEventListener('input', hideSuccess);
    document.body.addEventListener('change', hideSuccess);
}

function hideSuccess() {
    alertBox = document.getElementsByClassName('alert alert-success')[0];
    alertBox.classList.add('d-none');
    alertBox.classList.remove("alert-success");
    alertBox.textContent = "";
    document.body.removeEventListener('input', hideSuccess);
    document.body.removeEventListener('change', hideSuccess);
}