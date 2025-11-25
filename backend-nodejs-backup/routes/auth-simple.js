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
            },
            redirecionamento: usuario.tipo_usuario === 'especialista' 
                ? '/especialista-dashboard.html' 
                : '/index.html'
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
            },
            redirecionamento: usuario.tipo_usuario === 'especialista' 
                ? '/especialista-dashboard.html' 
                : '/index.html'
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

// ROTA: Solicitar recuperação de senha (envia OTP por email)
router.post('/esqueci-senha', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email é obrigatório'
            });
        }

        // Verificar se usuário existe
        const usuario = db.prepare('SELECT id, nome, email FROM usuarios WHERE email = ?').get(email);
        
        if (!usuario) {
            // Por segurança, não informamos se o email existe ou não
            return res.json({
                sucesso: true,
                mensagem: 'Se o email existir, você receberá um código de recuperação'
            });
        }

        // Gerar código OTP de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiração: 10 minutos
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000);
        
        // Salvar OTP no banco
        db.prepare(`
            INSERT INTO otp_codes (email, codigo, tipo, expira_em)
            VALUES (?, ?, 'recuperacao', ?)
        `).run(email, codigo, expiraEm.toISOString());

        // Enviar email com código
        const { enviarEmailOTP } = require('../config/email');
        const emailEnviado = await enviarEmailOTP(email, codigo, 'recuperacao', usuario.nome);

        if (!emailEnviado) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao enviar email. Tente novamente.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Código de recuperação enviado para seu email',
            email: email // Retorna o email para usar no próximo passo
        });

    } catch (error) {
        console.error('Erro ao solicitar recuperação:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao processar solicitação'
        });
    }
});

// ROTA: Validar OTP e redefinir senha
router.post('/redefinir-senha', async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body;

        if (!email || !codigo || !novaSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email, código e nova senha são obrigatórios'
            });
        }

        // Validar senha
        if (novaSenha.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A senha deve ter no mínimo 6 caracteres'
            });
        }

        // Verificar OTP
        const otp = db.prepare(`
            SELECT * FROM otp_codes 
            WHERE email = ? 
            AND codigo = ? 
            AND tipo = 'recuperacao'
            AND usado = 0
            AND expira_em > datetime('now')
            ORDER BY criado_em DESC
            LIMIT 1
        `).get(email, codigo);

        if (!otp) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado'
            });
        }

        // Verificar se usuário existe
        const usuario = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
        
        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Hash da nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha
        db.prepare(`
            UPDATE usuarios 
            SET senha = ?, atualizado_em = CURRENT_TIMESTAMP 
            WHERE email = ?
        `).run(senhaHash, email);

        // Marcar OTP como usado
        db.prepare(`
            UPDATE otp_codes 
            SET usado = 1 
            WHERE id = ?
        `).run(otp.id);

        // Invalidar todas as sessões anteriores do usuário
        db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(usuario.id);

        res.json({
            sucesso: true,
            mensagem: 'Senha redefinida com sucesso! Faça login com a nova senha.'
        });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao redefinir senha'
        });
    }
});

module.exports = router;
