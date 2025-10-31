// especialista-dashboard.js
const API_URL = 'http://localhost:3000/api';

let especialistaAtual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar se é especialista
    if (usuario.tipo_usuario !== 'especialista') {
        mostrarToast('Área restrita para especialistas', 'danger');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    document.getElementById('headerUserName').textContent = usuario.nome;
    carregarDadosEspecialista();
    configurarNavegacao();
});

// ==================== NAVEGAÇÃO ====================
function configurarNavegacao() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Atualizar active
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar seção
            const section = item.dataset.section;
            document.querySelectorAll('.dashboard-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(section).classList.add('active');
            
            // Carregar dados da seção
            carregarSecao(section);
        });
    });
}

function carregarSecao(section) {
    switch(section) {
        case 'overview':
            carregarVisaoGeral();
            break;
        case 'consultas':
            carregarConsultas();
            break;
        case 'pacientes':
            carregarPacientes();
            break;
        case 'mensagens':
            carregarMensagens();
            break;
        case 'anamnese':
            carregarAnamneses();
            break;
        case 'configuracoes':
            carregarConfiguracoes();
            break;
    }
}

// ==================== CARREGAR DADOS ESPECIALISTA ====================
async function carregarDadosEspecialista() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/especialistas/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            especialistaAtual = data.especialista;
            renderizarDadosEspecialista(data.especialista);
            renderizarEstatisticas(data.estatisticas);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function renderizarDadosEspecialista(especialista) {
    document.getElementById('specialistName').textContent = especialista.nome;
    document.getElementById('specialistSpecialty').textContent = especialista.especialidade;
    
    if (especialista.foto_perfil) {
        document.getElementById('specialistAvatar').innerHTML = 
            `<img src="${API_URL.replace('/api', '')}${especialista.foto_perfil}" alt="${especialista.nome}">`;
    }
}

function renderizarEstatisticas(stats) {
    document.getElementById('totalConsultas').textContent = stats.consultasHoje || 0;
    document.getElementById('totalPacientes').textContent = stats.pacientesAtivos || 0;
    document.getElementById('totalMensagens').textContent = stats.mensagensNaoLidas || 0;
    document.getElementById('avaliacaoMedia').textContent = (stats.avaliacaoMedia || 5.0).toFixed(1);
    
    // Atualizar badges
    document.getElementById('consultasBadge').textContent = stats.consultasHoje || 0;
    document.getElementById('mensagensBadge').textContent = stats.mensagensNaoLidas || 0;
}

// ==================== VISÃO GERAL ====================
async function carregarVisaoGeral() {
    await carregarProximasConsultas();
    await carregarNotificacoes();
}

async function carregarProximasConsultas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/especialistas/proximas-consultas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso && data.consultas.length > 0) {
            renderizarProximasConsultas(data.consultas);
        }
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
    }
}

function renderizarProximasConsultas(consultas) {
    const container = document.getElementById('proximasConsultas');
    
    container.innerHTML = consultas.map(consulta => {
        const hora = consulta.horario.substring(0, 5);
        const linkMeet = consulta.link_meet || gerarLinkMeet(consulta.id);
        
        return `
            <div class="appointment-item">
                <div class="appointment-time">
                    <div>${hora}</div>
                </div>
                <div class="appointment-info">
                    <h4>${consulta.paciente_nome}</h4>
                    <p><i class="fas fa-video"></i> ${consulta.tipo_consulta}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-meet" onclick="abrirMeet('${linkMeet}')">
                        <i class="fas fa-video"></i> Entrar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function carregarNotificacoes() {
    // Simulação - implementar backend depois
    const notificacoes = [
        { tipo: 'info', mensagem: 'Bem-vindo ao seu painel!' }
    ];
    
    const container = document.getElementById('notificacoes');
    container.innerHTML = notificacoes.map(notif => `
        <div class="notification-item">
            <i class="fas fa-${notif.tipo === 'info' ? 'info-circle' : 'bell'}"></i>
            <p>${notif.mensagem}</p>
        </div>
    `).join('');
}

// ==================== CONSULTAS ====================
async function carregarConsultas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/especialistas/consultas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            renderizarTabelaConsultas(data.consultas);
        }
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
    }
}

function renderizarTabelaConsultas(consultas) {
    const container = document.getElementById('consultasTable');
    
    if (!consultas || consultas.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>Nenhuma consulta encontrada</p></div>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Paciente</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${consultas.map(c => {
                    const data = new Date(c.data_consulta).toLocaleDateString('pt-BR');
                    const hora = c.horario.substring(0, 5);
                    const linkMeet = c.link_meet || gerarLinkMeet(c.id);
                    
                    return `
                        <tr>
                            <td>${data}</td>
                            <td>${hora}</td>
                            <td>${c.paciente_nome}</td>
                            <td>${c.tipo_consulta}</td>
                            <td><span class="status-badge ${c.status}">${c.status}</span></td>
                            <td>
                                ${c.status === 'agendada' ? 
                                    `<button class="btn-small primary" onclick="abrirMeet('${linkMeet}')">
                                        <i class="fas fa-video"></i> Meet
                                    </button>` : ''}
                                <button class="btn-small secondary" onclick="verDetalhes(${c.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function filtrarConsultas() {
    const status = document.getElementById('filtroStatus').value;
    const data = document.getElementById('filtroData').value;
    // Implementar filtro
    carregarConsultas();
}

// ==================== PACIENTES ====================
async function carregarPacientes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/especialistas/pacientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            renderizarPacientes(data.pacientes);
        }
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
    }
}

function renderizarPacientes(pacientes) {
    const container = document.getElementById('pacientesGrid');
    
    if (!pacientes || pacientes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum paciente encontrado</p></div>';
        return;
    }
    
    container.innerHTML = pacientes.map(p => {
        const inicial = p.nome.charAt(0).toUpperCase();
        const totalConsultas = p.total_consultas || 0;
        
        return `
            <div class="paciente-card">
                <div class="paciente-avatar">
                    ${p.foto_perfil ? 
                        `<img src="${API_URL.replace('/api', '')}${p.foto_perfil}">` : 
                        inicial}
                </div>
                <h4>${p.nome}</h4>
                <p>${totalConsultas} consulta${totalConsultas !== 1 ? 's' : ''}</p>
                <div class="paciente-actions">
                    <button class="btn-small primary" onclick="abrirChat(${p.id})">
                        <i class="fas fa-comment"></i> Chat
                    </button>
                    <button class="btn-small secondary" onclick="verHistorico(${p.id})">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function buscarPacientes() {
    const termo = document.getElementById('searchPaciente').value;
    // Implementar busca
    carregarPacientes();
}

// ==================== MENSAGENS ====================
async function carregarMensagens() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/conversas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            renderizarMensagens(data.conversas);
        }
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

function renderizarMensagens(conversas) {
    const container = document.getElementById('mensagensList');
    
    if (!conversas || conversas.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>Nenhuma mensagem</p></div>';
        return;
    }
    
    // Usar mesmo estilo do chat
    container.innerHTML = conversas.slice(0, 10).map(c => `
        <div class="appointment-item" onclick="window.location.href='chat.html'">
            <div class="paciente-avatar" style="width: 50px; height: 50px; font-size: 20px;">
                ${c.foto_perfil ? 
                    `<img src="${API_URL.replace('/api', '')}${c.foto_perfil}">` : 
                    c.nome.charAt(0).toUpperCase()}
            </div>
            <div class="appointment-info">
                <h4>${c.nome}</h4>
                <p>${c.ultima_mensagem || 'Sem mensagens'}</p>
            </div>
            ${c.nao_lidas > 0 ? `<span class="badge">${c.nao_lidas}</span>` : ''}
        </div>
    `).join('');
}

// ==================== ANAMNESE ====================
async function carregarAnamneses() {
    // Implementar backend
    const container = document.getElementById('anamneseList');
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>Nenhuma anamnese cadastrada</p></div>';
}

function criarAnamnese() {
    mostrarToast('Funcionalidade em desenvolvimento', 'info');
}

// ==================== CONFIGURAÇÕES ====================
async function carregarConfiguracoes() {
    if (!especialistaAtual) return;
    
    document.getElementById('especialidade').value = especialistaAtual.especialidade || '';
    document.getElementById('registroProfissional').value = especialistaAtual.registro_profissional || '';
    document.getElementById('biografia').value = especialistaAtual.biografia || '';
    document.getElementById('valorConsulta').value = especialistaAtual.valor_consulta || '';
    document.getElementById('disponibilidade').value = especialistaAtual.disponibilidade || '';
}

async function salvarConfiguracoes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/especialistas/configuracoes`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                especialidade: document.getElementById('especialidade').value,
                registro_profissional: document.getElementById('registroProfissional').value,
                biografia: document.getElementById('biografia').value,
                valor_consulta: document.getElementById('valorConsulta').value,
                disponibilidade: document.getElementById('disponibilidade').value
            })
        });

        const data = await response.json();

        if (data.sucesso) {
            mostrarToast('Configurações salvas com sucesso!', 'success');
            carregarDadosEspecialista();
        } else {
            mostrarToast(data.mensagem || 'Erro ao salvar', 'danger');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarToast('Erro ao salvar configurações', 'danger');
    }
}

// ==================== HELPERS ====================
function gerarLinkMeet(consultaId) {
    return `https://meet.google.com/tea-${consultaId}-${Date.now().toString(36)}`;
}

function abrirMeet(link) {
    window.open(link, '_blank');
}

function abrirChat(pacienteId) {
    window.location.href = `chat.html?contato=${pacienteId}`;
}

function verDetalhes(consultaId) {
    mostrarToast('Detalhes da consulta em desenvolvimento', 'info');
}

function verHistorico(pacienteId) {
    mostrarToast('Histórico do paciente em desenvolvimento', 'info');
}

function agendarConsulta() {
    mostrarToast('Agendamento em desenvolvimento', 'info');
}
