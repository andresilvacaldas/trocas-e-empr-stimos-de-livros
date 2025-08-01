const db = require('../config/dbPgConfig');

class RatingDb {
    // Inserir uma nova avaliação
    static async insert(model) {
        const conn = await db.connect();
        const { transaction_id, rater_id, rated_id, rating, comment } = model;

        const query = `
            INSERT INTO ratings (transaction_id, rater_id, rated_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const result = await conn.query(query, [transaction_id, rater_id, rated_id, rating, comment]);
        conn.release();
        return result.rows[0];
    }

    // Obter avaliações recebidas por um usuário
    static async getByRatedUser(model) {
        const conn = await db.connect();
        const { rated_id } = model;

        const query = `
            SELECT r.*, u_rater.username as rater_username
            FROM ratings r
            JOIN users u_rater ON r.rater_id = u_rater.user_id
            WHERE r.rated_id = $1
            ORDER BY r.created_at DESC;
        `;

        const result = await conn.query(query, [rated_id]);
        conn.release();
        return result.rows;
    }

    // Verificar se uma transação pode ser avaliada
    static async checkIfCanRate(model) {
        const conn = await db.connect();
        const { transaction_id, rater_id } = model;

        const query = `
            SELECT
                t.transaction_id,
                t.status,
                t.requester_id,
                t.owner_id,
                (SELECT rating_id FROM ratings WHERE transaction_id = t.transaction_id AND rater_id = $2) AS existing_rating
            FROM transactions t
            WHERE t.transaction_id = $1
        `;

        const result = await conn.query(query, [transaction_id, rater_id]);
        conn.release();
        return result.rows[0];
    }
}

module.exports = RatingDb;