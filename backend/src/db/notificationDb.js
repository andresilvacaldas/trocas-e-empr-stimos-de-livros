const db = require('../config/dbPgConfig');

class NotificationDb {
    // Obter notificações por ID de usuário e status (lidas/não lidas)
    static async getByUser(model) {
        const conn = await db.connect();
        const { user_id, is_read } = model;

        let query = `
            SELECT * FROM notifications
            WHERE user_id = $1
        `;
        const params = [user_id];

        if (is_read !== undefined) {
            query += ` AND is_read = $2`;
            params.push(is_read);
        }

        query += ` ORDER BY created_at DESC;`;

        const result = await conn.query(query, params);
        conn.release();
        return result.rows;
    }

    // Marcar uma notificação como lida
    static async markAsRead(model) {
        const conn = await db.connect();
        const { notification_id, user_id } = model;

        const query = `
            UPDATE notifications
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE notification_id = $1 AND user_id = $2
            RETURNING *;
        `;

        const result = await conn.query(query, [notification_id, user_id]);
        conn.release();
        return result.rows[0];
    }
}

module.exports = NotificationDb;