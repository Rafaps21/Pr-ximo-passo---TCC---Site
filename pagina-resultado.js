/* ===================================================================
   ARQUIVO: js/pagina-resultado.js
   -------------------------------------------------------------------
   Script exclusivo da página resultado.html. Ele depende de DOIS
   outros arquivos terem sido carregados ANTES dele no HTML:
     - js/dados.js            -> fornece CURSOS, carregarCursos(),
                                  renderCursoCard(), ativarBotoesFavoritar(),
                                  ativarBotoesComparar().
     - js/dados-vocacional.js -> fornece DIMENSOES_VOCACIONAL e
                                  faixaPontuacaoVocacional().

   O que esta página faz, resumidamente:
   1. Lê o resultado do quiz que foi salvo no localStorage por
      js/pagina-quiz.js.
   2. Se não existir nenhum resultado salvo (a pessoa nunca fez o
      quiz nesta sessão/navegador), mostra uma mensagem convidando a
      fazer o quiz, em vez de um relatório vazio.
   3. Se existir, calcula a "faixa" (baixa/média/alta) de cada uma das
      5 dimensões, descobre os 2 pontos mais fortes e os 2 que mais
      precisam de atenção, escolhe até 3 cursos recomendados (do
      banco de dados de cursos) com base nas áreas marcadas na última
      pergunta do quiz, e monta todo o HTML do relatório.
=================================================================== */

/* Mesma chave usada em js/pagina-quiz.js para salvar o resultado do
   quiz no localStorage. Repetida aqui (e não importada) porque cada
   página HTML carrega seu próprio conjunto de scripts e eles não
   compartilham variáveis entre páginas diferentes — só compartilham
   o que está gravado no localStorage, que é comum a todo o site. */
const QUIZ_RESULTADO_KEY = 'pp_quiz_resultado';

/* Função "async" porque, lá dentro, precisamos "esperar" (await) o
   carregamento assíncrono dos cursos (carregarCursos()) antes de
   poder montar a lista de recomendados. */
document.addEventListener('DOMContentLoaded', async () => {

    // Elemento onde todo o relatório será inserido (começa com o
    // texto "Carregando seu resultado..." definido no próprio HTML)
    const container = document.getElementById('resultado-conteudo');

    /* ---------------------------------------------------------------
       PASSO 1: tentar ler o resultado salvo no localStorage.
       Se "bruto" for null (não existe nada salvo), mostra uma tela
       convidando a pessoa a responder o quiz, e ENCERRA a função
       aqui com "return" — o resto do código abaixo não roda.
    --------------------------------------------------------------- */
    const bruto = localStorage.getItem(QUIZ_RESULTADO_KEY);
    if (!bruto) {
        container.innerHTML = `
            <div class="hero-texto" style="text-align:center;">
                <p>Você ainda não respondeu ao questionário nesta sessão.</p>
                <div class="btn-container" style="margin-top:20px;">
                    <a href="quiz.html" class="btn-principal">Responder o Questionário</a>
                </div>
            </div>`;
        return;
    }

    /* ---------------------------------------------------------------
       PASSO 2: converter o texto salvo (JSON) de volta em objeto
       JavaScript. Isso pode falhar se o valor salvo estiver
       corrompido — por isso o try/catch, que mostra uma mensagem de
       erro amigável em vez de travar a página com um erro no console.
    --------------------------------------------------------------- */
    let resultado;
    try {
        resultado = JSON.parse(bruto);
    } catch (e) {
        container.innerHTML = `<p class="carregando">Não foi possível carregar seu resultado. Tente refazer o questionário.</p>`;
        return;
    }

    /* Lista com os "nomes internos" das 5 dimensões (as mesmas chaves
       do objeto DIMENSOES_VOCACIONAL: 'interesses', 'habilidades',
       'valores', 'influencias', 'exploracao'). Object.keys() devolve
       um array só com os nomes das propriedades de um objeto. */
    const idsDimensoes = Object.keys(DIMENSOES_VOCACIONAL);

    /* -----------------------------------------------------------------
       Monta um array "linhas", onde cada item representa uma dimensão
       já com tudo o que vamos precisar para desenhar a tela:
         - id: nome interno ('interesses', etc)
         - dados: o objeto completo vindo de DIMENSOES_VOCACIONAL
                  (nome, resumo, aplicacaoAmpla, tiers)
         - pontuacao: quantos pontos a pessoa fez nessa dimensão
                      (resultado.dimensoes[id]; se não existir, assume 0)
         - maximo: pontuação máxima possível nessa dimensão. Cada
                   pergunta vale até 5 pontos, então o máximo é o
                   número de perguntas daquela dimensão × 5. Se por
                   algum motivo essa informação não existir no
                   resultado salvo, assume 20 como valor padrão
                   (4 perguntas × 5).
         - faixa: 'baixa' | 'media' | 'alta', calculada chamando
                  faixaPontuacaoVocacional() (vem de dados-vocacional.js)
    ----------------------------------------------------------------- */
    const linhas = idsDimensoes.map(id => {
        const pontuacao = resultado.dimensoes[id] || 0;
        const maximo = (resultado.maximoPorDimensao && resultado.maximoPorDimensao[id]) ? resultado.maximoPorDimensao[id] * 5 : 20;
        const faixa = faixaPontuacaoVocacional(pontuacao);
        return { id, dados: DIMENSOES_VOCACIONAL[id], pontuacao, maximo, faixa };
    });

    /* -----------------------------------------------------------------
       Descobre os pontos mais fortes e os que mais precisam de
       atenção, ORDENANDO uma CÓPIA do array "linhas" (o "..." dentro
       de colchetes, [...linhas], cria uma cópia nova, para não
       bagunçar a ordem original de "linhas", que a página usa depois
       em "Mapa Completo por Dimensão").

       - ordenadas: da MAIOR pontuação para a MENOR
                    (b.pontuacao - a.pontuacao é o padrão de ordenação
                    decrescente com Array.sort)
       - pontosFortes: as 2 primeiras da lista ordenada (as 2 maiores)
       - pontosDesenvolver: pega a lista ordenada, INVERTE a ordem
                             (.reverse(), que agora vira da menor para
                             a maior) e pega as 2 primeiras (as 2 menores)
    ----------------------------------------------------------------- */
    const ordenadas = [...linhas].sort((a, b) => b.pontuacao - a.pontuacao);
    const pontosFortes = ordenadas.slice(0, 2);
    const pontosDesenvolver = [...ordenadas].reverse().slice(0, 2);
    /* Observação: "pontosDesenvolver" é calculado mas atualmente não é
       usado em nenhum lugar do HTML montado mais abaixo — provavelmente
       ficou disponível para uma futura seção "Pontos a desenvolver"
       mais detalhada, já que a tabela geral (renderTabela) já mostra
       todas as dimensões, fortes e fracas, de uma vez. */

    /* ---------------------------------------------------------------
       PASSO 3: buscar cursos recomendados
       -----------------------------------------------------------
       Antes de usar a variável global CURSOS (vinda de js/dados.js),
       é preciso "esperar" ela ser preenchida — por isso o await aqui.
    --------------------------------------------------------------- */
    await carregarCursos();

    // Áreas marcadas pela pessoa na última pergunta do quiz (pergunta
    // 21, os checkboxes de "Tecnologia", "Humanas", etc). Se por
    // algum motivo não existir nada salvo, usa um array vazio.
    const areasEscolhidas = (resultado.areasInteresse && resultado.areasInteresse.length > 0)
        ? resultado.areasInteresse
        : [];

    /* Função auxiliar: o campo curso.empregabilidade é uma STRING com
       "%" no final (ex: "92%"). parseInt("92%", 10) entende os
       dígitos do começo da string e ignora o "%" no final, devolvendo
       o número 92. Se por algum motivo o valor não puder ser
       convertido, "|| 0" garante que o resultado seja 0 em vez de
       NaN (o que quebraria a ordenação por empregabilidade). */
    function empregabilidadeNumero(curso) {
        return parseInt(curso.empregabilidade, 10) || 0;
    }

    /* Filtra a lista COMPLETA de cursos, mantendo só os que pertencem
       a alguma das áreas escolhidas pela pessoa, depois ORDENA esses
       cursos filtrados da MAIOR para a MENOR empregabilidade, e pega
       só os 3 primeiros (slice(0, 3)). */
    let cursosRecomendados = CURSOS
        .filter(c => areasEscolhidas.includes(c.area))
        .sort((a, b) => empregabilidadeNumero(b) - empregabilidadeNumero(a))
        .slice(0, 3);

    /* Caso de segurança: se NENHUM curso do banco de dados pertencer
       a nenhuma das áreas marcadas (por exemplo, a pessoa não marcou
       nenhuma área, ou marcou uma área sem cursos cadastrados ainda),
       o filtro acima devolveria uma lista vazia. Nesse caso, em vez
       de mostrar "nenhum curso encontrado", o site mostra os 3 cursos
       de MAIOR empregabilidade entre TODOS os cursos disponíveis —
       e marca "avisoSemAreaEscolhida" como true, para que o texto na
       tela explique que esses são só os cursos com melhor
       empregabilidade (e não uma recomendação baseada nas respostas). */
    let avisoSemAreaEscolhida = false;
    if (cursosRecomendados.length === 0) {
        avisoSemAreaEscolhida = true;
        cursosRecomendados = [...CURSOS].sort((a, b) => empregabilidadeNumero(b) - empregabilidadeNumero(a)).slice(0, 3);
    }

    // Nomes das duas dimensões mais fortes, usados no texto de
    // apresentação dos cursos recomendados (ex: "com base nos pontos
    // em que você já demonstra mais clareza (Interesses... e Valores...)")
    const nomesForca1 = pontosFortes[0] ? pontosFortes[0].dados.nome : '';
    const nomesForca2 = pontosFortes[1] ? pontosFortes[1].dados.nome : '';

    /* -----------------------------------------------------------------
       renderTabela()
       -------------------------------------------------------------
       Monta o HTML da tabela "Pontos Fortes e Pontos a Desenvolver",
       com uma linha para cada uma das 5 dimensões, mostrando nome,
       pontuação (ex: "14 / 20"), a "tag" colorida com a classificação
       (Ponto forte / Em desenvolvimento / Vale atenção — a cor exata
       vem das classes .tag-classificacao-alta/media/baixa no CSS) e o
       texto de "aplicacaoAmpla" daquela dimensão.

       "linhas.map(...).join('')" gera um pedaço de HTML (<tr>...</tr>)
       para cada dimensão e junta tudo numa string só, sem separador
       entre eles (join('') = sem vírgulas nem espaços extras).
    ----------------------------------------------------------------- */
    function renderTabela() {
        const linhasHtml = linhas.map(linha => {
            const tier = linha.dados.tiers[linha.faixa];
            return `
            <tr>
                <td><strong>${linha.dados.nome}</strong></td>
                <td>${linha.pontuacao} / ${linha.maximo}</td>
                <td><span class="tag-area tag-classificacao-${linha.faixa}">${tier.rotulo}</span></td>
                <td>${linha.dados.aplicacaoAmpla}</td>
            </tr>`;
        }).join('');

        return `
        <div class="tabela-vocacional-wrapper">
            <table class="tabela-vocacional">
                <thead>
                    <tr>
                        <th>Dimensão</th>
                        <th>Pontuação</th>
                        <th>Classificação</th>
                        <th>Onde isso vale a pena — mesmo em outras áreas</th>
                    </tr>
                </thead>
                <tbody>${linhasHtml}</tbody>
            </table>
        </div>`;
    }

    /* -----------------------------------------------------------------
       renderDimensaoCompleta(linha)
       -------------------------------------------------------------
       Monta o card detalhado de UMA dimensão, usado na seção "Mapa
       Completo por Dimensão" no final da página (um card por
       dimensão, 5 no total). Diferente da tabela resumida acima,
       aqui aparece:
         - a barra de progresso visual (reaproveitando a classe CSS
           .quiz-progresso-barra, a mesma usada na barra do quiz)
           preenchida de acordo com o percentual de acerto;
         - o texto completo da faixa (tier.texto);
         - a dica prática (tier.dica), dentro de um bloco com o
           mesmo estilo visual usado para "Instituições Recomendadas"
           nos cards de curso (classe .faculdades-container), só que
           aqui reaproveitado para mostrar a dica.
    ----------------------------------------------------------------- */
    function renderDimensaoCompleta(linha) {
        // Percentual de aproveitamento (0 a 100), arredondado, usado
        // para definir a largura da barrinha de progresso do card
        const percentual = Math.round((linha.pontuacao / linha.maximo) * 100);
        const tier = linha.dados.tiers[linha.faixa];
        return `
        <div class="card curso-card">
            <span class="tag-area">${tier.rotulo}</span>
            <h3 class="curso-nome">${linha.dados.nome}</h3>
            <p class="detalhe-curso"><strong>Pontuação:</strong> <span class="dado-dinamico">${linha.pontuacao} / ${linha.maximo}</span></p>
            <div class="quiz-progresso-barra-fundo" style="margin: 8px 0 16px;">
                <div class="quiz-progresso-barra" style="width:${percentual}%;"></div>
            </div>
            <p class="detalhe-curso">${tier.texto}</p>
            <div class="faculdades-container">
                <h4>💡 Para continuar explorando:</h4>
                <p class="faculdade-item">${tier.dica}</p>
            </div>
        </div>`;
    }

    /* -----------------------------------------------------------------
       PASSO 4: montar a página inteira de uma vez, inserindo tudo no
       container. O HTML final tem, nesta ordem:

       1) "🎓 Cursos Recomendados para Você"
          - Um parágrafo de introdução que muda de texto dependendo
            de "avisoSemAreaEscolhida":
              - se true: fala que são os cursos com melhor
                empregabilidade do banco;
              - se false: cita as áreas marcadas e os pontos fortes
                (nomesForca1/nomesForca2) que embasaram a sugestão.
          - Um segundo parágrafo, sempre exibido, deixando claro que
            isso NÃO é "a profissão certa", só um ponto de partida.
          - A grid com os cards dos cursos recomendados
            (cursosRecomendados.map(renderCursoCard) — a função
            renderCursoCard vem de js/dados.js e já inclui o botão de
            favoritar e o link "Comparar Este").

       2) "📊 Seus Pontos Fortes e Pontos a Desenvolver"
          - A tabela resumida (renderTabela()).

       3) "🗺️ Mapa Completo por Dimensão"
          - Um card detalhado para cada uma das 5 dimensões
            (linhas.map(renderDimensaoCompleta)).

       4) Um convite final para ver a lista completa de cursos em
          cursos.html.
    ----------------------------------------------------------------- */
    container.innerHTML = `
        <h2>🎓 Cursos Recomendados para Você</h2>
        <p style="text-align:center; margin-bottom: 10px;">
            ${avisoSemAreaEscolhida
                ? 'Estes são os cursos com melhor empregabilidade no nosso banco de dados:'
                : `Com base nas áreas que você marcou e nos pontos em que você já demonstra mais clareza (<strong>${nomesForca1}</strong>${nomesForca2 ? ` e <strong>${nomesForca2}</strong>` : ''}), estas são algumas opções para você comparar:`
            }
        </p>
        <p style="text-align:center; margin-bottom: 30px; font-size:0.9rem; color:#5b6b81;">
            Isso não significa que essa é "a profissão certa" para você — é um ponto de partida para pesquisar e comparar, como este questionário recomenda.
        </p>
        <div class="grid" id="resultado-grid">${cursosRecomendados.map(renderCursoCard).join('')}</div>

        <h2>📊 Seus Pontos Fortes e Pontos a Desenvolver</h2>
        <p style="text-align:center; margin-bottom: 30px;">
            Se a área sugerida acima não for do seu interesse, veja abaixo onde esses mesmos pontos fortes também se aplicam.
        </p>
        ${renderTabela()}

        <h2 style="margin-top: 50px;">🗺️ Mapa Completo por Dimensão</h2>
        <p style="text-align:center; margin-bottom: 30px;">Veja o detalhe de todas as dimensões avaliadas pelo questionário.</p>
        <div class="grid">${linhas.map(renderDimensaoCompleta).join('')}</div>

        <section class="hero-texto" style="text-align:center; margin-top: 20px;">
            <p>
                Quer ver todas as opções de curso do nosso banco de dados, não só as recomendadas?
                <a href="cursos.html">Veja a lista completa de cursos</a>.
            </p>
        </section>
    `;

    /* -----------------------------------------------------------------
       PASSO 5: só depois que o innerHTML acima foi inserido é que os
       botões de favoritar e comparar (dentro dos cards recém-criados)
       realmente existem no DOM — por isso essas duas funções (que vêm
       de js/dados.js) são chamadas AGORA, passando a grid de
       resultados (#resultado-grid) como contexto de busca.
    ----------------------------------------------------------------- */
    ativarBotoesFavoritar(document.getElementById('resultado-grid'));
    ativarBotoesComparar(document.getElementById('resultado-grid'));
});
