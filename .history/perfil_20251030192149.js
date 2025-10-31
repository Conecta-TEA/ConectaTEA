// perfil.js - Gerenciamento de perfil do usuário

// Carregar dados do usuário
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
    calcularDiasCadastro();
});

function carregarPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Preencher campos
    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefone').value = usuario.telefone || '';
    document.getElementById('dataNascimento').value = usuario.data_nascimento || '';
    
    // Atualizar nome no header
    document.getElementById('headerUserName').textContent = usuario.nome || 'Usuário';

    // Avatar com inicial do nome
    const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U';
    document.getElementById('perfilAvatar').innerHTML = `<span>${inicial}</span>`;
}

function calcularDiasCadastro() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuario && usuario.criado_em) {
        const dataCadastro = new Date(usuario.criado_em);
        const hoje = new Date();
        const diffTime = Math.abs(hoje - dataCadastro);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        document.getElementById('diasCadastro').textContent = diffDays;
    } else {
        document.getElementById('diasCadastro').textContent = '1';
    }

    // TODO: Buscar total de consultas do backend
    document.getElementById('totalConsultas').textContent = '0';
}

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
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const dadosAtualizados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        data_nascimento: document.getElementById('dataNascimento').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/perfil', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosAtualizados)
        });

        const data = await response.json();

        if (response.ok) {
            // Atualizar localStorage
            const usuarioAtualizado = { ...usuario, ...dadosAtualizados };
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

            alert('Perfil atualizado com sucesso!');
            toggleEdit('pessoais');
            carregarPerfil();
        } else {
            alert(data.mensagem || 'Erro ao atualizar perfil');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
});

// Alterar senha
document.getElementById('formSenha').addEventListener('submit', async (e) => {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem');
        return;
    }

    if (novaSenha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/senha', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                senha_atual: senhaAtual,
                nova_senha: novaSenha
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Senha alterada com sucesso!');
            document.getElementById('formSenha').reset();
        } else {
            alert(data.mensagem || 'Erro ao alterar senha');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
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
