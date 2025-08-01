const AuthDb = require('../db/authDb');
const bcrypt = require('bcryptjs');

class Auth {
    
    // Registrar novo usuário
    static register(model) {
        return AuthDb.insert(model);
    }
    
    // Buscar usuário por email para login
    static findByEmail(model) {
        return AuthDb.findByEmail(model);
    }
    
    // Buscar usuário por username
    static findByUsername(model) {
        return AuthDb.findByUsername(model);
    }
    
    // Verificar se usuário já existe (email ou username)
    static checkExisting(model) {
        return AuthDb.checkExisting(model);
    }
    
    // Buscar usuário por ID
    static findById(model) {
        return AuthDb.findById(model);
    }
    
    // Validar dados de registro
    static validateRegisterData(model) {
        const errors = [];
        
        if (!model.username || model.username.length < 3) {
            errors.push('Username deve ter pelo menos 3 caracteres');
        }
        
        if (!model.email || !this.isValidEmail(model.email)) {
            errors.push('Email inválido');
        }
        
        if (!model.password || model.password.length < 8) {
            errors.push('Senha deve ter pelo menos 8 caracteres');
        }
        
        return errors;
    }
    
    // Validar dados de login
    static validateLoginData(model) {
        const errors = [];
        
        if (!model.email || !this.isValidEmail(model.email)) {
            errors.push('Email inválido');
        }
        
        if (!model.password) {
            errors.push('Senha é obrigatória');
        }
        
        return errors;
    }
    
    // Validar formato de email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

     
    // Validar dados de atualização de perfil
    static validateProfileUpdateData(model) {
        const errors = [];
        // Validações básicas de comprimento e formato
        if (model.full_name && model.full_name.length > 255) {
            errors.push('Nome completo muito longo');
        }
        if (model.bio && model.bio.length > 1000) { // Supondo um limite razoável para a bio
            errors.push('Biografia muito longa');
        }
        if (model.city && model.city.length > 100) {
            errors.push('Cidade muito longa');
        }
        if (model.state && model.state.length > 100) {
            errors.push('Estado muito longo');
        }
        // Valida a URL da foto se fornecida e não for vazia
        if (model.profile_picture_url && model.profile_picture_url.trim() !== '' && !Auth.isValidUrl(model.profile_picture_url)) {
             errors.push('URL da foto de perfil inválida');
        }

        return errors;
    }

    // Validar URL
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    //Atualizar perfil do usuário
    static async updateProfile(user_id, updateData) {
        const model = { ...updateData, user_id }; // Combina o ID do usuário com os dados de atualização

        // Realiza as validações dos dados do perfil
        const validationErrors = Auth.validateProfileUpdateData(model);
        if (validationErrors.length > 0) {
            // Lança um erro com as mensagens de validação para ser capturado no controller
            throw new Error(validationErrors.join(', '));
        }

        // Chama o método de atualização na camada de acesso ao banco de dados
        return AuthDb.updateProfile(model);
    }

    //Validar dados para atualização de senha
    static validatePasswordUpdateData(model) {
        const errors = [];

        if (!model.old_password) {
            errors.push('Senha antiga é obrigatória.');
        }
        if (!model.new_password) {
            errors.push('Nova senha é obrigatória.');
        } else if (model.new_password.length < 8 ||
                   !/[A-Z]/.test(model.new_password) ||
                   !/[0-9]/.test(model.new_password) ||
                   !/[^a-zA-Z0-9\s]/.test(model.new_password)) {
            // As mesmas regras que você já tem no express-validator para registro
            errors.push('Nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.');
        }
        if (model.old_password === model.new_password) {
            errors.push('A nova senha não pode ser igual à senha antiga.');
        }

        return errors;
    }

    // Atualizar senha do usuário
    static async changePassword(user_id, oldPassword, newPassword) {
        // 1. Validação dos dados
        const validationErrors = Auth.validatePasswordUpdateData({ old_password: oldPassword, new_password: newPassword });
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
        }

        // 2. Buscar o usuário pelo ID para pegar a senha hashed atual
        const user = await AuthDb.findById({ user_id }); // Reutiliza o método findById do AuthDb
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        // 3. Comparar a senha antiga fornecida com a senha hashed do BD
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new Error('Senha antiga incorreta.');
        }

        // 4. Hash da nova senha
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Chamar o método do DB para atualizar
        return AuthDb.updatePassword({ user_id, new_hashed_password: newHashedPassword });
    }

    // Deletar a conta do usuário (com confirmação de senha)
    static async deleteAccount(user_id, password) {
        if (!password) {
            throw new Error('A senha é necessária para confirmar a exclusão da conta.');
        }

        // Buscar o usuário para comparar a senha
        const user = await AuthDb.findById({ user_id });
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        // Comparar a senha fornecida com a senha hashed do DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Senha incorreta.');
        }

        // Se a senha for válida, deletar a conta
        return AuthDb.deleteUser({ user_id });
    }
}
module.exports = Auth;