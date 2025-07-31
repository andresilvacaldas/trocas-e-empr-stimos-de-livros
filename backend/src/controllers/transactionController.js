const Transaction = require('../models/transaction');
const Book = require('../models/book'); // O modelo Book (classe) é importado

// 1. Função para Listar transações do usuário
exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { status } = req.query;

        let transactions;

        if (status && Transaction.isValidStatus(status)) { // Chama método estático do modelo
            transactions = await Transaction.selectByStatus({
                user_id: userId,
                status: status
            });
        } else {
            transactions = await Transaction.selectByUser({ user_id: userId }); // Chama método estático do modelo
        }

        res.json(transactions);

    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 2. Função para Obter transação por ID
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID da transação inválido' });
        }

        const transaction = await Transaction.selectById({ // Chama método estático do modelo
            transaction_id: parseInt(id)
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        // Verificar se o usuário tem permissão para ver esta transação
        if (transaction.requester_id !== userId && transaction.owner_id !== userId) {
            return res.status(403).json({
                error: 'Você não tem permissão para ver esta transação'
            });
        }

        res.json(transaction);

    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 3. Função para Criar nova transação
exports.createTransaction = async (req, res) => {
    try {
        const requesterId = req.user.user_id;
        const { book_id, transaction_type, offered_book_id, request_message } = req.body;

        // Validar dados básicos
        const validationErrors = Transaction.validateTransactionData(req.body); // Chama método estático do modelo
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        // Verificar se o livro existe e obter owner_id
        const book = await Book.selectById({ book_id: parseInt(book_id) }); // Chama método estático do modelo
        if (!book) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const ownerId = book.owner_id;

        // Verificar se não está tentando solicitar próprio livro
        if (requesterId === ownerId) {
            return res.status(400).json({
                error: 'Você não pode solicitar seu próprio livro'
            });
        }

        // Verificar se já existe solicitação pendente
        const existingRequest = await Transaction.checkExistingRequest({ // Chama método estático do modelo
            book_id: parseInt(book_id),
            requester_id: requesterId
        });

        if (existingRequest) {
            return res.status(409).json({
                error: 'Você já tem uma solicitação pendente para este livro'
            });
        }

        // Para trocas, verificar se o livro oferecido pertence ao solicitante
        if (transaction_type === 'troca' && offered_book_id) {
            const offeredBook = await Book.selectById({ // Chama método estático do modelo
                book_id: parseInt(offered_book_id)
            });

            if (!offeredBook) {
                return res.status(404).json({ error: 'Livro oferecido não encontrado' });
            }

            if (offeredBook.owner_id !== requesterId) {
                return res.status(403).json({
                    error: 'Você só pode oferecer seus próprios livros'
                });
            }
        }

        const transactionData = Transaction.prepareTransactionData( // Chama método estático do modelo
            req.body, requesterId, ownerId
        );

        const newTransaction = await Transaction.insert(transactionData); // Chama método estático do modelo

        res.status(201).json(newTransaction);

    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 4. Função para Aceitar transação
exports.acceptTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID da transação inválido' });
        }

        const transaction = await Transaction.checkTransaction({ // Chama método estático do modelo
            transaction_id: parseInt(id)
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (!Transaction.canModifyTransaction(transaction, userId)) { // Chama método estático do modelo
            return res.status(403).json({
                error: 'Você não tem permissão para aceitar esta transação ou ela já foi processada'
            });
        }

        const updatedTransaction = await Transaction.updateStatus({ // Chama método estático do modelo
            transaction_id: parseInt(id),
            status: 'aceito',
            owner_id: userId
        });

        res.json(updatedTransaction);

    } catch (error) {
        console.error('Erro ao aceitar transação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 5. Função para Recusar transação
exports.rejectTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID da transação inválido' });
        }

        const transaction = await Transaction.checkTransaction({ // Chama método estático do modelo
            transaction_id: parseInt(id)
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (!Transaction.canModifyTransaction(transaction, userId)) { // Chama método estático do modelo
            return res.status(403).json({
                error: 'Você não tem permissão para recusar esta transação ou ela já foi processada'
            });
        }

        const updatedTransaction = await Transaction.updateStatus({ // Chama método estático do modelo
            transaction_id: parseInt(id),
            status: 'recusado',
            owner_id: userId
        });

        res.json(updatedTransaction);

    } catch (error) {
        console.error('Erro ao recusar transação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 6. Função para Cancelar transação
exports.cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID da transação inválido' });
        }

        const transaction = await Transaction.checkTransaction({ // Chama método estático do modelo
            transaction_id: parseInt(id)
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (!Transaction.canCancelTransaction(transaction, userId)) { // Chama método estático do modelo
            return res.status(403).json({
                error: 'Você não pode cancelar esta transação'
            });
        }

        const cancelled = await Transaction.delete({ // Chama método estático do modelo
            transaction_id: parseInt(id),
            requester_id: userId
        });

        if (!cancelled) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.status(204).send(); // Resposta 204 No Content para cancelamento bem-sucedido

    } catch (error) {
        console.error('Erro ao cancelar transação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};