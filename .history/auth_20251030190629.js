// auth.js - Lógica de autenticação frontend
const API_URL = 'http://localhost:3000/api';

// Elementos do DOM - Login
const formLogin = document.getElementById('formLogin');
const emailLogin = document.getElementById('emailLogin');
const senhaLogin = document.getElementById('senhaLogin');

// Elementos do DOM - Cadastro
const telaCadastro = document.getElementById('telaCadastro');
const telaVerificacao = document.getElementById('telaVerificacao');
const formCadastro = document.getElementById('formCadastro');
const formVerificarCadastro = document.getElementById('formVerificarCadastro');
const emailCadastrado = document.getElementById('emailCadastrado');

// Loading overlay
const loadingOverlay = document.getElementById('loadingOverlay');

// Variável para armazenar email temporariamente
let emailAtual = '';

// ==================== FUNÇÕES AUXILIARES ====================

function mostrarLoading() {
    loadingOverlay.classList.add('active');
}

function esconderLoading() {
    loadingOverlay.classList.remove('active');
}

function mostrarAlerta(tipo, mensagem, container) {
    const alertaExistente = container.querySelector('.alert');
    if (alertaExistente) {
        alertaExistente.remove();
    }

    const icones = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.innerHTML = `
        <i class="fas ${icones[tipo]}"></i>
        <span>${mensagem}</span>
    `;

    container.insertBefore(alerta, container.firstChild);

    if (tipo === 'success') {
        setTimeout(() => alerta.remove(), 5000);
    }
}

function trocarTela(telaAtual, proximaTela) {
    telaAtual.classList.remove('active');
    proximaTela.classList.add('active');
}

// ==================== LOGIN ====================

// Solicitar código OTP para login
if (formSolicitarOTP) {
    formSolicitarOTP.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailLogin.value.trim();
        emailAtual = email;

        mostrarLoading();

        try {
            const response = await fetch(`${API_URL}/auth/login/solicitar-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                emailExibicao.textContent = email;
                trocarTela(telaEmail, telaOTP);
                mostrarAlerta('success', 'Código enviado para seu email!', telaOTP);
            } else {
                mostrarAlerta('error', data.mensagem || 'Erro ao enviar código', telaEmail);
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', telaEmail);
        } finally {
            esconderLoading();
        }
    });
}

// Verificar código OTP e fazer login
if (formVerificarOTP) {
    formVerificarOTP.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const codigo = codigoOTP.value.trim();

        if (!/^\d{6}$/.test(codigo)) {
            mostrarAlerta('error', 'O código deve conter 6 dígitos', telaOTP);
            return;
        }

        mostrarLoading();

        try {
            const response = await fetch(`${API_URL}/auth/login/verificar-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: emailAtual, 
                    codigo 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                mostrarAlerta('success', 'Login realizado com sucesso!', telaOTP);

                // Redirecionar após 1 segundo
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                mostrarAlerta('error', data.mensagem || 'Código inválido ou expirado', telaOTP);
                codigoOTP.value = '';
                codigoOTP.focus();
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', telaOTP);
        } finally {
            esconderLoading();
        }
    });
}

// Reenviar código OTP
function reenviarOTP() {
    mostrarLoading();

    fetch(`${API_URL}/auth/reenviar-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: emailAtual, 
            tipo: 'login' 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            mostrarAlerta('success', 'Novo código enviado!', telaOTP);
        } else {
            mostrarAlerta('error', data.mensagem || 'Erro ao reenviar código', telaOTP);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarAlerta('error', 'Erro de conexão com o servidor', telaOTP);
    })
    .finally(() => {
        esconderLoading();
    });
}

// Voltar para tela de email
function voltarParaEmail() {
    trocarTela(telaOTP, telaEmail);
    codigoOTP.value = '';
}

// ==================== CADASTRO ====================

if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validações
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const telefone = document.getElementById('telefone').value.trim();
        const dataNascimento = document.getElementById('dataNascimento').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;

        // Validar senhas
        if (senha !== confirmarSenha) {
            mostrarAlerta('error', 'As senhas não coincidem', telaCadastro);
            return;
        }

        if (senha.length < 6) {
            mostrarAlerta('error', 'A senha deve ter no mínimo 6 caracteres', telaCadastro);
            return;
        }

        emailAtual = email;
        mostrarLoading();

        try {
            const response = await fetch(`${API_URL}/auth/cadastrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    telefone: telefone || null,
                    data_nascimento: dataNascimento || null,
                    tipo_usuario: tipoUsuario
                })
            });

            const data = await response.json();

            if (response.ok) {
                emailCadastrado.textContent = email;
                trocarTela(telaCadastro, telaVerificacao);
                mostrarAlerta('success', 'Cadastro realizado! Verifique seu email.', telaVerificacao);
            } else {
                mostrarAlerta('error', data.mensagem || 'Erro ao criar conta', telaCadastro);
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', telaCadastro);
        } finally {
            esconderLoading();
        }
    });
}

// Verificar email após cadastro
if (formVerificarCadastro) {
    formVerificarCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = document.getElementById('codigoVerificacao').value.trim();

        if (!/^\d{6}$/.test(codigo)) {
            mostrarAlerta('error', 'O código deve conter 6 dígitos', telaVerificacao);
            return;
        }

        mostrarLoading();

        try {
            const response = await fetch(`${API_URL}/auth/verificar-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: emailAtual, 
                    codigo 
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarAlerta('success', 'Email verificado! Redirecionando...', telaVerificacao);

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                mostrarAlerta('error', data.mensagem || 'Código inválido ou expirado', telaVerificacao);
                document.getElementById('codigoVerificacao').value = '';
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', telaVerificacao);
        } finally {
            esconderLoading();
        }
    });
}

// Reenviar código de verificação de cadastro
function reenviarCodigoCadastro() {
    mostrarLoading();

    fetch(`${API_URL}/auth/reenviar-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: emailAtual, 
            tipo: 'verificacao' 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            mostrarAlerta('success', 'Novo código enviado!', telaVerificacao);
        } else {
            mostrarAlerta('error', data.mensagem || 'Erro ao reenviar código', telaVerificacao);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarAlerta('error', 'Erro de conexão com o servidor', telaVerificacao);
    })
    .finally(() => {
        esconderLoading();
    });
}

// Voltar para formulário de cadastro
function voltarParaCadastro() {
    trocarTela(telaVerificacao, telaCadastro);
    document.getElementById('codigoVerificacao').value = '';
}

// ==================== FORMATAÇÃO DE TELEFONE ====================
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 10) {
            e.target.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            e.target.value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            e.target.value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            e.target.value = value;
        }
    });
}
