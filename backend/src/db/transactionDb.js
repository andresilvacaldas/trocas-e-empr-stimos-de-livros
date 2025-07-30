const db = require('../config/dbPgConfig');

class TransactionDb {
    
    // Inserir nova transação
    static async insert(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        const requester_id = model.requester_id;
        const owner_id = model.owner_id;
        const offered_book_id = model.offered_book_id;
        const transaction_type = model.transaction_type;
        const request_message = model.request_message;
        
        const query = `
            INSERT INTO transactions (
                book_id, requester_id, owner_id, offered_book_id, 
                transaction_type, request_message
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await conn.query(query, [
            book_id, requester_id, owner_id, offered_book_id, 
            transaction_type, request_message
        ]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Buscar transações do usuário
    static async selectByUser(model) {
        const conn = await db.connect();
        
        const user_id = model.user_id;
        
        const query = `
            SELECT 
                t.*,
                b.title as book_title,
                b.author as book_author,
                u_req.username as requester_name,
                u_owner.username as owner_name,
                ob.title as offered_book_title,
                ob.author as offered_book_author
            FROM transactions t
            JOIN books b ON t.book_id = b.book_id
            JOIN users u_req ON t.requester_id = u_req.user_id
            JOIN users u_owner ON t.owner_id = u_owner.user_id
            LEFT JOIN books ob ON t.offered_book_id = ob.book_id
            WHERE t.requester_id = $1 OR t.owner_id = $1
            ORDER BY t.request_date DESC
        `;
        
        const result = await conn.query(query, [user_id]);
        conn.release();
        
        return result.rows;
    }
    
    // Buscar transação por ID
    static async selectById(model) {
        const conn = await db.connect();
        
        const transaction_id = model.transaction_id;
        
        const query = `
            SELECT 
                t.*,
                b.title as book_title,
                b.author as book_author,
                u_req.username as requester_name,
                u_req.email as requester_email,
                u_owner.username as owner_name,
                u_owner.email as owner_email,
                ob.title as offered_book_title,
                ob.author as offered_book_author
            FROM transactions t
            JOIN books b ON t.book_id = b.book_id
            JOIN users u_req ON t.requester_id = u_req.user_id
            JOIN users u_owner ON t.owner_id = u_owner.user_id
            LEFT JOIN books ob ON t.offered_book_id = ob.book_id
            WHERE t.transaction_id = $1
        `;
        
        const result = await conn.query(query, [transaction_id]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Atualizar status da transação
    static async updateStatus(model) {
        const conn = await db.connect();
        
        const transaction_id = model.transaction_id;
        const status = model.status;
        const owner_id = model.owner_id;
        
        const query = `
            UPDATE transactions 
            SET status = $1 
            WHERE transaction_id = $2 AND owner_id = $3
            RETURNING *
        `;
        
        const result = await conn.query(query, [status, transaction_id, owner_id]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Verificar se transação existe e obter dados básicos
    static async checkTransaction(model) {
        const conn = await db.connect();
        
        const transaction_id = model.transaction_id;
        
        const query = `
            SELECT transaction_id, requester_id, owner_id, status 
            FROM transactions 
            WHERE transaction_id = $1
        `;
        
        const result = await conn.query(query, [transaction_id]);
        conn.release();
        
        return result.rows[0];
    }
    
    // Verificar se já existe transação pendente para o mesmo livro pelo mesmo usuário
    static async checkExistingRequest(model) {
        const conn = await db.connect();
        
        const book_id = model.book_id;
        const requester_id = model.requester_id;
        
        const query = `
            SELECT transaction_id 
            FROM transactions 
            WHERE book_id = $1 AND requester_id = $2 AND status = 'pendente'
        `;
        
        const result = await conn.query(query, [book_id, requester_id]);
        conn.release();
        
        return result.rows.length > 0;
    }
    
    // Buscar transações por status
    static async selectByStatus(model) {
        const conn = await db.connect();
        
        const user_id = model.user_id;
        const status = model.status;
        
        const query = `
            SELECT 
                t.*,
                b.title as book_title,
                b.author as book_author,
                u_req.username as requester_name,
                u_owner.username as owner_name
            FROM transactions t
            JOIN books b ON t.book_id = b.book_id
            JOIN users u_req ON t.requester_id = u_req.user_id
            JOIN users u_owner ON t.owner_id = u_owner.user_id
            WHERE (t.requester_id = $1 OR t.owner_id = $1) AND t.status = $2
            ORDER BY t.request_date DESC
        `;
        
        const result = await conn.query(query, [user_id, status]);
        conn.release();
        
        return result.rows;
    }
    
    // Deletar transação (cancelar)
    static async delete(model) {
        const conn = await db.connect();
        
        const transaction_id = model.transaction_id;
        const requester_id = model.requester_id;
        
        const query = `
            DELETE FROM transactions 
            WHERE transaction_id = $1 AND requester_id = $2 AND status = 'pendente'
        `;
        
        const result = await conn.query(query, [transaction_id, requester_id]);
        conn.release();
        
        return result.rowCount > 0;
    }
}

module.exports = TransactionDb;