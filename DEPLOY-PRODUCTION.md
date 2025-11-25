# 🚀 GUIA DE DEPLOY - ConectaTEA Backend

## 📋 Opções de Hospedagem Gratuita

### ⭐ OPÇÃO 1: Render.com (RECOMENDADO)
**Melhor para Node.js + SQLite**

#### Vantagens:
- ✅ Suporta SQLite nativamente
- ✅ 750 horas grátis/mês
- ✅ HTTPS automático
- ✅ Fácil integração com GitHub
- ✅ Logs em tempo real
- ✅ Variáveis de ambiente seguras

#### Passos:

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Criar Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Selecione: `Conecta-TEA/ConectaTEA`

3. **Configurar Service**
   ```
   Name: conectatea-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **Adicionar Variáveis de Ambiente**
   - Clique em "Environment"
   - Adicione:
   ```
   NODE_ENV=production
   PORT=3000
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app_do_gmail
   JWT_SECRET=chave_secreta_forte_aqui
   SESSION_SECRET=outra_chave_secreta
   ```

5. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o deploy (5-10 minutos)
   - URL: `https://conectatea-backend.onrender.com`

6. **Criar banco SQLite**
   - O banco será criado automaticamente no primeiro acesso
   - Render mantém o arquivo na pasta `/opt/render/project/src/data/`

#### ⚠️ Importante para Render:
```javascript
// Em server.js, adicione:
const PORT = process.env.PORT || 3000;

// Para o banco, use caminho absoluto:
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'conectatea.db');
```

---

### 🔷 OPÇÃO 2: Railway.app
**Alternativa ao Render**

#### Passos:
1. Acesse https://railway.app
2. Login com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecione o repositório
5. Configure:
   - Root Directory: `backend`
   - Start Command: `node server.js`
6. Adicione variáveis de ambiente
7. Deploy automático

URL: `https://conectatea-backend.up.railway.app`

---

### 🟢 OPÇÃO 3: Vercel (Frontend + Serverless Backend)
**Melhor para frontend, backend como Serverless Functions**

#### ⚠️ Limitação: SQLite não funciona bem (use PostgreSQL)

#### Se quiser usar Vercel:
1. Instale Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Na pasta do projeto:
   ```bash
   vercel
   ```

3. Configure `vercel.json` (já criado)

4. Para backend, use **Supabase** (PostgreSQL gratuito):
   - https://supabase.com
   - Crie projeto
   - Pegue connection string
   - Substitua SQLite por PostgreSQL no código

---

### 🔵 OPÇÃO 4: Fly.io
**Boa para Docker**

```bash
# Instalar Fly CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Criar app
fly launch

# Deploy
fly deploy
```

---

## 🔧 Preparar o Código para Produção

### 1. Atualizar CORS no backend/server.js

```javascript
// CORS dinâmico
const allowedOrigins = [
  'http://localhost:5500',
  'https://seu-frontend.vercel.app',
  'https://conectatea-backend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. Usar variáveis de ambiente

```javascript
// backend/server.js
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'desenvolvimento_secret';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
```

### 3. Criar script de inicialização do banco

```javascript
// backend/init-db.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'conectatea.db'));

// Executar migrations...
// (código das tabelas aqui)

console.log('✅ Banco inicializado!');
db.close();
```

### 4. Atualizar package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init-db": "node init-db.js",
    "postinstall": "npm run init-db"
  }
}
```

---

## 🌐 Deploy do Frontend

### Opção 1: Vercel (RECOMENDADO para frontend)

```bash
# Na raiz do projeto
vercel

# Seguir instruções
# URL: https://conectatea.vercel.app
```

### Opção 2: Netlify

1. Acesse https://netlify.com
2. Arraste a pasta do projeto
3. Configure:
   - Build command: (vazio)
   - Publish directory: .
4. Deploy!

### Opção 3: GitHub Pages

```bash
# Criar branch gh-pages
git checkout -b gh-pages
git push origin gh-pages

# Ativar em Settings → Pages
```

---

## 🔗 Conectar Frontend ao Backend

### Atualizar URLs no frontend

```javascript
// Criar arquivo config.js
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://conectatea-backend.onrender.com/api';

// Usar em todos os arquivos JS
// auth.js, perfil.js, especialista-painel.js, etc.
```

---

## ✅ Checklist Final

- [ ] Código commitado no GitHub
- [ ] .gitignore configurado (sem node_modules, .env)
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Backend deployado e funcionando
- [ ] Frontend deployado
- [ ] URLs atualizadas no código
- [ ] CORS configurado corretamente
- [ ] Email funcionando (testar recuperação de senha)
- [ ] Banco de dados inicializado
- [ ] Criar usuário admin de teste

---

## 🎯 RECOMENDAÇÃO FINAL

**Backend:** Render.com  
**Frontend:** Vercel ou Netlify  
**Banco:** SQLite (no Render) ou Supabase (PostgreSQL)  

### Links finais:
- Backend: `https://conectatea-backend.onrender.com`
- Frontend: `https://conectatea.vercel.app`
- API: `https://conectatea-backend.onrender.com/api`

---

## 📞 Suporte

Se tiver problemas:
1. Verificar logs no Render
2. Testar endpoints com Postman
3. Verificar variáveis de ambiente
4. Checar CORS no navegador (F12 → Console)

**Boa sorte! 🚀**
