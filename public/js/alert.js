window.alert = function(message) {
    // const activeModal = document.querySelector('.modal.show');
    // if (activeModal) {
    //     alertBox = activeModal.querySelector('.modal-alert-placeholder');
    // } else {
    //     alertBox = document.querySelector('alert alert-danger');
    // }
    alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
    document.body.addEventListener('input', hideAlertOnInputChange);
    document.body.addEventListener('change', hideAlertOnInputChange);
};

function hideAlertOnInputChange() {
    // const activeModal = document.querySelector('.modal.show');
    // if (activeModal) {
    //     alertBox = activeModal.querySelector('.modal-alert-placeholder');
    // } else {
    //     alertBox = document.querySelector('alert alert-danger');
    // }
    alertBox = document.getElementsByClassName('alert alert-danger')[0];
    alertBox.classList.add('d-none');
    alertBox.textContent = "";
    document.body.removeEventListener('input', hideAlertOnInputChange);
    document.body.removeEventListener('change', hideAlertOnInputChange);
}