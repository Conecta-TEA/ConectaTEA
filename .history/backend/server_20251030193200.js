const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/database-sqlite');
const authRoutes = require('./routes/auth-simple');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
    res.json({ 
        nome: 'ConectaTEA API',
        status: 'online',
        versao: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/api/health'
        }
    });
});

app.get('/api/health', (req, res) => {
    try {
        const result = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
        res.json({
            status: 'ok',
            database: 'conectado',
            usuarios: result.count
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            mensagem: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Servidor ConectaTEA rodando na porta 3000');
    console.log('📧 Email configurado:', process.env.EMAIL_USER);
    console.log('🗄️  Banco: SQLite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
