// public/js/gerador.js

// Envolvemos TODO o script em um 'ouvinte' que espera o HTML carregar.
// Isso garante que todos os 'getElementById' encontrarão os elementos.
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA 1: ATUALIZAR TEMAS (SELECTS) ---

    const temasPorMateria = {
        "Física": ['Mecânica', 'Óptica', 'Eletricidade', 'Termodinâmica'],
        "Química": ['Química Geral', 'Físico-Química','Química Orgânica', 'Química Inorgânica'],
    };

    const materiaSelect = document.getElementById('materia-select');
    const temaSelect = document.getElementById('tema-select');

    function updateTemas() {
        const materiaSelecionada = materiaSelect.value;
        const temas = temasPorMateria[materiaSelecionada] || [];

        temaSelect.innerHTML = ''; // Limpa o select de temas

        temas.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema.toLowerCase(); // ex: 'mecanica'
            option.textContent = tema; // ex: 'Mecânica'
            temaSelect.appendChild(option);
        });
    }

    // Adiciona o 'ouvinte' para quando o usuário mudar a matéria
    materiaSelect.addEventListener('change', updateTemas);
    // Chama a função uma vez no início para carregar os temas da primeira matéria (se houver)
    updateTemas();

    // --- LÓGICA 2: GERAR IMAGEM (FORMULÁRIO) ---

    const formGerador = document.getElementById("form-gerador");
    
    // Pega os elementos da UI
    const placeholderText = document.getElementById("placeholder-text");
    const spinner = document.getElementsByClassName("spinner-border")[0];
    const imagemGerada = document.getElementById("imagem-gerada");
    const gerarBtn = document.getElementById("gerar-btn");

    // Pega os elementos do NOVO fluxo de download
    const downloadBtnGerador = document.getElementById("download-btn-gerador");
    const downloadModal = document.getElementById('download-modal'); 

    formGerador.addEventListener("submit", function(event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Pega os valores do formulário
        const materia = document.getElementById("materia-select").value;
        const assunto = document.getElementById("tema-select").value;
        const estilo = document.getElementById("estilo-select").value;
        const descricao = document.getElementById("descricao-input").value;

        // Reseta a UI para o estado de "carregando"
        placeholderText.classList.add("d-none");
        imagemGerada.classList.add("d-none");     // Esconde a imagem antiga
        downloadBtnGerador.classList.add("d-none"); // Esconde o botão de download antigo
        spinner.classList.remove("d-none");
        gerarBtn.disabled = true;
        gerarBtn.innerHTML = "Gerando Imagem...";

        // Chama a API
        fetch("/api/ia/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
                // Sucesso! Mostra a imagem
                imagemGerada.src = data.imageUrl;
                imagemGerada.classList.remove("d-none");

                // ↓↓↓ LÓGICA DE DOWNLOAD (NOVO) ↓↓↓
                // 1. "Passa" a URL para o modal (guardando no 'dataset')
                downloadModal.dataset.imageUrl = data.imageUrl;
                // 2. Mostra o botão "Baixar"
                downloadBtnGerador.classList.remove("d-none");

            } else {
                console.error("imageUrl não encontrado na resposta da API.");
                alert("Ops! Ocorreu um erro. Tente novamente.");
                placeholderText.classList.remove("d-none"); // Mostra o placeholder se der erro
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ops! Ocorreu um erro. Tente novamente.");
            placeholderText.classList.remove("d-none"); // Mostra o placeholder se der erro
        })
        .finally(() => {
            // Reseta a UI do botão/spinner
            spinner.classList.add("d-none");
            gerarBtn.disabled = false;
            gerarBtn.innerHTML = "Gerar Imagem";
        });
    });

    // --- LÓGICA 3: DOWNLOAD DO MODAL (NOVO) ---
    
    // Pega os elementos de dentro do modal
    const downloadSubmitBtn = document.getElementById('download-submit-btn');
    const formatSelect = document.getElementById('format-select');

    // Adiciona o "ouvinte" ao botão "Baixar" final (de dentro do modal)
    downloadSubmitBtn.addEventListener('click', () => {
        
        // 1. Pega a URL que "grudamos" no modal
        const baseUrl = downloadModal.dataset.imageUrl;
        // 2. Pega o formato (f_jpg, f_png)
        const formatFlag = formatSelect.value;

        // 3. Validações
        if (!baseUrl) {
            alert('Erro! A URL da imagem não foi encontrada.');
            return;
        }
        if (!formatFlag) {
            alert('Por favor, selecione um formato para baixar.');
            return; 
        }

        // 4. Monta a URL final do Cloudinary
        const finalUrl = baseUrl.replace('/upload/', `/upload/fl_attachment,${formatFlag}/`);
        
        // 5. Usa o "truque do link invisível" para baixar
        const link = document.createElement('a');
        link.href = finalUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 6. Fecha o modal e limpa o <select>
        const modalInstance = bootstrap.Modal.getInstance(downloadModal);
        modalInstance.hide();
        formatSelect.selectedIndex = 0; // Reseta para a opção "-- Escolha..."
    });

}); // --- FIM DO 'DOMContentLoaded' ---