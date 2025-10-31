const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();
const db = require('./config/database-sqlite');
const authRoutes = require('./routes/auth-simple');
const usuariosRoutes = require('./routes/usuarios');
const chatRoutes = require('./routes/chat');
const especialistasRoutes = require('./routes/especialistas');
const forumRoutes = require('./routes/forum');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
        credentials: true
    }
});

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
app.use('/api/chat', chatRoutes);
app.use('/api/especialistas', especialistasRoutes);

// Socket.IO - Chat em tempo real
const usuariosOnline = new Map();

io.on('connection', (socket) => {
    console.log('👤 Novo cliente conectado:', socket.id);

    // Usuário entra no chat
    socket.on('entrar', (usuarioId) => {
        usuariosOnline.set(usuarioId, socket.id);
        socket.usuarioId = usuarioId;
        console.log(`✅ Usuário ${usuarioId} online`);
        
        // Notificar outros sobre status online
        io.emit('usuario-online', usuarioId);
    });

    // Enviar mensagem
    socket.on('enviar-mensagem', async (data) => {
        try {
            const { destinatario_id, mensagem, tipo } = data;
            
            // Salvar no banco
            const info = db.prepare(`
                INSERT INTO mensagens (remetente_id, destinatario_id, mensagem, tipo)
                VALUES (?, ?, ?, ?)
            `).run(socket.usuarioId, destinatario_id, mensagem, tipo || 'texto');

            const novaMensagem = db.prepare(`
                SELECT m.*, u.nome as remetente_nome, u.foto_perfil as remetente_foto
                FROM mensagens m
                JOIN usuarios u ON u.id = m.remetente_id
                WHERE m.id = ?
            `).get(info.lastInsertRowid);

            // Enviar para o remetente
            socket.emit('mensagem-enviada', novaMensagem);

            // Enviar para o destinatário se estiver online
            const destinatarioSocket = usuariosOnline.get(destinatario_id);
            if (destinatarioSocket) {
                io.to(destinatarioSocket).emit('nova-mensagem', novaMensagem);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            socket.emit('erro', { mensagem: 'Erro ao enviar mensagem' });
        }
    });

    // Digitando...
    socket.on('digitando', (destinatarioId) => {
        const destinatarioSocket = usuariosOnline.get(destinatarioId);
        if (destinatarioSocket) {
            io.to(destinatarioSocket).emit('usuario-digitando', socket.usuarioId);
        }
    });

    // Parou de digitar
    socket.on('parou-digitar', (destinatarioId) => {
        const destinatarioSocket = usuariosOnline.get(destinatarioId);
        if (destinatarioSocket) {
            io.to(destinatarioSocket).emit('usuario-parou-digitar', socket.usuarioId);
        }
    });

    // Marcar como lido
    socket.on('marcar-lido', (contatoId) => {
        try {
            db.prepare(`
                UPDATE mensagens 
                SET lido = 1 
                WHERE remetente_id = ? AND destinatario_id = ? AND lido = 0
            `).run(contatoId, socket.usuarioId);
        } catch (error) {
            console.error('Erro ao marcar como lido:', error);
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        if (socket.usuarioId) {
            usuariosOnline.delete(socket.usuarioId);
            io.emit('usuario-offline', socket.usuarioId);
            console.log(`❌ Usuário ${socket.usuarioId} offline`);
        }
        console.log('👤 Cliente desconectado:', socket.id);
    });
});

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

server.listen(3000, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Servidor ConectaTEA rodando na porta 3000');
    console.log('📧 Email configurado:', process.env.EMAIL_USER);
    console.log('🗄️  Banco: SQLite');
    console.log('💬 Socket.IO: Ativo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
