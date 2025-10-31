// routes/auth-simple.js - Autenticação simples SEM OTP
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database-sqlite');

// ROTA: Cadastrar novo usuário (login automático)
router.post('/cadastrar', async (req, res) => {
    try {
        const { nome, email, senha, telefone, data_nascimento, tipo_usuario } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verificar se email já existe
        const usuarioExistente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
        if (usuarioExistente) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário COM EMAIL JÁ VERIFICADO
        const stmt = db.prepare(`
            INSERT INTO usuarios (nome, email, senha, telefone, data_nascimento, tipo_usuario, email_verificado)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `);
        
        const info = stmt.run(
            nome,
            email,
            senhaHash,
            telefone || null,
            data_nascimento || null,
            tipo_usuario || 'paciente'
        );

        // Buscar usuário criado
        const usuario = db.prepare(`
            SELECT id, nome, email, tipo_usuario, foto_perfil 
            FROM usuarios WHERE id = ?
        `).get(info.lastInsertRowid);

        // Gerar token JWT automaticamente
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET || 'conectatea-secret-2024',
            { expiresIn: '7d' }
        );

        // Salvar sessão
        const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        db.prepare(`
            INSERT INTO sessoes (usuario_id, token, expira_em)
            VALUES (?, ?, ?)
        `).run(usuario.id, token, expiraEm.toISOString());

        res.json({
            sucesso: true,
            mensagem: 'Cadastro realizado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario,
                foto_perfil: usuario.foto_perfil
            }
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar usuário'
        });
    }
});

// ROTA: Login com email e senha
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email e senha são obrigatórios'
            });
        }

        // Verificar se usuário existe
        const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
        
        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Email ou senha incorretos'
            });
        }

        if (usuario.status !== 'ativo') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Email ou senha incorretos'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET || 'conectatea-secret-2024',
            { expiresIn: '7d' }
        );

        // Salvar sessão
        const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        db.prepare(`
            INSERT INTO sessoes (usuario_id, token, expira_em)
            VALUES (?, ?, ?)
        `).run(usuario.id, token, expiraEm.toISOString());

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario,
                foto_perfil: usuario.foto_perfil
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer login'
        });
    }
});

// ROTA: Logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
        }

        res.json({
            sucesso: true,
            mensagem: 'Logout realizado com sucesso!'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer logout'
        });
    }
});

module.exports = router;
