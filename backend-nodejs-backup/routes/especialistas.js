const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');

// Middleware de autenticação
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido' });
        }

        const sessao = db.prepare('SELECT * FROM sessoes WHERE token = ?').get(token);
        if (!sessao || new Date(sessao.expira_em) < new Date()) {
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado' });
        }

        req.usuarioId = sessao.usuario_id;
        next();
    } catch (error) {
        res.status(401).json({ sucesso: false, mensagem: 'Erro na autenticação' });
    }
};

// Dashboard - Dados gerais do especialista
router.get('/dashboard', auth, (req, res) => {
    try {
        // Buscar dados do especialista
        const especialista = db.prepare(`
            SELECT u.*, e.* 
            FROM usuarios u
            JOIN especialistas e ON e.usuario_id = u.id
            WHERE u.id = ?
        `).get(req.usuarioId);

        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        // Estatísticas
        const hoje = new Date().toISOString().split('T')[0];
        
        const consultasHoje = db.prepare(`
            SELECT COUNT(*) as count 
            FROM consultas 
            WHERE especialista_id = ? AND data_consulta = ? AND status = 'agendada'
        `).get(especialista.id, hoje).count;

        const pacientesAtivos = db.prepare(`
            SELECT COUNT(DISTINCT paciente_id) as count 
            FROM consultas 
            WHERE especialista_id = ?
        `).get(especialista.id).count;

        const mensagensNaoLidas = db.prepare(`
            SELECT COUNT(*) as count 
            FROM mensagens 
            WHERE destinatario_id = ? AND lido = 0
        `).get(req.usuarioId).count;

        const avaliacaoMedia = db.prepare(`
            SELECT AVG(avaliacao) as media 
            FROM consultas 
            WHERE especialista_id = ? AND avaliacao IS NOT NULL
        `).get(especialista.id).media || 5.0;

        res.json({
            sucesso: true,
            especialista: {
                id: especialista.id,
                nome: especialista.nome,
                email: especialista.email,
                foto_perfil: especialista.foto_perfil,
                especialidade: especialista.especialidade,
                registro_profissional: especialista.registro_profissional,
                biografia: especialista.biografia,
                valor_consulta: especialista.valor_consulta,
                disponibilidade: especialista.disponibilidade
            },
            estatisticas: {
                consultasHoje,
                pacientesAtivos,
                mensagensNaoLidas,
                avaliacaoMedia: parseFloat(avaliacaoMedia.toFixed(1))
            }
        });
    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar dashboard' });
    }
});

// Próximas consultas
router.get('/proximas-consultas', auth, (req, res) => {
    try {
        const especialista = db.prepare('SELECT id FROM especialistas WHERE usuario_id = ?').get(req.usuarioId);
        
        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        const hoje = new Date().toISOString().split('T')[0];
        
        const consultas = db.prepare(`
            SELECT c.*, u.nome as paciente_nome
            FROM consultas c
            JOIN usuarios u ON u.id = c.paciente_id
            WHERE c.especialista_id = ? 
              AND c.data_consulta = ? 
              AND c.status = 'agendada'
            ORDER BY c.horario ASC
        `).all(especialista.id, hoje);

        res.json({
            sucesso: true,
            consultas
        });
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar consultas' });
    }
});

// Todas as consultas
router.get('/consultas', auth, (req, res) => {
    try {
        const especialista = db.prepare('SELECT id FROM especialistas WHERE usuario_id = ?').get(req.usuarioId);
        
        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        const consultas = db.prepare(`
            SELECT c.*, u.nome as paciente_nome
            FROM consultas c
            JOIN usuarios u ON u.id = c.paciente_id
            WHERE c.especialista_id = ?
            ORDER BY c.data_consulta DESC, c.horario DESC
        `).all(especialista.id);

        res.json({
            sucesso: true,
            consultas
        });
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar consultas' });
    }
});

// Pacientes
router.get('/pacientes', auth, (req, res) => {
    try {
        const especialista = db.prepare('SELECT id FROM especialistas WHERE usuario_id = ?').get(req.usuarioId);
        
        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        const pacientes = db.prepare(`
            SELECT DISTINCT 
                u.id,
                u.nome,
                u.email,
                u.foto_perfil,
                (SELECT COUNT(*) FROM consultas WHERE paciente_id = u.id AND especialista_id = ?) as total_consultas
            FROM usuarios u
            JOIN consultas c ON c.paciente_id = u.id
            WHERE c.especialista_id = ?
            ORDER BY u.nome ASC
        `).all(especialista.id, especialista.id);

        res.json({
            sucesso: true,
            pacientes
        });
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar pacientes' });
    }
});

// Atualizar configurações
router.put('/configuracoes', auth, (req, res) => {
    try {
        const { especialidade, registro_profissional, biografia, valor_consulta, disponibilidade } = req.body;
        
        const especialista = db.prepare('SELECT id FROM especialistas WHERE usuario_id = ?').get(req.usuarioId);
        
        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        db.prepare(`
            UPDATE especialistas 
            SET especialidade = ?,
                registro_profissional = ?,
                biografia = ?,
                valor_consulta = ?,
                disponibilidade = ?
            WHERE id = ?
        `).run(
            especialidade,
            registro_profissional,
            biografia,
            valor_consulta,
            disponibilidade,
            especialista.id
        );

        res.json({
            sucesso: true,
            mensagem: 'Configurações atualizadas com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar configurações' });
    }
});

// Gerar link Google Meet
router.post('/gerar-meet/:consultaId', auth, (req, res) => {
    try {
        const { consultaId } = req.params;
        
        const especialista = db.prepare('SELECT id FROM especialistas WHERE usuario_id = ?').get(req.usuarioId);
        
        if (!especialista) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especialista não encontrado' });
        }

        // Verificar se a consulta pertence ao especialista
        const consulta = db.prepare('SELECT * FROM consultas WHERE id = ? AND especialista_id = ?').get(consultaId, especialista.id);
        
        if (!consulta) {
            return res.status(404).json({ sucesso: false, mensagem: 'Consulta não encontrada' });
        }

        // Gerar link único do Google Meet
        const linkMeet = `https://meet.google.com/tea-${consultaId}-${Date.now().toString(36)}`;
        
        // Atualizar consulta com o link
        db.prepare('UPDATE consultas SET link_meet = ? WHERE id = ?').run(linkMeet, consultaId);

        res.json({
            sucesso: true,
            link_meet: linkMeet
        });
    } catch (error) {
        console.error('Erro ao gerar link Meet:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar link' });
    }
});

module.exports = router;
