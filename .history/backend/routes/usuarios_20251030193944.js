// routes/usuarios.js - Rotas de perfil de usuário
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database-sqlite');
const multer = require('multer');
const path = require('path');

// Middleware de autenticação
const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token não fornecido'
        });
    }

    const sessao = db.prepare('SELECT * FROM sessoes WHERE token = ?').get(token);
    
    if (!sessao) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Sessão inválida'
        });
    }

    // Verificar expiração
    if (new Date(sessao.expira_em) < new Date()) {
        db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Sessão expirada'
        });
    }

    req.usuarioId = sessao.usuario_id;
    next();
};

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/perfil/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});

// ROTA: Buscar dados do perfil
router.get('/perfil', auth, (req, res) => {
    try {
        const usuario = db.prepare(`
            SELECT id, nome, email, telefone, data_nascimento, foto_perfil, 
                   tipo_usuario, status, criado_em
            FROM usuarios 
            WHERE id = ?
        `).get(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Buscar estatísticas
        const totalConsultas = db.prepare(`
            SELECT COUNT(*) as count 
            FROM consultas 
            WHERE usuario_id = ?
        `).get(req.usuarioId);

        const diasCadastro = Math.floor(
            (Date.now() - new Date(usuario.criado_em).getTime()) / (1000 * 60 * 60 * 24)
        );

        res.json({
            sucesso: true,
            usuario: {
                ...usuario,
                totalConsultas: totalConsultas.count,
                diasCadastro
            }
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar dados do perfil'
        });
    }
});

// ROTA: Atualizar dados pessoais
router.put('/perfil', auth, (req, res) => {
    try {
        const { nome, telefone, data_nascimento } = req.body;

        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome é obrigatório'
            });
        }

        db.prepare(`
            UPDATE usuarios 
            SET nome = ?, telefone = ?, data_nascimento = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(nome, telefone || null, data_nascimento || null, req.usuarioId);

        const usuarioAtualizado = db.prepare(`
            SELECT id, nome, email, telefone, data_nascimento, foto_perfil
            FROM usuarios 
            WHERE id = ?
        `).get(req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Perfil atualizado com sucesso!',
            usuario: usuarioAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar perfil'
        });
    }
});

// ROTA: Upload de foto de perfil
router.post('/perfil/foto', auth, upload.single('foto'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhuma foto enviada'
            });
        }

        const fotoUrl = '/uploads/perfil/' + req.file.filename;

        db.prepare(`
            UPDATE usuarios 
            SET foto_perfil = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(fotoUrl, req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Foto atualizada com sucesso!',
            foto_perfil: fotoUrl
        });

    } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer upload da foto'
        });
    }
});

// ROTA: Alterar senha
router.put('/senha', auth, async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Senha atual e nova senha são obrigatórias'
            });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A nova senha deve ter no mínimo 6 caracteres'
            });
        }

        // Buscar senha atual do banco
        const usuario = db.prepare('SELECT senha FROM usuarios WHERE id = ?').get(req.usuarioId);

        // Verificar senha atual
        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha
        db.prepare(`
            UPDATE usuarios 
            SET senha = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(novaSenhaHash, req.usuarioId);

        // Invalidar todas as sessões antigas
        db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Senha alterada com sucesso! Por favor, faça login novamente.'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao alterar senha'
        });
    }
});

// ROTA: Desativar conta
router.put('/desativar', auth, (req, res) => {
    try {
        db.prepare(`
            UPDATE usuarios 
            SET status = 'inativo', atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(req.usuarioId);

        // Invalidar todas as sessões
        db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Conta desativada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao desativar conta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao desativar conta'
        });
    }
});

// ROTA: Excluir conta permanentemente
router.delete('/excluir', auth, async (req, res) => {
    try {
        const { senha } = req.body;

        if (!senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Senha é obrigatória para excluir a conta'
            });
        }

        // Buscar usuário
        const usuario = db.prepare('SELECT senha FROM usuarios WHERE id = ?').get(req.usuarioId);

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Senha incorreta'
            });
        }

        // Excluir em cascata
        db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(req.usuarioId);
        db.prepare('DELETE FROM consultas WHERE usuario_id = ?').run(req.usuarioId);
        db.prepare('DELETE FROM mensagens WHERE remetente_id = ? OR destinatario_id = ?')
            .run(req.usuarioId, req.usuarioId);
        db.prepare('DELETE FROM forum_posts WHERE usuario_id = ?').run(req.usuarioId);
        db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.usuarioId);

        res.json({
            sucesso: true,
            mensagem: 'Conta excluída permanentemente'
        });

    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir conta'
        });
    }
});

module.exports = router;
