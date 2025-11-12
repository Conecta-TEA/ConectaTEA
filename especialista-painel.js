// Especialista Dashboard - JavaScript Principal
const API_URL = 'http://localhost:3000/api';
let usuario = null;
let token = null;
let socket = null;

// MODO DEMONSTRAÇÃO - Sem necessidade de backend
const MODO_DEMO = true;

// Dados fictícios para demonstração
const DADOS_DEMO = {
    pacientes: [
        {
            id: 1,
            nome: 'Maria Silva',
            email: 'maria@email.com',
            idade: 8,
            data_vinculo: '2024-01-15',
            observacoes: 'Paciente com diagnóstico de TEA leve'
        },
        {
            id: 2,
            nome: 'João Santos',
            email: 'joao@email.com',
            idade: 10,
            data_vinculo: '2024-02-20',
            observacoes: 'Acompanhamento semanal'
        },
        {
            id: 3,
            nome: 'Ana Costa',
            email: 'ana@email.com',
            idade: 6,
            data_vinculo: '2024-03-10',
            observacoes: 'Primeira consulta realizada'
        }
    ],
    reunioes: [
        {
            id: 1,
            paciente_id: 1,
            paciente_nome: 'Maria Silva',
            titulo: 'Consulta de Acompanhamento',
            data_hora: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Daqui 2h
            duracao: 60,
            status: 'agendada',
            link_meet: 'https://meet.google.com/abc-defg-hij'
        },
        {
            id: 2,
            paciente_id: 2,
            paciente_nome: 'João Santos',
            titulo: 'Avaliação Mensal',
            data_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
            duracao: 90,
            status: 'agendada',
            link_meet: 'https://meet.google.com/xyz-uvwx-rst'
        }
    ],
    prontuarios: [
        {
            id: 1,
            paciente_id: 1,
            paciente_nome: 'Maria Silva',
            titulo: 'Avaliação Inicial',
            tipo: 'avaliacao',
            conteudo: 'Paciente apresenta comunicação verbal limitada. Demonstra interesse por atividades estruturadas.',
            data: '2024-01-15'
        },
        {
            id: 2,
            paciente_id: 1,
            paciente_nome: 'Maria Silva',
            titulo: 'Evolução - Sessão 5',
            tipo: 'evolucao',
            conteudo: 'Melhora significativa na interação social. Consegue manter contato visual por períodos mais longos.',
            data: '2024-02-10'
        }
    ],
    mensagens: [
        {
            id: 1,
            remetente_id: 1,
            destinatario_id: 2,
            mensagem: 'Olá, gostaria de remarcar a consulta.',
            lido: false,
            criado_em: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
    ]
};

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
    if (MODO_DEMO) {
        console.log('Modo Demo: Socket.IO desabilitado');
        return;
    }
    
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
    if (MODO_DEMO) {
        // Usar dados demo
        document.getElementById('statPacientes').textContent = DADOS_DEMO.pacientes.length;
        document.getElementById('statReunioes').textContent = DADOS_DEMO.reunioes.filter(r => {
            const hoje = new Date().toDateString();
            return new Date(r.data_hora).toDateString() === hoje;
        }).length;
        document.getElementById('statPendentes').textContent = DADOS_DEMO.reunioes.length;
        document.getElementById('statMensagens').textContent = DADOS_DEMO.mensagens.filter(m => !m.lida).length;
        document.getElementById('badgeChat').textContent = DADOS_DEMO.mensagens.filter(m => !m.lida).length;
        console.log('Dashboard carregado em modo demo');
        return;
    }
    
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
    if (MODO_DEMO) {
        // Usar dados demo
        renderizarPacientes(DADOS_DEMO.pacientes);
        console.log('Pacientes carregados em modo demo');
        return;
    }
    
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
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users"></i>
                <h3>Nenhum paciente vinculado</h3>
                <p>Clique no botão acima para vincular seu primeiro paciente</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = pacientes.map(paciente => {
        const iniciais = paciente.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const dataDe = paciente.data_vinculo ? new Date(paciente.data_vinculo).toLocaleDateString('pt-BR') : 'Recente';
        
        return `
            <div class="paciente-card">
                <div class="paciente-header">
                    <div class="paciente-avatar">${iniciais}</div>
                    <div class="paciente-info">
                        <h3>${paciente.nome}</h3>
                        <p>${paciente.email}</p>
                    </div>
                </div>
                <div class="paciente-details">
                    <div class="paciente-detail">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Vinculado em ${dataDe}</span>
                    </div>
                    ${paciente.telefone ? `
                        <div class="paciente-detail">
                            <i class="fas fa-phone"></i>
                            <span>${paciente.telefone}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="paciente-actions">
                    <button class="btn-chat" onclick="abrirChat(${paciente.id})">
                        <i class="fas fa-comment"></i> Chat
                    </button>
                    <button class="btn-prontuario" onclick="verProntuarios(${paciente.id})">
                        <i class="fas fa-file-medical"></i> Prontuário
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Reuniões
async function carregarReunioes() {
    if (MODO_DEMO) {
        // Usar dados demo
        renderizarReunioes(DADOS_DEMO.reunioes);
        console.log('Reuniões carregadas em modo demo');
        return;
    }
    
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
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Nenhuma reunião agendada</h3>
                <p>Clique no botão acima para agendar sua primeira reunião</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = reunioes.map(reuniao => {
        const dataReuniao = new Date(reuniao.data_hora);
        const googleMeetLink = reuniao.google_meet_link || gerarLinkGoogleMeet(reuniao);
        
        return `
            <div class="reuniao-card">
                <div class="reuniao-icon">
                    <i class="fas fa-video"></i>
                </div>
                <div class="reuniao-info">
                    <h3>${reuniao.titulo}</h3>
                    <div class="reuniao-meta">
                        <span><i class="fas fa-user"></i> ${reuniao.paciente_nome}</span>
                        <span><i class="fas fa-calendar"></i> ${dataReuniao.toLocaleDateString('pt-BR')}</span>
                        <span><i class="fas fa-clock"></i> ${dataReuniao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} (${reuniao.duracao || 60}min)</span>
                    </div>
                    ${reuniao.descricao ? `<p class="reuniao-descricao">${reuniao.descricao}</p>` : ''}
                </div>
                <div class="reuniao-actions">
                    <button class="btn-meet" onclick="abrirGoogleMeet('${googleMeetLink}')">
                        <i class="fab fa-google"></i> Entrar no Meet
                    </button>
                    <button class="btn-editar" onclick="editarReuniao(${reuniao.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-cancelar" onclick="cancelarReuniao(${reuniao.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Gerar link Google Meet automático
function gerarLinkGoogleMeet(reuniao) {
    // Pegar link do perfil do especialista ou gerar um genérico
    const usuarioCompleto = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuarioCompleto && usuarioCompleto.google_meet_link) {
        return usuarioCompleto.google_meet_link;
    }
    
    // Link genérico do Google Meet
    const codigo = `reuniao-${reuniao.id}-${Date.now()}`;
    return `https://meet.google.com/new`;
}

// Abrir Google Meet
function abrirGoogleMeet(link) {
    if (!link || link === 'https://meet.google.com/new') {
        // Criar nova reunião
        window.open('https://meet.google.com/new', '_blank');
        return;
    }
    
    // Abrir link específico
    window.open(link, '_blank');
}

// Editar reunião
async function editarReuniao(reuniaoId) {
    alert('Funcionalidade de edição em desenvolvimento');
}

// Cancelar reunião
async function cancelarReuniao(reuniaoId) {
    if (!confirm('Deseja realmente cancelar esta reunião?')) return;
    
    if (MODO_DEMO) {
        alert('✅ Reunião cancelada com sucesso!\n\n(Modo demonstração - nenhuma ação foi executada no servidor)');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/especialista/reunioes/${reuniaoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        alert(result.mensagem);
        
        if (result.sucesso) {
            carregarReunioes();
        }
    } catch (error) {
        alert('Erro ao cancelar reunião');
    }
}

// Chat
async function carregarChat() {
    if (MODO_DEMO) {
        // Usar dados demo - criar conversas a partir das mensagens
        const conversas = DADOS_DEMO.mensagens.map(msg => ({
            contato_id: msg.remetente_id,
            contato_nome: msg.remetente_nome,
            ultima_mensagem: msg.conteudo,
            nao_lidas: msg.lida ? 0 : 1
        }));
        renderizarConversas(conversas);
        console.log('Chat carregado em modo demo');
        return;
    }
    
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
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Nenhuma conversa</h3>
                <p>Suas conversas aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = conversas.map(conversa => {
        const iniciais = conversa.contato_nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const ultimaMensagem = conversa.ultima_mensagem || 'Sem mensagens';
        const temNotificacao = conversa.nao_lidas > 0;
        
        return `
            <div class="conversa-item ${conversaAtiva === conversa.contato_id ? 'active' : ''}" onclick="abrirConversa(${conversa.contato_id})">
                <div class="conversa-avatar">${iniciais}</div>
                <div class="conversa-info">
                    <h4>${conversa.contato_nome}</h4>
                    <p>${ultimaMensagem.substring(0, 30)}${ultimaMensagem.length > 30 ? '...' : ''}</p>
                </div>
                ${temNotificacao ? `<span class="badge">${conversa.nao_lidas}</span>` : ''}
            </div>
        `;
    }).join('');
}

// Formulários
function inicializarFormularios() {
    // Vincular paciente
    document.getElementById('formVincular')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (MODO_DEMO) {
            alert('✅ Paciente vinculado com sucesso!\n\n(Modo demonstração - nenhuma ação foi executada no servidor)');
            fecharModal('modalVincular');
            e.target.reset();
            return;
        }
        
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
        
        if (MODO_DEMO) {
            alert('✅ Reunião agendada com sucesso!\n\n(Modo demonstração - nenhuma ação foi executada no servidor)');
            fecharModal('modalReuniao');
            e.target.reset();
            return;
        }
        
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
    if (MODO_DEMO) {
        // Usar dados demo
        const selects = ['pacienteReuniao', 'pacienteProntuario', 'selectPacienteProntuario'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Selecione um paciente</option>' +
                    DADOS_DEMO.pacientes.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
            }
        });
        console.log('Pacientes (select) carregados em modo demo');
        return;
    }
    
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
    
    if (MODO_DEMO) {
        // Usar dados demo - filtrar mensagens do contato
        const mensagensFiltradas = DADOS_DEMO.mensagens.filter(m => m.remetente_id === contatoId);
        renderizarMensagens(mensagensFiltradas);
        console.log('Conversa carregada em modo demo');
        return;
    }
    
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
        chatMessages.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-dots"></i>
                <h3>Nenhuma mensagem ainda</h3>
                <p>Envie a primeira mensagem para iniciar a conversa</p>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = mensagens.map(msg => {
        const isMine = msg.remetente_id === usuario.id;
        const iniciais = isMine 
            ? usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'PC'; // Paciente
        
        return `
            <div class="chat-message ${isMine ? 'sent' : ''}">
                <div class="message-avatar">${iniciais}</div>
                <div class="message-content">
                    <p>${msg.conteudo || msg.mensagem}</p>
                    <span class="message-time">${new Date(msg.created_at || msg.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            </div>
        `;
    }).join('');
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function enviarMensagem() {
    const texto = document.getElementById('mensagemTexto').value.trim();
    
    if (!texto || !conversaAtiva) return;
    
    if (MODO_DEMO) {
        // Simular envio no modo demo
        document.getElementById('mensagemTexto').value = '';
        alert('✅ Mensagem enviada!\n\n(Modo demonstração - nenhuma ação foi executada no servidor)');
        console.log('Mensagem enviada em modo demo');
        return;
    }
    
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
    
    if (MODO_DEMO) {
        // Usar dados demo - filtrar prontuários do paciente selecionado
        const prontuariosFiltrados = DADOS_DEMO.prontuarios.filter(p => p.paciente_id == pacienteId);
        renderizarProntuarios(prontuariosFiltrados);
        console.log('Prontuários carregados em modo demo');
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
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-medical"></i>
                <h3>Nenhum prontuário registrado</h3>
                <p>Clique no botão acima para criar o primeiro prontuário</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = prontuarios.map(p => `
        <div class="prontuario-card">
            <div class="prontuario-header">
                <div class="prontuario-titulo">
                    <h3>${p.titulo}</h3>
                    <div class="prontuario-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(p.created_at || p.criado_em).toLocaleDateString('pt-BR')}</span>
                        <span><i class="fas fa-user-md"></i> ${usuario.nome}</span>
                    </div>
                </div>
                <span class="prontuario-tipo tipo-${p.tipo}">${p.tipo}</span>
            </div>
            <div class="prontuario-conteudo">${p.conteudo}</div>
            <div class="prontuario-actions">
                <button class="btn-editar" onclick="editarProntuario(${p.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-secondary" onclick="imprimirProntuario(${p.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    `).join('');
}

// Editar prontuário
function editarProntuario(prontuarioId) {
    alert('Funcionalidade de edição em desenvolvimento');
}

// Imprimir prontuário
function imprimirProntuario(prontuarioId) {
    window.print();
}

// Form Prontuário
document.getElementById('formProntuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (MODO_DEMO) {
        alert('✅ Prontuário salvo com sucesso!\n\n(Modo demonstração - nenhuma ação foi executada no servidor)');
        fecharModal('modalProntuario');
        e.target.reset();
        return;
    }
    
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
