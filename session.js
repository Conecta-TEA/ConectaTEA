// session.js - Gerenciamento de sessão e autenticação global

const API_URL = 'http://localhost:3000/api';

// Verificar se o usuário está autenticado
function estaAutenticado() {
    return !!localStorage.getItem('token');
}

// Obter dados do usuário logado
function obterUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        try {
            return JSON.parse(usuarioStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Obter token de autenticação
function obterToken() {
    return localStorage.getItem('token');
}

// Fazer logout
async function logout() {
    const token = obterToken();
    
    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Fazer requisição autenticada
async function requisicaoAutenticada(url, options = {}) {
    const token = obterToken();
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Se o token for inválido, redirecionar para login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
        return null;
    }

    return response;
}

// Proteger página (requer login)
function protegerPagina() {
    if (!estaAutenticado()) {
        window.location.href = 'login.html';
    }
}

// Verificar se é admin
function ehAdmin() {
    const usuario = obterUsuario();
    return usuario && usuario.tipo_usuario === 'admin';
}

// Verificar se é especialista
function ehEspecialista() {
    const usuario = obterUsuario();
    return usuario && (usuario.tipo_usuario === 'especialista' || usuario.tipo_usuario === 'admin');
}

// Atualizar UI com informações do usuário
function atualizarUIUsuario() {
    if (!estaAutenticado()) {
        return;
    }

    const usuario = obterUsuario();
    if (!usuario) {
        return;
    }

    // Atualizar nome do usuário no header (se existir)
    const nomeUsuarioElements = document.querySelectorAll('.nome-usuario');
    nomeUsuarioElements.forEach(el => {
        el.textContent = usuario.nome;
    });

    // Atualizar foto de perfil (se existir)
    const fotoPerfilElements = document.querySelectorAll('.foto-perfil');
    fotoPerfilElements.forEach(el => {
        if (usuario.foto_perfil) {
            el.src = usuario.foto_perfil;
        } else {
            el.src = 'default-avatar.png';
        }
    });

    // Mostrar/ocultar opções admin
    if (ehAdmin()) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }

    // Mostrar/ocultar opções especialista
    if (ehEspecialista()) {
        document.querySelectorAll('.especialista-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// Adicionar botão de logout ao header
function adicionarBotaoLogout() {
    if (!estaAutenticado()) {
        return;
    }

    const nav = document.querySelector('nav ul');
    if (nav && !document.getElementById('btn-logout')) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.id = 'btn-logout';
        button.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        button.style.cssText = `
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        button.addEventListener('click', logout);
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 10px 30px rgba(220, 38, 38, 0.4)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
        
        li.appendChild(button);
        nav.appendChild(li);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    atualizarUIUsuario();
    adicionarBotaoLogout();
});

// Exportar funções
window.SessionManager = {
    estaAutenticado,
    obterUsuario,
    obterToken,
    logout,
    requisicaoAutenticada,
    protegerPagina,
    ehAdmin,
    ehEspecialista,
    atualizarUIUsuario,
    API_URL
};
