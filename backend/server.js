const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const consultaRoutes = require('./routes/consultaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/consultas', consultaRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API ConectaTEA funcionando!',
        versao: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            usuarios: '/api/usuarios',
            consultas: '/api/consultas'
        }
    });
});

// Rota para verificar saúde da API
app.get('/api/health', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        status: 'online',
        database: dbStatus ? 'conectado' : 'desconectado',
        timestamp: new Date().toISOString()
    });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Endpoint não encontrado'
    });
});

// Tratamento de erros gerais
app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Iniciar servidor
async function iniciarServidor() {
    try {
        // Testar conexão com banco de dados
        const dbConectado = await testConnection();
        
        if (!dbConectado) {
            console.error('❌ Não foi possível conectar ao banco de dados');
            console.log('📝 Verifique as configurações no arquivo .env');
            console.log('📝 Execute o script database.sql para criar as tabelas');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 ===================================');
            console.log(`🚀  Servidor rodando na porta ${PORT}`);
            console.log('🚀 ===================================');
            console.log('');
            console.log('📍 Endpoints disponíveis:');
            console.log(`   http://localhost:${PORT}/`);
            console.log(`   http://localhost:${PORT}/api/health`);
            console.log(`   http://localhost:${PORT}/api/auth/*`);
            console.log(`   http://localhost:${PORT}/api/usuarios/*`);
            console.log(`   http://localhost:${PORT}/api/consultas/*`);
            console.log('');
            console.log('📧 Configuração de email:', process.env.EMAIL_USER ? '✅' : '❌');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();

module.exports = app;
