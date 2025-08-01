const NotificationDb = require('../db/notificationDb');

class Notification {
    // Obter notificações do usuário (com ou sem filtro de lidas)
    static async getNotifications(user_id, is_read_status) {
        const model = { user_id, is_read: is_read_status };
        return NotificationDb.getByUser(model);
    }

    // Marcar uma notificação como lida
    static async markAsRead(user_id, notification_id) {
        const model = { user_id, notification_id };
        return NotificationDb.markAsRead(model);
    }

    // (Opcional) Método para criar notificações, a ser chamado por outros módulos
    static async create(user_id, type, title, message, related_id) {
        // Lógica para validar dados de notificação
        const model = { user_id, type, title, message, related_id };
        // Essa função precisaria ser implementada em NotificationDb.js também
        // return NotificationDb.insert(model);
        console.log(`DEBUG: Notificação criada para o usuário ${user_id}. Tipo: ${type}`);
        return true; // Retorno de mock por enquanto
    }
}

module.exports = Notification;