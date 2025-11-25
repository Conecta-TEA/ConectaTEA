const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Todas as rotas necessitam autenticação
router.use(verificarToken);

// Rotas CRUD de consultas
router.post('/', consultaController.criarConsulta);
router.get('/', consultaController.listarConsultas);
router.get('/:id', consultaController.buscarConsulta);
router.put('/:id', consultaController.atualizarConsulta);
router.put('/:id/cancelar', consultaController.cancelarConsulta);
router.delete('/:id', verificarAdmin, consultaController.deletarConsulta);

module.exports = router;
