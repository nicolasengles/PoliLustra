window.alert = function(message) {
    const alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
    document.body.addEventListener('input', hideAlertOnInputChange);
    document.body.addEventListener('change', hideAlertOnInputChange);
};

function hideAlertOnInputChange() {
    const alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.add('d-none');
    alertBox.textContent = "";
    document.body.removeEventListener('input', hideAlertOnInputChange);
    document.body.removeEventListener('change', hideAlertOnInputChange);
}