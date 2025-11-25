-- Script de criação do banco SQLite para ConectaTEA

CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo_usuario TEXT NOT NULL,
    foto_perfil TEXT,
    verificado INTEGER DEFAULT 0,
    codigo_otp TEXT,
    otp_expira_em DATETIME
);

CREATE TABLE pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    data_nascimento TEXT,
    data_vinculo TEXT,
    especialista_id INTEGER,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id)
);

CREATE TABLE reunioes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_hora TEXT NOT NULL,
    duracao INTEGER,
    especialista_id INTEGER,
    paciente_id INTEGER,
    google_meet_link TEXT,
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

CREATE TABLE prontuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    tipo TEXT,
    titulo TEXT,
    conteudo TEXT,
    criado_em TEXT,
    especialista_id INTEGER,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (especialista_id) REFERENCES usuarios(id)
);

CREATE TABLE mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remetente_id INTEGER,
    destinatario_id INTEGER,
    conteudo TEXT,
    criado_em TEXT,
    lida INTEGER DEFAULT 0,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);

-- Tabelas extras podem ser adicionadas conforme necessidade
