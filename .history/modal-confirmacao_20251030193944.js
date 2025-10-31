// ==================== SISTEMA DE MODAIS E NOTIFICAÇÕES ====================

// Função para criar modal de confirmação
function mostrarModalConfirmacao(opcoes) {
    const {
        tipo = 'info', // info, success, danger, logout
        titulo,
        mensagem,
        textoBotaoConfirmar = 'Confirmar',
        textoBotaoCancelar = 'Cancelar',
        precisaSenha = false,
        aoConfirmar,
        aoCancelar
    } = opcoes;

    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal-confirmacao';
    modal.innerHTML = `
        <div class="modal-confirmacao-content">
            <div class="modal-confirmacao-icon ${tipo}">
                ${getIconePorTipo(tipo)}
            </div>
            <h3>${titulo}</h3>
            <p>${mensagem}</p>
            ${precisaSenha ? `
                <div class="modal-senha-input">
                    <label for="senha-confirmacao">
                        <i class="fas fa-lock"></i> Digite sua senha para confirmar
                    </label>
                    <input type="password" id="senha-confirmacao" placeholder="Senha" autocomplete="current-password">
                </div>
            ` : ''}
            <div class="modal-confirmacao-buttons">
                <button class="btn-modal-cancelar">
                    <i class="fas fa-times"></i> ${textoBotaoCancelar}
                </button>
                <button class="btn-modal-confirmar ${tipo === 'danger' ? 'danger' : ''}">
                    <i class="fas fa-check"></i> ${textoBotaoConfirmar}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Mostrar modal com animação
    setTimeout(() => modal.classList.add('show'), 10);

    // Eventos dos botões
    const btnCancelar = modal.querySelector('.btn-modal-cancelar');
    const btnConfirmar = modal.querySelector('.btn-modal-confirmar');
    const inputSenha = modal.querySelector('#senha-confirmacao');

    btnCancelar.onclick = () => {
        fecharModal(modal);
        if (aoCancelar) aoCancelar();
    };

    btnConfirmar.onclick = () => {
        if (precisaSenha) {
            const senha = inputSenha.value;
            if (!senha) {
                inputSenha.focus();
                inputSenha.style.borderColor = '#ef4444';
                mostrarToast('Digite sua senha', 'Por favor, digite sua senha para confirmar', 'error');
                return;
            }
            if (aoConfirmar) aoConfirmar(senha);
        } else {
            if (aoConfirmar) aoConfirmar();
        }
        fecharModal(modal);
    };

    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            fecharModal(modal);
            if (aoCancelar) aoCancelar();
        }
    };

    // Enter para confirmar
    if (inputSenha) {
        inputSenha.onkeypress = (e) => {
            if (e.key === 'Enter') btnConfirmar.click();
        };
        setTimeout(() => inputSenha.focus(), 300);
    }
}

// Função para fechar modal com animação
function fecharModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
}

// Função para obter ícone por tipo
function getIconePorTipo(tipo) {
    const icones = {
        logout: '<i class="fas fa-sign-out-alt"></i>',
        danger: '<i class="fas fa-exclamation-triangle"></i>',
        success: '<i class="fas fa-check-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    return icones[tipo] || icones.info;
}

// Função para mostrar toast de notificação
function mostrarToast(titulo, mensagem, tipo = 'info', duracao = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${tipo}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${getIconePorTipo(tipo)}
        </div>
        <div class="toast-content">
            <h4>${titulo}</h4>
            <p>${mensagem}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(toast);

    // Mostrar toast com animação
    setTimeout(() => toast.classList.add('show'), 10);

    // Fechar ao clicar no X
    toast.querySelector('.toast-close').onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    // Fechar automaticamente
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}

// Função de logout personalizada
function logout() {
    mostrarModalConfirmacao({
        tipo: 'logout',
        titulo: 'Deseja sair?',
        mensagem: 'Você está prestes a sair do ConectaTEA. Tem certeza?',
        textoBotaoConfirmar: 'Sim, sair',
        textoBotaoCancelar: 'Cancelar',
        aoConfirmar: async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    await fetch('http://localhost:3000/api/auth/logout', {
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

            // Limpar dados locais
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            sessionStorage.clear();

            // Mostrar mensagem de despedida
            mostrarToast(
                'Até logo! 👋',
                'Esperamos ver você em breve no ConectaTEA',
                'info'
            );

            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });
}

// Função para desativar conta
function desativarConta() {
    mostrarModalConfirmacao({
        tipo: 'danger',
        titulo: 'Desativar Conta',
        mensagem: 'Sua conta será temporariamente desativada. Você pode reativá-la fazendo login novamente. Deseja continuar?',
        textoBotaoConfirmar: 'Desativar',
        textoBotaoCancelar: 'Cancelar',
        aoConfirmar: async () => {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('http://localhost:3000/api/usuarios/desativar', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.sucesso) {
                    mostrarToast('Conta desativada', data.mensagem, 'success');
                    
                    // Limpar dados e redirecionar
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    mostrarToast('Erro', data.mensagem, 'error');
                }
            } catch (error) {
                console.error('Erro ao desativar conta:', error);
                mostrarToast('Erro', 'Não foi possível desativar a conta', 'error');
            }
        }
    });
}

// Função para excluir conta
function excluirConta() {
    mostrarModalConfirmacao({
        tipo: 'danger',
        titulo: '⚠️ Excluir Conta Permanentemente',
        mensagem: 'Esta ação é IRREVERSÍVEL! Todos os seus dados serão excluídos permanentemente, incluindo consultas, mensagens e histórico.',
        textoBotaoConfirmar: 'Excluir Permanentemente',
        textoBotaoCancelar: 'Cancelar',
        precisaSenha: true,
        aoConfirmar: async (senha) => {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('http://localhost:3000/api/usuarios/excluir', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ senha })
                });

                const data = await response.json();

                if (data.sucesso) {
                    mostrarToast('Conta excluída', 'Sua conta foi excluída permanentemente', 'success');
                    
                    // Limpar dados e redirecionar
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    mostrarToast('Erro', data.mensagem, 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                mostrarToast('Erro', 'Não foi possível excluir a conta', 'error');
            }
        }
    });
}

// Exportar funções para uso global
window.mostrarModalConfirmacao = mostrarModalConfirmacao;
window.mostrarToast = mostrarToast;
window.logout = logout;
window.desativarConta = desativarConta;
window.excluirConta = excluirConta;
