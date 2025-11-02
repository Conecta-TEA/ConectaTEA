const db = require('better-sqlite3')('./data/conectatea.db');

console.log('📦 Criando tabelas para especialistas...\n');

try {
    // Tabela especialista_pacientes
    db.exec(`
        CREATE TABLE IF NOT EXISTS especialista_pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especialista_id INTEGER NOT NULL,
            paciente_id INTEGER NOT NULL,
            data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
            observacoes TEXT,
            ativo BOOLEAN DEFAULT 1,
            FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            UNIQUE(especialista_id, paciente_id)
        )
    `);
    console.log('✓ Tabela especialista_pacientes criada');

    // Tabela reunioes
    db.exec(`
        CREATE TABLE IF NOT EXISTS reunioes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especialista_id INTEGER NOT NULL,
            paciente_id INTEGER NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            data_hora DATETIME NOT NULL,
            duracao INTEGER NOT NULL,
            google_meet_link VARCHAR(255),
            status VARCHAR(20) DEFAULT 'agendada',
            observacoes TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
    console.log('✓ Tabela reunioes criada');

    // Tabela prontuarios
    db.exec(`
        CREATE TABLE IF NOT EXISTS prontuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especialista_id INTEGER NOT NULL,
            paciente_id INTEGER NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            conteudo TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
    console.log('✓ Tabela prontuarios criada');

    // Criar índices
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_especialista_pacientes_especialista ON especialista_pacientes(especialista_id);
        CREATE INDEX IF NOT EXISTS idx_especialista_pacientes_paciente ON especialista_pacientes(paciente_id);
        CREATE INDEX IF NOT EXISTS idx_reunioes_especialista ON reunioes(especialista_id);
        CREATE INDEX IF NOT EXISTS idx_reunioes_paciente ON reunioes(paciente_id);
        CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data_hora);
        CREATE INDEX IF NOT EXISTS idx_prontuarios_especialista ON prontuarios(especialista_id);
        CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON prontuarios(paciente_id);
    `);
    console.log('✓ Índices criados\n');

    console.log('✅ Migração concluída com sucesso!\n');
    
} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}

db.close();
