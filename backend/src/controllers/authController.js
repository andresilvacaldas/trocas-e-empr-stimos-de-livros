// C:\Users\Pichau\Desktop\trocas e emprestimo\backend\src\controllers\authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth'); // Importa a classe Auth do seu modelo (isso permanece)

// REMOVA A DEFINIÇÃO DA CLASSE 'class AuthController { ... }'

// 1. Função de Registro
exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        const userData = { username, email, password, full_name };

        // Validar dados - Você continua usando métodos estáticos da classe Auth (modelo)
        const validationErrors = Auth.validateRegisterData(userData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        // Verificar se usuário já existe
        const existingUsers = await Auth.checkExisting({ email, username });
        if (existingUsers.length > 0) {
            return res.status(409).json({
                error: 'Email ou nome de usuário já cadastrado'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        userData.password = hashedPassword;

        // Inserir usuário
        const newUser = await Auth.register(userData);

        // Gerar token
        const token = jwt.sign(
            { user_id: newUser.user_id, username: newUser.username },
            process.env.JWT_SECRET, // Garanta que JWT_SECRET está no seu .env
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: newUser,
            token
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 2. Função de Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const loginData = { email, password };

        // Validar dados
        const validationErrors = Auth.validateLoginData(loginData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        // Buscar usuário
        const user = await Auth.findByEmail({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET, // Garanta que JWT_SECRET está no seu .env
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login realizado com sucesso',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name
            },
            token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 3. Função para obter perfil do usuário logado
exports.getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id; // req.user é populado pelo middleware de autenticação

        const user = await Auth.findById({ user_id });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            message: 'Perfil obtido com sucesso',
            user
        });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// REMOVA O 'module.exports = AuthController;'
// As funções já são exportadas diretamente via 'exports.nomeDaFuncao'