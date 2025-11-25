const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { pool } = require('../config/database');

// Listar conversas (últimas mensagens com cada pessoa)
router.get('/conversas', verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        
        const [conversas] = await pool.query(
            `SELECT 
                CASE 
                    WHEN m.remetente_id = ? THEN m.destinatario_id 
                    ELSE m.remetente_id 
                END as contato_id,
                u.nome as contato_nome,
                u.foto_perfil as contato_foto,
                u.tipo_usuario as contato_tipo,
                MAX(m.created_at) as ultima_mensagem_data,
                (SELECT mensagem FROM mensagens 
                 WHERE (remetente_id = contato_id AND destinatario_id = ?) 
                    OR (remetente_id = ? AND destinatario_id = contato_id)
                 ORDER BY created_at DESC LIMIT 1) as ultima_mensagem,
                (SELECT COUNT(*) FROM mensagens 
                 WHERE remetente_id = contato_id 
                   AND destinatario_id = ? 
                   AND lida = FALSE) as nao_lidas
             FROM mensagens m
             JOIN usuarios u ON u.id = CASE 
                WHEN m.remetente_id = ? THEN m.destinatario_id 
                ELSE m.remetente_id 
             END
             WHERE m.remetente_id = ? OR m.destinatario_id = ?
             GROUP BY contato_id, u.nome, u.foto_perfil, u.tipo_usuario
             ORDER BY ultima_mensagem_data DESC`,
            [userId, userId, userId, userId, userId, userId, userId]
        );
        
        res.json({ sucesso: true, dados: conversas });
        
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conversas' });
    }
});

// Buscar mensagens de uma conversa
router.get('/conversa/:contato_id', verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const contatoId = req.params.contato_id;
        
        const [mensagens] = await pool.query(
            `SELECT m.*, 
                    ur.nome as remetente_nome, 
                    ur.foto_perfil as remetente_foto,
                    ud.nome as destinatario_nome,
                    ud.foto_perfil as destinatario_foto
             FROM mensagens m
             JOIN usuarios ur ON m.remetente_id = ur.id
             JOIN usuarios ud ON m.destinatario_id = ud.id
             WHERE (m.remetente_id = ? AND m.destinatario_id = ?)
                OR (m.remetente_id = ? AND m.destinatario_id = ?)
             ORDER BY m.created_at ASC`,
            [userId, contatoId, contatoId, userId]
        );
        
        // Marcar mensagens como lidas
        await pool.query(
            `UPDATE mensagens 
             SET lida = TRUE, data_leitura = NOW() 
             WHERE remetente_id = ? AND destinatario_id = ? AND lida = FALSE`,
            [contatoId, userId]
        );
        
        res.json({ sucesso: true, dados: mensagens });
        
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar mensagens' });
    }
});

// Enviar mensagem
router.post('/enviar', verificarToken, async (req, res) => {
    const { destinatario_id, mensagem } = req.body;
    
    try {
        const [resultado] = await pool.query(
            'INSERT INTO mensagens (remetente_id, destinatario_id, mensagem) VALUES (?, ?, ?)',
            [req.usuario.id, destinatario_id, mensagem]
        );
        
        // Buscar dados da mensagem criada
        const [novaMensagem] = await pool.query(
            `SELECT m.*, 
                    ur.nome as remetente_nome, 
                    ur.foto_perfil as remetente_foto
             FROM mensagens m
             JOIN usuarios ur ON m.remetente_id = ur.id
             WHERE m.id = ?`,
            [resultado.insertId]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Mensagem enviada!',
            dados: novaMensagem[0]
        });
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar mensagem' });
    }
});

// Marcar mensagem como lida
router.patch('/marcar-lida/:mensagem_id', verificarToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE mensagens SET lida = TRUE, data_leitura = NOW() WHERE id = ? AND destinatario_id = ?',
            [req.params.mensagem_id, req.usuario.id]
        );
        
        res.json({ sucesso: true, mensagem: 'Mensagem marcada como lida' });
        
    } catch (error) {
        console.error('Erro ao marcar mensagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao marcar mensagem' });
    }
});

// Buscar contatos disponíveis (para especialista: seus pacientes; para paciente: seus especialistas)
router.get('/contatos', verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        
        // Verificar tipo de usuário
        const [usuario] = await pool.query(
            'SELECT tipo_usuario FROM usuarios WHERE id = ?',
            [userId]
        );
        
        let contatos;
        
        if (usuario[0].tipo_usuario === 'especialista') {
            // Listar pacientes do especialista
            [contatos] = await pool.query(
                `SELECT u.id, u.nome, u.foto_perfil, u.tipo_usuario
                 FROM especialista_pacientes ep
                 JOIN usuarios u ON ep.paciente_id = u.id
                 WHERE ep.especialista_id = ? AND ep.status = 'ativo'
                 ORDER BY u.nome`,
                [userId]
            );
        } else {
            // Listar especialistas do paciente
            [contatos] = await pool.query(
                `SELECT u.id, u.nome, u.foto_perfil, u.tipo_usuario, u.especialidade
                 FROM especialista_pacientes ep
                 JOIN usuarios u ON ep.especialista_id = u.id
                 WHERE ep.paciente_id = ? AND ep.status = 'ativo'
                 ORDER BY u.nome`,
                [userId]
            );
        }
        
        res.json({ sucesso: true, dados: contatos });
        
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar contatos' });
    }
});

module.exports = router;
