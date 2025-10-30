const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

// Rotas públicas (sem autenticação)
router.post('/cadastrar', authController.cadastrar);
router.post('/verificar-email', authController.verificarEmail);
router.post('/login/solicitar-otp', authController.solicitarLoginOTP);
router.post('/login/verificar-otp', authController.verificarLoginOTP);
router.post('/reenviar-otp', authController.reenviarOTP);

// Rotas protegidas (com autenticação)
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
