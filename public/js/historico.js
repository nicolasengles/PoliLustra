// public/js/historico.js

// O "Ouvinte" principal que espera o HTML ficar pronto
document.addEventListener('DOMContentLoaded', () => {

    // ----- Bloco 1: Lógica de Exclusão (que você já tem) -----
    const container = document.getElementById('historico-container');
    if (container) {
        container.addEventListener('click', async (event) => {
            
            if (event.target.classList.contains('btn-excluir')) {
                // ...
                // (Todo o seu código de 'confirm', 'fetch DELETE', etc. vai aqui)
                // ...
            }
        });
    } // --- Fim do Bloco 1 ---


    // ----- Bloco 2: Lógica de Download (O novo código) -----
    // Você adiciona ele AQUI, no mesmo nível do Bloco 1.
    
    // public/js/historico.js

// ... (seu 'DOMContentLoaded' e 'Bloco 1: Lógica de Exclusão' ficam aqui em cima) ...

    // ----- Bloco 2: Lógica de Download (VERSÃO MAIS SEGURA) -----
    const downloadModal = document.getElementById('download-modal');

    if (downloadModal) {
        
        const downloadSubmitBtn = document.getElementById('download-submit-btn');
        const formatSelect = document.getElementById('format-select');

        // O "Espião"
        downloadModal.addEventListener('show.bs.modal', (event) => {
            try {
                const triggerButton = event.relatedTarget; 
                const imageUrl = triggerButton.dataset.imageUrl;

                // --- DEBUG 1: A transferência está funcionando? ---
                // Verifique seu console (F12) para esta mensagem
                console.log('Transferindo URL para o modal:', imageUrl);

                if (!imageUrl) {
                    console.error('Falha na transferência! O botão não tem data-image-url.');
                    return;
                }

                // "Gruda" a URL no modal
                downloadModal.dataset.imageUrl = imageUrl;

            } catch (error) {
                console.error('Erro no evento show.bs.modal:', error);
                alert('Ocorreu um erro ao preparar o download. Verifique o console (F12).');
            }
        });

        // O "Ouvinte" do clique final
        downloadSubmitBtn.addEventListener('click', () => {
            
            // --- DEBUG 2: Estamos lendo a URL "grudada"? ---
            const baseUrl = downloadModal.dataset.imageUrl;
            console.log('URL lida do modal:', baseUrl);

            // --- DEFESA 1: Verificamos se a baseUrl existe ---
            if (!baseUrl) {
                alert('Erro! A URL da imagem não foi encontrada. Tente abrir o modal novamente.');
                console.error('baseUrl está undefined! A transferência falhou.');
                return;
            }

            const formatFlag = formatSelect.value;

            // --- DEFESA 2: Verificamos se o formato foi escolhido ---
            if (!formatFlag) {
                alert('Por favor, selecione um formato para baixar.');
                return; 
            }

            // Se tudo deu certo, montamos a URL final
            const finalUrl = baseUrl.replace('/upload/', `/upload/fl_attachment,${formatFlag}/`);
            
            console.log('Abrindo URL final:', finalUrl);

            // 1. Cria um link <a> "invisível" na memória
            const link = document.createElement('a');
            link.href = finalUrl;

            // 2. Adiciona o link ao corpo da página (necessário para funcionar)
            document.body.appendChild(link);

            // 3. Simula um clique do usuário neste link
            link.click();

            // 4. Remove o link da página (limpeza)
            document.body.removeChild(link);

            // Bônus: Esconde o modal e limpa o <select>
            const modalInstance = bootstrap.Modal.getInstance(downloadModal);
            modalInstance.hide();
            formatSelect.selectedIndex = 0;
        });
    }

}); // <-- FIM DO 'DOMContentLoaded'