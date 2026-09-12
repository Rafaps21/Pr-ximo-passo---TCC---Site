// ==========================================================
// LOGIN MOCK — validação 100% no navegador, sem back-end real
// ==========================================================
// ATENÇÃO: isso é só para fins de demonstração/TCC.
// Qualquer pessoa pode abrir o "Inspecionar elemento" e ver
// esses usuários e senhas. Isso NÃO é seguro para produção.
// ==========================================================

// Usuários de teste (baseados nos alunos do seu banco de dados).
// Ajuste nomes, e-mails e senhas como quiser.
const USUARIOS = [
    { nome: 'Ana Souza',     email: 'ana@unb.br',     senha: '123456' },
    { nome: 'Carlos Silva',  email: 'carlos@unb.br',  senha: '123456' },
    { nome: 'Mariana Lima',  email: 'mariana@unb.br', senha: '123456' },
    { nome: 'Pedro Santos',  email: 'pedro@unb.br',   senha: '123456' },
];

const CHAVE_STORAGE = 'usuariosCadastrados';

function obterUsuariosCadastrados() {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
}

const form = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');
const mensagemErro = document.getElementById('mensagem-erro');

// Se veio da tela de cadastro com sucesso, preenche o e-mail e avisa
const parametros = new URLSearchParams(window.location.search);
if (parametros.get('cadastro') === 'sucesso') {
    const emailCadastrado = parametros.get('email');
    if (emailCadastrado) inputEmail.value = emailCadastrado;
    mostrarErro('Cadastro realizado! Faça login para continuar.');
    mensagemErro.classList.add('mensagem-sucesso');
}

form.addEventListener('submit', function (evento) {
    evento.preventDefault(); // impede o recarregamento da página

    const email = inputEmail.value.trim().toLowerCase();
    const senha = inputSenha.value;

    const todosUsuarios = USUARIOS.concat(obterUsuariosCadastrados());

    const usuarioEncontrado = todosUsuarios.find(
        (usuario) => usuario.email.toLowerCase() === email && usuario.senha === senha
    );

    if (usuarioEncontrado) {
        // Guarda quem está logado para as outras páginas poderem usar (opcional)
        sessionStorage.setItem('usuarioLogado', JSON.stringify({
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email,
        }));

        // Leva para a página inicial real do site
        window.location.href = 'inicio.html';
    } else {
        mostrarErro('E-mail ou senha incorretos.');
    }
});

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.style.display = 'block';
}

// Limpa a mensagem de erro assim que o usuário começa a corrigir os campos
[inputEmail, inputSenha].forEach((campo) => {
    campo.addEventListener('input', () => {
        mensagemErro.textContent = '';
        mensagemErro.style.display = 'none';
        mensagemErro.classList.remove('mensagem-sucesso');
    });
});
