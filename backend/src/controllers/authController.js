const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth'); // Importa a classe Auth do seu modelo 

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

//Atualizar perfil do usuário logado
exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id; // ID do usuário vem do token JWT autenticado
        const updateData = req.body; // Dados para atualização vêm do corpo da requisição

        // Chama o método do modelo para atualizar o perfil
        const updatedUser = await Auth.updateProfile(user_id, updateData);

        if (!updatedUser) {
            return res.status(404).json({ error: 'Usuário não encontrado ou nenhum dado para atualizar.' });
        }

        res.status(200).json({
            message: 'Perfil atualizado com sucesso',
            user: { // Retorna apenas os dados públicos/atualizados
                user_id: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                profile_picture_url: updatedUser.profile_picture_url,
                bio: updatedUser.bio,
                city: updatedUser.city,
                state: updatedUser.state,
                updated_at: updatedUser.updated_at
            }
        });

    } catch (error) {
        // Verifica se o erro veio da validação do modelo
        if (error.message.includes('Nome completo muito longo') ||
            error.message.includes('Biografia muito longa') ||
            error.message.includes('Cidade muito longa') ||
            error.message.includes('Estado muito longo') ||
            error.message.includes('URL da foto de perfil inválida')) {
            // Retorna 400 Bad Request com os detalhes da validação
            return res.status(400).json({ error: 'Dados inválidos para atualização', details: error.message.split(', ') });
        }
        console.error('Erro ao atualizar perfil:', error.stack); // Loga o stack trace completo
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar perfil.' });
    }
};

//Atualizar senha do usuário logado
exports.changePassword = async (req, res) => {
    try {
        const user_id = req.user.user_id; // ID do usuário vem do token JWT autenticado
        const { old_password, new_password } = req.body; // Senhas vêm do corpo da requisição

        if (!user_id) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        // Chama o método do modelo para mudar a senha
        const updatedUser = await Auth.changePassword(user_id, old_password, new_password);

        res.status(200).json({
            message: 'Senha atualizada com sucesso',
            user: { // Retorna dados básicos do usuário, sem a senha
                user_id: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email
            }
        });

    } catch (error) {
        // Tratamento de erros específicos vindos do modelo
        if (error.message.includes('Senha antiga incorreta')) {
            return res.status(401).json({ error: 'Senha antiga incorreta.' });
        }
        if (error.message.includes('Senha deve ter pelo menos 8 caracteres') ||
            error.message.includes('Nova senha não pode ser igual') ||
            error.message.includes('obrigatória')) { // Para pegar as mensagens de validação
            return res.status(400).json({ error: 'Dados inválidos para atualização de senha', details: error.message.split(', ') });
        }
        console.error('Erro ao mudar senha:', error.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao mudar senha.' });
    }
};


//Deletar a própria conta (com confirmação de leitura)
exports.deleteAccount = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { password } = req.body; // <-- Pega a senha do corpo da requisição

        const deleted = await Auth.deleteAccount(user_id, password); // <-- Passa a senha para o modelo

        if (!deleted) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(204).send(); // Resposta 204 No Content
    } catch (error) {
        if (error.message === 'Senha incorreta.') {
            return res.status(401).json({ error: error.message });
        }
        if (error.message.includes('senha é necessária')) {
            return res.status(400).json({ error: 'Senha é necessária para confirmar.' });
        }
        console.error('Erro ao deletar conta:', error.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao deletar conta.' });
    }
};