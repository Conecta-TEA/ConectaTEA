// chat.js - Chat em tempo real
const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000');

let usuarioAtual = null;
let conversaAtiva = null;
let digitandoTimeout = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        window.location.href = 'login.html';
        return;
    }

    usuarioAtual = usuario;
    document.getElementById('headerUserName').textContent = usuario.nome;

    // Conectar socket
    socket.emit('entrar', usuario.id);

    carregarConversas();
    configurarEventosSocket();
});

// ==================== SOCKET.IO ==================== 
function configurarEventosSocket() {
    // Nova mensagem recebida
    socket.on('nova-mensagem', (mensagem) => {
        if (conversaAtiva && mensagem.remetente_id == conversaAtiva.id) {
            adicionarMensagemNaLista(mensagem, false);
            socket.emit('marcar-lido', conversaAtiva.id);
        }
        atualizarConversaNaLista(mensagem);
    });

    // Mensagem enviada
    socket.on('mensagem-enviada', (mensagem) => {
        adicionarMensagemNaLista(mensagem, true);
        atualizarConversaNaLista(mensagem);
    });

    // Usuário digitando
    socket.on('usuario-digitando', (usuarioId) => {
        if (conversaAtiva && usuarioId == conversaAtiva.id) {
            mostrarIndicadorDigitacao();
        }
    });

    // Parou de digitar
    socket.on('usuario-parou-digitar', (usuarioId) => {
        if (conversaAtiva && usuarioId == conversaAtiva.id) {
            esconderIndicadorDigitacao();
        }
    });

    // Status online/offline
    socket.on('usuario-online', (usuarioId) => {
        atualizarStatusOnline(usuarioId, true);
    });

    socket.on('usuario-offline', (usuarioId) => {
        atualizarStatusOnline(usuarioId, false);
    });
}

// ==================== CONVERSAS ====================
async function carregarConversas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/conversas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            renderizarConversas(data.conversas);
        }
    } catch (error) {
        console.error('Erro ao carregar conversas:', error);
    }
}

function renderizarConversas(conversas) {
    const lista = document.getElementById('conversasList');

    if (!conversas || conversas.length === 0) {
        lista.innerHTML = `
            <div class="empty-conversas">
                <i class="fas fa-comments"></i>
                <p>Nenhuma conversa ainda</p>
                <button class="btn-iniciar-chat" onclick="abrirNovaConversa()">
                    Iniciar Chat
                </button>
            </div>
        `;
        return;
    }

    lista.innerHTML = conversas.map(conversa => {
        const inicial = conversa.nome.charAt(0).toUpperCase();
        const foto = conversa.foto_perfil 
            ? `<img src="${API_URL.replace('/api', '')}${conversa.foto_perfil}" alt="${conversa.nome}">` 
            : inicial;

        const badge = conversa.nao_lidas > 0 
            ? `<span class="conversa-badge">${conversa.nao_lidas}</span>` 
            : '';

        const hora = formatarHora(conversa.data_ultima_mensagem);

        return `
            <div class="conversa-item" onclick="abrirConversa(${conversa.contato_id}, '${conversa.nome}', '${conversa.foto_perfil || ''}')">
                <div class="conversa-avatar">
                    ${foto}
                </div>
                <div class="conversa-info">
                    <div class="conversa-header">
                        <span class="conversa-nome">${conversa.nome}</span>
                        <span class="conversa-hora">${hora}</span>
                    </div>
                    <div class="conversa-preview">${conversa.ultima_mensagem || 'Sem mensagens'}</div>
                </div>
                ${badge}
            </div>
        `;
    }).join('');
}

async function abrirConversa(contatoId, nome, foto) {
    conversaAtiva = { id: contatoId, nome, foto };

    // Marcar conversa como ativa
    document.querySelectorAll('.conversa-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Carregar mensagens
    await carregarMensagens(contatoId);

    // Renderizar chat
    renderizarChatAtivo();

    // Marcar como lido
    socket.emit('marcar-lido', contatoId);
}

async function carregarMensagens(contatoId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/mensagens/${contatoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            conversaAtiva.mensagens = data.mensagens;
        }
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

function renderizarChatAtivo() {
    const chatMain = document.getElementById('chatMain');
    const inicial = conversaAtiva.nome.charAt(0).toUpperCase();
    const foto = conversaAtiva.foto 
        ? `<img src="${API_URL.replace('/api', '')}${conversaAtiva.foto}" alt="${conversaAtiva.nome}">` 
        : inicial;

    chatMain.innerHTML = `
        <div class="chat-active">
            <div class="chat-header">
                <div class="chat-header-avatar">${foto}</div>
                <div class="chat-header-info">
                    <h3>${conversaAtiva.nome}</h3>
                    <div class="chat-header-status" id="statusContato">
                        <i class="fas fa-circle"></i> Online
                    </div>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                ${renderizarMensagens()}
            </div>
            <div class="chat-input-container">
                <div class="chat-input">
                    <textarea 
                        id="inputMensagem" 
                        placeholder="Digite sua mensagem..." 
                        rows="1"
                        onkeydown="handleKeyDown(event)"
                        oninput="handleDigitacao()"></textarea>
                    <button class="btn-enviar" onclick="enviarMensagem()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Scroll para última mensagem
    setTimeout(() => {
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);
}

function renderizarMensagens() {
    if (!conversaAtiva.mensagens || conversaAtiva.mensagens.length === 0) {
        return '<div class="chat-empty"><p>Nenhuma mensagem ainda. Envie a primeira!</p></div>';
    }

    return conversaAtiva.mensagens.map(msg => {
        const isSent = msg.remetente_id == usuarioAtual.id;
        const inicial = isSent ? usuarioAtual.nome.charAt(0) : conversaAtiva.nome.charAt(0);
        const foto = isSent 
            ? (usuarioAtual.foto_perfil ? `<img src="${API_URL.replace('/api', '')}${usuarioAtual.foto_perfil}">` : inicial.toUpperCase())
            : (msg.remetente_foto ? `<img src="${API_URL.replace('/api', '')}${msg.remetente_foto}">` : inicial.toUpperCase());

        return `
            <div class="message ${isSent ? 'sent' : ''}">
                <div class="message-avatar">${foto}</div>
                <div class="message-content">
                    <div class="message-bubble">${msg.mensagem}</div>
                    <div class="message-time">${formatarHoraMensagem(msg.criado_em)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function adicionarMensagemNaLista(mensagem, isSent) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;

    const inicial = isSent ? usuarioAtual.nome.charAt(0) : conversaAtiva.nome.charAt(0);
    const foto = isSent 
        ? (usuarioAtual.foto_perfil ? `<img src="${API_URL.replace('/api', '')}${usuarioAtual.foto_perfil}">` : inicial.toUpperCase())
        : (mensagem.remetente_foto ? `<img src="${API_URL.replace('/api', '')}${mensagem.remetente_foto}">` : inicial.toUpperCase());

    const messageHTML = `
        <div class="message ${isSent ? 'sent' : ''}">
            <div class="message-avatar">${foto}</div>
            <div class="message-content">
                <div class="message-bubble">${mensagem.mensagem}</div>
                <div class="message-time">${formatarHoraMensagem(mensagem.criado_em)}</div>
            </div>
        </div>
    `;

    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ==================== ENVIAR MENSAGEM ====================
function enviarMensagem() {
    const input = document.getElementById('inputMensagem');
    const mensagem = input.value.trim();

    if (!mensagem || !conversaAtiva) return;

    socket.emit('enviar-mensagem', {
        destinatario_id: conversaAtiva.id,
        mensagem: mensagem,
        tipo: 'texto'
    });

    input.value = '';
    input.style.height = 'auto';
    socket.emit('parou-digitar', conversaAtiva.id);
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        enviarMensagem();
    }
}

function handleDigitacao() {
    const input = document.getElementById('inputMensagem');
    
    // Auto-resize textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';

    // Indicador de digitação
    if (conversaAtiva) {
        socket.emit('digitando', conversaAtiva.id);

        clearTimeout(digitandoTimeout);
        digitandoTimeout = setTimeout(() => {
            socket.emit('parou-digitar', conversaAtiva.id);
        }, 1000);
    }
}

function mostrarIndicadorDigitacao() {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;

    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    messagesDiv.appendChild(indicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function esconderIndicadorDigitacao() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ==================== NOVA CONVERSA ====================
async function abrirNovaConversa() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/especialistas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            renderizarEspecialistas(data.especialistas);
            document.getElementById('modalNovaConversa').classList.add('active');
        }
    } catch (error) {
        console.error('Erro ao buscar especialistas:', error);
    }
}

function renderizarEspecialistas(especialistas) {
    const lista = document.getElementById('especialistasList');

    lista.innerHTML = especialistas.map(esp => {
        const inicial = esp.nome.charAt(0).toUpperCase();
        const foto = esp.foto_perfil 
            ? `<img src="${API_URL.replace('/api', '')}${esp.foto_perfil}">` 
            : inicial;

        return `
            <div class="especialista-item" onclick="iniciarConversaCom(${esp.id}, '${esp.nome}', '${esp.foto_perfil || ''}')">
                <div class="especialista-avatar">${foto}</div>
                <div class="especialista-info">
                    <h4>${esp.nome}</h4>
                    <p>${esp.especialidade} • ${esp.registro_profissional}</p>
                </div>
            </div>
        `;
    }).join('');
}

function iniciarConversaCom(id, nome, foto) {
    fecharNovaConversa();
    abrirConversa(id, nome, foto);
}

function fecharNovaConversa() {
    document.getElementById('modalNovaConversa').classList.remove('active');
}

// ==================== HELPERS ====================
function formatarHora(data) {
    if (!data) return '';
    const d = new Date(data);
    const hoje = new Date();
    
    if (d.toDateString() === hoje.toDateString()) {
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
}

function formatarHoraMensagem(data) {
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function atualizarConversaNaLista(mensagem) {
    // Atualizar a preview da conversa
    carregarConversas();
}

function atualizarStatusOnline(usuarioId, online) {
    if (conversaAtiva && usuarioId == conversaAtiva.id) {
        const status = document.getElementById('statusContato');
        if (status) {
            status.className = online ? 'chat-header-status' : 'chat-header-status offline';
            status.innerHTML = online 
                ? '<i class="fas fa-circle"></i> Online' 
                : '<i class="fas fa-circle"></i> Offline';
        }
    }
}

// Busca de conversas
document.getElementById('searchConversas')?.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll('.conversa-item').forEach(item => {
        const nome = item.querySelector('.conversa-nome').textContent.toLowerCase();
        item.style.display = nome.includes(termo) ? 'flex' : 'none';
    });
});

// Busca de especialistas
document.getElementById('searchEspecialistas')?.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll('.especialista-item').forEach(item => {
        const nome = item.querySelector('h4').textContent.toLowerCase();
        item.style.display = nome.includes(termo) ? 'flex' : 'none';
    });
});
