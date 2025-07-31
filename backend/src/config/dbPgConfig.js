const { Pool } = require('pg');

const dbPgConfig = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'troca_emprestimo', 
  password: process.env.DB_PASSWORD || 'Andresilva1239#',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão
dbPgConfig.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

dbPgConfig.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
  
});

module.exports = dbPgConfig;