const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const BookController = require('../controllers/bookController');

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

// Validações para livro
const bookValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório')
        .isLength({ max: 255 })
        .withMessage('Título muito longo'),
    body('author')
        .trim()
        .notEmpty()
        .withMessage('Autor é obrigatório')
        .isLength({ max: 255 })
        .withMessage('Nome do autor muito longo'),
    body('publisher')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Nome da editora muito longo'),
    body('isbn')
        .optional()
        .trim()
        .matches(/^(\d{9}X|\d{10}|\d{13})$/)
        .withMessage('ISBN deve ter formato válido'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Descrição muito longa'),
    body('condition')
        .isIn(['novo', 'usado - bom', 'usado - razoável', 'usado - ruim'])
        .withMessage('Condição inválida'),
    body('exchange_available')
        .isBoolean()
        .withMessage('exchange_available deve ser boolean'),
    body('loan_available')
        .isBoolean()
        .withMessage('loan_available deve ser boolean'),
    body('available')
        .optional()
        .isBoolean()
        .withMessage('available deve ser boolean')
];

// Rotas públicas
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);

// Rotas protegidas
router.get('/user/my-books', authenticateToken, BookController.getMyBooks);
router.post('/', authenticateToken, bookValidation, handleValidationErrors, BookController.createBook);
router.put('/:id', authenticateToken, bookValidation, handleValidationErrors, BookController.updateBook);
router.delete('/:id', authenticateToken, BookController.deleteBook);

module.exports = router;