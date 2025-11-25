const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido' });
        }

        const sessao = db.prepare('SELECT * FROM sessoes WHERE token = ?').get(token);
        if (!sessao || new Date(sessao.expira_em) < new Date()) {
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });
        }

        req.usuarioId = sessao.usuario_id;
        next();
    } catch (error) {
        res.status(401).json({ sucesso: false, mensagem: 'Erro na autenticação' });
    }
};

// Listar posts
router.get('/posts', auth, (req, res) => {
    try {
        const { categoria, limit, orderBy } = req.query;
        
        let query = `
            SELECT p.*, u.nome as autor_nome,
                   (SELECT COUNT(*) FROM forum_respostas WHERE post_id = p.id) as respostas
            FROM forum_posts p
            JOIN usuarios u ON u.id = p.autor_id
        `;
        
        const params = [];
        
        if (categoria) {
            query += ' WHERE p.categoria = ?';
            params.push(categoria);
        }
        
        query += ' ORDER BY ';
        if (orderBy === 'visualizacoes') {
            query += 'p.visualizacoes DESC';
        } else {
            query += 'p.criado_em DESC';
        }
        
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        
        const posts = db.prepare(query).all(...params);
        
        res.json({ sucesso: true, posts });
    } catch (error) {
        console.error('Erro ao listar posts:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar posts' });
    }
});

// Ver post detalhado
router.get('/posts/:id', auth, (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar post
        const post = db.prepare(`
            SELECT p.*, u.nome as autor_nome
            FROM forum_posts p
            JOIN usuarios u ON u.id = p.autor_id
            WHERE p.id = ?
        `).get(id);
        
        if (!post) {
            return res.status(404).json({ sucesso: false, mensagem: 'Post não encontrado' });
        }
        
        // Incrementar visualizações
        db.prepare('UPDATE forum_posts SET visualizacoes = visualizacoes + 1 WHERE id = ?').run(id);
        
        // Buscar respostas
        const respostas = db.prepare(`
            SELECT r.*, u.nome as autor_nome
            FROM forum_respostas r
            JOIN usuarios u ON u.id = r.autor_id
            WHERE r.post_id = ?
            ORDER BY r.criado_em ASC
        `).all(id);
        
        res.json({ sucesso: true, post, respostas });
    } catch (error) {
        console.error('Erro ao buscar post:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar post' });
    }
});

// Criar post
router.post('/posts', auth, (req, res) => {
    try {
        const { titulo, conteudo, categoria, tags } = req.body;
        
        if (!titulo || !conteudo) {
            return res.status(400).json({ sucesso: false, mensagem: 'Título e conteúdo obrigatórios' });
        }
        
        const result = db.prepare(`
            INSERT INTO forum_posts (autor_id, titulo, conteudo, categoria, tags)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.usuarioId, titulo, conteudo, categoria || 'Geral', tags || '');
        
        res.json({ sucesso: true, post_id: result.lastInsertRowid });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar post' });
    }
});

// Criar resposta
router.post('/respostas', auth, (req, res) => {
    try {
        const { post_id, conteudo } = req.body;
        
        if (!post_id || !conteudo) {
            return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos' });
        }
        
        const result = db.prepare(`
            INSERT INTO forum_respostas (post_id, autor_id, conteudo)
            VALUES (?, ?, ?)
        `).run(post_id, req.usuarioId, conteudo);
        
        res.json({ sucesso: true, resposta_id: result.lastInsertRowid });
    } catch (error) {
        console.error('Erro ao criar resposta:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar resposta' });
    }
});

module.exports = router;
