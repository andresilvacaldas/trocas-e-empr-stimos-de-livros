const Notification = require('../models/notification');

// Listar todas as notificações do usuário logado
exports.getNotifications = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const is_read = req.query.is_read; // 'true' ou 'false'

        const notifications = await Notification.getNotifications(user_id, is_read);

        res.status(200).json({
            message: 'Notificações obtidas com sucesso.',
            data: notifications
        });

    } catch (error) {
        console.error('Erro ao buscar notificações:', error.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar notificações.' });
    }
};

// Marcar uma notificação específica como lida
exports.markAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const notification_id = parseInt(req.params.id);

        if (isNaN(notification_id)) {
            return res.status(400).json({ error: 'ID da notificação inválido.' });
        }

        const updatedNotification = await Notification.markAsRead(user_id, notification_id);

        if (!updatedNotification) {
            return res.status(404).json({ error: 'Notificação não encontrada ou não pertence ao usuário.' });
        }

        res.status(200).json({
            message: 'Notificação marcada como lida com sucesso.',
            data: updatedNotification
        });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error.stack);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};