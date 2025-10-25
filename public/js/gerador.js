const temasPorMateria = {
    fisica: ['Mecânica', 'Óptica', 'Eletricidade', 'Termodinâmica'],
    quimica: ['teste 1', 'teste 2'],
};

const materiaSelect = document.getElementById('materia-select');
const temaSelect = document.getElementById('tema-select');

function updateTemas() {
    const materiaSelecionada = materiaSelect.value;
    const temas = temasPorMateria[materiaSelecionada] || [];

    temaSelect.innerHTML = '';

    temas.forEach(tema => {
        const option = document.createElement('option');
        option.value = tema.toLowerCase();
        option.textContent = tema;
        temaSelect.appendChild(option);
    });
}

materiaSelect.addEventListener('change', updateTemas);

document.addEventListener('DOMContentLoaded', updateTemas);