/* ===================================================================
   ARQUIVO: js/dados.js
   -------------------------------------------------------------------
   Este é o arquivo "central de dados" do site. Ele guarda a lista de
   cursos e um punhado de funções que várias páginas usam em conjunto
   (cursos.html, comparacao.html, resultado.html, perfil.html).

   A ideia de deixar tudo isso em um único arquivo é: se um dia vocês
   ligarem numa API/banco de dados de verdade, só este arquivo precisa
   mudar. As outras páginas nunca mexem direto no array de cursos —
   elas sempre passam pelas funções daqui (carregarCursos, getCursoPorId,
   renderCursoCard, etc). Isso é uma forma simples de "separar dados
   da interface".
=================================================================== */

/* -------------------------------------------------------------------
   VARIÁVEL GLOBAL "CURSOS"
   -------------------------------------------------------------------
   Começa como um array vazio. Ela só é preenchida depois que alguém
   chama e "espera" (await) a função carregarCursos() lá embaixo.
   Como é declarada com "let" (e não "const"), seu conteúdo pode ser
   trocado depois — é exatamente isso que carregarCursos() faz.

   IMPORTANTE: como esse arquivo não usa "export/import" (é um <script>
   comum, carregado com <script src="js/dados.js">), essa variável e
   todas as funções abaixo ficam disponíveis globalmente para qualquer
   outro script carregado DEPOIS dele na mesma página (por isso a ordem
   das tags <script> no HTML importa: dados.js sempre vem antes dos
   scripts de cada página específica). */
let CURSOS = [];

/* ---------------------------------------------------------------------
   CURSOS_MOCK - DADOS FALSOS/TEMPORÁRIOS ("mock" = simulação)
   -----------------------------------------------------------------
   Este array é a "base de dados" fake usada enquanto não existe um
   banco de dados ou uma API de verdade por trás do site. Cada objeto
   dentro do array representa UM curso, sempre com os mesmos campos
   (nome, area, cargaHoraria, salario, etc). Manter os mesmos nomes de
   campo em todos os cursos é o que permite que o resto do código
   (renderCursoCard, comparação, etc.) funcione igual para qualquer um
   deles, sem precisar de "if" especial para cada curso.

   Quando a API real estiver pronta, basta apagar este array e fazer
   a função carregarCursos() (mais abaixo) buscar os dados de verdade,
   desde que os campos tenham os mesmos nomes usados aqui.
--------------------------------------------------------------------- */
const CURSOS_MOCK = [
    {
        id: 'ads',                                    // identificador único do curso (usado nos <select>, nos favoritos, na URL de comparação, etc.)
        nome: 'Análise e Desenvolvimento de Sistemas', // nome completo exibido nos cards
        area: 'Tecnologia',                            // área usada para filtrar/recomendar cursos (bate com os checkboxes do quiz)
        cargaHoraria: '2.400 horas',
        salario: 'R$ 5.500,00',
        empregabilidade: '92%',                        // string com "%" — quando precisa comparar numericamente, o código converte com parseInt (veja empregabilidadeNumero em pagina-resultado.js)
        perfil: 'Atua no desenvolvimento de sistemas, banco de dados e infraestrutura de TI.',
        publicas: 'IFB',                                // instituições públicas onde cursar (texto livre, pode ter mais de uma separada por vírgula)
        privadas: 'UniCEUB, UCB',
        duracao: '2,5 a 3 anos',
        grade: 'Lógica de Programação, Estrutura de Dados, Engenharia de Requisitos',
        mensalidade: 'R$ 450,00 a R$ 800,00'
    },
    {
        id: 'cc',
        nome: 'Ciência da Computação',
        area: 'Tecnologia',
        cargaHoraria: '3.200 horas',
        salario: 'R$ 6.800,00',
        empregabilidade: '90%',
        perfil: 'Atua no desenvolvimento de sistemas, segurança da informação e inteligência artificial.',
        publicas: 'UnB',
        privadas: 'UniCEUB, IESB',
        duracao: '4 anos',
        grade: 'Algoritmos Complexos, Teoria da Computação, Inteligência Artificial',
        mensalidade: 'R$ 850,00 a R$ 1.400,00'
    },
    {
        id: 'es',
        nome: 'Engenharia de Software',
        area: 'Tecnologia',
        cargaHoraria: '3.600 horas',
        salario: 'R$ 7.200,00',
        empregabilidade: '89%',
        perfil: 'Projeta, desenvolve e mantém sistemas de software em larga escala.',
        publicas: 'UnB, FGA',
        privadas: 'IESB, Católica',
        duracao: '4 a 5 anos',
        grade: 'Arquitetura de Software, Qualidade de Software, Cálculo I e II',
        mensalidade: 'R$ 900,00 a R$ 1.600,00'
    },
    {
        id: 'redes',
        nome: 'Redes de Computadores',
        area: 'Tecnologia',
        cargaHoraria: '2.200 horas',
        salario: 'R$ 4.800,00',
        empregabilidade: '85%',
        perfil: 'Projeta, instala e mantém redes de comunicação e infraestrutura de TI.',
        publicas: 'IFB',
        privadas: 'Projeção, UCB',
        duracao: '2,5 anos',
        grade: 'Roteamento, Segurança de Redes, Infraestrutura Cloud, Sistemas Operacionais',
        mensalidade: 'R$ 400,00 a R$ 700,00'
    },
    {
        id: 'direito',
        nome: 'Direito',
        area: 'Humanas',
        cargaHoraria: '3.700 horas',
        salario: 'R$ 6.000,00',
        empregabilidade: '78%',
        perfil: 'Atua em advocacia, magistratura, órgãos públicos e consultoria jurídica.',
        publicas: 'UnB',
        privadas: 'UniCEUB, Católica, IESB',
        duracao: '5 anos',
        grade: 'Direito Civil, Direito Constitucional, Processo Penal',
        mensalidade: 'R$ 1.100,00 a R$ 2.200,00'
    },
    {
        id: 'medicina',
        nome: 'Medicina',
        area: 'Saúde',
        cargaHoraria: '8.000 horas',
        salario: 'R$ 12.000,00',
        empregabilidade: '96%',
        perfil: 'Diagnostica, trata e previne doenças em hospitais, clínicas e consultórios.',
        publicas: 'UnB, ESCS',
        privadas: 'UniCEUB, UNIP',
        duracao: '6 anos',
        grade: 'Anatomia, Fisiologia, Clínica Médica, Internato',
        mensalidade: 'R$ 8.000,00 a R$ 12.000,00'
    },
    {
        id: 'bio',
        nome: 'Ciências Biológicas',
        area: 'Biológicas',
        cargaHoraria: '3.200 horas',
        salario: 'R$ 4.200,00',
        empregabilidade: '75%',
        perfil: 'Pesquisa, ensino e preservação ambiental, laboratórios e áreas de conservação.',
        publicas: 'UnB',
        privadas: 'UniCEUB, Projeção',
        duracao: '4 anos',
        grade: 'Botânica, Zoologia, Ecologia, Genética',
        mensalidade: 'R$ 600,00 a R$ 1.000,00'
    },
    {
        id: 'civil',
        nome: 'Engenharia Civil',
        area: 'Exatas',
        cargaHoraria: '4.000 horas',
        salario: 'R$ 7.500,00',
        empregabilidade: '81%',
        perfil: 'Planeja, projeta e supervisiona obras de construção civil e infraestrutura.',
        publicas: 'UnB',
        privadas: 'UniCEUB, IESB',
        duracao: '5 anos',
        grade: 'Estruturas, Materiais de Construção, Topografia, Hidráulica',
        mensalidade: 'R$ 900,00 a R$ 1.500,00'
    },
    {
        id: 'psico',
        nome: 'Psicologia',
        area: 'Humanas',
        cargaHoraria: '4.000 horas',
        salario: 'R$ 4.500,00',
        empregabilidade: '80%',
        perfil: 'Atua em clínicas, escolas, empresas e hospitais promovendo saúde mental.',
        publicas: 'UnB',
        privadas: 'UniCEUB, Católica',
        duracao: '5 anos',
        grade: 'Psicologia do Desenvolvimento, Psicopatologia, Neurociência',
        mensalidade: 'R$ 900,00 a R$ 1.600,00'
    },
    {
        id: 'design',
        nome: 'Design Gráfico',
        area: 'Criativas',
        cargaHoraria: '2.800 horas',
        salario: 'R$ 3.800,00',
        empregabilidade: '72%',
        perfil: 'Cria identidades visuais, peças publicitárias e materiais digitais.',
        publicas: 'IFB',
        privadas: 'UniCEUB, Projeção',
        duracao: '4 anos',
        grade: 'Tipografia, Design Digital, Ilustração, Branding',
        mensalidade: 'R$ 500,00 a R$ 900,00'
    }
];

/* ---------------------------------------------------------------------
   carregarCursos()
   -----------------------------------------------------------------
   Função "assíncrona" (async) que finge buscar os cursos de um
   servidor. Toda página que precisa da lista de cursos chama:

       await carregarCursos();

   e só depois disso usa a variável global CURSOS.

   Por que existe o "await new Promise(...)" com setTimeout?
   -> É só para SIMULAR o tempo de espera de uma requisição de rede de
      verdade (por isso o comentário "simula o tempo de uma requisição
      real de rede"). Sem isso, os dados apareceriam instantaneamente,
      o que esconderia bugs que só aparecem quando existe demora real
      (por isso as páginas mostram "Carregando..." enquanto esperam).

   Quando o banco de dados de verdade existir, essa função pode virar,
   por exemplo:

       async function carregarCursos() {
           const resposta = await fetch('https://sua-api.com/cursos');
           CURSOS = await resposta.json();
           return CURSOS;
       }

   E nada mais no site precisa mudar, desde que a API devolva objetos
   com os mesmos campos do CURSOS_MOCK.
--------------------------------------------------------------------- */
async function carregarCursos() {
    // Cria uma Promise que só "resolve" (libera a execução) depois de
    // 150 milissegundos. O "await" pausa a função aqui até isso acontecer.
    await new Promise(resolve => setTimeout(resolve, 150));

    // "Preenche" a variável global CURSOS com os dados mock.
    CURSOS = CURSOS_MOCK;

    // Devolve os cursos também como retorno da função, caso algum
    // código queira usar o valor diretamente (ex: const c = await carregarCursos()).
    return CURSOS;
}

/* -------------------------------------------------------------------
   CHAVES USADAS NO localStorage DO NAVEGADOR
   -------------------------------------------------------------------
   O localStorage é uma espécie de "banco de dados" bem simples que
   fica salvo no navegador da própria pessoa (não vai para nenhum
   servidor). Cada informação é salva como um par chave -> valor
   (sempre em formato texto). Aqui definimos os "nomes" (chaves) que
   o site usa para não espalhar strings soltas pelo código e correr o
   risco de digitar errado em algum lugar.

   FAVORITOS_KEY         -> lista de ids de cursos favoritados
   PERFIL_NOME_KEY        -> nome que a pessoa digitou na página de perfil
   COMPARAR_INICIAL_KEY   -> id do curso escolhido em "Comparar Este",
                             para pré-preencher a página de comparação
------------------------------------------------------------------- */
const FAVORITOS_KEY = 'pp_favoritos';
const PERFIL_NOME_KEY = 'pp_perfil_nome';
const COMPARAR_INICIAL_KEY = 'pp_comparar_inicial';

/* Procura, dentro do array CURSOS, o curso cujo campo "id" bate com o
   id recebido. Array.prototype.find() percorre o array e devolve o
   PRIMEIRO elemento que satisfizer a condição — ou "undefined" se
   nenhum bater. Usado sempre que uma página só tem o id salvo (ex:
   veio do localStorage ou de um <select>) e precisa dos dados completos. */
function getCursoPorId(id) {
    return CURSOS.find(c => c.id === id);
}

/* -------------------------------------------------------------------
   getFavoritos()
   -------------------------------------------------------------------
   Lê a lista de ids favoritados salva no localStorage.
   Como o localStorage só guarda texto, os favoritos são salvos como
   uma string em formato JSON (ex: '["ads","medicina"]') e aqui a
   função faz o caminho inverso com JSON.parse() para transformar essa
   string de volta em um array de verdade.

   O try/catch existe para o caso de o valor salvo estar corrompido ou
   não existir ainda (localStorage.getItem devolve null na primeira
   visita) — nesses casos, devolve um array vazio em vez de quebrar o
   site. */
function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

/* Verifica se um curso específico (pelo id) já está entre os
   favoritos. Usa o método Array.includes(), que devolve true/false. */
function isFavorito(id) {
    return getFavoritos().includes(id);
}

/* -------------------------------------------------------------------
   toggleFavorito(id)
   -------------------------------------------------------------------
   "Alterna" o estado de favorito de um curso: se já estava
   favoritado, remove; se não estava, adiciona. Essa é a função
   chamada quando a pessoa clica na estrela (☆ / ★) de um card.

   Passo a passo:
   1. Pega a lista atual de favoritos.
   2. Se o id já está na lista -> filtra ele para FORA (ou seja, cria
      uma nova lista sem esse id).
      Se não está -> usa push() para adicionar o id ao final da lista.
   3. Salva a lista atualizada de volta no localStorage, sempre
      convertendo o array para string com JSON.stringify (o processo
      inverso do JSON.parse usado em getFavoritos).
   4. Dispara um evento customizado 'favoritos-atualizados' no
      "document" inteiro. Isso serve para AVISAR outras partes do
      código (por exemplo, a página de perfil, que fica "escutando"
      esse evento) de que a lista mudou, sem que essas partes
      precisem ficar checando o localStorage toda hora.
   5. Devolve true/false indicando se o curso ESTÁ favoritado agora
      (depois da mudança), para quem chamou a função já saber como
      atualizar o botão na tela. */
function toggleFavorito(id) {
    let favoritos = getFavoritos();
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
    document.dispatchEvent(new CustomEvent('favoritos-atualizados'));
    return favoritos.includes(id);
}

/* -------------------------------------------------------------------
   renderCursoCard(curso)
   -------------------------------------------------------------------
   Recebe UM objeto de curso (com os campos vistos no CURSOS_MOCK) e
   devolve uma STRING de HTML pronta para ser inserida na página — é
   o "card" visual de um curso, usado em cursos.html, resultado.html e
   perfil.html.

   Isso é chamado de "template string" / "template literal": usar
   crase (`) em vez de aspas normais permite escrever HTML de várias
   linhas e inserir valores de variáveis dentro de ${...}.

   Se "curso" vier vazio/indefinido (por segurança), devolve uma
   string vazia em vez de quebrar com erro.

   O botão de favoritar já nasce marcado (classe "ativo" e ícone ★)
   se esse curso já estiver nos favoritos — por isso a função chama
   isFavorito(curso.id) logo no início. */
function renderCursoCard(curso) {
    if (!curso) return '';
    const favoritado = isFavorito(curso.id);
    return `
    <div class="card curso-card" data-id="${curso.id}">
        <button class="favoritar-btn ${favoritado ? 'ativo' : ''}" data-id="${curso.id}" title="Favoritar curso" aria-pressed="${favoritado}">${favoritado ? '★' : '☆'}</button>
        <h3 class="curso-nome">${curso.nome}</h3>
        <span class="tag-area">${curso.area}</span>
        <div class="dados-banco">
            <p class="detalhe-curso"><strong>⏱️ Carga Horária:</strong> <span class="dado-dinamico">${curso.cargaHoraria}</span></p>
            <p class="detalhe-curso"><strong>💰 Salário Médio:</strong> <span class="dado-dinamico">${curso.salario}</span></p>
            <p class="detalhe-curso"><strong>📈 Empregabilidade:</strong> <span class="dado-dinamico">${curso.empregabilidade}</span></p>
            <p class="detalhe-curso"><strong>💼 Perfil Profissional:</strong> <span class="dado-dinamico">${curso.perfil}</span></p>
        </div>
        <div class="faculdades-container">
            <h4>🏛️ Instituições Recomendadas:</h4>
            <p class="faculdade-item"><strong>Públicas:</strong> <span class="dado-dinamico">${curso.publicas}</span></p>
            <p class="faculdade-item"><strong>Privadas:</strong> <span class="dado-dinamico">${curso.privadas}</span></p>
        </div>
        <br>
        <a href="comparacao.html" class="btn-card btn-comparar-este" data-id="${curso.id}">Comparar Este</a>
    </div>`;
}

/* -------------------------------------------------------------------
   ativarBotoesFavoritar(container)
   -------------------------------------------------------------------
   renderCursoCard() só cria o HTML (texto) do botão de favoritar —
   HTML sozinho não tem "comportamento". Esta função é quem realmente
   liga o clique: ela recebe um elemento pai (container, por exemplo
   a grid onde os cards foram inseridos) e, para CADA botão
   ".favoritar-btn" encontrado dentro dele, registra um "ouvinte" de
   clique (addEventListener).

   Precisa ser chamada TODA VEZ que novos cards são inseridos no HTML
   (via innerHTML), porque inserir HTML como texto não traz os
   "eventos" junto — por isso cada página que desenha cards chama
   ativarBotoesFavoritar() logo depois de montar o innerHTML.

   Dentro do clique:
   - e.preventDefault() evita que o clique dispare qualquer
     comportamento padrão do botão (como recarregar a página, caso
     estivesse dentro de um <form>).
   - Lê o id do curso a partir do atributo data-id do próprio botão.
   - Chama toggleFavorito(id), que já devolve se ficou favoritado ou não.
   - Atualiza visualmente o próprio botão (classe "ativo", o símbolo
     ★/☆ e o atributo de acessibilidade aria-pressed) sem precisar
     redesenhar o card inteiro. */
function ativarBotoesFavoritar(container) {
    container.querySelectorAll('.favoritar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const ativo = toggleFavorito(id);
            btn.classList.toggle('ativo', ativo);
            btn.textContent = ativo ? '★' : '☆';
            btn.setAttribute('aria-pressed', String(ativo));
        });
    });
}

/* -------------------------------------------------------------------
   ativarBotoesComparar(container)
   -------------------------------------------------------------------
   Liga o comportamento do link/botão "Comparar Este" que aparece em
   cada card. Esse botão já é um <a href="comparacao.html">, então ele
   naturalmente LEVA a pessoa para a página de comparação — o que esta
   função faz é, ANTES de sair da página, guardar no localStorage qual
   curso deve vir pré-selecionado quando comparacao.html carregar (o
   pagina-comparacao.js lê essa chave e preenche o primeiro <select>
   automaticamente). */
function ativarBotoesComparar(container) {
    container.querySelectorAll('.btn-comparar-este').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem(COMPARAR_INICIAL_KEY, btn.getAttribute('data-id'));
        });
    });
}
