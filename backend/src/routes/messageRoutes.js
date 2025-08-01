const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const MessageController = require('../controllers/messageController');

// Todas as rotas de mensagem são protegidas por autenticação
router.use(authenticateToken);

// Enviar nova mensagem
router.post('/', MessageController.sendMessage);

// Obter conversa com um usuário específico
router.get('/conversation/:receiverId', MessageController.getConversation);

// Deletar uma mensagem tanto enviada tanto recebida 
router.delete('/:id', MessageController.deleteMessage);

module.exports = router;