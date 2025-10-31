// perfil.js - Gerenciamento de perfil do usuário

const API_URL = 'http://localhost:3000/api';

// Carregar dados do usuário
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
});

async function carregarPerfil() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar perfil');
        }

        const data = await response.json();
        const usuario = data.usuario;

        // Atualizar localStorage com dados completos
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Preencher campos
        document.getElementById('nome').value = usuario.nome || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefone').value = usuario.telefone || '';
        document.getElementById('dataNascimento').value = usuario.data_nascimento || '';
        
        // Atualizar nome no header
        document.getElementById('headerUserName').textContent = usuario.nome || 'Usuário';

        // Avatar - foto ou inicial
        const avatarDiv = document.getElementById('perfilAvatar');
        if (usuario.foto_perfil) {
            avatarDiv.innerHTML = `<img src="${API_URL.replace('/api', '')}${usuario.foto_perfil}" alt="${usuario.nome}">`;
        } else {
            const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U';
            avatarDiv.innerHTML = `<span>${inicial}</span>`;
        }

        // Estatísticas
        document.getElementById('totalConsultas').textContent = usuario.totalConsultas || '0';
        document.getElementById('diasCadastro').textContent = usuario.diasCadastro || '0';

    } catch (error) {
        console.error('Erro:', error);
        mostrarToast('Erro', 'Não foi possível carregar os dados do perfil', 'error');
    }
}

// Upload de foto de perfil
document.querySelector('.btn-change-photo').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            mostrarToast('Arquivo muito grande', 'A imagem deve ter no máximo 5MB', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('foto', file);

        try {
            const response = await fetch(`${API_URL}/usuarios/perfil/foto`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.sucesso) {
                mostrarToast('Sucesso!', 'Foto de perfil atualizada', 'success');
                carregarPerfil(); // Recarregar para mostrar nova foto
            } else {
                mostrarToast('Erro', data.mensagem, 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarToast('Erro', 'Não foi possível fazer upload da foto', 'error');
        }
    };

    input.click();
});

// Editar informações pessoais
function toggleEdit(tipo) {
    const form = document.getElementById(`form${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const inputs = form.querySelectorAll('input');
    const actions = form.querySelector('.form-actions');
    const btnEdit = form.closest('.perfil-card').querySelector('.btn-edit');

    // Habilitar/desabilitar inputs
    inputs.forEach(input => {
        if (input.id !== 'email') { // Email não deve ser editável
            input.disabled = !input.disabled;
        }
    });

    // Mostrar/esconder botões de ação
    if (actions) {
        actions.style.display = actions.style.display === 'none' ? 'flex' : 'none';
    }

    // Alterar texto do botão
    if (btnEdit) {
        const isEditing = !inputs[0].disabled;
        btnEdit.innerHTML = isEditing ? '<i class="fas fa-times"></i> Cancelar' : '<i class="fas fa-edit"></i> Editar';
    }
}

function cancelEdit(tipo) {
    toggleEdit(tipo);
    carregarPerfil(); // Recarregar dados originais
}

// Salvar informações pessoais
document.getElementById('formPessoais').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const dadosAtualizados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        data_nascimento: document.getElementById('dataNascimento').value
    };

    try {
        const response = await fetch(`${API_URL}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosAtualizados)
        });

        const data = await response.json();

        if (data.sucesso) {
            mostrarToast('Sucesso!', 'Perfil atualizado com sucesso', 'success');
            toggleEdit('pessoais');
            carregarPerfil();
        } else {
            mostrarToast('Erro', data.mensagem, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarToast('Erro', 'Erro de conexão com o servidor', 'error');
    }
});

// Alterar senha
document.getElementById('formSenha').addEventListener('submit', async (e) => {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        mostrarToast('Senhas diferentes', 'As senhas não coincidem', 'error');
        return;
    }

    if (novaSenha.length < 6) {
        mostrarToast('Senha fraca', 'A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/usuarios/senha`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                senhaAtual: senhaAtual,
                novaSenha: novaSenha
            })
        });

        const data = await response.json();

        if (data.sucesso) {
            mostrarToast('Sucesso!', 'Senha alterada com sucesso! Faça login novamente.', 'success');
            document.getElementById('formSenha').reset();
            
            // Logout após 2 segundos
            setTimeout(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarToast('Erro', data.mensagem, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarToast('Erro', 'Erro de conexão com o servidor', 'error');
    }
});

// Desativar conta
function desativarConta() {
    if (confirm('Tem certeza que deseja desativar sua conta? Você poderá reativá-la fazendo login novamente.')) {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3000/api/usuarios/desativar', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Conta desativada com sucesso');
                logout();
            } else {
                alert(data.mensagem || 'Erro ao desativar conta');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor');
        });
    }
}

// Excluir conta
function excluirConta() {
    if (confirm('⚠️ ATENÇÃO: Esta ação é irreversível! Todos os seus dados serão permanentemente excluídos. Deseja continuar?')) {
        if (confirm('Digite "EXCLUIR" para confirmar a exclusão permanente da conta:')) {
            const confirmacao = prompt('Digite "EXCLUIR" (em maiúsculas):');
            
            if (confirmacao === 'EXCLUIR') {
                const token = localStorage.getItem('token');

                fetch('http://localhost:3000/api/usuarios/excluir', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        alert('Conta excluída permanentemente');
                        logout();
                    } else {
                        alert(data.mensagem || 'Erro ao excluir conta');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro de conexão com o servidor');
                });
            } else {
                alert('Confirmação incorreta. Exclusão cancelada.');
            }
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}
