const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Todas as rotas necessitam autenticação
router.use(verificarToken);

// Rotas CRUD de usuários
router.get('/', verificarAdmin, usuarioController.listarUsuarios);
router.get('/:id', usuarioController.buscarUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.delete('/:id', verificarAdmin, usuarioController.deletarUsuario);
router.post('/alterar-senha', usuarioController.alterarSenha);

module.exports = router;
