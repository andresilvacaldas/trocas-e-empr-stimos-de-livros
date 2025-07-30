const db = require('../config/dbPgConfig');

class BookDb {
    
    // Inserir novo livro
    static async insert(model) {
        const conn = await db.connect();
        
        const title = model.title;
        const author = model.author;
        const publisher = model.publisher;
        const isbn = model.isbn;
        const description = model.description;
        const condition = model.condition;
        const exchange_available = model.exchange_available;
        const loan_available = model.loan_available;
        const owner_id = model.owner_id;
        
        const query = 'INSERT INTO books (title, author, publisher, isbn, description, condition, ' +
                     'exchange_available, loan_available, owner_id) ' +
                     'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ' +
                     'RETURNING *';
        
        const result = await conn.query(query, [
            title, author, publisher, isbn, description, condition,
            exchange_available, loan_available, owner_id
        ]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Buscar todos os livros com filtros
    static async selectAll(model = {}) {
        const conn = await db.connect();
        
        let query = `
            SELECT b.*, u.username as owner_name 
            FROM books b 
            JOIN users u ON b.owner_id = u.user_id 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;
        
        // Filtro por busca (título ou autor)
        if (model.search) {
            paramCount++;
            query += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount})`;
            params.push(`%${model.search}%`);
        }
        
        // Filtro por autor
        if (model.author) {
            paramCount++;
            query += ` AND b.author ILIKE $${paramCount}`;
            params.push(`%${model.author}%`);
        }
        
        // Filtro por disponibilidade
        if (model.available !== undefined) {
            paramCount++;
            query += ` AND b.available = $${paramCount}`;
            params.push(model.available);
        }
        
        // Filtro por tipo (troca ou empréstimo)
        if (model.type === 'troca') {
            query += ` AND b.exchange_available = true`;
        } else if (model.type === 'emprestimo') {
            query += ` AND b.loan_available = true`;
        }
        
        // Filtro por proprietário
        if (model.owner_id) {
            paramCount++;
            query += ` AND b.owner_id = $${paramCount}`;
            params.push(model.owner_id);
        }
        
        query += ` ORDER BY b.created_at DESC`;
        
        const result = await conn.query(query, params);
        conn.release();
        
        return result.rows;
    }
    
    // Buscar livro por ID
    static async selectById(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        
        const query = `
            SELECT b.*, u.username as owner_name, u.email as owner_email 
            FROM books b 
            JOIN users u ON b.owner_id = u.user_id 
            WHERE b.book_id = $1
        `;
        
        const result = await conn.query(query, [book_id]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Atualizar livro
    static async update(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        const title = model.title;
        const author = model.author;
        const publisher = model.publisher;
        const isbn = model.isbn;
        const description = model.description;
        const condition = model.condition;
        const exchange_available = model.exchange_available;
        const loan_available = model.loan_available;
        const available = model.available;
        const owner_id = model.owner_id;
        
        const query = `
            UPDATE books SET 
                title = $1, author = $2, publisher = $3, isbn = $4, 
                description = $5, condition = $6, exchange_available = $7, 
                loan_available = $8, available = $9
            WHERE book_id = $10 AND owner_id = $11
            RETURNING *
        `;
        
        const result = await conn.query(query, [
            title, author, publisher, isbn, description, condition,
            exchange_available, loan_available, available, book_id, owner_id
        ]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Deletar livro
    static async delete(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        const owner_id = model.owner_id;
        
        const query = 'DELETE FROM books WHERE book_id = $1 AND owner_id = $2';
        
        const result = await conn.query(query, [book_id, owner_id]);
        conn.release();
        
        return result.rowCount > 0;
    }
    
    // Verificar se livro pertence ao usuário
    static async checkOwnership(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        const owner_id = model.owner_id;
        
        const query = 'SELECT owner_id FROM books WHERE book_id = $1';
        
        const result = await conn.query(query, [book_id]);
        conn.release();
        
        if (result.rows.length === 0) {
            return { exists: false, isOwner: false };
        }
        
        return {
            exists: true,
            isOwner: result.rows[0].owner_id === owner_id
        };
    }
    
    // Buscar livros do usuário
    static async selectByOwner(model) {
        const conn = await db.connect();
        
        const owner_id = model.owner_id;
        
        const query = `
            SELECT * FROM books 
            WHERE owner_id = $1 
            ORDER BY created_at DESC
        `;
        
        const result = await conn.query(query, [owner_id]);
        conn.release();
        
        return result.rows;
    }
}

module.exports = BookDb;