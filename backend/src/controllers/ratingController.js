const Rating = require('../models/rating');

// Adicionar uma nova avaliação
exports.addRating = async (req, res) => {
    try {
        const rater_id = req.user.user_id;
        const { transaction_id, rated_id, rating, comment } = req.body;

        if (isNaN(transaction_id)) {
            return res.status(400).json({ error: 'ID da transação inválido.' });
        }
        if (isNaN(parseInt(rated_id))) {
            return res.status(400).json({ error: 'ID do usuário avaliado inválido.' });
        }

        const ratingData = { rater_id, rated_id, rating, comment, transaction_id };
        const newRating = await Rating.addRating(ratingData);

        res.status(201).json({
            message: 'Avaliação adicionada com sucesso.',
            data: newRating
        });

    } catch (error) {
        console.error('Erro ao adicionar avaliação:', error.stack);
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao adicionar avaliação.' });
    }
};

// Obter avaliações de um usuário
exports.getRatings = async (req, res) => {
    try {
        const rated_id = parseInt(req.params.id);

        if (isNaN(rated_id)) {
            return res.status(400).json({ error: 'ID do usuário avaliado inválido.' });
        }

        const ratings = await Rating.getRatings(rated_id);

        res.status(200).json({
            message: 'Avaliações obtidas com sucesso.',
            data: ratings
        });

    } catch (error) {
        console.error('Erro ao obter avaliações:', error.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao obter avaliações.' });
    }
};