// Script para executar migrações no banco SQLite
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'conectatea.db');
const migrationPath = path.join(__dirname, 'add-especialista-fields-sqlite.sql');

console.log('🔧 Executando migrações para especialistas...\n');
console.log(`📂 Banco de dados: ${dbPath}\n`);

// Verificar se o banco existe
if (!fs.existsSync(dbPath)) {
    console.error('❌ Banco de dados não encontrado!');
    console.log('💡 Execute o servidor primeiro para criar o banco.\n');
    process.exit(1);
}

// Conectar ao banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✓ Conectado ao banco SQLite');
});

// Ler arquivo SQL
const sql = fs.readFileSync(migrationPath, 'utf8');

// Executar cada comando separadamente
const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

console.log(`\n📝 Executando ${commands.length} comandos...\n`);

let completed = 0;
let hasErrors = false;

db.serialize(() => {
    commands.forEach((command, index) => {
        db.run(command, (err) => {
            completed++;
            
            if (err) {
                // Ignorar erros de coluna já existente
                if (err.message.includes('duplicate column name')) {
                    console.log(`  ⚠️  Coluna já existe, ignorando...`);
                } else if (err.message.includes('already exists')) {
                    console.log(`  ⚠️  Tabela/índice já existe, ignorando...`);
                } else {
                    console.error(`  ✗ Erro no comando ${index + 1}:`, err.message);
                    hasErrors = true;
                }
            } else {
                // Extrair informação do comando
                if (command.includes('ALTER TABLE')) {
                    const match = command.match(/ADD COLUMN (\w+)/);
                    if (match) {
                        console.log(`  ✓ Coluna adicionada: ${match[1]}`);
                    }
                } else if (command.includes('CREATE TABLE')) {
                    const match = command.match(/CREATE TABLE.*?(\w+)\s*\(/);
                    if (match) {
                        console.log(`  ✓ Tabela criada: ${match[1]}`);
                    }
                } else if (command.includes('CREATE INDEX')) {
                    const match = command.match(/CREATE INDEX.*?(\w+)\s+ON/);
                    if (match) {
                        console.log(`  ✓ Índice criado: ${match[1]}`);
                    }
                }
            }
            
            // Se todos os comandos foram executados
            if (completed === commands.length) {
                console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                if (hasErrors) {
                    console.log('⚠️  Migração concluída com alguns avisos');
                } else {
                    console.log('✅ Migração concluída com sucesso!');
                }
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                
                db.close();
            }
        });
    });
});
