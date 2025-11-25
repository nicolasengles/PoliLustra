document.addEventListener('DOMContentLoaded', () => {
    const downloadModal = document.getElementById('download-modal');

    downloadModal.addEventListener('show.bs.modal', (event) => {
        downloadModal.dataset.imageUrl = event.relatedTarget.dataset.imageUrl;
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const url = downloadModal.dataset.imageUrl;

        const formatSelect = document.getElementById('format-select');

        const finalUrl = url.replace('/upload/', `/upload/fl_attachment,${formatSelect.value}/`);

        const link = document.createElement('a');
        link.href = finalUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        bootstrap.Modal.getInstance(downloadModal).hide();
        formatSelect.selectedIndex = 0;
    });

    document.getElementById('detalhes-modal').addEventListener('show.bs.modal', (event) => {
        document.getElementById('modal-detalhe-img').src = event.relatedTarget.dataset.imgUrl;
        document.getElementById('modal-detalhe-prompt').textContent = event.relatedTarget.dataset.prompt;
        document.getElementById('modal-detalhe-materia').textContent = event.relatedTarget.dataset.materia;
        document.getElementById('modal-detalhe-assunto').textContent = event.relatedTarget.dataset.assunto;
        document.getElementById('modal-detalhe-descricao').textContent = event.relatedTarget.dataset.descricao;
    });

    document.getElementById('excluir-imagem-modal').addEventListener('show.bs.modal', (event) => {
        event.currentTarget.dataset.imageId = event.relatedTarget.dataset.id;
    });
});

async function excluirImagem() {
    imageId = document.getElementById('excluir-imagem-modal').dataset.imageId;
    try {
        const response = await fetch(`/api/historico/excluir-imagem/${imageId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById(`image-card-${imageId}`).remove();
            bootstrap.Modal.getInstance(document.getElementById('excluir-imagem-modal')).hide();
        } else {
            alert(data.message || MENSAGEM_ERRO_PADRAO);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert(MENSAGEM_ERRO_PADRAO);
    }
}