// routes/auth-routes.js - Rotas de autenticação com OTP
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/database-sqlite');

// Configurar transporte de email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Função para gerar código OTP
function gerarOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para enviar email
async function enviarEmail(destinatario, assunto, html) {
    try {
        await transporter.sendMail({
            from: `"ConectaTEA" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            html: html
        });
        return true;
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return false;
    }
}

// Template de email
function templateEmail(codigo, tipo, nome) {
    const titulos = {
        verificacao: 'Bem-vindo ao ConectaTEA!',
        login: 'Seu Código de Acesso',
        recuperacao: 'Recuperar Senha'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 8px; }
                .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .code { font-size: 36px; font-weight: bold; color: #a855f7; text-align: center; margin: 30px 0; letter-spacing: 8px; }
                .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💙 ${titulos[tipo]}</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Olá${nome ? ' ' + nome : ''},</p>
                    <p>Seu código de verificação é:</p>
                    <div class="code">${codigo}</div>
                    <p>Este código expira em <strong>10 minutos</strong>.</p>
                    <p>Se você não solicitou este código, ignore este email.</p>
                </div>
                <div class="footer">
                    <p>ConectaTEA - Apoio para famílias</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// ROTA: Cadastrar novo usuário
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

        // Inserir usuário
        const stmt = db.prepare(`
            INSERT INTO usuarios (nome, email, senha, telefone, data_nascimento, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            nome,
            email,
            senhaHash,
            telefone || null,
            data_nascimento || null,
            tipo_usuario || 'paciente'
        );

        // Gerar e salvar código OTP
        const codigo = gerarOTP();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        db.prepare(`
            INSERT INTO otp_codes (email, codigo, tipo, expira_em)
            VALUES (?, ?, ?, ?)
        `).run(email, codigo, 'verificacao', expiraEm.toISOString());

        // Enviar email
        const emailEnviado = await enviarEmail(
            email,
            'Bem-vindo ao ConectaTEA - Verifique seu Email',
            templateEmail(codigo, 'verificacao', nome)
        );

        res.json({
            sucesso: true,
            mensagem: 'Cadastro realizado! Verifique seu email.',
            usuario_id: info.lastInsertRowid,
            email_enviado: emailEnviado
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar usuário'
        });
    }
});

// ROTA: Verificar email (após cadastro)
router.post('/verificar-email', async (req, res) => {
    try {
        const { email, codigo } = req.body;

        // Buscar código válido
        const otpValido = db.prepare(`
            SELECT * FROM otp_codes 
            WHERE email = ? AND codigo = ? AND tipo = 'verificacao' AND usado = 0
            AND datetime(expira_em) > datetime('now')
            ORDER BY criado_em DESC LIMIT 1
        `).get(email, codigo);

        if (!otpValido) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado'
            });
        }

        // Marcar código como usado
        db.prepare('UPDATE otp_codes SET usado = 1 WHERE id = ?').run(otpValido.id);

        // Ativar email do usuário
        db.prepare('UPDATE usuarios SET email_verificado = 1 WHERE email = ?').run(email);

        res.json({
            sucesso: true,
            mensagem: 'Email verificado com sucesso!'
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao verificar email'
        });
    }
});

// ROTA: Solicitar código OTP para login
router.post('/login/solicitar-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar se usuário existe
        const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
        
        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        if (!usuario.email_verificado) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email não verificado. Verifique sua caixa de entrada.'
            });
        }

        if (usuario.status !== 'ativo') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Gerar código OTP
        const codigo = gerarOTP();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000);

        db.prepare(`
            INSERT INTO otp_codes (email, codigo, tipo, expira_em)
            VALUES (?, ?, ?, ?)
        `).run(email, codigo, 'login', expiraEm.toISOString());

        // Enviar email
        const emailEnviado = await enviarEmail(
            email,
            'Seu Código de Acesso - ConectaTEA',
            templateEmail(codigo, 'login', usuario.nome)
        );

        res.json({
            sucesso: true,
            mensagem: 'Código enviado para seu email!',
            email_enviado: emailEnviado
        });

    } catch (error) {
        console.error('Erro ao solicitar OTP:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao enviar código'
        });
    }
});

// ROTA: Verificar OTP e fazer login
router.post('/login/verificar-otp', async (req, res) => {
    try {
        const { email, codigo } = req.body;

        // Buscar código válido
        const otpValido = db.prepare(`
            SELECT * FROM otp_codes 
            WHERE email = ? AND codigo = ? AND tipo = 'login' AND usado = 0
            AND datetime(expira_em) > datetime('now')
            ORDER BY criado_em DESC LIMIT 1
        `).get(email, codigo);

        if (!otpValido) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado'
            });
        }

        // Marcar como usado
        db.prepare('UPDATE otp_codes SET usado = 1 WHERE id = ?').run(otpValido.id);

        // Buscar usuário
        const usuario = db.prepare(`
            SELECT id, nome, email, tipo_usuario, foto_perfil 
            FROM usuarios WHERE email = ?
        `).get(email);

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
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

// ROTA: Reenviar código OTP
router.post('/reenviar-otp', async (req, res) => {
    try {
        const { email, tipo } = req.body;

        const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
        
        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Gerar novo código
        const codigo = gerarOTP();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000);

        db.prepare(`
            INSERT INTO otp_codes (email, codigo, tipo, expira_em)
            VALUES (?, ?, ?, ?)
        `).run(email, codigo, tipo, expiraEm.toISOString());

        // Enviar email
        const emailEnviado = await enviarEmail(
            email,
            tipo === 'login' ? 'Seu Código de Acesso - ConectaTEA' : 'Bem-vindo ao ConectaTEA',
            templateEmail(codigo, tipo, usuario.nome)
        );

        res.json({
            sucesso: true,
            mensagem: 'Novo código enviado!',
            email_enviado: emailEnviado
        });

    } catch (error) {
        console.error('Erro ao reenviar:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao reenviar código'
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
