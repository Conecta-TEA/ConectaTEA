# 🚀 Guia Completo de Deploy - ConectaTEA

## 📌 Resumo da Solução

Como o Netlify **não suporta backends Node.js/Express tradicionais**, a melhor solução é:

- **Frontend** → Netlify (gratuito)
- **Backend** → Render, Railway, Vercel ou Fly.io (gratuito com limitações)
- **Banco de Dados** → Usar o SQLite em produção OU migrar para PostgreSQL

---

## 🎯 Opção 1: Deploy Completo (Recomendado)

### Backend no Render (Gratuito)

#### Passo 1: Preparar o Backend

1. Criar arquivo `render.yaml` na raiz do projeto:

```yaml
services:
  - type: web
    name: conectatea-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: EMAIL_HOST
        value: smtp.gmail.com
      - key: EMAIL_PORT
        value: 587
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASSWORD
        sync: false
```

2. Adicionar ao `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Passo 2: Deploy no Render

1. Acesse [render.com](https://render.com)
2. Crie uma conta (pode usar GitHub)
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: conectatea-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

6. Adicione as variáveis de ambiente:
   - `EMAIL_USER`: seu-email@gmail.com
   - `EMAIL_PASSWORD`: sua-senha-de-app
   - `JWT_SECRET`: (auto-gerado)

7. Clique em "Create Web Service"

8. Aguarde o deploy (5-10 minutos)

9. Copie a URL do backend (ex: `https://conectatea-backend.onrender.com`)

---

### Frontend no Netlify (Gratuito)

#### Passo 1: Preparar o Frontend

Criar arquivo `netlify.toml` na raiz:

```toml
[build]
  publish = "."
  command = "echo 'No build required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Passo 2: Atualizar API_URL

Editar TODOS os arquivos JS para apontar para o backend no Render:

**Arquivos a modificar:**
- `auth.js`
- `perfil.js`
- `chat.js`
- `especialista-dashboard.js`
- `forum.js`
- `esqueci-senha.js`

**Mudar de:**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**Para:**
```javascript
const API_URL = 'https://conectatea-backend.onrender.com/api';
```

#### Passo 3: Deploy no Netlify

**Opção A: Via Interface Web**

1. Acesse [netlify.com](https://netlify.com)
2. Faça login (pode usar GitHub)
3. Clique em "Add new site" → "Import an existing project"
4. Conecte seu repositório GitHub
5. Configure:
   - **Branch**: main
   - **Build command**: (deixe vazio)
   - **Publish directory**: `.` (raiz)
6. Clique em "Deploy site"

**Opção B: Via Netlify CLI**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 🎯 Opção 2: Tudo no Vercel (Mais Complexo)

O Vercel suporta serverless functions, mas requer reescrever todo o backend.

### Converter Express para Serverless Functions

Cada rota vira uma função separada em `/api/`:

**Exemplo: `/api/auth/login.js`**
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../backend/config/database-sqlite');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido' });
    }

    const { email, senha } = req.body;
    
    // ... resto da lógica de login
};
```

**Estrutura necessária:**
```
/api
  /auth
    login.js
    cadastrar.js
    esqueci-senha.js
    redefinir-senha.js
  /usuarios
    perfil.js
    atualizar.js
  /chat
    mensagens.js
  /especialistas
    dashboard.js
  /forum
    posts.js
```

---

## 🗄️ Banco de Dados em Produção

### Opção A: SQLite (Limitado)

**Prós:**
- Zero configuração
- Funciona out-of-the-box

**Contras:**
- ⚠️ **Dados são perdidos a cada redeploy no Render Free**
- Não suporta múltiplas conexões simultâneas
- Arquivo `.db` não persiste em ambientes efêmeros

**Solução:** Usar volume persistente (Render Paid) ou migrar para PostgreSQL

---

### Opção B: PostgreSQL (Recomendado para Produção)

#### No Render:

1. Criar PostgreSQL Database (Free tier: 90 dias)
2. Copiar a `DATABASE_URL`
3. Instalar `pg` no backend:

```bash
cd backend
npm install pg
```

4. Modificar `backend/config/database.js`:

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

5. Converter queries SQLite para PostgreSQL:
   - `AUTOINCREMENT` → `SERIAL`
   - `datetime('now')` → `NOW()`
   - `CURRENT_TIMESTAMP` já funciona

---

## 🌐 CORS e Segurança

Atualizar `backend/server.js`:

```javascript
const allowedOrigins = [
    'http://localhost:5500',
    'https://conectatea.netlify.app', // Sua URL do Netlify
    'https://conectatea-backend.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

---

## 📧 Configuração de Email em Produção

### Gmail com Senha de App:

1. Ativar "Verificação em 2 etapas" na conta Google
2. Gerar "Senha de app":
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Outro" → "ConectaTEA"
   - Copie a senha gerada

3. Adicionar no Render:
   - `EMAIL_USER`: matheuslucindo904@gmail.com
   - `EMAIL_PASSWORD`: (senha de app de 16 dígitos)

### Alternativa: SendGrid (Recomendado)

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function enviarEmailOTP(email, codigo, tipo, nome) {
    const msg = {
        to: email,
        from: 'noreply@conectatea.com',
        subject: '🔐 Código de Recuperação - ConectaTEA',
        html: `<h1>Seu código: ${codigo}</h1>`
    };
    
    await sgMail.send(msg);
}
```

---

## 🔥 Checklist de Deploy

### Backend (Render):
- [ ] Criar conta no Render
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Deploy do serviço
- [ ] Testar endpoints na URL gerada
- [ ] Verificar logs de erro

### Frontend (Netlify):
- [ ] Atualizar `API_URL` em todos os arquivos JS
- [ ] Criar conta no Netlify
- [ ] Conectar repositório
- [ ] Deploy do site
- [ ] Testar funcionalidades
- [ ] Configurar domínio customizado (opcional)

### Email:
- [ ] Gerar senha de app do Gmail
- [ ] Adicionar credenciais no Render
- [ ] Testar envio de OTP

### Banco de Dados:
- [ ] Decidir: SQLite ou PostgreSQL
- [ ] Se PostgreSQL: criar database no Render
- [ ] Migrar schema
- [ ] Testar conexão

---

## 🚨 Limitações do Plano Gratuito

### Render Free:
- ⚠️ **O serviço "dorme" após 15 minutos de inatividade**
- Primeira requisição pode demorar 30-60 segundos (cold start)
- 750 horas/mês de uso
- Banco SQLite é perdido a cada redeploy

### Netlify Free:
- 100GB de banda/mês
- 300 minutos de build/mês
- Domínio customizado gratuito

### Solução para Cold Start:
Criar um cron job que pinga o backend a cada 10 minutos:

```javascript
// Usar cron-job.org ou uptimerobot.com
// GET https://conectatea-backend.onrender.com/api/health
```

---

## 🧪 Testar Localmente Antes do Deploy

```bash
# Backend
cd backend
node server.js

# Frontend (com Live Server no VS Code)
# Ou Python:
python -m http.server 5500

# Ou Node:
npx serve -l 5500
```

Abra: http://localhost:5500

---

## 📝 URLs Finais

Após deploy:

- **Backend**: https://conectatea-backend.onrender.com
- **Frontend**: https://conectatea.netlify.app
- **Documentação API**: https://conectatea-backend.onrender.com/api/health

---

## 🆘 Troubleshooting

### Backend não inicia no Render:
1. Verifique os logs no dashboard
2. Confirme que `package.json` existe
3. Verifique variáveis de ambiente
4. Teste localmente primeiro

### CORS Errors:
1. Adicione URL do Netlify no `allowedOrigins`
2. Verifique se frontend usa HTTPS (não HTTP)
3. Confirme credenciais: true

### Email não envia:
1. Teste credenciais localmente
2. Verifique senha de app (16 dígitos)
3. Veja logs do Render
4. Tente SendGrid como alternativa

### SQLite perdendo dados:
1. Migre para PostgreSQL (Render Database)
2. Ou use plano pago com volumes persistentes

---

## 🎉 Pronto para Deploy!

Execute o checklist acima e seu ConectaTEA estará online em ~30 minutos!

**Ordem recomendada:**
1. Deploy do backend no Render (10 min)
2. Atualizar API_URL no código (5 min)
3. Deploy do frontend no Netlify (5 min)
4. Testar todas as funcionalidades (10 min)

---

**Desenvolvido com ❤️ para ConectaTEA**
