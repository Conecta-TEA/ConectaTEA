// Adaptador de Banco de Dados PostgreSQL para Vercel
const { Pool } = require('pg');

// Criar pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
});

// Função helper para queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Adaptar interface para compatibilidade com código SQLite existente
const db = {
  // Simular prepare().get() do SQLite
  prepare: (sql) => ({
    get: async (...params) => {
      const result = await query(sql, params);
      return result.rows[0] || null;
    },
    all: async (...params) => {
      const result = await query(sql, params);
      return result.rows;
    },
    run: async (...params) => {
      const result = await query(sql, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: result.rows[0]?.id || null
      };
    }
  }),
  
  // Query direto
  query: async (sql, params) => {
    const result = await query(sql, params);
    return result.rows;
  },
  
  // Pool para uso avançado
  pool
};

module.exports = db;
