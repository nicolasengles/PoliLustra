// public/js/historico.js

// O "Ouvinte" principal que espera o HTML ficar pronto
document.addEventListener('DOMContentLoaded', () => {

    // ----- Bloco 1: Lógica de Exclusão -----
    const container = document.getElementById('historico-container');
    if (container) {
        container.addEventListener('click', async (event) => {
            
            // Verifica se o elemento clicado é um botão de excluir
            if (event.target.classList.contains('btn-excluir')) {
                
                // Pega o ID que colocamos no atributo 'data-id'
                const imageId = event.target.dataset.id;

                // Pergunta ao usuário se ele tem certeza
                if (!confirm('Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.')) {
                    return; // Se ele clicar 'Cancelar', não faz nada
                }

                try {
                    // Chama a sua API usando 'fetch' com o método DELETE
                    const response = await fetch(`/api/ia/history/${imageId}`, {
                        method: 'DELETE'
                    });

                    // Pega a resposta da sua API (ex: { message: '...' })
                    const data = await response.json();

                    if (response.ok) {
                        // Sucesso!
                        alert(data.message); // Exibe "Imagem deletada com sucesso."
                        
                        // Remove o card da imagem da tela (feedback visual)
                        event.target.closest('.image-card').remove();

                    } else {
                        // Erro! (Ex: 401, 404, 500)
                        throw new Error(data.message);
                    }

                } catch (error) {
                    console.error('Erro ao excluir:', error);
                    alert('Erro: ' + error.message);
                }
            }
        });
    } // --- Fim do Bloco 1 ---


    // ----- Bloco 2: Lógica de Download -----
    const downloadModal = document.getElementById('download-modal');

    if (downloadModal) {
        
        const downloadSubmitBtn = document.getElementById('download-submit-btn');
        const formatSelect = document.getElementById('format-select');

        // O "Espião"
        downloadModal.addEventListener('show.bs.modal', (event) => {
            try {
                const triggerButton = event.relatedTarget; 
                const imageUrl = triggerButton.dataset.imageUrl;

                console.log('Transferindo URL para o modal:', imageUrl);

                if (!imageUrl) {
                    console.error('Falha na transferência! O botão não tem data-image-url.');
                    return;
                }
                
                downloadModal.dataset.imageUrl = imageUrl;

            } catch (error) {
                console.error('Erro no evento show.bs.modal:', error);
                alert('Ocorreu um erro ao preparar o download. Verifique o console (F12).');
            }
        });

        // O "Ouvinte" do clique final
        downloadSubmitBtn.addEventListener('click', () => {
            
            const baseUrl = downloadModal.dataset.imageUrl;
            console.log('URL lida do modal:', baseUrl);

            if (!baseUrl) {
                alert('Erro! A URL da imagem não foi encontrada. Tente abrir o modal novamente.');
                console.error('baseUrl está undefined! A transferência falhou.');
                return;
            }

            const formatFlag = formatSelect.value;

            if (!formatFlag) {
                alert('Por favor, selecione um formato para baixar.');
                return; 
            }

            const finalUrl = baseUrl.replace('/upload/', `/upload/fl_attachment,${formatFlag}/`);
            
            console.log('Abrindo URL final:', finalUrl);

            // "Truque do link invisível"
            const link = document.createElement('a');
            link.href = finalUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Bônus: Esconde o modal e limpa o <select>
            const modalInstance = bootstrap.Modal.getInstance(downloadModal);
            modalInstance.hide();
            formatSelect.selectedIndex = 0;
        });
    } // --- Fim do Bloco 2 ---


    // --- Bloco 3: LÓGICA DE DETALHES (NOVO) ---
    const detalhesModal = document.getElementById('detalhes-modal');
    if (detalhesModal) {
        
        // 1. Pega os "espaços reservados" (placeholders) dentro do modal
        const imgElement = document.getElementById('modal-detalhe-img');
        const promptElement = document.getElementById('modal-detalhe-prompt');
        const materiaElement = document.getElementById('modal-detalhe-materia');
        const assuntoElement = document.getElementById('modal-detalhe-assunto');
        const descricaoElement = document.getElementById('modal-detalhe-descricao');

        // 2. O "Espião" do Bootstrap: ouve quando o modal está prestes a abrir
        detalhesModal.addEventListener('show.bs.modal', (event) => {
            
            // 3. Pega o botão exato que foi clicado
            const triggerButton = event.relatedTarget;

            // 4. Pega todos os dados dos atributos 'data-*'
            const imageUrl = triggerButton.dataset.imgUrl;
            const prompt = triggerButton.dataset.prompt;
            const materia = triggerButton.dataset.materia;
            const assunto = triggerButton.dataset.assunto;
            const descricao = triggerButton.dataset.descricao;

            // 5. Injeta os dados nos "espaços reservados"
            imgElement.src = imageUrl;
            promptElement.textContent = prompt;
            materiaElement.textContent = materia;
            assuntoElement.textContent = assunto;
            descricaoElement.textContent = descricao;
        });
    } // --- Fim do Bloco 3 ---

}); // <-- FIM DO 'DOMContentLoaded'