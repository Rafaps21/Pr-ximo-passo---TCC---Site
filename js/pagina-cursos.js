/* ===================================================================
   ARQUIVO: js/pagina-cursos.js
   -------------------------------------------------------------------
   Script exclusivo da página cursos.html. É o script mais curto e
   simples do projeto, mas mostra bem o "padrão" repetido em várias
   páginas do site: mostrar "Carregando...", buscar os dados, e só
   depois desenhar o conteúdo de verdade.

   Depende de js/dados.js ter sido carregado antes (para existirem as
   funções carregarCursos, renderCursoCard, ativarBotoesFavoritar e
   ativarBotoesComparar, além da variável global CURSOS).
=================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Pega a <div id="cursos-grid"> vazia que existe no HTML
    const grid = document.getElementById('cursos-grid');

    // Mostra uma mensagem de carregamento enquanto os dados não chegam
    // (a classe .carregando do CSS estiliza esse texto)
    grid.innerHTML = '<p class="carregando">Carregando cursos...</p>';

    // Espera a "busca" dos cursos terminar (hoje é só uma simulação com
    // atraso de 150ms dentro de carregarCursos(), em js/dados.js —
    // no futuro pode virar uma chamada de API de verdade)
    await carregarCursos();

    // Agora que CURSOS está preenchido, gera um card de HTML para CADA
    // curso (usando renderCursoCard, de js/dados.js) e junta tudo numa
    // única string para substituir o "Carregando..." pelo conteúdo real
    grid.innerHTML = CURSOS.map(renderCursoCard).join('');

    // Liga o comportamento de clique dos botões de favoritar (★/☆) e
    // dos links "Comparar Este" que acabaram de ser inseridos na tela
    // — precisa ser feito DEPOIS do innerHTML, porque inserir HTML como
    // texto não traz nenhum "escutador de evento" junto
    ativarBotoesFavoritar(grid);
    ativarBotoesComparar(grid);
});
