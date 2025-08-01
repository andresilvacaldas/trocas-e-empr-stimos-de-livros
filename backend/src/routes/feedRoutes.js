const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const FeedController = require('../controllers/feedController');

// Rotas públicas
router.get('/', FeedController.getAllPosts);
router.get('/:id', FeedController.getPostById);
router.get('/:id/comments', FeedController.getComments);

// Rotas protegidas (que precisam de autenticação)
router.post('/', authenticateToken, FeedController.createPost);
router.put('/:id', authenticateToken, FeedController.updatePost);
router.delete('/:id', authenticateToken, FeedController.deletePost);
router.post('/:id/like', authenticateToken, FeedController.toggleLike);
router.post('/:id/comments', authenticateToken, FeedController.addComment); 

module.exports = router;