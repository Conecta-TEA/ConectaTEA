const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { enviarEmailOTP } = require('../config/email');
const { gerarCodigoOTP, otpExpirou, calcularExpiracao } = require('../utils/otp');

// CADASTRO - Passo 1: Criar conta
async function cadastrar(req, res) {
    const { nome, email, senha, telefone, cpf, data_nascimento, tipo_usuario } = req.body;

    try {
        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verificar se email já existe
        const [usuarioExistente] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        const [resultado] = await pool.query(
            `INSERT INTO usuarios (nome, email, senha, telefone, cpf, data_nascimento, tipo_usuario, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
            [nome, email, senhaHash, telefone || null, cpf || null, data_nascimento || null, tipo_usuario || 'paciente']
        );

        const usuarioId = resultado.insertId;

        // Gerar código OTP
        const codigo = gerarCodigoOTP();
        const expiraEm = calcularExpiracao();

        // Salvar OTP no banco
        await pool.query(
            `INSERT INTO otp_codes (usuario_id, email, codigo, tipo, expira_em, ip_address) 
             VALUES (?, ?, ?, 'verificacao', ?, ?)`,
            [usuarioId, email, codigo, expiraEm, req.ip]
        );

        // Enviar email
        await enviarEmailOTP(email, codigo, 'verificacao', nome);

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_novos, ip_address) 
             VALUES (?, 'CADASTRO', 'usuarios', ?, ?, ?)`,
            [usuarioId, usuarioId, JSON.stringify({ nome, email, tipo_usuario }), req.ip]
        );

        res.status(201).json({
            sucesso: true,
            mensagem: 'Cadastro realizado! Verifique seu email para ativar a conta.',
            dados: {
                usuario_id: usuarioId,
                email: email
            }
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao realizar cadastro'
        });
    }
}

// CADASTRO - Passo 2: Verificar código OTP
async function verificarEmail(req, res) {
    const { email, codigo } = req.body;

    try {
        // Buscar código OTP
        const [otps] = await pool.query(
            `SELECT * FROM otp_codes 
             WHERE email = ? AND codigo = ? AND tipo = 'verificacao' AND usado = FALSE 
             ORDER BY created_at DESC LIMIT 1`,
            [email, codigo]
        );

        if (otps.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido'
            });
        }

        const otp = otps[0];

        // Verificar expiração
        if (otpExpirou(otp.expira_em)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código expirado. Solicite um novo código.'
            });
        }

        // Marcar OTP como usado
        await pool.query(
            'UPDATE otp_codes SET usado = TRUE WHERE id = ?',
            [otp.id]
        );

        // Ativar usuário
        await pool.query(
            'UPDATE usuarios SET email_verificado = TRUE, status = "ativo" WHERE id = ?',
            [otp.usuario_id]
        );

        // Buscar dados do usuário
        const [usuarios] = await pool.query(
            'SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = ?',
            [otp.usuario_id]
        );

        const usuario = usuarios[0];

        // Gerar token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tipo: usuario.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Salvar sessão
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 7);

        await pool.query(
            `INSERT INTO sessoes (usuario_id, token, ip_address, user_agent, expira_em) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuario.id, token, req.ip, req.headers['user-agent'], expiraEm]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, ip_address) 
             VALUES (?, 'VERIFICACAO_EMAIL', ?)`,
            [usuario.id, req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Email verificado com sucesso!',
            dados: {
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo_usuario
                },
                redirecionamento: usuario.tipo_usuario === 'especialista' 
                    ? '/especialista-dashboard.html' 
                    : '/index.html'
            }
        });

    } catch (error) {
        console.error('Erro ao verificar email:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao verificar email'
        });
    }
}

// LOGIN - Passo 1: Solicitar código OTP
async function solicitarLoginOTP(req, res) {
    const { email } = req.body;

    try {
        // Verificar se usuário existe
        const [usuarios] = await pool.query(
            'SELECT id, nome, email, status, email_verificado FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Email não cadastrado'
            });
        }

        const usuario = usuarios[0];

        // Verificar se conta está ativa
        if (usuario.status !== 'ativo') {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Conta inativa. Entre em contato com o suporte.'
            });
        }

        // Gerar código OTP
        const codigo = gerarCodigoOTP();
        const expiraEm = calcularExpiracao();

        // Salvar OTP no banco
        await pool.query(
            `INSERT INTO otp_codes (usuario_id, email, codigo, tipo, expira_em, ip_address) 
             VALUES (?, ?, ?, 'login', ?, ?)`,
            [usuario.id, email, codigo, expiraEm, req.ip]
        );

        // Enviar email
        await enviarEmailOTP(email, codigo, 'login', usuario.nome);

        res.json({
            sucesso: true,
            mensagem: 'Código enviado para seu email!',
            dados: {
                email: email
            }
        });

    } catch (error) {
        console.error('Erro ao solicitar login OTP:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao enviar código'
        });
    }
}

// LOGIN - Passo 2: Verificar código OTP e fazer login
async function verificarLoginOTP(req, res) {
    const { email, codigo } = req.body;

    try {
        // Buscar código OTP
        const [otps] = await pool.query(
            `SELECT * FROM otp_codes 
             WHERE email = ? AND codigo = ? AND tipo = 'login' AND usado = FALSE 
             ORDER BY created_at DESC LIMIT 1`,
            [email, codigo]
        );

        if (otps.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido'
            });
        }

        const otp = otps[0];

        // Verificar expiração
        if (otpExpirou(otp.expira_em)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código expirado. Solicite um novo código.'
            });
        }

        // Marcar OTP como usado
        await pool.query(
            'UPDATE otp_codes SET usado = TRUE WHERE id = ?',
            [otp.id]
        );

        // Buscar dados completos do usuário
        const [usuarios] = await pool.query(
            'SELECT id, nome, email, tipo_usuario, foto_perfil FROM usuarios WHERE id = ?',
            [otp.usuario_id]
        );

        const usuario = usuarios[0];

        // Gerar token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tipo: usuario.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Salvar sessão
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 7);

        await pool.query(
            `INSERT INTO sessoes (usuario_id, token, ip_address, user_agent, expira_em) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuario.id, token, req.ip, req.headers['user-agent'], expiraEm]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, ip_address) 
             VALUES (?, 'LOGIN', ?)`,
            [usuario.id, req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            dados: {
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo_usuario,
                    foto_perfil: usuario.foto_perfil
                },
                redirecionamento: usuario.tipo_usuario === 'especialista' 
                    ? '/especialista-dashboard.html' 
                    : '/index.html'
            }
        });

    } catch (error) {
        console.error('Erro ao verificar login OTP:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer login'
        });
    }
}

// REENVIAR código OTP
async function reenviarOTP(req, res) {
    const { email, tipo } = req.body;

    try {
        // Buscar usuário
        const [usuarios] = await pool.query(
            'SELECT id, nome FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Email não encontrado'
            });
        }

        const usuario = usuarios[0];

        // Gerar novo código
        const codigo = gerarCodigoOTP();
        const expiraEm = calcularExpiracao();

        // Salvar novo OTP
        await pool.query(
            `INSERT INTO otp_codes (usuario_id, email, codigo, tipo, expira_em, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario.id, email, codigo, tipo, expiraEm, req.ip]
        );

        // Enviar email
        await enviarEmailOTP(email, codigo, tipo, usuario.nome);

        res.json({
            sucesso: true,
            mensagem: 'Novo código enviado!'
        });

    } catch (error) {
        console.error('Erro ao reenviar OTP:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao reenviar código'
        });
    }
}

// LOGOUT
async function logout(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        // Desativar sessão
        await pool.query(
            'UPDATE sessoes SET ativo = FALSE WHERE token = ?',
            [token]
        );

        // Registrar auditoria
        await pool.query(
            `INSERT INTO auditoria (usuario_id, acao, ip_address) 
             VALUES (?, 'LOGOUT', ?)`,
            [req.usuario.id, req.ip]
        );

        res.json({
            sucesso: true,
            mensagem: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer logout'
        });
    }
}

module.exports = {
    cadastrar,
    verificarEmail,
    solicitarLoginOTP,
    verificarLoginOTP,
    reenviarOTP,
    logout
};
