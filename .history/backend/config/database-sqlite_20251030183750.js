// config/database-sqlite.js - Banco de dados SQLite embutido
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'conectatea.db');
const db = new Database(dbPath, { verbose: console.log });

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Função para inicializar o banco
function initDatabase() {
    console.log('🔧 Inicializando banco de dados SQLite...');

    // Criar diretório data se não existir
    const fs = require('fs');
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 1. Tabela de usuários
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
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Tabela de códigos OTP
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

    // 3. Tabela de especialistas
    db.exec(`
        CREATE TABLE IF NOT EXISTS especialistas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            especialidade VARCHAR(100) NOT NULL,
            registro_profissional VARCHAR(50),
            biografia TEXT,
            formacao TEXT,
            anos_experiencia INTEGER,
            valor_consulta DECIMAL(10,2),
            disponibilidade TEXT,
            total_consultas INTEGER DEFAULT 0,
            avaliacao_media DECIMAL(3,2) DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);

    // 4. Tabela de consultas
    db.exec(`
        CREATE TABLE IF NOT EXISTS consultas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            especialista_id INTEGER NOT NULL,
            data_consulta DATE NOT NULL,
            horario TIME NOT NULL,
            tipo_consulta VARCHAR(50),
            status VARCHAR(20) DEFAULT 'agendada',
            link_meet VARCHAR(255),
            observacoes TEXT,
            motivo_cancelamento TEXT,
            anamnese_id INTEGER,
            valor DECIMAL(10,2),
            avaliacao INTEGER,
            comentario_avaliacao TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
            FOREIGN KEY (especialista_id) REFERENCES especialistas(id)
        )
    `);

    // 5. Tabela de anamnese
    db.exec(`
        CREATE TABLE IF NOT EXISTS anamnese (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            especialista_id INTEGER NOT NULL,
            consulta_id INTEGER,
            queixa_principal TEXT,
            historico_familiar TEXT,
            desenvolvimento TEXT,
            comportamento TEXT,
            comunicacao TEXT,
            interacao_social TEXT,
            interesses TEXT,
            observacoes TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
            FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
            FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        )
    `);

    // 6. Tabela de mensagens (chat)
    db.exec(`
        CREATE TABLE IF NOT EXISTS mensagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            remetente_id INTEGER NOT NULL,
            destinatario_id INTEGER NOT NULL,
            mensagem TEXT,
            tipo VARCHAR(20) DEFAULT 'texto',
            arquivo_url VARCHAR(255),
            arquivo_nome VARCHAR(255),
            arquivo_tipo VARCHAR(50),
            lido BOOLEAN DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
            FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
        )
    `);

    // 7. Tabela de posts do fórum
    db.exec(`
        CREATE TABLE IF NOT EXISTS forum_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            autor_id INTEGER NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            conteudo TEXT NOT NULL,
            categoria VARCHAR(50),
            tags TEXT,
            visualizacoes INTEGER DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (autor_id) REFERENCES usuarios(id)
        )
    `);

    // 8. Tabela de respostas do fórum
    db.exec(`
        CREATE TABLE IF NOT EXISTS forum_respostas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            autor_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            melhor_resposta BOOLEAN DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (autor_id) REFERENCES usuarios(id)
        )
    `);

    // 9. Tabela de indicações de especialistas
    db.exec(`
        CREATE TABLE IF NOT EXISTS indicacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especialista_id INTEGER NOT NULL,
            especialista_indicado_id INTEGER NOT NULL,
            motivo TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
            FOREIGN KEY (especialista_indicado_id) REFERENCES especialistas(id)
        )
    `);

    // 10. Tabela de recursos
    db.exec(`
        CREATE TABLE IF NOT EXISTS recursos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            tipo VARCHAR(50),
            conteudo TEXT,
            url VARCHAR(255),
            categoria VARCHAR(50),
            autor_id INTEGER,
            visualizacoes INTEGER DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (autor_id) REFERENCES usuarios(id)
        )
    `);

    // 11. Tabela de sessões JWT
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

    // Criar índices para performance
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
        CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
        CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(paciente_id);
        CREATE INDEX IF NOT EXISTS idx_consultas_especialista ON consultas(especialista_id);
        CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_id);
        CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(destinatario_id);
    `);

    // Inserir usuário admin padrão se não existir
    const adminExists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@conectatea.com.br');
    
    if (!adminExists) {
        const senhaHash = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO usuarios (nome, email, senha, tipo_usuario, email_verificado, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Administrador', 'admin@conectatea.com.br', senhaHash, 'admin', 1, 'ativo');
        
        console.log('✓ Usuário admin criado');
    }

    console.log('✓ Banco de dados SQLite inicializado com sucesso!\n');
}

// Inicializar ao carregar
initDatabase();

module.exports = db;
