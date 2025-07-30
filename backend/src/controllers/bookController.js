// C:\Users\Pichau\Desktop\trocas e emprestimo\backend\src\controllers\bookController.js

const Book = require('../models/book'); // Importa a classe Book do seu modelo

// REMOVA A DEFINIÇÃO DA CLASSE 'class BookController { ... }'

// 1. Função para Listar todos os livros com filtros
exports.getAllBooks = async (req, res) => {
    try {
        const { search, author, available, type } = req.query;

        const filters = {
            search,
            author,
            available: available === 'true' ? true : available === 'false' ? false : undefined,
            type
        };

        const books = await Book.selectAll(filters); // Chama método estático do modelo

        res.json(books);

    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 2. Função para Obter livro por ID
exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID do livro inválido' });
        }

        const book = await Book.selectById({ book_id: parseInt(id) }); // Chama método estático do modelo

        if (!book) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json(book);

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 3. Função para Criar novo livro
exports.createBook = async (req, res) => {
    try {
        const userId = req.user.user_id; // req.user é populado pelo middleware de autenticação
        const bookData = Book.prepareBookData(req.body, userId); // Chama método estático do modelo

        // Validar dados
        const validationErrors = Book.validateBookData(bookData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        const newBook = await Book.insert(bookData); // Chama método estático do modelo

        res.status(201).json(newBook);

    } catch (error) {
        console.error('Erro ao criar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 4. Função para Atualizar livro
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID do livro inválido' });
        }

        // Verificar propriedade do livro
        const ownership = await Book.checkOwnership({ // Chama método estático do modelo
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

        const bookData = Book.prepareBookData(req.body, userId); // Chama método estático do modelo
        bookData.book_id = parseInt(id);

        // Validar dados
        const validationErrors = Book.validateBookData(bookData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        const updatedBook = await Book.update(bookData); // Chama método estático do modelo

        if (!updatedBook) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json(updatedBook);

    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 5. Função para Deletar livro
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID do livro inválido' });
        }

        // Verificar propriedade do livro
        const ownership = await Book.checkOwnership({ // Chama método estático do modelo
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

        const deleted = await Book.delete({ // Chama método estático do modelo
            book_id: parseInt(id),
            owner_id: userId
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.status(204).send(); // Resposta 204 No Content para deleção bem-sucedida

    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// 6. Função para Obter livros do usuário logado
exports.getMyBooks = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const books = await Book.selectByOwner({ owner_id: userId }); // Chama método estático do modelo

        res.json(books);

    } catch (error) {
        console.error('Erro ao buscar meus livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// REMOVA O 'module.exports = BookController;'
// As funções já são exportadas diretamente via 'exports.nomeDaFuncao'