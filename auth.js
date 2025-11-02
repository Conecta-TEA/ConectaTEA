// auth.js - Lógica de autenticação frontend
const API_URL = 'http://localhost:3000/api';

// Elementos do DOM - Login
const formLogin = document.getElementById('formLogin');
const emailLogin = document.getElementById('emailLogin');
const senhaLogin = document.getElementById('senhaLogin');

// Elementos do DOM - Cadastro
const formCadastro = document.getElementById('formCadastro');

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

// Login direto com email e senha
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailLogin.value.trim();
        const senha = senhaLogin.value;

        if (!email || !senha) {
            mostrarAlerta('error', 'Preencha email e senha', document.querySelector('#formLogin').parentElement);
            return;
        }

        mostrarLoading();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                // Marcar para mostrar boas-vindas
                sessionStorage.setItem('mostrarWelcome', 'true');

                mostrarAlerta('success', 'Login realizado com sucesso!', document.querySelector('#formLogin').parentElement);

                // Redirecionar após 1 segundo
                setTimeout(() => {
                    // Verificar se há redirecionamento específico ou usar o tipo de usuário
                    const usuario = data.usuario;
                    if (data.redirecionamento) {
                        window.location.href = data.redirecionamento;
                    } else if (usuario && usuario.tipo_usuario === 'especialista') {
                        window.location.href = 'especialista-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                mostrarAlerta('error', data.mensagem || 'Email ou senha incorretos', document.querySelector('#formLogin').parentElement);
                senhaLogin.value = '';
                senhaLogin.focus();
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', document.querySelector('#formLogin').parentElement);
        } finally {
            esconderLoading();
        }
    });
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

        const formContainer = document.querySelector('#telaCadastro') || document.querySelector('#formCadastro').parentElement;

        // Validar senhas
        if (senha !== confirmarSenha) {
            mostrarAlerta('error', 'As senhas não coincidem', formContainer);
            return;
        }

        if (senha.length < 6) {
            mostrarAlerta('error', 'A senha deve ter no mínimo 6 caracteres', formContainer);
            return;
        }

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
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                // Marcar para mostrar boas-vindas (primeira vez)
                sessionStorage.setItem('mostrarWelcome', 'true');

                mostrarAlerta('success', 'Cadastro realizado com sucesso! Redirecionando...', formContainer);

                // Redirecionar após 1 segundo
                setTimeout(() => {
                    // Verificar se há redirecionamento específico ou usar o tipo de usuário
                    const usuario = data.usuario;
                    if (data.redirecionamento) {
                        window.location.href = data.redirecionamento;
                    } else if (usuario && usuario.tipo_usuario === 'especialista') {
                        window.location.href = 'especialista-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                mostrarAlerta('error', data.mensagem || 'Erro ao criar conta', formContainer);
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('error', 'Erro de conexão com o servidor', formContainer);
        } finally {
            esconderLoading();
        }
    });
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
