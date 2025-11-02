const db = require('./config/database-sqlite');

console.log('📦 Adicionando colunas de especialista na tabela usuarios...\n');

const colunas = [
    { nome: 'especialidade', tipo: 'VARCHAR(100)' },
    { nome: 'registro_profissional', tipo: 'VARCHAR(50)' },
    { nome: 'descricao_profissional', tipo: 'TEXT' },
    { nome: 'valor_consulta', tipo: 'DECIMAL(10,2)' },
    { nome: 'google_meet_link', tipo: 'VARCHAR(255)' },
    { nome: 'aprovado', tipo: 'BOOLEAN DEFAULT 1' }
];

try {
    colunas.forEach(coluna => {
        try {
            db.exec(`ALTER TABLE usuarios ADD COLUMN ${coluna.nome} ${coluna.tipo}`);
            console.log(`✓ Coluna adicionada: ${coluna.nome}`);
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log(`  ⚠️  Coluna ${coluna.nome} já existe, ignorando...`);
            } else {
                throw error;
            }
        }
    });
    
    console.log('\n✅ Colunas adicionadas com sucesso!\n');
} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}

db.close();
