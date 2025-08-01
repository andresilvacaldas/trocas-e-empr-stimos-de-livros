const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const RatingController = require('../controllers/ratingController');

// Rota pública para obter avaliações de um usuário específico
router.get('/users/:id', RatingController.getRatings);

// Rota protegida para adicionar uma avaliação
router.post('/', authenticateToken, RatingController.addRating);

module.exports = router;