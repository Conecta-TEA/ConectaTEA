const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database-sqlite');
const authRoutes = require('./routes/auth-routes');

const app = express();

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);

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
