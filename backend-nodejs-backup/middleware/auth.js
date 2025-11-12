const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware para verificar JWT
async function verificarToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token não fornecido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar se sessão está ativa
        const [sessoes] = await pool.query(
            'SELECT * FROM sessoes WHERE token = ? AND ativo = TRUE AND expira_em > NOW()',
            [token]
        );

        if (sessoes.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Sessão inválida ou expirada'
            });
        }

        // Buscar dados do usuário
        const [usuarios] = await pool.query(
            'SELECT id, nome, email, tipo_usuario, status FROM usuarios WHERE id = ?',
            [decoded.id]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        req.usuario = usuarios[0];
        next();
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido'
        });
    }
}

// Middleware para verificar se é admin
function verificarAdmin(req, res, next) {
    if (req.usuario.tipo_usuario !== 'admin') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Acesso negado. Apenas administradores.'
        });
    }
    next();
}

// Middleware para verificar se é especialista
function verificarEspecialista(req, res, next) {
    if (req.usuario.tipo_usuario !== 'especialista' && req.usuario.tipo_usuario !== 'admin') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Acesso negado. Apenas especialistas.'
        });
    }
    next();
}

module.exports = {
    verificarToken,
    verificarAdmin,
    verificarEspecialista
};
