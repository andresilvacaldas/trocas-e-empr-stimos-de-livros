const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const NotificationController = require('../controllers/notificationController');

// Todas as rotas de notificação são protegidas por autenticação
router.use(authenticateToken);

// Obter todas as notificações do usuário logado
router.get('/', NotificationController.getNotifications);

// Marcar uma notificação específica como lida
router.put('/:id/read', NotificationController.markAsRead);

module.exports = router;