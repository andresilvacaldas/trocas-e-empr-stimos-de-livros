const AuthDb = require('../db/authDb');

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
        
        if (!model.password || model.password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
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
}

module.exports = Auth;