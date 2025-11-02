// Especialista Dashboard - JavaScript Principal
const API_URL = 'http://localhost:3000/api';
let usuario = null;
let token = null;
let socket = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    inicializarNavegacao();
    inicializarFormularios();
});

// Verificar autenticação
function verificarAutenticacao() {
    token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');
    
    if (!token || !usuarioData) {
        window.location.href = 'login.html';
        return;
    }
    
    usuario = JSON.parse(usuarioData);
    
    // Verificar se é especialista
    if (usuario.tipo_usuario !== 'especialista' && usuario.tipo !== 'especialista') {
        alert('Acesso negado. Área exclusiva para especialistas.');
        window.location.href = 'index.html';
        return;
    }
    
    carregarDadosUsuario();
    carregarDashboard();
    conectarSocket();
}

// Carregar dados do usuário
function carregarDadosUsuario() {
    document.getElementById('headerNome').textContent = usuario.nome;
    
    if (usuario.foto_perfil) {
        let fotoPath = usuario.foto_perfil;
        if (fotoPath.startsWith('/')) {
            fotoPath = fotoPath.substring(1);
        }
        const fotoUrl = fotoPath.startsWith('http') 
            ? fotoPath 
            : `${API_URL.replace('/api', '')}/${fotoPath}`;
        document.getElementById('headerFoto').src = fotoUrl;
    }
}

// Conectar Socket.IO
function conectarSocket() {
    socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
        console.log('Conectado ao servidor');
        socket.emit('entrar', usuario.id);
    });
    
    socket.on('nova-mensagem', (mensagem) => {
        atualizarBadgeChat();
        if (paginaAtiva === 'chat') {
            receberNovaMensagem(mensagem);
        }
    });
}

// Navegação entre páginas
let paginaAtiva = 'dashboard';

function inicializarNavegacao() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pagina = item.dataset.page;
            trocarPagina(pagina);
        });
    });
}

function trocarPagina(pagina) {
    // Remover classe active de todas as páginas e nav items
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Ativar nova página
    document.getElementById(`page-${pagina}`).classList.add('active');
    document.querySelector(`[data-page="${pagina}"]`).classList.add('active');
    
    paginaAtiva = pagina;
    
    // Carregar dados da página
    switch(pagina) {
        case 'dashboard':
            carregarDashboard();
            break;
        case 'pacientes':
            carregarPacientes();
            break;
        case 'reunioes':
            carregarReunioes();
            break;
        case 'chat':
            carregarChat();
            break;
        case 'prontuarios':
            carregarPacientesSelect();
            break;
        case 'perfil':
            carregarPerfilEspecialista();
            break;
    }
}

// Dashboard
async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/especialista/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            document.getElementById('statPacientes').textContent = result.dados.total_pacientes;
            document.getElementById('statReunioes').textContent = result.dados.reunioes_hoje;
            document.getElementById('statPendentes').textContent = result.dados.reunioes_pendentes;
            document.getElementById('statMensagens').textContent = result.dados.mensagens_nao_lidas;
            document.getElementById('badgeChat').textContent = result.dados.mensagens_nao_lidas;
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Pacientes
async function carregarPacientes() {
    try {
        const response = await fetch(`${API_URL}/especialista/pacientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            renderizarPacientes(result.dados);
        }
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
    }
}

function renderizarPacientes(pacientes) {
    const grid = document.getElementById('pacientesGrid');
    
    if (pacientes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #718096;">Nenhum paciente vinculado ainda.</p>';
        return;
    }
    
    grid.innerHTML = pacientes.map(paciente => `
        <div class="paciente-card">
            <div class="paciente-header">
                <img src="${paciente.foto_perfil || 'https://via.placeholder.com/60'}" 
                     alt="${paciente.nome}" 
                     class="paciente-foto">
                <div class="paciente-info">
                    <h3>${paciente.nome}</h3>
                    <p>${paciente.email}</p>
                    <p>Desde: ${new Date(paciente.data_vinculo).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            <div class="paciente-acoes">
                <button class="btn-secondary" onclick="abrirChat(${paciente.id})">
                    <i class="fas fa-comment"></i> Mensagem
                </button>
                <button class="btn-secondary" onclick="verProntuarios(${paciente.id})">
                    <i class="fas fa-file-medical"></i> Prontuário
                </button>
            </div>
        </div>
    `).join('');
}

// Reuniões
async function carregarReunioes() {
    try {
        const response = await fetch(`${API_URL}/especialista/reunioes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            renderizarReunioes(result.dados);
        }
    } catch (error) {
        console.error('Erro ao carregar reuniões:', error);
    }
}

function renderizarReunioes(reunioes) {
    const lista = document.getElementById('reunioesLista');
    
    if (reunioes.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #718096;">Nenhuma reunião agendada.</p>';
        return;
    }
    
    lista.innerHTML = reunioes.map(reuniao => `
        <div class="reuniao-card">
            <div class="reuniao-header">
                <h3>${reuniao.titulo}</h3>
                <span class="badge status-${reuniao.status}">${reuniao.status}</span>
            </div>
            <p><i class="fas fa-user"></i> ${reuniao.paciente_nome}</p>
            <p><i class="fas fa-calendar"></i> ${new Date(reuniao.data_hora).toLocaleString('pt-BR')}</p>
            <p><i class="fas fa-clock"></i> ${reuniao.duracao} minutos</p>
            ${reuniao.google_meet_link ? `
                <a href="${reuniao.google_meet_link}" target="_blank" class="btn-primary">
                    <i class="fas fa-video"></i> Entrar no Meet
                </a>
            ` : ''}
        </div>
    `).join('');
}

// Chat
async function carregarChat() {
    try {
        const response = await fetch(`${API_URL}/mensagens/conversas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            renderizarConversas(result.dados);
        }
    } catch (error) {
        console.error('Erro ao carregar chat:', error);
    }
}

function renderizarConversas(conversas) {
    const lista = document.getElementById('conversasLista');
    
    if (conversas.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #718096;">Nenhuma conversa ainda.</p>';
        return;
    }
    
    lista.innerHTML = conversas.map(conversa => `
        <div class="conversa-item" onclick="abrirConversa(${conversa.contato_id})">
            <img src="${conversa.contato_foto || 'https://via.placeholder.com/50'}" 
                 alt="${conversa.contato_nome}" 
                 style="width: 50px; height: 50px; border-radius: 50%;">
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1rem;">${conversa.contato_nome}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: #718096;">${conversa.ultima_mensagem || 'Sem mensagens'}</p>
            </div>
            ${conversa.nao_lidas > 0 ? `<span class="badge">${conversa.nao_lidas}</span>` : ''}
        </div>
    `).join('');
}

// Formulários
function inicializarFormularios() {
    // Vincular paciente
    document.getElementById('formVincular')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('emailPaciente').value;
        const observacoes = document.getElementById('observacoes').value;
        
        try {
            const response = await fetch(`${API_URL}/especialista/pacientes/vincular`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paciente_email: email, observacoes })
            });
            
            const result = await response.json();
            alert(result.mensagem);
            
            if (result.sucesso) {
                fecharModal('modalVincular');
                carregarPacientes();
            }
        } catch (error) {
            alert('Erro ao vincular paciente');
        }
    });
    
    // Agendar reunião
    document.getElementById('formReuniao')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dados = {
            paciente_id: document.getElementById('pacienteReuniao').value,
            titulo: document.getElementById('tituloReuniao').value,
            descricao: document.getElementById('descricaoReuniao').value,
            data_hora: document.getElementById('dataHoraReuniao').value,
            duracao: document.getElementById('duracaoReuniao').value
        };
        
        try {
            const response = await fetch(`${API_URL}/especialista/reunioes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            
            const result = await response.json();
            alert(result.mensagem);
            
            if (result.sucesso) {
                fecharModal('modalReuniao');
                carregarReunioes();
            }
        } catch (error) {
            alert('Erro ao agendar reunião');
        }
    });
}

// Modais
function mostrarModalVincular() {
    document.getElementById('modalVincular').classList.add('active');
}

function mostrarModalReuniao() {
    carregarPacientesSelect();
    document.getElementById('modalReuniao').classList.add('active');
}

function mostrarModalProntuario() {
    carregarPacientesSelect();
    document.getElementById('modalProntuario').classList.add('active');
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

async function carregarPacientesSelect() {
    try {
        const response = await fetch(`${API_URL}/especialista/pacientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            const selects = ['pacienteReuniao', 'pacienteProntuario', 'selectPacienteProntuario'];
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Selecione um paciente</option>' +
                        result.dados.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Atualizar badge chat
function atualizarBadgeChat() {
    carregarDashboard();
}

// Chat Functions
let conversaAtiva = null;

async function abrirConversa(contatoId) {
    conversaAtiva = contatoId;
    
    try {
        const response = await fetch(`${API_URL}/mensagens/conversa/${contatoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            renderizarMensagens(result.dados);
            atualizarBadgeChat();
        }
    } catch (error) {
        console.error('Erro ao carregar conversa:', error);
    }
}

function renderizarMensagens(mensagens) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (mensagens.length === 0) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">Nenhuma mensagem ainda</p>';
        return;
    }
    
    chatMessages.innerHTML = mensagens.map(msg => {
        const isMine = msg.remetente_id === usuario.id;
        return `
            <div class="chat-message ${isMine ? 'mine' : 'theirs'}">
                <div class="message-content">
                    <p>${msg.conteudo}</p>
                    <span class="message-time">${new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                </div>
            </div>
        `;
    }).join('');
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function enviarMensagem() {
    const texto = document.getElementById('mensagemTexto').value.trim();
    
    if (!texto || !conversaAtiva) return;
    
    try {
        const response = await fetch(`${API_URL}/mensagens/enviar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destinatario_id: conversaAtiva,
                conteudo: texto
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            document.getElementById('mensagemTexto').value = '';
            
            // Emitir via socket
            if (socket) {
                socket.emit('enviar-mensagem', {
                    destinatario_id: conversaAtiva,
                    mensagem: result.dados
                });
            }
            
            // Adicionar localmente
            abrirConversa(conversaAtiva);
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
}

function receberNovaMensagem(mensagem) {
    if (mensagem.remetente_id === conversaAtiva || mensagem.destinatario_id === conversaAtiva) {
        abrirConversa(conversaAtiva);
    }
}

function abrirChat(pacienteId) {
    trocarPagina('chat');
    setTimeout(() => abrirConversa(pacienteId), 300);
}

// Prontuários
async function verProntuarios(pacienteId) {
    trocarPagina('prontuarios');
    document.getElementById('selectPacienteProntuario').value = pacienteId;
    setTimeout(() => carregarProntuariosPaciente(), 300);
}

async function carregarProntuariosPaciente() {
    const pacienteId = document.getElementById('selectPacienteProntuario').value;
    
    if (!pacienteId) {
        document.getElementById('prontuariosLista').innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/especialista/prontuarios/${pacienteId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            renderizarProntuarios(result.dados);
        }
    } catch (error) {
        console.error('Erro ao carregar prontuários:', error);
    }
}

function renderizarProntuarios(prontuarios) {
    const lista = document.getElementById('prontuariosLista');
    
    if (prontuarios.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #718096;">Nenhum prontuário registrado.</p>';
        return;
    }
    
    lista.innerHTML = prontuarios.map(p => `
        <div class="card" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0 0 0.5rem 0;">${p.titulo}</h3>
                    <span class="badge">${p.tipo}</span>
                </div>
                <span style="color: #718096; font-size: 0.9rem;">
                    ${new Date(p.created_at).toLocaleDateString('pt-BR')}
                </span>
            </div>
            <p style="white-space: pre-wrap; color: #4a5568;">${p.conteudo}</p>
        </div>
    `).join('');
}

// Form Prontuário
document.getElementById('formProntuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dados = {
        paciente_id: document.getElementById('pacienteProntuario').value,
        tipo: document.getElementById('tipoProntuario').value,
        titulo: document.getElementById('tituloProntuario').value,
        conteudo: document.getElementById('conteudoProntuario').value
    };
    
    try {
        const response = await fetch(`${API_URL}/especialista/prontuarios`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        alert(result.mensagem);
        
        if (result.sucesso) {
            fecharModal('modalProntuario');
            document.getElementById('formProntuario').reset();
        }
    } catch (error) {
        alert('Erro ao salvar prontuário');
    }
});

// Perfil do Especialista
async function carregarPerfilEspecialista() {
    // Preencher com dados do usuário do localStorage
    const usuarioCompleto = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuarioCompleto) {
        document.getElementById('perfilEspecialidade').value = usuarioCompleto.especialidade || '';
        document.getElementById('perfilRegistro').value = usuarioCompleto.registro_profissional || '';
        document.getElementById('perfilDescricao').value = usuarioCompleto.descricao_profissional || '';
        document.getElementById('perfilValor').value = usuarioCompleto.valor_consulta || '';
        document.getElementById('perfilGoogleMeet').value = usuarioCompleto.google_meet_link || '';
    }
}

// Form Perfil
document.getElementById('formPerfil')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dados = {
        especialidade: document.getElementById('perfilEspecialidade').value,
        registro_profissional: document.getElementById('perfilRegistro').value,
        descricao_profissional: document.getElementById('perfilDescricao').value,
        valor_consulta: document.getElementById('perfilValor').value,
        google_meet_link: document.getElementById('perfilGoogleMeet').value
    };
    
    try {
        const response = await fetch(`${API_URL}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        alert(result.mensagem);
        
        if (result.sucesso) {
            // Atualizar localStorage
            const usuarioAtual = JSON.parse(localStorage.getItem('usuario'));
            Object.assign(usuarioAtual, dados);
            localStorage.setItem('usuario', JSON.stringify(usuarioAtual));
        }
    } catch (error) {
        alert('Erro ao salvar perfil');
    }
});

// Enter para enviar mensagem
document.getElementById('mensagemTexto')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
});
