-- ============================================
-- ConectaTEA - Database Schema MySQL 8.0
-- Execute no MySQL Workbench 8.0
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS conectatea
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE conectatea;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'paciente',
    foto_perfil VARCHAR(255),
    email_verificado BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Códigos OTP
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expira (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Especialistas
CREATE TABLE IF NOT EXISTS especialistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    registro_profissional VARCHAR(50),
    biografia TEXT,
    formacao TEXT,
    anos_experiencia INT,
    valor_consulta DECIMAL(10,2),
    disponibilidade TEXT,
    total_consultas INT DEFAULT 0,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Pacientes do Especialista
CREATE TABLE IF NOT EXISTS especialista_pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    data_primeiro_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativo',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_especialista_paciente (especialista_id, paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela de Reuniões/Consultas
CREATE TABLE IF NOT EXISTS reunioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    data_hora DATETIME NOT NULL,
    duracao INT DEFAULT 60,
    link_meet VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'consulta',
    status VARCHAR(20) DEFAULT 'agendada',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_especialista (especialista_id),
    INDEX idx_paciente (paciente_id),
    INDEX idx_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Prontuários
CREATE TABLE IF NOT EXISTS prontuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    reuniao_id INT,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    data_atendimento DATE NOT NULL,
    diagnostico TEXT,
    tratamento TEXT,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE SET NULL,
    INDEX idx_especialista (especialista_id),
    INDEX idx_paciente (paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(20) DEFAULT 'texto',
    arquivo_url VARCHAR(255),
    arquivo_nome VARCHAR(255),
    arquivo_tipo VARCHAR(50),
    lido BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_remetente (remetente_id),
    INDEX idx_destinatario (destinatario_id),
    INDEX idx_lido (lido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Sessões (JWT)
CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token TEXT NOT NULL,
    expira_em DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS - Usuário Admin de Teste
-- ============================================

-- Senha: Admin123! (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, email_verificado, status)
VALUES (
    'Administrador',
    'admin@conectatea.com',
    '$2y$10$YourBcryptHashHere',  -- Gere um hash real no PHP
    'especialista',
    TRUE,
    'ativo'
) ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver todas as tabelas criadas
SHOW TABLES;

-- Contar registros em cada tabela
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
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
