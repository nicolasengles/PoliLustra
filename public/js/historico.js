document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('historico-container');
    if (container) {
        container.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-excluir')) {
                const imageId = event.target.dataset.id;

                if (!confirm('Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.')) {
                    return;
                }

                try {
                    const response = await fetch(`/api/ia/history/${imageId}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (response.ok) {
                        success(data.message);
                        event.target.closest('.image-card').remove();

                    } else {
                        throw new Error(data.message);
                    }

                } catch (error) {
                    console.error('Erro ao excluir:', error);
                    error('Erro: ' + error.message);
                }
            }
        });
    }

    const downloadModal = document.getElementById('download-modal');

    if (downloadModal) {
        
        const downloadSubmitBtn = document.getElementById('download-submit-btn');
        const formatSelect = document.getElementById('format-select');

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
                error('Ocorreu um erro ao preparar o download. Verifique o console (F12).');
            }
        });

        downloadSubmitBtn.addEventListener('click', () => {
            const baseUrl = downloadModal.dataset.imageUrl;

            if (!baseUrl) {
                error('Erro! A URL da imagem não foi encontrada. Tente abrir o modal novamente.');
                console.error('baseUrl está undefined! A transferência falhou.');
                return;
            }

            const formatFlag = formatSelect.value;

            if (!formatFlag) {
                error('Por favor, selecione um formato para baixar.');
                return; 
            }

            const finalUrl = baseUrl.replace('/upload/', `/upload/fl_attachment,${formatFlag}/`);
            
            console.log('Abrindo URL final:', finalUrl);

            const link = document.createElement('a');
            link.href = finalUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            const modalInstance = bootstrap.Modal.getInstance(downloadModal);
            modalInstance.hide();
            formatSelect.selectedIndex = 0;
        });
    }

    const detalhesModal = document.getElementById('detalhes-modal');
    if (detalhesModal) {
        const imgElement = document.getElementById('modal-detalhe-img');
        const promptElement = document.getElementById('modal-detalhe-prompt');
        const materiaElement = document.getElementById('modal-detalhe-materia');
        const assuntoElement = document.getElementById('modal-detalhe-assunto');
        const descricaoElement = document.getElementById('modal-detalhe-descricao');

        detalhesModal.addEventListener('show.bs.modal', (event) => {
            const triggerButton = event.relatedTarget;

            const imageUrl = triggerButton.dataset.imgUrl;
            const prompt = triggerButton.dataset.prompt;
            const materia = triggerButton.dataset.materia;
            const assunto = triggerButton.dataset.assunto;
            const descricao = triggerButton.dataset.descricao;

            imgElement.src = imageUrl;
            promptElement.textContent = prompt;
            materiaElement.textContent = materia;
            assuntoElement.textContent = assunto;
            descricaoElement.textContent = descricao;
        });
    }
});