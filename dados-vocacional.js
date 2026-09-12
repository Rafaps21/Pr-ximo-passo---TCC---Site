/* ===================================================================
   ARQUIVO: js/dados-vocacional.js
   -------------------------------------------------------------------
   Este arquivo é a "camada de dados" do QUIZ (diferente de dados.js,
   que é a camada de dados dos CURSOS). Ele não tem nenhuma lógica de
   tela — só guarda um grande objeto de configuração com os textos
   explicativos de cada uma das 5 dimensões avaliadas pelo quiz de
   quiz.html, e uma função pequena que decide em qual "faixa" uma
   pontuação se encaixa.

   Quem usa este arquivo é js/pagina-resultado.js, que lê esses textos
   para montar a página resultado.html dinamicamente, de acordo com o
   que a pessoa respondeu no quiz.
=================================================================== */

/* ---------------------------------------------------------------------
   DIMENSOES_VOCACIONAL
   -----------------------------------------------------------------
   Um objeto onde cada CHAVE (interesses, habilidades, valores,
   influencias, exploracao) corresponde a uma das 5 dimensões
   avaliadas pelo Questionário de Exploração da Situação Vocacional em
   quiz.html. Essas chaves são exatamente os mesmos valores usados no
   atributo data-dimensao de cada bloco de pergunta no HTML do quiz —
   é assim que o resultado de cada pergunta é somado na dimensão certa
   (veja js/pagina-quiz.js).

   Cada dimensão tem:
     - nome: título completo, mostrado na tabela/cards do resultado.
     - resumo: frase curta (não é usada em nenhuma tela ainda, mas
       fica disponível caso a página de resultado queira exibi-la no
       futuro).
     - aplicacaoAmpla: texto que explica por que aquela dimensão é
       importante mesmo em outras áreas além da sugerida — aparece na
       coluna "Onde isso vale a pena" da tabela de resultado.
     - tiers: um objeto com três "faixas" possíveis de pontuação
       (baixa / media / alta). Cada faixa tem:
         - rotulo: etiqueta curta mostrada como "tag colorida"
           (ex: "Ponto forte", "Em desenvolvimento", "Vale atenção").
         - texto: parágrafo explicando o que aquela faixa significa.
         - dica: uma sugestão prática de próximo passo.

   Este objeto é só DADOS — nenhuma função aqui decide sozinha qual
   faixa usar; isso é feito por faixaPontuacaoVocacional() logo
   abaixo, e quem chama essa função é pagina-resultado.js.
--------------------------------------------------------------------- */
const DIMENSOES_VOCACIONAL = {

    /* ---- Dimensão 1: perguntas 1 a 4 do quiz (data-dimensao="interesses") ---- */
    interesses: {
        nome: 'Interesses e Preferências Vocacionais',
        resumo: 'O que desperta sua curiosidade e sua vontade de se envolver.',
        aplicacaoAmpla: 'Saber nomear o que desperta sua curiosidade é útil em qualquer área — é o que te ajuda a escolher, dentro de um curso ou profissão, os projetos e especializações que vão te manter interessado.',
        tiers: {
            alta: {
                rotulo: 'Ponto forte',
                texto: 'Você já reconhece com clareza os assuntos e atividades que despertam sua curiosidade, percebe em quais situações se envolve espontaneamente e consegue relacionar esses interesses a mais de uma área profissional.',
                dica: 'Continue ampliando: para cada interesse que você já identificou, procure conhecer pelo menos duas profissões diferentes ligadas a ele.'
            },
            media: {
                rotulo: 'Em desenvolvimento',
                texto: 'Alguns dos seus interesses já estão claros, mas outros ainda são difíceis de nomear. Isso pode acontecer quando você gosta de muitas coisas ao mesmo tempo ou teve poucas experiências diferentes para comparar.',
                dica: 'Liste três coisas de que você gosta e procure o que existe em comum entre elas: criar, investigar, conversar, construir, organizar, ensinar ou liderar?'
            },
            baixa: {
                rotulo: 'Vale atenção',
                texto: 'Nomear interesses ainda está difícil para você neste momento, o que é bastante comum quando o contato com diferentes áreas profissionais ainda é pequeno.',
                dica: 'Troque a pergunta "qual profissão eu quero?" por "sobre o que eu gostaria de aprender mais?" e "que atividade eu gostaria de experimentar?".'
            }
        }
    },

    /* ---- Dimensão 2: perguntas 5 a 8 (data-dimensao="habilidades") ---- */
    habilidades: {
        nome: 'Habilidades Percebidas e Características Pessoais',
        resumo: 'O que você já sabe fazer bem e como costuma agir diante das situações.',
        aplicacaoAmpla: 'Reconhecer suas próprias habilidades vale para qualquer curso ou profissão — é o que te permite escolher, dentro de qualquer área, o tipo de função em que você rende mais (mais técnica, mais criativa, mais de contato com pessoas, etc).',
        tiers: {
            alta: {
                rotulo: 'Ponto forte',
                texto: 'Você reconhece habilidades e características pessoais que já desenvolveu, consegue diferenciar o que gosta de fazer daquilo que já faz com facilidade, e entende que habilidades podem continuar sendo desenvolvidas.',
                dica: 'Pense em uma habilidade que você já reconhece em si e pesquise em quais áreas profissionais ela costuma ser valorizada.'
            },
            media: {
                rotulo: 'Em desenvolvimento',
                texto: 'Você já reconhece algumas habilidades, mas ainda pode ter dificuldade em separar o que gosta de fazer do que faz com facilidade, ou não sabe exatamente onde essas capacidades poderiam ser úteis.',
                dica: 'Lembre de uma vez em que alguém disse "você é bom nisso" — o que você estava fazendo? Isso é uma pista importante.'
            },
            baixa: {
                rotulo: 'Vale atenção',
                texto: 'Reconhecer as próprias capacidades ainda é difícil neste momento. Isso pode acontecer quando faltam oportunidades de experimentar atividades diferentes, ou quando habilidade é associada apenas a notas escolares.',
                dica: 'Pergunte a duas pessoas que te conhecem bem: "o que você acha que eu faço bem?" e compare as respostas.'
            }
        }
    },

    /* ---- Dimensão 3: perguntas 9 a 12 (data-dimensao="valores") ---- */
    valores: {
        nome: 'Valores, Expectativas e Projeto de Vida',
        resumo: 'Que tipo de vida profissional você gostaria de construir.',
        aplicacaoAmpla: 'Saber o que você valoriza (estabilidade, autonomia, ajudar pessoas, criatividade...) funciona como um filtro em qualquer área — ajuda a escolher, entre várias profissões parecidas, a que combina com o estilo de vida que você quer.',
        tiers: {
            alta: {
                rotulo: 'Ponto forte',
                texto: 'Você já consegue identificar prioridades para o seu futuro trabalho, pensa além do salário, considera o estilo de vida ligado a cada profissão e começa a relacionar carreira com o projeto de vida que deseja.',
                dica: 'Escolha os três valores mais importantes para você (autonomia, estabilidade, criatividade, ajudar pessoas, entre outros) e explique por quê.'
            },
            media: {
                rotulo: 'Em desenvolvimento',
                texto: 'Algumas das suas prioridades já estão claras, mas outras ainda não. É possível que você conheça profissões interessantes sem ainda ter pensado no estilo de vida que elas exigem.',
                dica: 'Complete: "Eu gostaria de um trabalho que me permitisse ______" e "Eu teria dificuldade com um trabalho que exigisse ______".'
            },
            baixa: {
                rotulo: 'Vale atenção',
                texto: 'O futuro profissional ainda pode parecer distante, ou as ideias de sucesso podem estar muito ligadas ao que os outros esperam, sem que você tenha parado para pensar no que é importante para você.',
                dica: 'Imagine um bom dia de trabalho: sozinho ou com pessoas? Rotina previsível ou atividades variadas? Isso já diz muito sobre seus valores.'
            }
        }
    },

    /* ---- Dimensão 4: perguntas 13 a 16 (data-dimensao="influencias") ---- */
    influencias: {
        nome: 'Influências e Contexto da Escolha',
        resumo: 'Como família, amigos, escola e redes sociais participam da sua decisão.',
        aplicacaoAmpla: 'Conseguir separar sua vontade da expectativa das outras pessoas é útil na escolha de qualquer curso — é o que evita que você escolha (ou desista de) uma área só por pressão externa, em vez de por análise própria.',
        tiers: {
            alta: {
                rotulo: 'Ponto forte',
                texto: 'Você percebe como a família e o contexto ao seu redor influenciam suas ideias sobre profissões, consegue ouvir opiniões sem deixar que decidam por você e já questiona imagens idealizadas mostradas nas redes sociais.',
                dica: 'Separe: "eu gostaria", "minha família gostaria" e "as pessoas ao meu redor acham" — depois pergunte o que realmente faz sentido para você.'
            },
            media: {
                rotulo: 'Em desenvolvimento',
                texto: 'Você já reconhece algumas influências, mas ainda pode ter dificuldade em separar o que é seu desejo do que é expectativa das pessoas ao seu redor.',
                dica: 'Pense na profissão que mais chama sua atenção hoje: se ninguém pudesse elogiar ou criticar essa escolha, você continuaria interessado?'
            },
            baixa: {
                rotulo: 'Vale atenção',
                texto: 'As influências externas ainda podem estar pouco claras para você, o que pode levar a escolhas baseadas principalmente em status, salário ou no que aparece nas redes sociais.',
                dica: 'Escreva três frases sobre profissão que você costuma ouvir e pergunte: "eu realmente concordo com isso ou só ouvi essa ideia muitas vezes?".'
            }
        }
    },

    /* ---- Dimensão 5: perguntas 17 a 20 (data-dimensao="exploracao") ---- */
    exploracao: {
        nome: 'Exploração, Decisão e Planejamento Profissional',
        resumo: 'O quanto você já pesquisa, compara e planeja seus próximos passos.',
        aplicacaoAmpla: 'A capacidade de pesquisar, comparar e planejar próximos passos vale para qualquer curso — é a mesma habilidade que você vai usar depois para comparar vagas de estágio, especializações e áreas de atuação.',
        tiers: {
            alta: {
                rotulo: 'Ponto forte',
                texto: 'Você já busca conhecer diferentes profissões, procura fontes de informação confiáveis, compara alternativas e consegue transformar dúvidas em ações concretas de pesquisa.',
                dica: 'Escolha uma profissão de interesse e mapeie o que já sabe sobre formação, rotina e áreas de atuação — e o que ainda falta descobrir.'
            },
            media: {
                rotulo: 'Em desenvolvimento',
                texto: 'Você já pesquisou algumas profissões, mas as informações ainda podem ser superficiais, ou você pensa bastante sobre o assunto sem transformar isso em ações concretas.',
                dica: 'Escolha duas possibilidades e responda para cada uma: "o que eu gosto nela?" e "o que eu ainda não sei sobre ela?".'
            },
            baixa: {
                rotulo: 'Vale atenção',
                texto: 'A exploração de profissões ainda está no começo. Isso pode acontecer por não saber por onde começar, por conhecer apenas profissões mais populares, ou por adiar o tema por sentir confusão em relação a ele.',
                dica: 'Escolha uma única ação para esta semana: pesquisar um curso, conhecer uma universidade ou conversar com um profissional da área.'
            }
        }
    }
};

/* ---------------------------------------------------------------------
   faixaPontuacaoVocacional(pontuacao)
   -----------------------------------------------------------------
   Recebe a SOMA de pontos de uma dimensão (cada dimensão tem 4
   perguntas, cada uma valendo de 1 a 5 pontos — então a soma mínima
   possível é 4 e a máxima é 20) e devolve uma string indicando em
   qual faixa essa soma se encaixa: 'baixa', 'media' ou 'alta'.

   As faixas de corte foram definidas assim:
     - pontuação até 10  -> 'baixa'
     - pontuação até 15  -> 'media'
     - qualquer coisa acima de 15 (ou seja, 16 a 20) -> 'alta'

   Essa string devolvida é justamente a chave usada para buscar o
   texto certo dentro de "tiers" no objeto DIMENSOES_VOCACIONAL acima
   (ex: DIMENSOES_VOCACIONAL.interesses.tiers['media']).
--------------------------------------------------------------------- */
function faixaPontuacaoVocacional(pontuacao) {
    if (pontuacao <= 10) return 'baixa';
    if (pontuacao <= 15) return 'media';
    return 'alta';
}
