const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// LISTAR usuários (com filtros e paginação)
async function listarUsuarios(req, res) {
    const { tipo, status, pagina = 1, limite = 10, busca } = req.query;

    try {
        let query = 'SELECT id, nome, email, telefone, tipo_usuario, status, email_verificado, created_at FROM usuarios WHERE 1=1';
        const params = [];

        if (tipo) {
            query += ' AND tipo_usuario = ?';
            params.push(tipo);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (busca) {
            query += ' AND (nome LIKE ? OR email LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // Paginação
        const offset = (pagina - 1) * limite;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), parseInt(offset));

        const [usuarios] = await pool.query(query, params);

        // Contar total
        let countQuery = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
        const countParams = [];

        if (tipo) {
            countQuery += ' AND tipo_usuario = ?';
            countParams.push(tipo);
        }

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (busca) {
            countQuery += ' AND (nome LIKE ? OR email LIKE ?)';
            countParams.push(`%${busca}%`, `%${busca}%`);
        }

        const [total] = await pool.query(countQuery, countParams);

        res.json({
            sucesso: true,
            dados: usuarios,
            paginacao: {
                pagina_atual: parseInt(pagina),
                total_paginas: Math.ceil(total[0].total / limite),
                total_registros: total[0].total
            }
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar usuários'
        });
    }
}

// BUSCAR usuário por ID
async function buscarUsuario(req, res) {
    const { id } = req.params;

    try {
        const [usuarios] = await pool.query(
            `SELECT id, nome, email, telefone, cpf, data_nascimento, foto_perfil, 
                    tipo_usuario, status, email_verificado, created_at, updated_at 
             FROM usuarios WHERE id = ?`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        const usuario = usuarios[0];

        // Se for especialista, buscar dados adicionais
        if (usuario.tipo_usuario === 'especialista') {
            const [especialistas] = await pool.query(
                'SELECT * FROM especialistas WHERE usuario_id = ?',
                [id]
            );

            if (especialistas.length > 0) {
                usuario.especialista = especialistas[0];
            }
        }

        res.json({
            sucesso: true,
            dados: usuario
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar usuário'
        });
    }
}

// ATUALIZAR usuário
async function atualizarUsuario(req, res) {
    const { id } = req.params;
    const { nome, telefone, data_nascimento, foto_perfil } = req.body;

    try {
        // Verificar permissão (só pode editar próprio perfil ou ser admin)
        if (req.usuario.id != id && req.usuario.tipo_usuario !== 'admin') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Sem permissão para editar este usuário'
            });
        }

        // Buscar dados anteriores
        const [usuarioAntigo] = await pool.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarioAntigo.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Atualizar
        await pool.query(
            `UPDATE usuarios SET nome = ?, telefone = ?, data_nascimento = ?, foto_perfil = ? 
             WHERE id = ?`,
            [nome, telefone, data_nascimento, foto_perfil, id]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_anteriores, dados_novos, ip_address) 
             VALUES (?, 'ATUALIZAR_USUARIO', 'usuarios', ?, ?, ?, ?)`,
            [
                req.usuario.id,
                id,
                JSON.stringify(usuarioAntigo[0]),
                JSON.stringify({ nome, telefone, data_nascimento, foto_perfil }),
                req.ip
            ]
        );

        res.json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar usuário'
        });
    }
}

// DELETAR usuário
async function deletarUsuario(req, res) {
    const { id } = req.params;

    try {
        // Apenas admin pode deletar
        if (req.usuario.tipo_usuario !== 'admin') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Apenas administradores podem deletar usuários'
            });
        }

        // Buscar dados antes de deletar
        const [usuario] = await pool.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Deletar
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_anteriores, ip_address) 
             VALUES (?, 'DELETAR_USUARIO', 'usuarios', ?, ?, ?)`,
            [req.usuario.id, id, JSON.stringify(usuario[0]), req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Usuário deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar usuário'
        });
    }
}

// ALTERAR senha
async function alterarSenha(req, res) {
    const { senha_atual, senha_nova } = req.body;

    try {
        // Buscar usuário
        const [usuarios] = await pool.query(
            'SELECT senha FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const senhaCorreta = await bcrypt.compare(senha_atual, usuarios[0].senha);

        if (!senhaCorreta) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const novaSenhaHash = await bcrypt.hash(senha_nova, 10);

        // Atualizar senha
        await pool.query(
            'UPDATE usuarios SET senha = ? WHERE id = ?',
            [novaSenhaHash, req.usuario.id]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, ip_address) 
             VALUES (?, 'ALTERAR_SENHA', ?)`,
            [req.usuario.id, req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao alterar senha'
        });
    }
}

module.exports = {
    listarUsuarios,
    buscarUsuario,
    atualizarUsuario,
    deletarUsuario,
    alterarSenha
};
