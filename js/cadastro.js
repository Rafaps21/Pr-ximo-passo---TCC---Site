// ==========================================================
// CADASTRO MOCK — salva o usuário no localStorage do navegador
// ==========================================================
// ATENÇÃO: assim como o login, isso é só para demonstração.
// Os dados ficam salvos só nesse navegador/computador (não em
// um banco de dados de verdade), e a senha fica em texto puro,
// visível para quem inspecionar o navegador. Não é seguro para
// um sistema real.
// ==========================================================

const CHAVE_STORAGE = 'usuariosCadastrados';

const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');
const inputConfirmarSenha = document.getElementById('confirmar-senha');
const mensagemErro = document.getElementById('mensagem-erro');

function obterUsuariosCadastrados() {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
}

function salvarUsuarioCadastrado(usuario) {
    const usuarios = obterUsuariosCadastrados();
    usuarios.push(usuario);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarios));
}

form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim().toLowerCase();
    const senha = inputSenha.value;
    const confirmarSenha = inputConfirmarSenha.value;

    if (senha !== confirmarSenha) {
        mostrarErro('As senhas não coincidem.');
        return;
    }

    const usuariosCadastrados = obterUsuariosCadastrados();
    const emailJaExiste = usuariosCadastrados.some(
        (usuario) => usuario.email.toLowerCase() === email
    );

    if (emailJaExiste) {
        mostrarErro('Já existe uma conta cadastrada com esse e-mail.');
        return;
    }

    salvarUsuarioCadastrado({ nome, email, senha });

    // Manda de volta para o login já com o e-mail preenchido
    window.location.href = 'index.html?cadastro=sucesso&email=' + encodeURIComponent(email);
});

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.style.display = 'block';
}

[inputNome, inputEmail, inputSenha, inputConfirmarSenha].forEach((campo) => {
    campo.addEventListener('input', () => {
        mensagemErro.textContent = '';
        mensagemErro.style.display = 'none';
    });
});
