// Configuração de API para Desenvolvimento e Produção
// Este arquivo detecta automaticamente o ambiente

const CONFIG = {
    // Detectar se está em produção ou desenvolvimento
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // URLs de API
    get API_URL() {
        if (this.isDevelopment) {
            return 'http://localhost:3000/api';
        }
        
        // URL do backend em produção (substitua pela sua URL do Render)
        return 'https://conectatea-backend.onrender.com/api';
    },
    
    get SOCKET_URL() {
        if (this.isDevelopment) {
            return 'http://localhost:3000';
        }
        
        return 'https://conectatea-backend.onrender.com';
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
    apiUrl: CONFIG.API_URL,
    socketUrl: CONFIG.SOCKET_URL
});

// Exportar para uso global
window.CONFIG = CONFIG;
