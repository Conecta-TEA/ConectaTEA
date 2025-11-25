-- Adicionar campos de especialista na tabela usuarios
ALTER TABLE usuarios ADD COLUMN especialidade VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN registro_profissional VARCHAR(50);
ALTER TABLE usuarios ADD COLUMN descricao_profissional TEXT;
ALTER TABLE usuarios ADD COLUMN valor_consulta DECIMAL(10,2);
ALTER TABLE usuarios ADD COLUMN google_meet_link VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN aprovado BOOLEAN DEFAULT 1;

-- Criar tabela de relacionamento especialista-paciente
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
);

-- Criar tabela de reuniões
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
);

-- Atualizar tabela mensagens se necessário
CREATE TABLE IF NOT EXISTS mensagens_especialista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remetente_id INTEGER NOT NULL,
    destinatario_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL,
    lido BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Criar tabela de prontuários
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
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_especialista_pacientes_especialista ON especialista_pacientes(especialista_id);
CREATE INDEX IF NOT EXISTS idx_especialista_pacientes_paciente ON especialista_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_especialista ON reunioes(especialista_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_paciente ON reunioes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data_hora);
CREATE INDEX IF NOT EXISTS idx_mensagens_esp_remetente ON mensagens_especialista(remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_esp_destinatario ON mensagens_especialista(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_especialista ON prontuarios(especialista_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON prontuarios(paciente_id);
