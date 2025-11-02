// esqueci-senha.js - Lógica de recuperação de senha

const API_URL = 'http://localhost:3000/api';
let emailUsuario = '';
let codigoValidado = '';

// Elementos do DOM
const formSolicitarCodigo = document.getElementById('formSolicitarCodigo');
const formDigitarCodigo = document.getElementById('formDigitarCodigo');
const formNovaSenha = document.getElementById('formNovaSenha');
const formSucesso = document.getElementById('formSucesso');
const loadingOverlay = document.getElementById('loadingOverlay');

// Debug: verificar se elementos foram encontrados
console.log('Elementos carregados:', {
    formSolicitarCodigo: !!formSolicitarCodigo,
    formDigitarCodigo: !!formDigitarCodigo,
    formNovaSenha: !!formNovaSenha,
    formSucesso: !!formSucesso
});

// Etapa 1: Solicitar código
document.getElementById('formEmail').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('emailRecuperacao').value;
    
    if (!email) {
        mostrarAlerta('Por favor, digite seu email', 'error');
        return;
    }

    mostrarLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/esqueci-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        mostrarLoading(false);

        console.log('Resposta do servidor:', data);

        if (data.sucesso) {
            emailUsuario = email;
            document.getElementById('emailEnviado').textContent = email;
            
            console.log('Trocando para etapa 2...');
            
            // Trocar para etapa 2 (digitar código)
            formSolicitarCodigo.classList.remove('active');
            formDigitarCodigo.classList.add('active');
            
            console.log('Classes atualizadas. formDigitarCodigo ativo:', formDigitarCodigo.classList.contains('active'));
            
            mostrarAlerta('Código enviado para seu email!', 'success');
        } else {
            mostrarAlerta(data.mensagem || 'Erro ao enviar código', 'error');
        }

    } catch (error) {
        mostrarLoading(false);
        console.error('Erro:', error);
        mostrarAlerta('Erro ao processar solicitação', 'error');
    }
});

// Etapa 2: Validar código
document.getElementById('formValidarCodigo').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codigo = document.getElementById('codigoValidacao').value;
    
    if (!codigo || codigo.length !== 6) {
        mostrarAlerta('Digite o código de 6 dígitos', 'error');
        return;
    }

    // Salvar código para usar na etapa 3
    codigoValidado = codigo;
    
    // Trocar para etapa 3 (nova senha)
    formDigitarCodigo.classList.remove('active');
    formNovaSenha.classList.add('active');
    
    mostrarAlerta('Código validado! Defina sua nova senha', 'success');
});

// Etapa 3: Redefinir senha
document.getElementById('formRedefinir').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validações
    if (!novaSenha || novaSenha.length < 6) {
        mostrarAlerta('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarAlerta('As senhas não coincidem', 'error');
        return;
    }

    if (!codigoValidado) {
        mostrarAlerta('Código não foi validado. Volte e digite o código.', 'error');
        return;
    }

    mostrarLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/redefinir-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailUsuario,
                codigo: codigoValidado,
                novaSenha: novaSenha
            })
        });

        const data = await response.json();
        
        mostrarLoading(false);

        if (data.sucesso) {
            // Trocar para etapa 4 (sucesso)
            formNovaSenha.classList.remove('active');
            formSucesso.classList.add('active');
            
            // Fazer login automático após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarAlerta(data.mensagem || 'Erro ao redefinir senha', 'error');
        }

    } catch (error) {
        mostrarLoading(false);
        console.error('Erro:', error);
        mostrarAlerta('Erro ao processar solicitação', 'error');
    }
});

// Função para voltar para o formulário de email
function voltarParaEmail() {
    formDigitarCodigo.classList.remove('active');
    formSolicitarCodigo.classList.add('active');
    
    // Limpar campo
    document.getElementById('codigoValidacao').value = '';
}

// Função para voltar para digitar código
function voltarParaCodigo() {
    formNovaSenha.classList.remove('active');
    formDigitarCodigo.classList.add('active');
    
    // Limpar campos
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
}

// Função para reenviar código
async function reenviarCodigo() {
    if (!emailUsuario) {
        mostrarAlerta('Email não encontrado', 'error');
        return;
    }

    mostrarLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/esqueci-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailUsuario })
        });

        const data = await response.json();
        
        mostrarLoading(false);

        if (data.sucesso) {
            mostrarAlerta('Novo código enviado!', 'success');
            
            // Limpar campo do código
            document.getElementById('codigoValidacao').value = '';
        } else {
            mostrarAlerta(data.mensagem || 'Erro ao reenviar código', 'error');
        }

    } catch (error) {
        mostrarLoading(false);
        console.error('Erro:', error);
        mostrarAlerta('Erro ao processar solicitação', 'error');
    }
}

// Auto-format código OTP (apenas números)
document.getElementById('codigoValidacao').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Função para mostrar loading
function mostrarLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Função para mostrar alertas
function mostrarAlerta(mensagem, tipo = 'info') {
    // Remover alertas anteriores
    const alertasAntigos = document.querySelectorAll('.alert');
    alertasAntigos.forEach(alerta => alerta.remove());

    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    
    const icon = tipo === 'success' ? 'check-circle' : 
                 tipo === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    alerta.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${mensagem}</span>
    `;

    // Inserir no formulário ativo
    const formAtivo = document.querySelector('.auth-form.active form') || 
                     document.querySelector('.auth-form.active');
    
    if (formAtivo) {
        formAtivo.insertBefore(alerta, formAtivo.firstChild);
    }

    // Remover após 5 segundos
    setTimeout(() => {
        alerta.remove();
    }, 5000);
}

// Verificar se já está logado
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}
