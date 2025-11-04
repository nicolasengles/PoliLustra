const temasPorMateria = {
    "Física": ['Mecânica', 'Óptica', 'Eletricidade', 'Termodinâmica'],
    "Química": ['Química orgânica', 'Química Física','Bioquímica'],
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

document.getElementById("form-gerador").addEventListener("submit", function(event) {
    event.preventDefault();

    const materia = document.getElementById("materia-select").value;
    const assunto = document.getElementById("tema-select").value;
    const estilo = document.getElementById("estilo-select").value;
    const descricao = document.getElementById("descricao-input").value;

    const placeholderText = document.getElementById("placeholder-text");
    const spinner = document.getElementsByClassName("spinner-border")[0];
    const imagemGerada = document.getElementById("imagem-gerada");
    const gerarBtn = document.getElementById("gerar-btn");

    placeholderText.classList.add("d-none");
    spinner.classList.remove("d-none");
    gerarBtn.disabled = true;
    gerarBtn.innerHTML = "Gerando Imagem...";

    fetch("/api/ia/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            materia: materia,
            assunto: assunto,
            estilo: estilo,
            prompt_personalizado: descricao 
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Um erro ocorreu! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.imageUrl) {
            imagemGerada.src = data.imageUrl;
            imagemGerada.classList.remove("d-none");
        } else {
            console.error("imageUrl não encontrado na resposta da API.");
            alert("Ops! Ocorreu um erro. Tente novamente.");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Ops! Ocorreu um erro. Tente novamente.");
    })
    .finally(() => {
        spinner.classList.add("d-none");
        gerarBtn.disabled = false;
        gerarBtn.innerHTML = "Gerar Imagem";
    });
});