/* ===================================================================
   ARQUIVO: js/pagina-quiz.js
   -------------------------------------------------------------------
   Script exclusivo da página quiz.html (é carregado só nela, veja a
   tag <script src="js/pagina-quiz.js"> no fim do HTML).

   O que ele faz, resumidamente:
   1. Mostra UMA pergunta por vez (mesmo o HTML tendo todas as 21
      perguntas escritas no documento desde o início).
   2. Controla os botões "Anterior" / "Próxima" e a barra de progresso.
   3. Impede avançar se a pergunta atual ainda não foi respondida.
   4. Na última pergunta, calcula a pontuação de cada uma das 5
      dimensões do questionário, salva tudo no localStorage do
      navegador, e manda a pessoa para resultado.html — que vai ler
      esses dados salvos e montar o relatório.
=================================================================== */

/* Nome da "chave" usada para salvar/ler o resultado no localStorage.
   Essa MESMA string também aparece em js/pagina-resultado.js — os dois
   arquivos precisam concordar no nome da chave para um conseguir ler
   o que o outro escreveu. Ela não pode ser "importada" de um arquivo
   para o outro porque cada página carrega scripts diferentes e eles
   não compartilham variáveis entre si (por isso é uma constante
   repetida, e não uma importação). */
const QUIZ_RESULTADO_KEY = 'pp_quiz_resultado';

/* Tudo dentro deste bloco só roda depois que o navegador terminou de
   montar toda a árvore HTML da página (evento 'DOMContentLoaded').
   Isso garante que document.querySelectorAll, getElementById, etc,
   já vão encontrar os elementos, porque eles já existem na página. */
document.addEventListener('DOMContentLoaded', () => {

    /* Pega TODOS os blocos de pergunta do formulário (cada <div
       class="questoes-bloco">, incluindo o bloco especial de "áreas
       de interesse" no final) e transforma o resultado (uma NodeList)
       em um array de verdade com Array.from(), para poder usar
       métodos como .forEach, .map etc. sem restrição. */
    const blocos = Array.from(document.querySelectorAll('.questoes-bloco'));

    // Quantidade total de "passos" do quiz (21: 20 perguntas + 1 bloco de áreas)
    const total = blocos.length;

    // Índice (posição, começando em 0) da pergunta que está sendo exibida agora
    let atual = 0;

    // Referências aos elementos da tela que este script precisa manipular
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');
    const progressoTexto = document.getElementById('progresso-texto');
    const progressoBarra = document.getElementById('progresso-barra');

    /* -----------------------------------------------------------------
       perguntaRespondida(indice)
       -------------------------------------------------------------
       Verifica se o bloco de pergunta na posição "indice" já tem
       alguma opção marcada.

       O bloco de "áreas de interesse" (a última pergunta) é diferente
       das demais: ele usa checkboxes (pode marcar mais de uma opção),
       enquanto todas as outras usam radio buttons (só uma opção por
       pergunta). Por isso a função primeiro checa se o bloco tem a
       classe "bloco-areas" para saber qual tipo de input procurar.

       querySelectorAll(...).length > 0 -> devolve true se encontrou
       pelo menos um input marcado (:checked), senão false.
    ----------------------------------------------------------------- */
    function perguntaRespondida(indice) {
        const bloco = blocos[indice];
        if (bloco.classList.contains('bloco-areas')) {
            return bloco.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        }
        return bloco.querySelectorAll('input[type="radio"]:checked').length > 0;
    }

    /* -----------------------------------------------------------------
       mostrarPergunta(indice)
       -------------------------------------------------------------
       Responsável por exibir SÓ o bloco de pergunta na posição
       "indice" e esconder todos os outros, além de atualizar a barra
       de progresso e o texto ("Pergunta X de 21") e o texto do botão
       "Próxima".

       Como funciona o "mostrar/esconder"? O CSS (style.css) define
       que TODO ".questoes-bloco" começa com display:none, e que a
       classe extra ".pergunta-ativa" muda isso para display:block.
       Então aqui, para cada bloco, usamos classList.toggle(classe,
       condicao): se a condição for verdadeira, a classe é adicionada;
       se for falsa, a classe é removida. Ou seja, só o bloco cujo
       índice bate com "indice" fica com a classe "pergunta-ativa".
    ----------------------------------------------------------------- */
    function mostrarPergunta(indice) {
        blocos.forEach((bloco, i) => {
            bloco.classList.toggle('pergunta-ativa', i === indice);
        });

        // Atualiza o texto "Pergunta N de 21"
        progressoTexto.textContent = `Pergunta ${indice + 1} de ${total}`;

        // Atualiza a largura (em %) da barra de progresso visual
        progressoBarra.style.width = `${((indice + 1) / total) * 100}%`;

        // Esconde o botão "Anterior" quando está na primeira pergunta
        // (não faz sentido voltar se já é a primeira)
        btnAnterior.classList.toggle('escondido', indice === 0);

        // Na última pergunta, o botão "Próxima" muda de texto para
        // avisar que o clique vai finalizar o quiz
        btnProxima.textContent = indice === total - 1 ? 'Finalizar e Ver Resultados' : 'Próxima →';
    }

    /* -----------------------------------------------------------------
       calcularEsalvarResultado()
       -------------------------------------------------------------
       Chamada só quando a pessoa clica em "Finalizar e Ver
       Resultados" (ou seja, na última pergunta). Ela percorre TODOS
       os blocos de pergunta e:

       - Para o bloco especial de áreas de interesse: coleta os
         valores de todos os checkboxes marcados num array de strings
         (ex: ["Tecnologia", "Exatas"]).

       - Para os demais blocos (as 20 perguntas de verdade):
           a) Descobre a que DIMENSÃO aquele bloco pertence, lendo o
              atributo data-dimensao do próprio bloco (ex:
              "interesses", "habilidades"...).
           b) Encontra o input radio marcado dentro do bloco e lê seu
              "value" (que vai de "1" a "5" em texto), convertendo
              para número com parseInt. Se por algum motivo nada
              estiver marcado, assume valor 0 (não deveria acontecer,
              já que o botão "Próxima" bloqueia perguntas em branco).
           c) Soma esse valor ao total acumulado daquela dimensão em
              "somaPorDimensao", e conta mais uma pergunta respondida
              em "totalPerguntasPorDimensao" (usado depois para saber
              a pontuação MÁXIMA possível daquela dimensão: cada
              pergunta vale até 5 pontos).

       No final, monta um objeto "resultado" com:
         - geradoEm: data/hora em que o quiz foi concluído (formato
           ISO, ex: "2026-08-30T12:00:00.000Z"), útil para debug ou
           futuras funcionalidades (ex: mostrar "respondido há X dias").
         - dimensoes: { interesses: 15, habilidades: 12, ... } -> soma
           de pontos de cada dimensão.
         - maximoPorDimensao: { interesses: 4, habilidades: 4, ... } ->
           quantas perguntas cada dimensão teve (usado em
           pagina-resultado.js para calcular a pontuação máxima
           possível, multiplicando por 5).
         - areasInteresse: array de áreas marcadas na última pergunta.

       Por fim, salva esse objeto inteiro no localStorage, convertido
       para texto com JSON.stringify (o localStorage só aceita string).
    ----------------------------------------------------------------- */
    function calcularEsalvarResultado() {
        const somaPorDimensao = {};
        const totalPerguntasPorDimensao = {};
        let areasInteresse = [];

        blocos.forEach(bloco => {
            // Bloco especial das áreas de interesse (não entra na soma das dimensões)
            if (bloco.classList.contains('bloco-areas')) {
                areasInteresse = Array.from(bloco.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(input => input.value);
                return; // "return" dentro do forEach = "continue", pula para o próximo bloco
            }

            const dimensao = bloco.getAttribute('data-dimensao');
            const marcado = bloco.querySelector('input[type="radio"]:checked');
            const valor = marcado ? parseInt(marcado.value, 10) : 0;

            // "somaPorDimensao[dimensao] || 0" garante que, na primeira vez que
            // aquela dimensão aparece, a soma comece de 0 antes de somar o valor
            somaPorDimensao[dimensao] = (somaPorDimensao[dimensao] || 0) + valor;
            totalPerguntasPorDimensao[dimensao] = (totalPerguntasPorDimensao[dimensao] || 0) + 1;
        });

        const resultado = {
            geradoEm: new Date().toISOString(),
            dimensoes: somaPorDimensao,
            maximoPorDimensao: totalPerguntasPorDimensao,
            areasInteresse: areasInteresse
        };

        localStorage.setItem(QUIZ_RESULTADO_KEY, JSON.stringify(resultado));
    }

    /* -----------------------------------------------------------------
       Clique no botão "Próxima" (ou "Finalizar e Ver Resultados")
       -------------------------------------------------------------
       1. Primeiro checa se a pergunta ATUAL foi respondida.
          - Se NÃO foi: adiciona a classe "pergunta-erro" no bloco
            (o CSS usa essa classe para fazer um "tremor" visual e
            destacar as opções em vermelho) e rola a tela suavemente
            até o bloco ficar visível (scrollIntoView). Depois disso,
            "return" interrompe a função — ou seja, NÃO avança.
          - Se FOI respondida: remove qualquer classe de erro que
            tivesse ficado de uma tentativa anterior.
       2. Se a pergunta atual for a ÚLTIMA (atual === total - 1):
          calcula e salva o resultado, depois redireciona o navegador
          para resultado.html (window.location.href = ...) e encerra
          a função.
       3. Caso contrário: avança o índice "atual" em 1 e chama
          mostrarPergunta() para exibir a próxima.
    ----------------------------------------------------------------- */
    btnProxima.addEventListener('click', () => {
        if (!perguntaRespondida(atual)) {
            blocos[atual].classList.add('pergunta-erro');
            blocos[atual].scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        blocos[atual].classList.remove('pergunta-erro');

        if (atual === total - 1) {
            calcularEsalvarResultado();
            window.location.href = 'resultado.html';
            return;
        }

        atual++;
        mostrarPergunta(atual);
    });

    /* Clique no botão "Anterior": só volta se não estiver já na
       primeira pergunta (o botão fica escondido nesse caso, mas essa
       checagem extra evita erro caso alguém force o clique de outra
       forma, por exemplo via ferramentas de desenvolvedor). */
    btnAnterior.addEventListener('click', () => {
        if (atual === 0) return;
        atual--;
        mostrarPergunta(atual);
    });

    /* Assim que a pessoa clica em QUALQUER opção de resposta (radio)
       dentro de um bloco, remove a classe de erro daquele bloco — ou
       seja, o aviso visual de "faltou responder" some assim que ela
       começa a corrigir o problema, sem precisar clicar em "Próxima"
       de novo para o aviso sumir. */
    blocos.forEach(bloco => {
        bloco.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => bloco.classList.remove('pergunta-erro'));
        });
    });

    /* Chamada inicial: exibe a primeira pergunta (índice 0) assim que
       a página termina de carregar. Sem esta linha, TODOS os blocos
       ficariam escondidos (porque .questoes-bloco começa com
       display:none no CSS) e nada apareceria na tela. */
    mostrarPergunta(atual);
});
