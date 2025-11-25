// Configuração de API para Desenvolvimento e Produção
// Este arquivo detecta automaticamente o ambiente e backend (Node.js ou PHP)

const CONFIG = {
    // Detectar se está em produção ou desenvolvimento
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // ESCOLHA O BACKEND (true = PHP, false = Node.js)
    usarPHP: true,  // ← MUDE AQUI PARA ALTERNAR
    
    // URLs de API
    get API_URL() {
        if (this.isDevelopment) {
            // Desenvolvimento local
            if (this.usarPHP) {
                return 'http://localhost/conectatea/backend-php/api';  // XAMPP/PHP
            } else {
                return 'http://localhost:3000/api';  // Node.js
            }
        }
        
        // Produção
        if (this.usarPHP) {
            return 'https://seu-dominio.com/api';  // Hospedagem PHP
        } else {
            return 'https://conectatea.vercel.app/api';  // Vercel/Render
        }
    },
    
    get SOCKET_URL() {
        if (this.isDevelopment) {
            return 'http://localhost:3000';  // Socket.IO só no Node.js
        }
        return 'https://conectatea.vercel.app';
    },
    
    // Outras configurações
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    TOKEN_KEY: 'token',
    USER_KEY: 'usuario'
};

// Log para debug
console.log('🔧 Configuração da API:', {
    ambiente: CONFIG.isDevelopment ? 'Desenvolvimento' : 'Produção',
    backend: CONFIG.usarPHP ? 'PHP (XAMPP)' : 'Node.js (Express)',
    apiUrl: CONFIG.API_URL,
    socketUrl: CONFIG.SOCKET_URL
});

// Exportar para uso global
window.CONFIG = CONFIG;
