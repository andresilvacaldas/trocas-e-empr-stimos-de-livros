// C:\Users\Pichau\Desktop\trocas e emprestimo\backend\server.js

const path = require('path'); // Módulo 'path' para resolver caminhos de arquivo

// Carrega as variáveis de ambiente do arquivo .env
// Força o dotenv a procurar o .env no diretório onde server.js está localizado
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


// Certifique-se de que o caminho './src/app' está correto para a localização do seu app.js
const app = require('./src/app');

// Define a porta do servidor, usando a variável de ambiente PORT ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Função principal para iniciar o servidor Express
const startServer = () => {
    // Inicia o servidor Express na porta especificada
    const server = app.listen(PORT, () => {
        console.log('🔧 Iniciando o servidor...');
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📚 API disponível em http://localhost:${PORT}`);
        console.log(`📖 Documentação: http://localhost:${PORT}/`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
        console.log('✅ Servidor iniciado com sucesso!');
    });

    // Tratamento de erros do servidor, como porta já em uso ou permissões
    server.on('error', (error) => {
        // Ignora erros que não são de syscall 'listen'
        if (error.syscall !== 'listen') {
            throw error;
        }

        // Formata a mensagem de erro para pipes ou portas
        const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

        // Trata códigos de erro específicos
        switch (error.code) {
            case 'EACCES': // Erro de acesso negado (porta 80 sem privilégios, por exemplo)
                console.error(`❌ ${bind} requer privilégios elevados`);
                process.exit(1); // Encerra o processo com erro
                break;
            case 'EADDRINUSE': // Erro de endereço já em uso (porta já ocupada)
                console.error(`❌ ${bind} já está em uso`);
                process.exit(1); // Encerra o processo com erro
                break;
            default:
                throw error; // Lança outros erros não tratados
        }
    });

    // Tratamento de sinais de encerramento para desligar o servidor de forma graciosa
    // SIGTERM: sinal enviado por orquestradores como Docker/Kubernetes para encerrar processos
    process.on('SIGTERM', () => {
        console.log('🛑 Recebido SIGTERM, encerrando servidor...');
        server.close(() => {
            console.log('✅ Servidor encerrado com sucesso');
            process.exit(0); // Sai do processo com sucesso
        });
    });

    // SIGINT: sinal enviado quando você pressiona Ctrl+C no terminal
    process.on('SIGINT', () => {
        console.log('🛑 Recebido SIGINT, encerrando servidor...');
        server.close(() => {
            console.log('✅ Servidor encerrado com sucesso');
            process.exit(0); // Sai do processo com sucesso
        });
    });
};

// Chama a função para iniciar o servidor quando o arquivo server.js é executado
startServer();