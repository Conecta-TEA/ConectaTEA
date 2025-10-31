// forum.js
const API_URL = 'http://localhost:3000/api';
let categoriaAtual = '';
let postAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('headerUserName').textContent = usuario.nome;
    carregarPosts();
    carregarPopulares();
    configurarCategorias();
});

function configurarCategorias() {
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            categoriaAtual = item.dataset.category;
            carregarPosts();
        });
    });
}

async function carregarPosts() {
    try {
        const token = localStorage.getItem('token');
        const url = categoriaAtual ? `${API_URL}/forum/posts?categoria=${categoriaAtual}` : `${API_URL}/forum/posts`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.sucesso) {
            renderizarPosts(data.posts);
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

function renderizarPosts(posts) {
    const container = document.getElementById('postsList');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>Nenhuma discussão encontrada</p>
                <p class="empty-subtitle">Seja o primeiro a criar uma discussão e compartilhar suas experiências!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => {
        const inicial = post.autor_nome.charAt(0).toUpperCase();
        const tempo = formatarTempo(post.criado_em);
        const tags = post.tags ? post.tags.split(',') : [];
        
        return `
            <div class="post-item" onclick="verPost(${post.id})">
                <div class="post-header">
                    <div class="post-avatar">${inicial}</div>
                    <div class="post-info">
                        <div class="post-author">
                            <h4>${post.autor_nome}</h4>
                            <span>• ${tempo}</span>
                        </div>
                        <span class="post-category">${post.categoria}</span>
                    </div>
                </div>
                <h3 class="post-title">${post.titulo}</h3>
                <p class="post-content">${post.conteudo.substring(0, 200)}${post.conteudo.length > 200 ? '...' : ''}</p>
                ${tags.length > 0 ? `
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="tag">#${tag.trim()}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="post-footer">
                    <div class="post-stat">
                        <i class="fas fa-eye"></i>
                        <span>${post.visualizacoes || 0}</span>
                    </div>
                    <div class="post-stat">
                        <i class="fas fa-comments"></i>
                        <span>${post.respostas || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function carregarPopulares() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/forum/posts?limit=5&orderBy=visualizacoes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.sucesso) {
            renderizarPopulares(data.posts);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderizarPopulares(posts) {
    const container = document.getElementById('popularPosts');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #94a3b8;">
                <i class="fas fa-fire" style="font-size: 40px; margin-bottom: 10px; opacity: 0.3;"></i>
                <p style="font-size: 13px;">Nenhum post popular ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(p => `
        <div class="popular-post-item" onclick="verPost(${p.id})">
            <h4>${p.titulo}</h4>
            <p><i class="fas fa-eye"></i> ${p.visualizacoes || 0} visualizações</p>
        </div>
    `).join('');
}

async function verPost(postId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/forum/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.sucesso) {
            postAtual = data.post;
            renderizarPostDetalhes(data.post, data.respostas);
            document.getElementById('modalVerPost').classList.add('active');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderizarPostDetalhes(post, respostas) {
    const container = document.getElementById('postDetalhes');
    const tags = post.tags ? post.tags.split(',') : [];
    
    container.innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <h2 class="post-detail-title">${post.titulo}</h2>
                <div class="post-detail-meta">
                    <span class="post-category">${post.categoria}</span>
                    <span>Por ${post.autor_nome}</span>
                    <span>• ${formatarTempo(post.criado_em)}</span>
                </div>
                ${tags.length > 0 ? `
                    <div class="post-tags" style="margin-top: 15px;">
                        ${tags.map(tag => `<span class="tag">#${tag.trim()}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="post-detail-content">${post.conteudo}</div>
            
            <div class="post-responses">
                <div class="responses-header">
                    <h3>${respostas.length} Resposta${respostas.length !== 1 ? 's' : ''}</h3>
                </div>
                <div class="responses-list">
                    ${respostas.map(r => `
                        <div class="response-item">
                            <div class="response-header">
                                <div class="response-avatar">${r.autor_nome.charAt(0)}</div>
                                <div class="response-info">
                                    <h4>${r.autor_nome}</h4>
                                    <span>${formatarTempo(r.criado_em)}</span>
                                </div>
                            </div>
                            <p class="response-content">${r.conteudo}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="response-form">
                    <h4>Responder</h4>
                    <textarea id="respostaConteudo" placeholder="Digite sua resposta..."></textarea>
                    <button class="btn-primary" onclick="enviarResposta()">
                        <i class="fas fa-paper-plane"></i> Enviar Resposta
                    </button>
                </div>
            </div>
        </div>
    `;
}

function abrirNovoPost() {
    document.getElementById('modalNovoPost').classList.add('active');
}

function fecharNovoPost() {
    document.getElementById('modalNovoPost').classList.remove('active');
}

function fecharVerPost() {
    document.getElementById('modalVerPost').classList.remove('active');
}

async function criarPost() {
    const titulo = document.getElementById('postTitulo').value.trim();
    const conteudo = document.getElementById('postConteudo').value.trim();
    const categoria = document.getElementById('postCategoria').value;
    const tags = document.getElementById('postTags').value.trim();

    if (!titulo || !conteudo) {
        mostrarToast('Preencha título e conteúdo', 'danger');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/forum/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, conteudo, categoria, tags })
        });

        const data = await response.json();
        if (data.sucesso) {
            mostrarToast('Post criado com sucesso!', 'success');
            fecharNovoPost();
            carregarPosts();
            document.getElementById('postTitulo').value = '';
            document.getElementById('postConteudo').value = '';
            document.getElementById('postTags').value = '';
        }
    } catch (error) {
        mostrarToast('Erro ao criar post', 'danger');
    }
}

async function enviarResposta() {
    const conteudo = document.getElementById('respostaConteudo').value.trim();
    
    if (!conteudo) {
        mostrarToast('Digite uma resposta', 'danger');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/forum/respostas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ post_id: postAtual.id, conteudo })
        });

        const data = await response.json();
        if (data.sucesso) {
            mostrarToast('Resposta enviada!', 'success');
            verPost(postAtual.id);
        }
    } catch (error) {
        mostrarToast('Erro ao enviar resposta', 'danger');
    }
}

function formatarTempo(data) {
    const diff = Date.now() - new Date(data).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 60) return `${minutos}m atrás`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
}

function buscarPosts() {
    // Implementar busca
}

function ordenarPosts() {
    // Implementar ordenação
}
