-- Adicionar campos para especialistas
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS especialidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS registro_profissional VARCHAR(50),
ADD COLUMN IF NOT EXISTS descricao_profissional TEXT,
ADD COLUMN IF NOT EXISTS valor_consulta DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(255),
ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT FALSE;

-- Tabela de pacientes do especialista
CREATE TABLE IF NOT EXISTS especialista_pacientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    observacoes TEXT,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vinculo (especialista_id, paciente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de reuniões
CREATE TABLE IF NOT EXISTS reunioes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_hora DATETIME NOT NULL,
    duracao INT DEFAULT 60 COMMENT 'Duração em minutos',
    google_meet_link VARCHAR(500),
    status ENUM('agendada', 'confirmada', 'cancelada', 'concluida') DEFAULT 'agendada',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_especialista (especialista_id),
    INDEX idx_paciente (paciente_id),
    INDEX idx_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS mensagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_conversa (remetente_id, destinatario_id),
    INDEX idx_lida (lida),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de prontuários
CREATE TABLE IF NOT EXISTS prontuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    especialista_id INT NOT NULL,
    paciente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo ENUM('avaliacao', 'evolucao', 'prescricao', 'observacao') DEFAULT 'evolucao',
    data_atendimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_especialista_paciente (especialista_id, paciente_id),
    INDEX idx_data (data_atendimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
