const RatingDb = require('../db/ratingDb');

class Rating {
    // Adicionar uma nova avaliação
    static async addRating(model) {
        const { rater_id, rated_id, rating, comment, transaction_id } = model;

        // 1. Validar a entrada da avaliação
        if (!rating || rating < 1 || rating > 5) {
            throw new Error('A avaliação deve ser um número entre 1 e 5.');
        }
        if (!rated_id) {
            throw new Error('O ID do usuário a ser avaliado é obrigatório.');
        }
        if (rater_id === rated_id) {
            throw new Error('Você não pode se auto-avaliar.');
        }
        if (comment && comment.length > 500) {
            throw new Error('O comentário é muito longo.');
        }

        // 2. Verificar se a transação pode ser avaliada
        const transaction = await RatingDb.checkIfCanRate({ transaction_id, rater_id });

        if (!transaction) {
            throw new Error('Transação não encontrada.');
        }
        if (transaction.status !== 'concluido') {
            throw new Error('A transação deve estar concluída para ser avaliada.');
        }
        if (transaction.existing_rating) {
            throw new Error('Você já avaliou esta transação.');
        }
        if ((transaction.requester_id !== rater_id && transaction.owner_id !== rater_id) ||
            (transaction.requester_id !== rated_id && transaction.owner_id !== rated_id)) {
            throw new Error('Usuário não participou desta transação.');
        }

        // 3. Inserir a avaliação no banco de dados
        return RatingDb.insert(model);
    }

    // Obter avaliações de um usuário
    static async getRatings(rated_id) {
        return RatingDb.getByRatedUser({ rated_id });
    }
}

module.exports = Rating;