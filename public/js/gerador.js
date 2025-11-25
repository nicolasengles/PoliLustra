document.addEventListener("DOMContentLoaded", function() {
    updateAssuntos();
    document.getElementById('materia-select').addEventListener('change', updateAssuntos);

    document.getElementById("form-gerador").addEventListener("submit", async (event) => {
        event.preventDefault();

        const dados = {
            materia: document.getElementById("materia-select").value,
            assunto: document.getElementById("assunto-select").value,
            estilo: document.getElementById("estilo-select").value,
            descricao: document.getElementById("descricao-input").value
        };

        await gerarImagem(dados);
    });
});

function updateAssuntos() {
    const assuntosPorMateria = {
        "Física": ['Mecânica', 'Óptica', 'Eletricidade', 'Termodinâmica'],
        "Química": ['Química Geral', 'Físico-Química','Química Orgânica', 'Química Inorgânica'],
    };

    const materiaSelect = document.getElementById('materia-select');
    const assuntoSelect = document.getElementById('assunto-select');
    
    const materiaSelecionada = materiaSelect.value;
    const assuntos = assuntosPorMateria[materiaSelecionada] || [];

    assuntoSelect.innerHTML = '';

    assuntos.forEach(assunto => {
        const option = document.createElement('option');
        option.value = assunto.toLowerCase();
        option.textContent = assunto;
        assuntoSelect.appendChild(option);
    });
}

async function gerarImagem(dados) {
    const imagemGerada = document.getElementById("imagem-gerada");
    const spinner = document.getElementsByClassName("spinner-border")[0];
    const gerarBtn = document.getElementById("gerar-btn");
    const downloadBtn = document.getElementById("download-btn");
    const placeholderText = document.getElementById("placeholder-text").classList.add("d-none");

    gerarBtn.disabled = true;
    imagemGerada.classList.add("d-none");
    placeholderText.classList.add("d-none");
    spinner.classList.remove("d-none");
    downloadBtn.classList.add("d-none");

    try {
        const res = await fetch("/api/ia/gerar-imagem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados)
        })

        const data = res.json();

        if (data.success && data.imageUrl) {
            imagemGerada.src = data.imageUrl;
            imagemGerada.classList.remove("d-none");
            downloadModal.dataset.imageUrl = data.imageUrl;
            downloadBtn.classList.remove("d-none");
        } else {
            error(data.message || MENSAGEM_ERRO_PADRAO);
            placeholderText.classList.remove("d-none");
        }

        spinner.classList.add("d-none");
        gerarBtn.disabled = false;
    } catch (error) {
        console.error('Erro:', error);
        error(MENSGAGEM_ERRO_PADRAO);
    }
}

async function downloadImage() {
    const url = downloadModal.dataset.imageUrl;

    const link = document.createElement('a');
    link.href = url.replace('/upload/', `/upload/fl_attachment,${document.getElementById('format-select').value}/`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    bootstrap.Modal.getInstance(downloadModal).hide();
}