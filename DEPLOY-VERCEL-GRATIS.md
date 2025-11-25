# 🚀 Deploy COMPLETO no Vercel - 100% GRÁTIS

## 🎯 Arquitetura

- **Frontend**: Vercel (hospedagem estática)
- **Backend**: Vercel Serverless Functions
- **Banco de Dados**: Supabase PostgreSQL (grátis)
- **Storage**: Vercel Blob (para uploads)

---

## 📦 PASSO 1: Criar Projeto no Supabase

### 1.1 Criar Conta
- Acesse: https://supabase.com
- Login com GitHub
- "New Project"

### 1.2 Configurar Projeto
```
Organization: Sua org
Project Name: conectatea
Database Password: Crie uma senha forte (anote!)
Region: South America (São Paulo)
Pricing Plan: Free
```

### 1.3 Copiar Credenciais
Vá em **Settings** → **Database** → **Connection String**

**URI Mode:**
```
postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

Copie:
- `SUPABASE_URL`: Em Settings → API → Project URL
- `SUPABASE_KEY`: Em Settings → API → anon/public key

### 1.4 Criar Tabelas

Vá em **SQL Editor** e execute:

```sql
-- Tabela usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    tipo_usuario VARCHAR(20) DEFAULT 'paciente',
    foto_perfil VARCHAR(255),
    email_verificado BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ativo',
    especialidade VARCHAR(100),
    registro_profissional VARCHAR(50),
    descricao_profissional TEXT,
    valor_consulta DECIMAL(10,2),
    google_meet_link VARCHAR(255),
    aprovado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela otp_codes
CREATE TABLE otp_codes (
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

-- Tabela especialista_pacientes
CREATE TABLE especialista_pacientes (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    observacoes TEXT,
    data_vinculo TIMESTAMP DEFAULT NOW(),
    UNIQUE(especialista_id, paciente_id)
);

-- Tabela reunioes
CREATE TABLE reunioes (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 60,
    google_meet_link VARCHAR(255),
    status VARCHAR(20) DEFAULT 'agendada',
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela prontuarios
CREATE TABLE prontuarios (
    id SERIAL PRIMARY KEY,
    especialista_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela mensagens
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    destinatario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto',
    arquivo_url VARCHAR(255),
    lido BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela sessoes
CREATE TABLE sessoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_mensagens_remetente ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_destinatario ON mensagens(destinatario_id);

-- Criar usuário admin
INSERT INTO usuarios (
    nome, email, senha, tipo_usuario, email_verificado, 
    aprovado, especialidade, registro_profissional, valor_consulta
) VALUES (
    'Dr. Admin Master',
    'admin@especialista.com',
    '$2a$10$0Ew1RGzO9C1oYz2ayqG0tu4WD5l5KZYx8qYKZYx8qYKZYx8qYK',
    'especialista',
    true,
    true,
    'Psicologia Clínica e TEA',
    'CRP 06/123456',
    250.00
);
```

---

## 📝 PASSO 2: Preparar o Código

### 2.1 Instalar Dependências do PostgreSQL

```bash
cd c:\app3\ConectaTEA\backend
npm install pg
npm install @vercel/postgres
```

### 2.2 Criar Arquivo de Configuração do Banco

Crie `backend/config/database-postgres.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
```

### 2.3 Atualizar package.json

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.5.1",
    "pg": "^8.11.3",
    // ... outras dependências existentes
  }
}
```

---

## 🔧 PASSO 3: Configurar Vercel

### 3.1 Criar vercel.json na raiz do projeto

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*\\.(html|css|js|png|jpg|jpeg|gif|svg|ico))",
      "dest": "/$1"
    },
    {
      "src": "/",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3.2 Criar .vercelignore

```
node_modules
.env
*.log
.DS_Store
backend/data
*.db
.history
```

---

## 🚀 PASSO 4: Deploy no Vercel

### 4.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Login

```bash
vercel login
```

### 4.3 Deploy

```bash
cd c:\app3\ConectaTEA
vercel
```

Responda:
- Set up and deploy? → **Y**
- Which scope? → Sua conta
- Link to existing project? → **N**
- Project name? → **conectatea**
- In which directory? → **.** (Enter)
- Override settings? → **N**

### 4.4 Adicionar Variáveis de Ambiente

```bash
vercel env add DATABASE_URL
```

Cole a connection string do Supabase:
```
postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

Adicione outras variáveis:

```bash
vercel env add EMAIL_USER
# Cole: seu_email@gmail.com

vercel env add EMAIL_PASS
# Cole: sua_senha_de_app

vercel env add JWT_SECRET
# Cole: chave_secreta_forte

vercel env add SESSION_SECRET
# Cole: outra_chave_secreta

vercel env add NODE_ENV
# Digite: production
```

### 4.5 Deploy em Produção

```bash
vercel --prod
```

---

## 🎯 PASSO 5: Configuração Automática pelo Dashboard

### Alternativa: Deploy pelo Site (mais fácil!)

1. **Acessar Vercel**
   - https://vercel.com
   - Login com GitHub

2. **Import Repository**
   - "Add New..." → "Project"
   - Import Git Repository
   - Selecione: `Conecta-TEA/ConectaTEA`

3. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (deixe vazio)
   Output Directory: ./
   Install Command: npm install --prefix backend
   ```

4. **Environment Variables**
   Clique em "Environment Variables" e adicione:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATABASE_URL` | `postgresql://...` | Production |
   | `EMAIL_USER` | `seu_email@gmail.com` | Production |
   | `EMAIL_PASS` | `sua_senha_app` | Production |
   | `JWT_SECRET` | Chave secreta | Production |
   | `SESSION_SECRET` | Chave secreta | Production |
   | `NODE_ENV` | `production` | Production |

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - URL: `https://conectatea.vercel.app`

---

## ✅ PASSO 6: Verificação

### 6.1 Testar API

Acesse: `https://conectatea.vercel.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "database": "conectado",
  "usuarios": 1
}
```

### 6.2 Testar Frontend

Acesse: `https://conectatea.vercel.app`

Deve carregar a página inicial normalmente.

### 6.3 Testar Login

1. Vá para: `https://conectatea.vercel.app/login.html`
2. Use: `admin@especialista.com` / `admin123`
3. Deve redirecionar para o painel do especialista

---

## 🔄 PASSO 7: Deploys Automáticos

### 7.1 Configurar GitHub Integration

Vercel já está conectado ao GitHub. Agora:

1. Faça qualquer alteração no código
2. Commit e push:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push
   ```
3. Vercel deploya automaticamente!
4. Veja em: https://vercel.com/seu-usuario/conectatea

### 7.2 Preview Deploys

- Cada commit gera uma URL de preview
- Útil para testar antes de ir para produção
- URL: `https://conectatea-git-branch.vercel.app`

---

## 💰 Limites do Plano Gratuito

### Vercel Free:
- ✅ Bandwidth: 100GB/mês
- ✅ Serverless Functions: 100GB-Hrs
- ✅ Builds: Ilimitados
- ✅ Domínios: Ilimitados
- ✅ HTTPS: Automático
- ⚠️ Function Timeout: 10 segundos

### Supabase Free:
- ✅ Database: 500MB
- ✅ Bandwidth: 2GB/mês
- ✅ Storage: 1GB
- ✅ Requests: 50,000/mês
- ⚠️ Inatividade: pausa após 7 dias (reativa automaticamente)

---

## 🎨 PASSO 8: Domínio Personalizado (Opcional)

### 8.1 Adicionar Domínio

1. Vercel Dashboard → Project → Settings → Domains
2. Add Domain: `conectatea.com.br`
3. Configure DNS no seu registrador:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

4. Aguarde propagação (até 48h)
5. Vercel configura HTTPS automaticamente

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

**Solução:**
1. Verifique `DATABASE_URL` em Environment Variables
2. Teste conexão no Supabase SQL Editor
3. Certifique-se que SSL está configurado

### Erro: "Function timeout"

**Solução:**
1. Queries muito lentas
2. Adicione índices no banco
3. Otimize queries
4. Considere upgrade (Hobby: $20/mês = 60s timeout)

### Erro: "Module not found"

**Solução:**
```bash
# Certifique-se que package.json está correto
cd backend
npm install
git add package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Socket.IO não funciona

**Limitação:** Vercel Serverless não suporta WebSockets persistentes.

**Soluções:**
1. Use **Polling** ao invés de WebSocket
2. Configure Socket.IO com `transports: ['polling']`
3. Ou use **Pusher** (grátis até 100 conexões)
4. Ou use **Supabase Realtime** (já incluído!)

---

## 📊 Monitoramento

### Logs

1. Vercel Dashboard → Project → Deployments
2. Clique em um deploy → "View Function Logs"
3. Veja erros em tempo real

### Analytics

1. Vercel Dashboard → Analytics
2. Veja pageviews, visitors, performance
3. Free tier: últimos 7 dias

---

## 🎯 Próximos Passos

- [ ] ✅ Backend e Frontend no Vercel
- [ ] ✅ Banco PostgreSQL no Supabase
- [ ] 🔄 Configurar Socket.IO com polling
- [ ] 📧 Testar envio de emails
- [ ] 🖼️ Configurar Vercel Blob para uploads
- [ ] 🌐 Adicionar domínio personalizado
- [ ] 📊 Monitorar logs e performance

---

## 🎉 Resultado Final

**URLs:**
- 🌐 Site: `https://conectatea.vercel.app`
- 🔌 API: `https://conectatea.vercel.app/api`
- ❤️ Health: `https://conectatea.vercel.app/api/health`
- 👤 Admin: `admin@especialista.com` / `admin123`

**100% Grátis! 🎊**

---

## 📞 Suporte

Problemas? 
1. Verifique logs do Vercel
2. Teste conexão com Supabase
3. Verifique variáveis de ambiente
4. Console do navegador (F12)

**Boa sorte! 🚀**
