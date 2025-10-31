// routes/chat.js - Rotas de chat
const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');

// Middleware de autenticação
const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token não fornecido'
        });
    }

    const sessao = db.prepare('SELECT * FROM sessoes WHERE token = ?').get(token);
    
    if (!sessao || new Date(sessao.expira_em) < new Date()) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Sessão inválida ou expirada'
        });
    }

    req.usuarioId = sessao.usuario_id;
    next();
};

// Buscar conversas do usuário
router.get('/conversas', auth, (req, res) => {
    try {
        const conversas = db.prepare(`
            SELECT DISTINCT
                CASE 
                    WHEN m.remetente_id = ? THEN m.destinatario_id
                    ELSE m.remetente_id
                END as contato_id,
                u.nome,
                u.foto_perfil,
                u.tipo_usuario,
                (SELECT mensagem FROM mensagens 
                 WHERE (remetente_id = ? AND destinatario_id = contato_id) 
                    OR (remetente_id = contato_id AND destinatario_id = ?)
                 ORDER BY criado_em DESC LIMIT 1) as ultima_mensagem,
                (SELECT criado_em FROM mensagens 
                 WHERE (remetente_id = ? AND destinatario_id = contato_id) 
                    OR (remetente_id = contato_id AND destinatario_id = ?)
                 ORDER BY criado_em DESC LIMIT 1) as data_ultima_mensagem,
                (SELECT COUNT(*) FROM mensagens 
                 WHERE remetente_id = contato_id 
                   AND destinatario_id = ? 
                   AND lido = 0) as nao_lidas
            FROM mensagens m
            JOIN usuarios u ON u.id = contato_id
            WHERE m.remetente_id = ? OR m.destinatario_id = ?
            ORDER BY data_ultima_mensagem DESC
        `).all(
            req.usuarioId, req.usuarioId, req.usuarioId,
            req.usuarioId, req.usuarioId, req.usuarioId,
            req.usuarioId, req.usuarioId
        );

        res.json({
            sucesso: true,
            conversas
        });
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar conversas'
        });
    }
});

// Buscar mensagens de uma conversa
router.get('/mensagens/:contatoId', auth, (req, res) => {
    try {
        const { contatoId } = req.params;

        const mensagens = db.prepare(`
            SELECT 
                m.*,
                u.nome as remetente_nome,
                u.foto_perfil as remetente_foto
            FROM mensagens m
            JOIN usuarios u ON u.id = m.remetente_id
            WHERE (m.remetente_id = ? AND m.destinatario_id = ?)
               OR (m.remetente_id = ? AND m.destinatario_id = ?)
            ORDER BY m.criado_em ASC
        `).all(req.usuarioId, contatoId, contatoId, req.usuarioId);

        // Marcar mensagens como lidas
        db.prepare(`
            UPDATE mensagens 
            SET lido = 1 
            WHERE remetente_id = ? AND destinatario_id = ? AND lido = 0
        `).run(contatoId, req.usuarioId);

        res.json({
            sucesso: true,
            mensagens
        });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar mensagens'
        });
    }
});

// Enviar mensagem (via HTTP, socket.io também enviará)
router.post('/enviar', auth, (req, res) => {
    try {
        const { destinatario_id, mensagem, tipo } = req.body;

        const info = db.prepare(`
            INSERT INTO mensagens (remetente_id, destinatario_id, mensagem, tipo)
            VALUES (?, ?, ?, ?)
        `).run(req.usuarioId, destinatario_id, mensagem, tipo || 'texto');

        const novaMensagem = db.prepare(`
            SELECT m.*, u.nome as remetente_nome, u.foto_perfil as remetente_foto
            FROM mensagens m
            JOIN usuarios u ON u.id = m.remetente_id
            WHERE m.id = ?
        `).get(info.lastInsertRowid);

        res.json({
            sucesso: true,
            mensagem: novaMensagem
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao enviar mensagem'
        });
    }
});

// Marcar mensagens como lidas
router.put('/marcar-lidas/:contatoId', auth, (req, res) => {
    try {
        db.prepare(`
            UPDATE mensagens 
            SET lido = 1 
            WHERE remetente_id = ? AND destinatario_id = ? AND lido = 0
        `).run(req.params.contatoId, req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Mensagens marcadas como lidas'
        });
    } catch (error) {
        console.error('Erro ao marcar mensagens:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao marcar mensagens'
        });
    }
});

// Buscar especialistas para chat
router.get('/especialistas', auth, (req, res) => {
    try {
        const especialistas = db.prepare(`
            SELECT u.id, u.nome, u.foto_perfil, e.especialidade, e.registro_profissional
            FROM usuarios u
            JOIN especialistas e ON e.usuario_id = u.id
            WHERE u.status = 'ativo'
            ORDER BY u.nome
        `).all();

        res.json({
            sucesso: true,
            especialistas
        });
    } catch (error) {
        console.error('Erro ao buscar especialistas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar especialistas'
        });
    }
});

module.exports = router;
