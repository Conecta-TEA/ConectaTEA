-- ============================================
-- ConectaTEA - Database Schema PostgreSQL
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'paciente',
    foto_perfil VARCHAR(255),
    email_verificado BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Códigos OTP
CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT false,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Especialistas
CREATE TABLE IF NOT EXISTS especialistas (
    id SERIAL PRIMARY KEY,
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
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Tabela de Pacientes do Especialista
CREATE TABLE IF NOT EXISTS especialista_pacientes (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    data_primeiro_atendimento TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ativo',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(especialista_id, paciente_id)
);

-- 5. Tabela de Reuniões/Consultas
CREATE TABLE IF NOT EXISTS reunioes (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 60,
    link_meet VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'consulta',
    status VARCHAR(20) DEFAULT 'agendada',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. Tabela de Prontuários
CREATE TABLE IF NOT EXISTS prontuarios (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    reuniao_id INTEGER,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    data_atendimento DATE NOT NULL,
    diagnostico TEXT,
    tratamento TEXT,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE SET NULL
);

-- 7. Tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER NOT NULL,
    destinatario_id INTEGER NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(20) DEFAULT 'texto',
    arquivo_url VARCHAR(255),
    arquivo_nome VARCHAR(255),
    arquivo_tipo VARCHAR(50),
    lido BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 8. Tabela de Sessões (JWT)
CREATE TABLE IF NOT EXISTS sessoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_expira ON otp_codes(expira_em);
CREATE INDEX IF NOT EXISTS idx_especialista_usuario ON especialistas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_especialista ON reunioes(especialista_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_paciente ON reunioes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data_hora);
CREATE INDEX IF NOT EXISTS idx_prontuarios_especialista ON prontuarios(especialista_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON prontuarios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_lido ON mensagens(lido);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);

-- ============================================
-- DADOS INICIAIS - Usuário Admin
-- ============================================

-- Senha: Admin123! (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, email_verificado, status)
VALUES (
    'Administrador',
    'admin@conectatea.com',
    '$2a$10$YourBcryptHashHere',
    'especialista',
    true,
    'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Contar registros em cada tabela
SELECT 
    'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'otp_codes', COUNT(*) FROM otp_codes
UNION ALL
SELECT 'especialistas', COUNT(*) FROM especialistas
UNION ALL
SELECT 'especialista_pacientes', COUNT(*) FROM especialista_pacientes
UNION ALL
SELECT 'reunioes', COUNT(*) FROM reunioes
UNION ALL
SELECT 'prontuarios', COUNT(*) FROM prontuarios
UNION ALL
SELECT 'mensagens', COUNT(*) FROM mensagens
UNION ALL
SELECT 'sessoes', COUNT(*) FROM sessoes;

-- ============================================
-- ✅ SUCESSO!
-- Se você vê 8 linhas acima, todas as tabelas foram criadas!
-- ============================================
