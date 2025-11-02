# 🔄 Diferenças SQLite vs PostgreSQL

## Queries que precisam ser adaptadas:

### 1. AUTO_INCREMENT
```sql
-- SQLite
id INTEGER PRIMARY KEY AUTOINCREMENT

-- PostgreSQL
id SERIAL PRIMARY KEY
```

### 2. DATETIME
```sql
-- SQLite
criado_em DATETIME DEFAULT CURRENT_TIMESTAMP

-- PostgreSQL  
criado_em TIMESTAMP DEFAULT NOW()
```

### 3. BOOLEAN
```sql
-- SQLite
ativo BOOLEAN DEFAULT 0

-- PostgreSQL
ativo BOOLEAN DEFAULT false
```

### 4. LIMIT com OFFSET
```sql
-- SQLite e PostgreSQL (igual)
SELECT * FROM usuarios LIMIT 10 OFFSET 20
```

### 5. LAST_INSERT_ID
```sql
-- SQLite (via código)
const result = db.prepare('INSERT...').run();
console.log(result.lastInsertRowid);

-- PostgreSQL
INSERT INTO usuarios (...) VALUES (...) RETURNING id;
```

### 6. Prepared Statements
```javascript
// SQLite
const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
const user = stmt.get('email@test.com');

// PostgreSQL (nossa adaptação)
const stmt = db.prepare('SELECT * FROM usuarios WHERE email = $1');
const user = await stmt.get('email@test.com');
```

## ✅ Já Criamos

- ✅ `database-postgres.js` - Conexão PostgreSQL
- ✅ `db-selector.js` - Seletor automático
- ✅ Adaptador para manter compatibilidade com código SQLite

## 🔧 Para Usar

Simplesmente mude em `server.js`:

```javascript
// ANTES
const db = require('./config/database-sqlite');

// DEPOIS
const db = require('./config/db-selector');
```

Pronto! Funciona em dev (SQLite) e prod (PostgreSQL) automaticamente! 🎉
