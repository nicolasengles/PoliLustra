// public/js/historico.js

// Espera o documento HTML carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o 'container' onde todos os cards estão
    const container = document.getElementById('historico-container');

    // Se este script for carregado em uma pág. sem o container, ele para.
    if (!container) {
        return;
    }

    // Adiciona um 'ouvinte' de clique no container pai
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
});