/* ===================================================================
   ARQUIVO: js/pagina-perfil.js
   -------------------------------------------------------------------
   Script exclusivo da página perfil.html. Controla dois recursos:
   1. Nome e e-mail da pessoa logada, lidos de sessionStorage (salvos
      por js/login.js no momento do login). Se não houver ninguém
      logado, redireciona para a tela de login.
   2. A lista de cursos favoritados, exibida como uma grid de cards.

   Depende de js/dados.js já carregado antes (usa getFavoritos,
   getCursoPorId, renderCursoCard, ativarBotoesFavoritar,
   ativarBotoesComparar e carregarCursos).
=================================================================== */

/* -----------------------------------------------------------------------
   atualizarSaudacao(nome)
   -------------------------------------------------------------------
   Atualiza o texto do <h2 id="perfil-saudacao">. Se "nome" for uma
   string vazia (ninguém está logado), mostra só "Olá! 👋"; caso
   contrário, personaliza com "Olá, <nome>! 👋".
----------------------------------------------------------------------- */
function atualizarSaudacao(nome) {
    const saudacao = document.getElementById('perfil-saudacao');
    saudacao.textContent = nome ? `Olá, ${nome}! 👋` : 'Olá! 👋';
}

/* -----------------------------------------------------------------------
   renderFavoritos()
   -------------------------------------------------------------------
   Desenha a lista de cursos favoritados dentro de #lista-favoritos.

   1. Busca os ids favoritados com getFavoritos() (de js/dados.js).
   2. Se a lista estiver vazia, mostra uma mensagem explicando que
      ainda não há favoritos e um link para a página de cursos, onde
      é possível favoritar.
   3. Se houver favoritos:
      - Transforma a lista de IDS em uma lista de CURSOS completos,
        usando .map(getCursoPorId) (chama getCursoPorId para cada id).
      - .filter(Boolean) remove qualquer resultado "undefined" que
        possa aparecer — por exemplo, se um curso foi favoritado no
        passado mas depois removido do banco de dados, getCursoPorId
        não encontraria mais esse curso, e sem esse filtro apareceria
        um card quebrado/vazio na tela.
      - Gera o HTML de cada curso com renderCursoCard (de dados.js) e
        insere tudo dentro de uma <div class="grid">.
      - Reativa os botões de favoritar e comparar dos cards recém
        inseridos (igual às outras páginas, precisa ser feito depois
        do innerHTML, porque HTML inserido como texto não traz
        eventos já ligados).

   Esta função é chamada tanto no carregamento inicial da página
   quanto sempre que o evento 'favoritos-atualizados' é disparado
   (veja mais abaixo) — ou seja, se a pessoa desfavoritar um curso
   clicando na estrela AQUI MESMO na página de perfil, a lista é
   redesenhada automaticamente sem precisar recarregar a página.
----------------------------------------------------------------------- */
function renderFavoritos() {
    const lista = document.getElementById('lista-favoritos');
    const favoritos = getFavoritos();

    if (favoritos.length === 0) {
        lista.innerHTML = `<div class="sem-favoritos">
            <p>Você ainda não favoritou nenhum curso.</p>
            <p>Vá até <a href="cursos.html">Cursos</a> e clique na estrela ☆ para adicionar aqui.</p>
        </div>`;
        return;
    }

    const cursos = favoritos.map(getCursoPorId).filter(Boolean);
    lista.innerHTML = `<div class="grid">${cursos.map(renderCursoCard).join('')}</div>`;
    ativarBotoesFavoritar(lista);
    ativarBotoesComparar(lista);
}

/* -----------------------------------------------------------------------
   Bloco principal: roda quando a página termina de carregar
----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {

    /* --- Parte 1: dados de quem está logado --- */
    // Lê o que foi salvo pelo login (js/login.js), em sessionStorage.
    // Se a pessoa chegou aqui sem ter feito login, "usuarioLogado" será
    // null, então manda de volta para a tela de login.
    const dadosSessao = sessionStorage.getItem('usuarioLogado');

    if (!dadosSessao) {
        window.location.href = 'index.html';
        return;
    }

    const usuarioLogado = JSON.parse(dadosSessao);
    atualizarSaudacao(usuarioLogado.nome);
    document.getElementById('perfil-email').textContent = usuarioLogado.email;

    document.getElementById('botao-sair').addEventListener('click', () => {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = 'index.html';
    });

    /* --- Parte 2: lista de favoritos --- */
    // Mostra "Carregando..." enquanto os dados dos cursos (necessários
    // para desenhar os cards) ainda não chegaram
    document.getElementById('lista-favoritos').innerHTML = '<p class="carregando">Carregando favoritos...</p>';

    // Precisa esperar os cursos carregarem antes de poder traduzir os
    // ids favoritados em objetos de curso completos (getCursoPorId
    // só funciona depois que a variável global CURSOS foi preenchida)
    await carregarCursos();

    renderFavoritos();

    // Escuta o evento customizado 'favoritos-atualizados', disparado
    // por toggleFavorito() em js/dados.js sempre que um favorito é
    // adicionado ou removido — assim, clicar na estrela de um card
    // atualiza a lista automaticamente, mesmo sem recarregar a página
    document.addEventListener('favoritos-atualizados', renderFavoritos);
});
