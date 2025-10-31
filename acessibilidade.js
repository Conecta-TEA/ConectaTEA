// acessibilidade.js - Recursos de acessibilidade

// Estado global de acessibilidade
const acessibilidadeState = {
    altoContraste: false,
    fonteGrande: false,
    libras: false,
    narracao: false,
    tamanhoFonte: 100
};

// Carregar preferências salvas
document.addEventListener('DOMContentLoaded', () => {
    carregarPreferencias();
    inicializarAcessibilidade();
});

function inicializarAcessibilidade() {
    // Criar botão flutuante de acessibilidade
    const btnAcessibilidade = document.createElement('button');
    btnAcessibilidade.className = 'btn-acessibilidade';
    btnAcessibilidade.innerHTML = '<i class="fas fa-universal-access"></i>';
    btnAcessibilidade.onclick = toggleMenuAcessibilidade;
    btnAcessibilidade.setAttribute('aria-label', 'Menu de Acessibilidade');
    document.body.appendChild(btnAcessibilidade);

    // Criar menu de acessibilidade
    const menuAcessibilidade = document.createElement('div');
    menuAcessibilidade.className = 'acessibilidade-menu';
    menuAcessibilidade.id = 'menuAcessibilidade';
    menuAcessibilidade.innerHTML = `
        <div class="acessibilidade-header">
            <h3><i class="fas fa-universal-access"></i> Acessibilidade</h3>
            <button class="btn-close-acessibilidade" onclick="toggleMenuAcessibilidade()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="acessibilidade-content">
            <!-- Alto Contraste -->
            <div class="acessibilidade-opcao">
                <div class="acessibilidade-opcao-info">
                    <div class="acessibilidade-icon icon-blue">
                        <i class="fas fa-adjust"></i>
                    </div>
                    <div class="acessibilidade-opcao-text">
                        <h4>Alto Contraste</h4>
                        <p>Melhora a visualização</p>
                    </div>
                </div>
                <button class="btn-ativar" id="btnAltoContraste" onclick="toggleAltoContraste()">
                    Ativar
                </button>
            </div>

            <!-- Tamanho da Fonte -->
            <div class="acessibilidade-opcao">
                <div class="acessibilidade-opcao-info">
                    <div class="acessibilidade-icon icon-green">
                        <i class="fas fa-text-height"></i>
                    </div>
                    <div class="acessibilidade-opcao-text">
                        <h4>Tamanho do Texto</h4>
                        <p>Ajuste o tamanho da fonte</p>
                    </div>
                </div>
                <div class="font-controls">
                    <button class="btn-font" onclick="diminuirFonte()">A-</button>
                    <button class="btn-font" onclick="aumentarFonte()">A+</button>
                    <button class="btn-font" onclick="resetarFonte()">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </div>

            <!-- Libras -->
            <div class="acessibilidade-opcao">
                <div class="acessibilidade-opcao-info">
                    <div class="acessibilidade-icon icon-purple">
                        <i class="fas fa-hands"></i>
                    </div>
                    <div class="acessibilidade-opcao-text">
                        <h4>Intérprete de Libras</h4>
                        <p>Tradução em Libras (em breve)</p>
                    </div>
                </div>
                <button class="btn-ativar" id="btnLibras" onclick="toggleLibras()">
                    Ativar
                </button>
            </div>

            <!-- Narração -->
            <div class="acessibilidade-opcao">
                <div class="acessibilidade-opcao-info">
                    <div class="acessibilidade-icon icon-orange">
                        <i class="fas fa-volume-up"></i>
                    </div>
                    <div class="acessibilidade-opcao-text">
                        <h4>Narração de Texto</h4>
                        <p>Leitura automática do conteúdo</p>
                    </div>
                </div>
                <button class="btn-ativar" id="btnNarracao" onclick="toggleNarracao()">
                    Ativar
                </button>
            </div>

            <!-- Info -->
            <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-size: 12px; color: #065f46;">
                    <i class="fas fa-info-circle"></i> Suas preferências são salvas automaticamente
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(menuAcessibilidade);

    // Criar modal de Libras
    const librasModal = document.createElement('div');
    librasModal.className = 'libras-modal';
    librasModal.id = 'librasModal';
    librasModal.innerHTML = `
        <div class="libras-content">
            <h2>Intérprete de Libras</h2>
            <div class="libras-video-container">
                <div class="libras-placeholder">
                    <i class="fas fa-hands"></i>
                </div>
            </div>
            <p>Recurso em desenvolvimento. Em breve você poderá ter acesso a um intérprete virtual de Libras!</p>
            <button class="btn-ativar" onclick="toggleLibras()" style="margin-top: 20px;">
                Fechar
            </button>
        </div>
    `;
    document.body.appendChild(librasModal);

    // Criar toast de notificação
    const toast = document.createElement('div');
    toast.className = 'acessibilidade-toast';
    toast.id = 'acessibilidadeToast';
    document.body.appendChild(toast);

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Alt + A = Abrir menu de acessibilidade
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            toggleMenuAcessibilidade();
        }
        // Alt + C = Alto contraste
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            toggleAltoContraste();
        }
        // Alt + + = Aumentar fonte
        if (e.altKey && e.key === '+') {
            e.preventDefault();
            aumentarFonte();
        }
        // Alt + - = Diminuir fonte
        if (e.altKey && e.key === '-') {
            e.preventDefault();
            diminuirFonte();
        }
    });
}

function toggleMenuAcessibilidade() {
    const menu = document.getElementById('menuAcessibilidade');
    menu.classList.toggle('active');
}

function toggleAltoContraste() {
    acessibilidadeState.altoContraste = !acessibilidadeState.altoContraste;
    document.body.classList.toggle('alto-contraste');
    
    const btn = document.getElementById('btnAltoContraste');
    btn.textContent = acessibilidadeState.altoContraste ? 'Desativar' : 'Ativar';
    btn.classList.toggle('active');
    
    salvarPreferencias();
    mostrarToast(acessibilidadeState.altoContraste ? 'Alto contraste ativado' : 'Alto contraste desativado');
    
    if (acessibilidadeState.narracao) {
        narrar(acessibilidadeState.altoContraste ? 'Alto contraste ativado' : 'Alto contraste desativado');
    }
}

function aumentarFonte() {
    if (acessibilidadeState.tamanhoFonte < 150) {
        acessibilidadeState.tamanhoFonte += 10;
        aplicarTamanhoFonte();
        salvarPreferencias();
        mostrarToast(`Fonte: ${acessibilidadeState.tamanhoFonte}%`);
    }
}

function diminuirFonte() {
    if (acessibilidadeState.tamanhoFonte > 80) {
        acessibilidadeState.tamanhoFonte -= 10;
        aplicarTamanhoFonte();
        salvarPreferencias();
        mostrarToast(`Fonte: ${acessibilidadeState.tamanhoFonte}%`);
    }
}

function resetarFonte() {
    acessibilidadeState.tamanhoFonte = 100;
    aplicarTamanhoFonte();
    salvarPreferencias();
    mostrarToast('Fonte resetada para 100%');
}

function aplicarTamanhoFonte() {
    document.documentElement.style.fontSize = `${acessibilidadeState.tamanhoFonte}%`;
}

function toggleLibras() {
    acessibilidadeState.libras = !acessibilidadeState.libras;
    const modal = document.getElementById('librasModal');
    modal.classList.toggle('active');
    
    const btn = document.getElementById('btnLibras');
    btn.textContent = acessibilidadeState.libras ? 'Desativar' : 'Ativar';
    btn.classList.toggle('active');
    
    salvarPreferencias();
}

function toggleNarracao() {
    acessibilidadeState.narracao = !acessibilidadeState.narracao;
    
    const btn = document.getElementById('btnNarracao');
    btn.textContent = acessibilidadeState.narracao ? 'Desativar' : 'Ativar';
    btn.classList.toggle('active');
    
    salvarPreferencias();
    mostrarToast(acessibilidadeState.narracao ? 'Narração ativada' : 'Narração desativada');
    
    if (acessibilidadeState.narracao) {
        narrar('Narração de texto ativada. Passe o mouse sobre os elementos para ouvir o conteúdo');
        ativarNarracao();
    } else {
        desativarNarracao();
    }
}

function ativarNarracao() {
    // Adicionar listeners para narrar ao passar o mouse
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, li').forEach(el => {
        el.addEventListener('mouseenter', function() {
            if (acessibilidadeState.narracao) {
                this.classList.add('narracao-ativa');
                narrar(this.textContent);
            }
        });
        
        el.addEventListener('mouseleave', function() {
            this.classList.remove('narracao-ativa');
        });
    });
}

function desativarNarracao() {
    window.speechSynthesis.cancel();
}

function narrar(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('acessibilidadeToast');
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function salvarPreferencias() {
    localStorage.setItem('acessibilidade', JSON.stringify(acessibilidadeState));
}

function carregarPreferencias() {
    const saved = localStorage.getItem('acessibilidade');
    if (saved) {
        Object.assign(acessibilidadeState, JSON.parse(saved));
        
        // Aplicar preferências salvas
        if (acessibilidadeState.altoContraste) {
            document.body.classList.add('alto-contraste');
            setTimeout(() => {
                const btn = document.getElementById('btnAltoContraste');
                if (btn) {
                    btn.textContent = 'Desativar';
                    btn.classList.add('active');
                }
            }, 100);
        }
        
        if (acessibilidadeState.tamanhoFonte !== 100) {
            aplicarTamanhoFonte();
        }
        
        if (acessibilidadeState.narracao) {
            setTimeout(() => {
                const btn = document.getElementById('btnNarracao');
                if (btn) {
                    btn.textContent = 'Desativar';
                    btn.classList.add('active');
                }
                ativarNarracao();
            }, 100);
        }
    }
}

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    const menu = document.getElementById('menuAcessibilidade');
    const btn = document.querySelector('.btn-acessibilidade');
    
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
    }
});
