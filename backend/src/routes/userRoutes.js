const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const UserController = require('../controllers/userController');

// Todas as rotas deste roteador são protegidas por autenticação
router.use(authenticateToken);

// Obter todas as preferências do usuário
router.get('/preferences', UserController.getPreferences);

// Adicionar uma nova preferência de usuário
router.post('/preferences', UserController.addPreference);
// Deletar uma preferência
router.delete('/preferences/:id', UserController.deletePreference);

module.exports = router;