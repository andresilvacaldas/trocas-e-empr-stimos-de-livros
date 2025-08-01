const MessageDb = require('../db/messageDb');

class Message {
    // Enviar uma nova mensagem
    static async sendMessage(model) {
        // Lógica de validação básica do modelo aqui
        if (!model.content || model.content.trim() === '') {
            throw new Error('O conteúdo da mensagem não pode ser vazio.');
        }
        if (model.sender_id === model.receiver_id) {
            throw new Error('Não é possível enviar uma mensagem para si mesmo.');
        }
        return MessageDb.insert(model);
    }

    // Buscar a conversa entre dois usuários e gerencia o soft delete
    
    static async getConversation(model) {
        return MessageDb.getConversation(model);
    }

    // MÉTODO MODIFICADO: para gerenciar o soft delete
    static async deleteMessage(user_id, message_id) {
        // 1. Obter a mensagem para verificar se o usuário é o remetente ou destinatário
        const message = await MessageDb.getById({ message_id }); 
        if (!message) {
            return false; // Mensagem não encontrada
        }

        let is_sender = false;
        if (message.sender_id === user_id) {
            is_sender = true;
        } else if (message.receiver_id !== user_id) {
            // Se o usuário não é nem o remetente nem o destinatário, não tem permissão
            throw new Error('Você não tem permissão para apagar esta mensagem.');
        }

        return MessageDb.deleteMessage({ message_id, user_id, is_sender });
    }
}

module.exports = Message;