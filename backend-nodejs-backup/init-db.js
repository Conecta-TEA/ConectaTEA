// Script de inicialização do banco de dados para produção
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔧 Iniciando configuração do banco de dados...\n');

// Criar diretório data se não existir
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Diretório data/ criado');
}

// Conectar ao banco
const dbPath = path.join(dataDir, 'conectatea.db');
const db = new Database(dbPath);

console.log('📊 Banco de dados:', dbPath);

// Habilitar Foreign Keys
db.pragma('foreign_keys = ON');

// Criar tabelas
console.log('\n📋 Criando tabelas...');

// Tabela usuarios
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        data_nascimento DATE,
        tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'paciente',
        foto_perfil VARCHAR(255),
        email_verificado BOOLEAN DEFAULT 0,
        status VARCHAR(20) DEFAULT 'ativo',
        especialidade VARCHAR(100),
        registro_profissional VARCHAR(50),
        descricao_profissional TEXT,
        valor_consulta DECIMAL(10,2),
        google_meet_link VARCHAR(255),
        aprovado BOOLEAN DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log('✅ usuarios');

// Tabela otp_codes
db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(100) NOT NULL,
        codigo VARCHAR(6) NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        expira_em DATETIME NOT NULL,
        usado BOOLEAN DEFAULT 0,
        ip_address VARCHAR(45),
        user_agent TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log('✅ otp_codes');

// Tabela especialista_pacientes
db.exec(`
    CREATE TABLE IF NOT EXISTS especialista_pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        especialista_id INTEGER NOT NULL,
        paciente_id INTEGER NOT NULL,
        observacoes TEXT,
        data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE(especialista_id, paciente_id)
    )
`);
console.log('✅ especialista_pacientes');

// Tabela reunioes
db.exec(`
    CREATE TABLE IF NOT EXISTS reunioes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        especialista_id INTEGER NOT NULL,
        paciente_id INTEGER NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT,
        data_hora DATETIME NOT NULL,
        duracao INTEGER DEFAULT 60,
        google_meet_link VARCHAR(255),
        status VARCHAR(20) DEFAULT 'agendada',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
`);
console.log('✅ reunioes');

// Tabela prontuarios
db.exec(`
    CREATE TABLE IF NOT EXISTS prontuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        especialista_id INTEGER NOT NULL,
        paciente_id INTEGER NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
`);
console.log('✅ prontuarios');

// Tabela mensagens
db.exec(`
    CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remetente_id INTEGER NOT NULL,
        destinatario_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        tipo VARCHAR(20) DEFAULT 'texto',
        arquivo_url VARCHAR(255),
        lido BOOLEAN DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
`);
console.log('✅ mensagens');

// Tabela sessoes
db.exec(`
    CREATE TABLE IF NOT EXISTS sessoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expira_em DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
`);
console.log('✅ sessoes');

// Criar índices
console.log('\n📇 Criando índices...');
db.exec(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(destinatario_id)`);
console.log('✅ Índices criados');

// Verificar se existe usuário admin
const adminExists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@especialista.com');

if (!adminExists) {
    console.log('\n👤 Criando usuário admin padrão...');
    const bcrypt = require('bcryptjs');
    const senhaHash = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
        INSERT INTO usuarios (
            nome, email, senha, tipo_usuario, email_verificado, 
            aprovado, especialidade, registro_profissional, valor_consulta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        'Dr. Admin Master',
        'admin@especialista.com',
        senhaHash,
        'especialista',
        1,
        1,
        'Psicologia Clínica e TEA',
        'CRP 06/123456',
        250.00
    );
    
    console.log('✅ Usuário admin criado');
    console.log('   Email: admin@especialista.com');
    console.log('   Senha: admin123');
}

db.close();

console.log('\n✨ Banco de dados inicializado com sucesso!\n');
