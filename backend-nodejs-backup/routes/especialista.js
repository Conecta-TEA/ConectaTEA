const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { pool } = require('../config/database');

// Middleware para verificar se é especialista
const verificarEspecialista = async (req, res, next) => {
    try {
        const [usuarios] = await pool.query(
            'SELECT tipo_usuario FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );
        
        if (usuarios.length === 0 || usuarios[0].tipo_usuario !== 'especialista') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas especialistas podem acessar.'
            });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar permissão' });
    }
};

// Dashboard - Estatísticas
router.get('/dashboard/stats', verificarToken, verificarEspecialista, async (req, res) => {
    try {
        const especialistaId = req.usuario.id;
        
        // Total de pacientes
        const [totalPacientes] = await pool.query(
            'SELECT COUNT(*) as total FROM especialista_pacientes WHERE especialista_id = ? AND status = "ativo"',
            [especialistaId]
        );
        
        // Reuniões hoje
        const [reunioesHoje] = await pool.query(
            `SELECT COUNT(*) as total FROM reunioes 
             WHERE especialista_id = ? AND DATE(data_hora) = CURDATE() AND status != 'cancelada'`,
            [especialistaId]
        );
        
        // Reuniões pendentes
        const [reunioesPendentes] = await pool.query(
            `SELECT COUNT(*) as total FROM reunioes 
             WHERE especialista_id = ? AND data_hora > NOW() AND status = 'agendada'`,
            [especialistaId]
        );
        
        // Mensagens não lidas
        const [mensagensNaoLidas] = await pool.query(
            'SELECT COUNT(*) as total FROM mensagens WHERE destinatario_id = ? AND lida = FALSE',
            [especialistaId]
        );
        
        res.json({
            sucesso: true,
            dados: {
                total_pacientes: totalPacientes[0].total,
                reunioes_hoje: reunioesHoje[0].total,
                reunioes_pendentes: reunioesPendentes[0].total,
                mensagens_nao_lidas: mensagensNaoLidas[0].total
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas' });
    }
});

// Listar pacientes
router.get('/pacientes', verificarToken, verificarEspecialista, async (req, res) => {
    try {
        const [pacientes] = await pool.query(
            `SELECT u.id, u.nome, u.email, u.foto_perfil, u.telefone,
                    ep.data_vinculo, ep.observacoes, ep.status
             FROM especialista_pacientes ep
             JOIN usuarios u ON ep.paciente_id = u.id
             WHERE ep.especialista_id = ?
             ORDER BY u.nome`,
            [req.usuario.id]
        );
        
        res.json({ sucesso: true, dados: pacientes });
        
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar pacientes' });
    }
});

// Vincular paciente
router.post('/pacientes/vincular', verificarToken, verificarEspecialista, async (req, res) => {
    const { paciente_email, observacoes } = req.body;
    
    try {
        // Buscar paciente pelo email
        const [pacientes] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ? AND tipo_usuario = "paciente"',
            [paciente_email]
        );
        
        if (pacientes.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Paciente não encontrado'
            });
        }
        
        // Vincular
        await pool.query(
            `INSERT INTO especialista_pacientes (especialista_id, paciente_id, observacoes) 
             VALUES (?, ?, ?)`,
            [req.usuario.id, pacientes[0].id, observacoes || null]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Paciente vinculado com sucesso!'
        });
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este paciente já está vinculado a você'
            });
        }
        console.error('Erro ao vincular paciente:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao vincular paciente' });
    }
});

// Listar reuniões
router.get('/reunioes', verificarToken, verificarEspecialista, async (req, res) => {
    try {
        const [reunioes] = await pool.query(
            `SELECT r.*, u.nome as paciente_nome, u.foto_perfil as paciente_foto
             FROM reunioes r
             JOIN usuarios u ON r.paciente_id = u.id
             WHERE r.especialista_id = ?
             ORDER BY r.data_hora DESC
             LIMIT 50`,
            [req.usuario.id]
        );
        
        res.json({ sucesso: true, dados: reunioes });
        
    } catch (error) {
        console.error('Erro ao buscar reuniões:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar reuniões' });
    }
});

// Criar reunião
router.post('/reunioes', verificarToken, verificarEspecialista, async (req, res) => {
    const { paciente_id, titulo, descricao, data_hora, duracao } = req.body;
    
    try {
        // Gerar link do Google Meet (simplificado - você pode integrar com a API do Google)
        const meetId = Math.random().toString(36).substring(2, 12);
        const google_meet_link = `https://meet.google.com/${meetId}`;
        
        const [resultado] = await pool.query(
            `INSERT INTO reunioes (especialista_id, paciente_id, titulo, descricao, data_hora, duracao, google_meet_link) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, paciente_id, titulo, descricao, data_hora, duracao || 60, google_meet_link]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Reunião agendada com sucesso!',
            dados: {
                id: resultado.insertId,
                google_meet_link
            }
        });
        
    } catch (error) {
        console.error('Erro ao criar reunião:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao agendar reunião' });
    }
});

// Atualizar status da reunião
router.patch('/reunioes/:id/status', verificarToken, verificarEspecialista, async (req, res) => {
    const { id } = req.params;
    const { status, notas } = req.body;
    
    try {
        await pool.query(
            'UPDATE reunioes SET status = ?, notas = ? WHERE id = ? AND especialista_id = ?',
            [status, notas || null, id, req.usuario.id]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Status atualizado com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao atualizar reunião:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar reunião' });
    }
});

// Listar prontuários de um paciente
router.get('/prontuarios/:paciente_id', verificarToken, verificarEspecialista, async (req, res) => {
    try {
        const [prontuarios] = await pool.query(
            `SELECT * FROM prontuarios 
             WHERE especialista_id = ? AND paciente_id = ?
             ORDER BY data_atendimento DESC, created_at DESC`,
            [req.usuario.id, req.params.paciente_id]
        );
        
        res.json({ sucesso: true, dados: prontuarios });
        
    } catch (error) {
        console.error('Erro ao buscar prontuários:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar prontuários' });
    }
});

// Criar prontuário
router.post('/prontuarios', verificarToken, verificarEspecialista, async (req, res) => {
    const { paciente_id, titulo, conteudo, tipo, data_atendimento } = req.body;
    
    try {
        const [resultado] = await pool.query(
            `INSERT INTO prontuarios (especialista_id, paciente_id, titulo, conteudo, tipo, data_atendimento) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, paciente_id, titulo, conteudo, tipo || 'evolucao', data_atendimento || new Date()]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Prontuário salvo com sucesso!',
            dados: { id: resultado.insertId }
        });
        
    } catch (error) {
        console.error('Erro ao salvar prontuário:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar prontuário' });
    }
});

module.exports = router;
