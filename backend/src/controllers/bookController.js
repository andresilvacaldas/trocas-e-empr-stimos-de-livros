const Book = require('../models/book');

class BookController {
    
    // Listar todos os livros com filtros
    static async getAllBooks(req, res) {
        try {
            const { search, author, available, type } = req.query;
            
            const filters = {
                search,
                author,
                available: available === 'true' ? true : available === 'false' ? false : undefined,
                type
            };
            
            const books = await Book.selectAll(filters);
            
            res.json(books);
            
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Obter livro por ID
    static async getBookById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ error: 'ID do livro inválido' });
            }
            
            const book = await Book.selectById({ book_id: parseInt(id) });
            
            if (!book) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }
            
            res.json(book);
            
        } catch (error) {
            console.error('Erro ao buscar livro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Criar novo livro
    static async createBook(req, res) {
        try {
            const userId = req.user.user_id;
            const bookData = Book.prepareBookData(req.body, userId);
            
            // Validar dados
            const validationErrors = Book.validateBookData(bookData);
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    error: 'Dados inválidos', 
                    details: validationErrors 
                });
            }
            
            const newBook = await Book.insert(bookData);
            
            res.status(201).json(newBook);
            
        } catch (error) {
            console.error('Erro ao criar livro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Atualizar livro
    static async updateBook(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.user_id;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ error: 'ID do livro inválido' });
            }
            
            // Verificar propriedade do livro
            const ownership = await Book.checkOwnership({ 
                book_id: parseInt(id), 
                owner_id: userId 
            });
            
            if (!ownership.exists) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }
            
            if (!ownership.isOwner) {
                return res.status(403).json({ 
                    error: 'Você não tem permissão para editar este livro' 
                });
            }
            
            const bookData = Book.prepareBookData(req.body, userId);
            bookData.book_id = parseInt(id);
            
            // Validar dados
            const validationErrors = Book.validateBookData(bookData);
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    error: 'Dados inválidos', 
                    details: validationErrors 
                });
            }
            
            const updatedBook = await Book.update(bookData);
            
            if (!updatedBook) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }
            
            res.json(updatedBook);
            
        } catch (error) {
            console.error('Erro ao atualizar livro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Deletar livro
    static async deleteBook(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.user_id;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ error: 'ID do livro inválido' });
            }
            
            // Verificar propriedade do livro
            const ownership = await Book.checkOwnership({ 
                book_id: parseInt(id), 
                owner_id: userId 
            });
            
            if (!ownership.exists) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }
            
            if (!ownership.isOwner) {
                return res.status(403).json({ 
                    error: 'Você não tem permissão para deletar este livro' 
                });
            }
            
            const deleted = await Book.delete({ 
                book_id: parseInt(id), 
                owner_id: userId 
            });
            
            if (!deleted) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }
            
            res.status(204).send();
            
        } catch (error) {
            console.error('Erro ao deletar livro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Obter livros do usuário logado
    static async getMyBooks(req, res) {
        try {
            const userId = req.user.user_id;
            
            const books = await Book.selectByOwner({ owner_id: userId });
            
            res.json(books);
            
        } catch (error) {
            console.error('Erro ao buscar meus livros:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = BookController;