const MENSAGEM_ERRO_PADRAO = "Ops! Ocorreu um erro. Entre em contato conosco caso o problema persista.";

window.alert = function(message) {
    alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
    document.body.addEventListener('input', hideAlertOnInputChange);
    document.body.addEventListener('change', hideAlertOnInputChange);
};

function hideAlertOnInputChange() {
    alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.add('d-none');
    alertBox.textContent = "";
    document.body.removeEventListener('input', hideAlertOnInputChange);
    document.body.removeEventListener('change', hideAlertOnInputChange);
}