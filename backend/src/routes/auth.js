const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware para tratar erros de validação do express-validator
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

// Validações para registro
const registerValidation = [
    body('username')
        .isLength({ min: 3 })
        .withMessage('Nome de usuário deve ter pelo menos 3 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Nome de usuário deve conter apenas letras, números e underscore'),
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }) // Mínimo de 8 caracteres
        .withMessage('Senha deve ter pelo menos 8 caracteres')
        .matches(/[A-Z]/) // Pelo menos uma letra maiúscula
        .withMessage('Senha deve conter pelo menos uma letra maiúscula')
        .matches(/[0-9]/) // Pelo menos um número
        .withMessage('Senha deve conter pelo menos um número')
        .matches(/[^a-zA-Z0-9\s]/) // Pelo menos um caractere especial (não alfanumérico nem espaço)
        .withMessage('Senha deve conter pelo menos um caractere especial'),
    body('full_name')
        .optional()
        .isLength({ max: 150 })
        .withMessage('Nome completo muito longo')
];

// Validações para login
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/register', registerValidation, handleValidationErrors, AuthController.register);
router.post('/login', loginValidation, handleValidationErrors, AuthController.login);

// Rotas protegidas
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword); 
router.delete('/profile', authenticateToken, AuthController.deleteAccount);

module.exports = router;