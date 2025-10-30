const { pool } = require('../config/database');

// CRIAR consulta (agendamento)
async function criarConsulta(req, res) {
    const { especialista_id, tipo_atendimento, data_consulta, horario_consulta, observacoes } = req.body;

    try {
        const paciente_id = req.usuario.id;

        // Verificar se especialista existe
        const [especialistas] = await pool.query(
            'SELECT * FROM especialistas WHERE id = ?',
            [especialista_id]
        );

        if (especialistas.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Especialista não encontrado'
            });
        }

        // Verificar se horário está disponível
        const [consultasExistentes] = await pool.query(
            `SELECT id FROM consultas 
             WHERE especialista_id = ? AND data_consulta = ? AND horario_consulta = ? 
             AND status NOT IN ('cancelada')`,
            [especialista_id, data_consulta, horario_consulta]
        );

        if (consultasExistentes.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este horário já está ocupado'
            });
        }

        // Criar consulta
        const [resultado] = await pool.query(
            `INSERT INTO consultas (paciente_id, especialista_id, tipo_atendimento, data_consulta, horario_consulta, observacoes, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'agendada')`,
            [paciente_id, especialista_id, tipo_atendimento, data_consulta, horario_consulta, observacoes]
        );

        // Atualizar contador de consultas do especialista
        await pool.query(
            'UPDATE especialistas SET total_consultas = total_consultas + 1 WHERE id = ?',
            [especialista_id]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_novos, ip_address) 
             VALUES (?, 'CRIAR_CONSULTA', 'consultas', ?, ?, ?)`,
            [
                paciente_id,
                resultado.insertId,
                JSON.stringify({ especialista_id, tipo_atendimento, data_consulta, horario_consulta }),
                req.ip
            ]
        );

        res.status(201).json({
            sucesso: true,
            mensagem: 'Consulta agendada com sucesso!',
            dados: {
                consulta_id: resultado.insertId
            }
        });

    } catch (error) {
        console.error('Erro ao criar consulta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao agendar consulta'
        });
    }
}

// LISTAR consultas do usuário
async function listarConsultas(req, res) {
    const { status, pagina = 1, limite = 10 } = req.query;
    const usuario_id = req.usuario.id;

    try {
        let query = `
            SELECT c.*, 
                   u.nome as especialista_nome, u.foto_perfil as especialista_foto,
                   e.especialidade, e.registro_profissional
            FROM consultas c
            INNER JOIN especialistas e ON c.especialista_id = e.id
            INNER JOIN usuarios u ON e.usuario_id = u.id
            WHERE c.paciente_id = ?
        `;
        const params = [usuario_id];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }

        const offset = (pagina - 1) * limite;
        query += ' ORDER BY c.data_consulta DESC, c.horario_consulta DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), parseInt(offset));

        const [consultas] = await pool.query(query, params);

        // Contar total
        let countQuery = 'SELECT COUNT(*) as total FROM consultas WHERE paciente_id = ?';
        const countParams = [usuario_id];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const [total] = await pool.query(countQuery, countParams);

        res.json({
            sucesso: true,
            dados: consultas,
            paginacao: {
                pagina_atual: parseInt(pagina),
                total_paginas: Math.ceil(total[0].total / limite),
                total_registros: total[0].total
            }
        });

    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar consultas'
        });
    }
}

// BUSCAR consulta específica
async function buscarConsulta(req, res) {
    const { id } = req.params;

    try {
        const [consultas] = await pool.query(
            `SELECT c.*, 
                   u.nome as especialista_nome, u.email as especialista_email, u.foto_perfil as especialista_foto,
                   e.especialidade, e.registro_profissional, e.valor_consulta
            FROM consultas c
            INNER JOIN especialistas e ON c.especialista_id = e.id
            INNER JOIN usuarios u ON e.usuario_id = u.id
            WHERE c.id = ?`,
            [id]
        );

        if (consultas.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Consulta não encontrada'
            });
        }

        res.json({
            sucesso: true,
            dados: consultas[0]
        });

    } catch (error) {
        console.error('Erro ao buscar consulta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar consulta'
        });
    }
}

// ATUALIZAR consulta
async function atualizarConsulta(req, res) {
    const { id } = req.params;
    const { tipo_atendimento, data_consulta, horario_consulta, observacoes, status } = req.body;

    try {
        // Buscar consulta
        const [consultas] = await pool.query(
            'SELECT * FROM consultas WHERE id = ?',
            [id]
        );

        if (consultas.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Consulta não encontrada'
            });
        }

        const consulta = consultas[0];

        // Verificar permissão
        if (consulta.paciente_id != req.usuario.id && req.usuario.tipo_usuario !== 'admin') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Sem permissão para editar esta consulta'
            });
        }

        // Atualizar
        await pool.query(
            `UPDATE consultas 
             SET tipo_atendimento = ?, data_consulta = ?, horario_consulta = ?, observacoes = ?, status = ?
             WHERE id = ?`,
            [
                tipo_atendimento || consulta.tipo_atendimento,
                data_consulta || consulta.data_consulta,
                horario_consulta || consulta.horario_consulta,
                observacoes || consulta.observacoes,
                status || consulta.status,
                id
            ]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_anteriores, dados_novos, ip_address) 
             VALUES (?, 'ATUALIZAR_CONSULTA', 'consultas', ?, ?, ?, ?)`,
            [
                req.usuario.id,
                id,
                JSON.stringify(consulta),
                JSON.stringify({ tipo_atendimento, data_consulta, horario_consulta, observacoes, status }),
                req.ip
            ]
        );

        res.json({
            sucesso: true,
            mensagem: 'Consulta atualizada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar consulta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar consulta'
        });
    }
}

// CANCELAR consulta
async function cancelarConsulta(req, res) {
    const { id } = req.params;
    const { motivo_cancelamento } = req.body;

    try {
        // Buscar consulta
        const [consultas] = await pool.query(
            'SELECT * FROM consultas WHERE id = ?',
            [id]
        );

        if (consultas.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Consulta não encontrada'
            });
        }

        const consulta = consultas[0];

        // Verificar permissão
        if (consulta.paciente_id != req.usuario.id && req.usuario.tipo_usuario !== 'admin') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Sem permissão para cancelar esta consulta'
            });
        }

        // Cancelar
        await pool.query(
            `UPDATE consultas SET status = 'cancelada', motivo_cancelamento = ? WHERE id = ?`,
            [motivo_cancelamento, id]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_novos, ip_address) 
             VALUES (?, 'CANCELAR_CONSULTA', 'consultas', ?, ?, ?)`,
            [req.usuario.id, id, JSON.stringify({ motivo_cancelamento }), req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Consulta cancelada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cancelar consulta'
        });
    }
}

// DELETAR consulta (apenas admin)
async function deletarConsulta(req, res) {
    const { id } = req.params;

    try {
        if (req.usuario.tipo_usuario !== 'admin') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Apenas administradores podem deletar consultas'
            });
        }

        const [consulta] = await pool.query(
            'SELECT * FROM consultas WHERE id = ?',
            [id]
        );

        if (consulta.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Consulta não encontrada'
            });
        }

        await pool.query('DELETE FROM consultas WHERE id = ?', [id]);

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_anteriores, ip_address) 
             VALUES (?, 'DELETAR_CONSULTA', 'consultas', ?, ?, ?)`,
            [req.usuario.id, id, JSON.stringify(consulta[0]), req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Consulta deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar consulta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar consulta'
        });
    }
}

module.exports = {
    criarConsulta,
    listarConsultas,
    buscarConsulta,
    atualizarConsulta,
    cancelarConsulta,
    deletarConsulta
};
