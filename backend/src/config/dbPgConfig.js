// C:\Users\Pichau\Desktop\trocas e emprestimo\backend\src\config\dbPgConfig.js

const { Pool } = require('pg');

// REMOVA ESTA LINHA: require('dotenv').config();
// As variáveis de ambiente já são carregadas uma única vez no server.js
// Isso evita carregamentos múltiplos ou inconsistências

const dbPgConfig = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'troca_emprestimo', // <-- ATUALIZE O FALLBACK AQUI
  password: process.env.DB_PASSWORD || 'Andresilva1239#',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão
dbPgConfig.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

dbPgConfig.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
  // Você pode adicionar process.exit(1); aqui se quiser que a aplicação encerre em caso de erro fatal na conexão do pool
});

module.exports = dbPgConfig;