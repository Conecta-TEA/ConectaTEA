// Seletor automático de banco de dados
// Usa SQLite em desenvolvimento e PostgreSQL em produção (Vercel)

let db;

if (process.env.DATABASE_URL) {
  // Produção: PostgreSQL (Supabase)
  console.log('🔵 Modo: PRODUÇÃO - PostgreSQL (Supabase)');
  db = require('./database-postgres');
} else {
  // Desenvolvimento: SQLite
  console.log('🟢 Modo: DESENVOLVIMENTO - SQLite');
  db = require('./database-sqlite');
}

module.exports = db;
