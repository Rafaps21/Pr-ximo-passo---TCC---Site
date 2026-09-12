/* ===================================================================
   ARQUIVO: js/pagina-comparacao.js
   -------------------------------------------------------------------
   Script exclusivo da página comparacao.html. Monta um painel com 4
   "colunas" lado a lado, cada uma com um <select> (menu suspenso)
   para escolher um curso e uma área abaixo que mostra os dados
   completos daquele curso, permitindo comparar até 4 cursos ao mesmo
   tempo.

   Depende de js/dados.js já carregado antes (usa CURSOS,
   carregarCursos, getCursoPorId e a constante COMPARAR_INICIAL_KEY).
=================================================================== */

// Quantidade de colunas/slots de comparação exibidos na tela (fixo em 4,
// batendo com o layout de 4 colunas definido em .painel-comparativo no CSS)
const NUM_SLOTS = 4;

/* -----------------------------------------------------------------------
   opcoesSelect()
   -------------------------------------------------------------------
   Gera o HTML de todas as <option> que vão dentro de cada <select> de
   curso. Sempre começa com uma opção vazia/placeholder ("Selecione um
   curso..."), e depois uma opção para cada curso existente em CURSOS,
   usando o "id" do curso como valor da option e o "nome" como texto
   visível. Essa mesma lista de opções é repetida igual nos 4 selects.
----------------------------------------------------------------------- */
function opcoesSelect() {
    let html = `<option value="">Selecione um curso...</option>`;
    CURSOS.forEach(c => {
        html += `<option value="${c.id}">${c.nome}</option>`;
    });
    return html;
}

/* -----------------------------------------------------------------------
   conteudoColuna(curso)
   -------------------------------------------------------------------
   Recebe um curso (ou undefined/null, se nada foi selecionado ainda)
   e devolve um objeto { classe, html } com o que deve aparecer numa
   coluna de comparação.

   CASO 1 - nenhum curso selecionado (curso é undefined/null):
     -> classe: "coluna-curso coluna-vazia" (o CSS estiliza essa
        combinação com borda tracejada e texto de placeholder)
     -> html: um ícone e uma mensagem convidando a escolher um curso

   CASO 2 - um curso foi selecionado:
     -> classe: só "coluna-curso" (estilo normal, com fundo branco e
        sombra)
     -> html: bloco com a tag "DF" (Distrito Federal, indicando que os
        dados são regionais), o nome do curso, e uma série de
        "info-grupo" (label + valor) para carga horária, salário
        médio, duração, onde estudar (públicas/privadas), grade
        curricular e mensalidade média.

   Devolver um objeto com "classe" e "html" juntos permite que quem
   chama a função (atualizarColuna, abaixo) só precise aplicar os dois
   valores de uma vez, sem duplicar essa lógica de decisão.
----------------------------------------------------------------------- */
function conteudoColuna(curso) {
    if (!curso) {
        return {
            classe: 'coluna-curso coluna-vazia',
            html: `<span class="placeholder-icone">📊</span>
                <p class="placeholder-comparacao">Selecione um curso acima para ver os dados aqui.</p>`
        };
    }
    return {
        classe: 'coluna-curso',
        html: `
        <div class="topo-curso">
            <span class="tag-df">DF</span>
            <h3 class="curso-titulo">${curso.nome}</h3>
        </div>
        <div class="info-grupo">
            <label>⏱️ Carga Horária</label>
            <p>${curso.cargaHoraria}</p>
        </div>
        <div class="info-grupo">
            <label>💰 Salário Médio (DF)</label>
            <p>${curso.salario}</p>
        </div>
        <div class="info-grupo">
            <label>⏳ Duração Regular</label>
            <p>${curso.duracao}</p>
        </div>
        <div class="info-grupo">
            <label>🏛️ Onde Estudar no DF</label>
            <p><strong>Públicas:</strong> ${curso.publicas}</p>
            <p><strong>Privadas:</strong> ${curso.privadas}</p>
        </div>
        <div class="info-grupo">
            <label>📚 Grade Curricular Base</label>
            <p>${curso.grade}</p>
        </div>
        <div class="info-grupo">
            <label>💳 Mensalidade Média</label>
            <p class="preco-curso">${curso.mensalidade}</p>
        </div>`
    };
}

/* -----------------------------------------------------------------------
   atualizarColuna(slot)
   -------------------------------------------------------------------
   Chamada toda vez que a pessoa troca a opção escolhida em um dos
   selects (veja o atributo onchange="atualizarColuna(N)" adicionado
   dinamicamente no HTML mais abaixo). "slot" é o número da coluna
   (1 a 4).

   Passos:
   1. Encontra o <select> e a <div> da coluna correspondentes a esse
      número de slot (os ids seguem o padrão "select-curso-N" e
      "coluna-N", montados dinamicamente).
   2. Usa getCursoPorId (de js/dados.js) para buscar o curso completo
      a partir do valor atualmente selecionado no <select>. Se o
      select estiver na opção vazia (value=""), getCursoPorId não vai
      encontrar nada e devolve undefined — o que faz conteudoColuna
      cair no "caso vazio".
   3. Pede para conteudoColuna() montar a classe e o HTML certos.
   4. Aplica os dois na coluna: className substitui TODAS as classes
      da div de uma vez (por isso conteudoColuna sempre devolve a
      string completa de classes, e não só a classe extra), e
      innerHTML substitui o conteúdo visual.
----------------------------------------------------------------------- */
function atualizarColuna(slot) {
    const select = document.getElementById(`select-curso-${slot}`);
    const coluna = document.getElementById(`coluna-${slot}`);
    const curso = getCursoPorId(select.value);
    const { classe, html } = conteudoColuna(curso);
    coluna.className = classe;
    coluna.innerHTML = html;
}

/* -----------------------------------------------------------------------
   Bloco principal: roda quando a página termina de carregar
----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
    const painel = document.getElementById('painel-comparativo');

    // Mensagem de carregamento enquanto os cursos (para popular os
    // selects) ainda não chegaram
    painel.innerHTML = '<p class="carregando">Carregando cursos disponíveis...</p>';

    await carregarCursos();

    /* Monta o HTML dos 4 slots de comparação em um laço "for" comum
       (de 1 até NUM_SLOTS). Cada slot tem:
         - um <select> com id único (select-curso-1, select-curso-2...)
           e um atributo onchange que chama atualizarColuna(i) — ou
           seja, sempre que a pessoa muda a escolha NAQUELE select
           específico, só a coluna correspondente é atualizada, sem
           mexer nas outras 3.
         - uma <div> vazia/placeholder com id único (coluna-1,
           coluna-2...), que é onde atualizarColuna vai escrever o
           conteúdo depois. */
    let html = '';
    for (let i = 1; i <= NUM_SLOTS; i++) {
        html += `
        <div class="slot-comparacao">
            <select id="select-curso-${i}" class="select-curso" onchange="atualizarColuna(${i})">
                ${opcoesSelect()}
            </select>
            <div id="coluna-${i}" class="coluna-curso coluna-vazia">
                <span class="placeholder-icone">📊</span>
                <p class="placeholder-comparacao">Selecione um curso acima para ver os dados aqui.</p>
            </div>
        </div>`;
    }
    painel.innerHTML = html;

    /* -------------------------------------------------------------
       Pré-seleção vinda de outra página: se a pessoa clicou em
       "Comparar Este" em algum card (em cursos.html, resultado.html
       ou perfil.html), o id daquele curso foi salvo no localStorage
       sob a chave COMPARAR_INICIAL_KEY (definida em js/dados.js), e
       o link já trouxe a pessoa direto para esta página.

       Aqui a gente lê esse valor salvo e, se ele existir E
       corresponder a um curso válido (getCursoPorId encontrou algo),
       preenche automaticamente o PRIMEIRO select (slot 1) com esse
       curso e chama atualizarColuna(1) para desenhar a coluna já
       preenchida — assim a pessoa não precisa escolher de novo o
       curso que já tinha clicado.

       Depois de usar, o valor é removido do localStorage
       (localStorage.removeItem) para não ficar "grudado": se a
       pessoa voltar para esta página de novo mais tarde sem clicar
       em "Comparar Este" de novo, o slot 1 deve começar vazio.
    ------------------------------------------------------------- */
    const inicial = localStorage.getItem(COMPARAR_INICIAL_KEY);
    if (inicial && getCursoPorId(inicial)) {
        document.getElementById('select-curso-1').value = inicial;
        atualizarColuna(1);
    }
    localStorage.removeItem(COMPARAR_INICIAL_KEY);

    /* Botão "Limpar comparação": percorre os 4 slots, reseta o valor
       de cada select para a opção vazia (value = '') e chama
       atualizarColuna para cada um, o que faz todas as colunas
       voltarem ao estado "placeholder" (vazio). */
    document.getElementById('btn-limpar-comparacao').addEventListener('click', () => {
        for (let i = 1; i <= NUM_SLOTS; i++) {
            document.getElementById(`select-curso-${i}`).value = '';
            atualizarColuna(i);
        }
    });
});
