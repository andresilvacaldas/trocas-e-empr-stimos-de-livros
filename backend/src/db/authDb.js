const db = require('../config/dbPgConfig');

class AuthDb {
    
    // Inserir novo usuário
    static async insert(model) {
        const conn = await db.connect();
        
        const username = model.username;
        const email = model.email;
        const password = model.password;
        const full_name = model.full_name;
        
        const query = 'INSERT INTO users (username, email, password, full_name) ' +
                     'VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, full_name';
        
        const result = await conn.query(query, [username, email, password, full_name]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Buscar usuário por email
    static async findByEmail(model) {
        const conn = await db.connect();
        
        const email = model.email;
        
        const query = 'SELECT * FROM users WHERE email = $1';
        
        const result = await conn.query(query, [email]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Buscar usuário por username
    static async findByUsername(model) {
        const conn = await db.connect();
        
        const username = model.username;
        
        const query = 'SELECT * FROM users WHERE username = $1';
        
        const result = await conn.query(query, [username]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Verificar se email ou username já existem
    static async checkExisting(model) {
        const conn = await db.connect();
        
        const email = model.email;
        const username = model.username;
        
        const query = 'SELECT user_id, email, username FROM users WHERE email = $1 OR username = $2';
        
        const result = await conn.query(query, [email, username]);
        conn.release();
        
        return result.rows;
    }
    
    // Buscar usuário por ID
    static async findById(model) {
        const conn = await db.connect();
        
        const user_id = model.user_id;
        
        const query = 'SELECT user_id, username, email, full_name, created_at FROM users WHERE user_id = $1';
        
        const result = await conn.query(query, [user_id]);
        conn.release();
        
        return result.rows[0];
    }
}

module.exports = AuthDb;