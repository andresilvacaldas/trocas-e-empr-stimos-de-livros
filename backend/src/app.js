const express = require('express');
const cors = require('cors');

const app = express(); // Cria a instância do aplicativo Express

// Middlewares globais
app.use(cors()); // Permite requisições de outras origens
app.use(express.json({ limit: '10mb' })); // Para parsear JSON no corpo das requisições (com limite de 10MB)
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para parsear dados de formulário (com limite de 10MB)

// Middleware de logging (opcional): registra cada requisição no console
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next(); // Continua para o próximo middleware ou rota
});

// Rota de status da API (rota inicial)
app.get('/', (req, res) => {
    res.json({
        message: 'API do Sistema de Troca e Empréstimo de Livros',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            books: '/api/books',
            transactions: '/api/transactions'
        }
    });
});

// Rota de health check (para verificar se a API está funcionando)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() // Tempo de atividade do processo Node.js
    });
});

// Importar e usar rotas específicas (certifique-se de que os caminhos para 'routes' estão corretos)
// Ex: './routes/auth' significa que 'auth.js' está dentro da pasta 'routes' que está dentro de 'src'
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const transactionRoutes = require('./routes/transactions');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);

// Middleware de tratamento de erros (deve ser o último middleware ANTES das rotas não encontradas)
app.use((err, req, res, next) => {
    console.error('Erro capturado:', err.stack); // Loga o stack trace do erro

    // Tratamento de erros específicos
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' });
    }

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload muito grande' });
    }

    // Resposta de erro genérica
    res.status(500).json({
        error: 'Erro interno do servidor',
        // Mostra a mensagem de erro detalhada apenas em ambiente de desenvolvimento
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado!'
    });
});

// Middleware para rotas não encontradas (deve ser o ÚLTIMO middleware)
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// EXPORTA A INSTÂNCIA DO APP EXPRESS para que server.js possa importá-la
module.exports = app;