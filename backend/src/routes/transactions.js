const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const TransactionController = require('../controllers/transactionController');

const router = express.Router();

// Middleware para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Dados inválidos',
            details: errors.array().map(err => err.msg)
        });
    }
    next();
};

// Validações para transação
const transactionValidation = [
    body('book_id')
        .isInt({ min: 1 })
        .withMessage('book_id deve ser um número inteiro positivo'),
    body('transaction_type')
        .isIn(['troca', 'emprestimo'])
        .withMessage('Tipo de transação deve ser "troca" ou "emprestimo"'),
    body('offered_book_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('offered_book_id deve ser um número inteiro positivo'),
    body('request_message')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Mensagem de solicitação muito longa (máximo 500 caracteres)')
];

// Todas as rotas de transação são protegidas
router.use(authenticateToken);

// Rotas
router.get('/', TransactionController.getMyTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.post('/', transactionValidation, handleValidationErrors, TransactionController.createTransaction);
router.put('/:id/accept', TransactionController.acceptTransaction);
router.put('/:id/reject', TransactionController.rejectTransaction);
router.delete('/:id', TransactionController.cancelTransaction);

module.exports = router;