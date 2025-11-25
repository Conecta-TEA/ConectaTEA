# 🎯 GUIA MASTER - ConectaTEA (Projeto em Grupo)

## 📋 Visão Geral

Este projeto está preparado para **trabalho em grupo de 5 pessoas** com **dois backends diferentes**:

1. **Backend Node.js** (completo, pronto, backup)
2. **Backend PHP** (simplificado para o grupo aprender)

**OTP por email mantido em ambos!** ✅

---

## 🗂️ Estrutura do Projeto

```
ConectaTEA/
├── 📁 backend/                    ← Backend Node.js ORIGINAL
│   ├── config/                    ← Configurações
│   ├── routes/                    ← Rotas da API
│   ├── server.js                  ← Servidor Express
│   └── package.json               ← Dependências Node
│
├── 📁 backend-nodejs-backup/       ← ✅ BACKUP COMPLETO Node.js
│   └── (cópia completa do backend)
│
├── 📁 backend-php/                 ← ✅ Backend PHP SIMPLES
│   ├── config/
│   │   ├── database.php           ← Conexão MySQL
│   │   └── email.php              ← OTP/PHPMailer
│   ├── api/
│   │   ├── cadastro.php           ← Criar conta
│   │   ├── login.php              ← Solicitar OTP
│   │   ├── verificar-email.php    ← Verificar cadastro
│   │   └── verificar-login.php    ← Login com OTP
│   ├── database-mysql.sql         ← Script MySQL 8.0
│   ├── composer.json              ← Dependências PHP
│   └── README.md                  ← Guia PHP
│
├── 📁 css/                         ← Estilos
├── 📁 js/                          ← Scripts
├── 📁 img/                         ← Imagens
│
├── index.html                     ← Página inicial
├── cadastro.html                  ← Cadastro
├── login.html                     ← Login
├── painel-especialista.html       ← Dashboard (completo!)
├── config.js                      ← ✅ Troca backend PHP/Node
│
├── vercel.json                    ← Deploy Vercel
├── supabase-schema.sql            ← PostgreSQL (produção)
│
└── 📚 GUIAS:
    ├── README.md                  ← Geral
    ├── GUIA-MASTER.md             ← Este arquivo
    ├── DEPLOY-15MIN.md            ← Deploy rápido
    ├── DEPLOY-VERCEL-GRATIS.md    ← Deploy completo
    ├── SEU-DEPLOY.md              ← Deploy personalizado
    └── backend-php/README.md      ← Guia PHP
```

---

## 🎯 Como Trabalhar em Grupo

### Você (Líder/Frontend):
- ✅ Frontend completo (HTML/CSS/JS)
- ✅ Design do painel especialista
- ✅ Integrações Google Meet
- ✅ Configuração de deploy
- ✅ Backup do backend Node.js

### Grupo (4 pessoas - Backend PHP):

**Pessoa 1 - Banco de Dados:**
- [ ] Instalar MySQL Workbench 8.0
- [ ] Criar banco `conectatea`
- [ ] Executar `backend-php/database-mysql.sql`
- [ ] Documentar estrutura das tabelas
- [ ] Criar diagrama ER (opcional)

**Pessoa 2 - Autenticação:**
- [ ] Entender APIs: cadastro.php, login.php
- [ ] Testar OTP por email
- [ ] Melhorar validações
- [ ] Adicionar recuperação de senha
- [ ] Documentar endpoints

**Pessoa 3 - CRUD Especialistas:**
- [ ] Criar `api/especialistas-listar.php`
- [ ] Criar `api/especialistas-buscar.php`
- [ ] Adicionar filtros (especialidade, etc)
- [ ] Integrar com frontend
- [ ] Testes

**Pessoa 4 - CRUD Consultas:**
- [ ] Criar `api/consultas-agendar.php`
- [ ] Criar `api/consultas-listar.php`
- [ ] Criar `api/consultas-cancelar.php`
- [ ] Notificações por email
- [ ] Testes

---

## 🔧 Configuração Inicial (15 min)

### 1. Clonar/Baixar Projeto

```bash
# Se tiver Git:
git clone https://github.com/Conecta-TEA/ConectaTEA.git

# Ou baixe o ZIP do GitHub
```

### 2. Escolher Backend

**Opção A: PHP (Recomendado para grupo iniciante)**

```bash
1. Instale XAMPP: https://www.apachefriends.org/
2. Copie `backend-php` para `C:\xampp\htdocs\conectatea\`
3. Inicie XAMPP → Start Apache e MySQL
4. Instale Composer: https://getcomposer.org/
5. Execute: cd C:\xampp\htdocs\conectatea\backend-php && composer install
6. Configure: config/database.php (ajuste DB_PASS se necessário)
7. Configure: config/email.php (senha de app Gmail)
8. MySQL Workbench → Execute database-mysql.sql
9. Teste: http://localhost/conectatea/backend-php/api/
```

**Opção B: Node.js (Backup, já pronto)**

```bash
1. Instale Node.js: https://nodejs.org/
2. cd backend
3. npm install
4. Copie .env.example para .env
5. Configure variáveis em .env
6. npm start
7. Teste: http://localhost:3000/api/health
```

### 3. Configurar Frontend

```javascript
// Edite: config.js (linha 8)

usarPHP: true,  // true = PHP, false = Node.js
```

### 4. Abrir Frontend

```
Opção 1: Live Server (VS Code)
- Instale extensão Live Server
- Clique direito em index.html → Open with Live Server

Opção 2: Python
- python -m http.server 5500

Opção 3: XAMPP
- Copie tudo para C:\xampp\htdocs\conectatea\
- Acesse: http://localhost/conectatea/
```

---

## 📧 Configurar OTP por Email (Gmail)

**Para ambos backends (PHP e Node.js):**

```bash
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em 2 etapas"
3. Acesse: https://myaccount.google.com/apppasswords
4. Nome: ConectaTEA
5. Gerar
6. Copie 16 dígitos (sem espaços)

PHP: Cole em backend-php/config/email.php (linha 14)
Node.js: Cole em backend/.env (EMAIL_PASS=...)
```

---

## 🗄️ Bancos de Dados

### Desenvolvimento (Local):

| Backend | Banco | Ferramenta | Arquivo |
|---------|-------|------------|---------|
| PHP | MySQL 8.0 | MySQL Workbench / phpMyAdmin | `backend-php/database-mysql.sql` |
| Node.js | SQLite | Automático | `backend/data/database.db` |

### Produção (Deploy):

| Plataforma | Banco | Ferramenta | Arquivo |
|------------|-------|------------|---------|
| Vercel/Render | PostgreSQL | Supabase | `supabase-schema.sql` |
| Hospedagem PHP | MySQL | cPanel/phpMyAdmin | `backend-php/database-mysql.sql` |

---

## 🚀 Deploy

### Frontend (Netlify - Gratuito)

```bash
1. Crie conta: https://www.netlify.com/
2. Conecte com GitHub
3. Import Project → Conecta-TEA/ConectaTEA
4. Build settings:
   - Build command: (vazio)
   - Publish directory: ./
5. Deploy!
6. URL: https://conectatea.netlify.app
```

**✅ Já pode acessar online!**

### Backend PHP (Hospedagem Gratuita)

```bash
Opções gratuitas:
- InfinityFree: https://infinityfree.net/
- 000webhost: https://www.000webhost.com/
- AwardSpace: https://www.awardspace.com/

Upload:
- Faça upload da pasta backend-php via FTP
- Crie banco MySQL no painel
- Importe database-mysql.sql
- Configure config/database.php com credenciais
- Teste: https://seu-site.com/api/cadastro.php
```

### Backend Node.js (Vercel - Gratuito)

```bash
Veja guias completos:
- DEPLOY-15MIN.md
- DEPLOY-VERCEL-GRATIS.md
- SEU-DEPLOY.md
```

---

## 🧪 Testar APIs

### PHP (XAMPP):

```bash
# Cadastro
curl -X POST http://localhost/conectatea/backend-php/api/cadastro.php \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456","tipo_usuario":"paciente"}'

# Login (solicitar OTP)
curl -X POST http://localhost/conectatea/backend-php/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com"}'

# Verificar OTP
curl -X POST http://localhost/conectatea/backend-php/api/verificar-login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","codigo":"123456"}'
```

### Node.js:

```bash
# Health check
curl http://localhost:3000/api/health

# Cadastro
curl -X POST http://localhost:3000/api/auth/cadastrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456","tipo_usuario":"paciente"}'
```

---

## 📊 Comparação Backends

| Recurso | Node.js | PHP |
|---------|---------|-----|
| **Complexidade** | Média | Baixa |
| **Curva de aprendizado** | Íngreme | Suave |
| **Async** | async/await | Síncrono |
| **Banco Dev** | SQLite | MySQL |
| **Servidor** | Express | Apache (XAMPP) |
| **Email** | Nodemailer | PHPMailer |
| **Deploy** | Vercel/Render | Hospedagem PHP |
| **OTP Email** | ✅ Sim | ✅ Sim |
| **Real-time** | ✅ Socket.IO | ❌ Não |
| **Melhor para** | Produção | Aprendizado |

---

## 📚 Roadmap do Grupo

### Semana 1: Setup
- [ ] Instalar ferramentas (XAMPP, Composer, MySQL Workbench)
- [ ] Criar banco de dados
- [ ] Testar cadastro e login com OTP
- [ ] Dividir tarefas entre membros

### Semana 2: Desenvolvimento
- [ ] CRUD de especialistas
- [ ] CRUD de consultas
- [ ] Sistema de avaliações
- [ ] Upload de fotos

### Semana 3: Integração
- [ ] Conectar frontend com backend PHP
- [ ] Testes de todas as funcionalidades
- [ ] Correção de bugs
- [ ] Documentação

### Semana 4: Deploy
- [ ] Deploy frontend no Netlify
- [ ] Deploy backend em hospedagem
- [ ] Configurar domínio (opcional)
- [ ] Apresentação final

---

## 🐛 Problemas Comuns

### ❌ "CORS error"
```
PHP: Já configurado em includes/functions.php
Node.js: Já configurado em server.js
```

### ❌ Email não envia
```
1. Use senha de APP do Gmail (não senha normal)
2. Verifique config/email.php ou .env
3. Teste com outro email de destino
```

### ❌ Banco não conecta
```
PHP: Verifique config/database.php (linha 8-12)
Node.js: Banco SQLite é automático
```

### ❌ "Module not found"
```
PHP: composer install
Node.js: npm install
```

---

## 📞 Contatos e Links

- **GitHub**: https://github.com/Conecta-TEA/ConectaTEA
- **Email do Projeto**: matheuslucindo904@gmail.com
- **Suporte XAMPP**: https://www.apachefriends.org/faq.html
- **Suporte PHP**: https://www.php.net/manual/pt_BR/

---

## ✅ Checklist Final

### Setup:
- [ ] Ferramentas instaladas (XAMPP/Composer ou Node.js/npm)
- [ ] Banco de dados criado e populado
- [ ] Email configurado (senha de app)
- [ ] Backend rodando localmente
- [ ] Frontend acessível

### Desenvolvimento:
- [ ] APIs básicas testadas (cadastro, login, OTP)
- [ ] Frontend conectado com backend
- [ ] Tarefas divididas entre grupo
- [ ] Sistema de versionamento (Git)

### Deploy:
- [ ] Frontend online (Netlify)
- [ ] Backend online (Hospedagem)
- [ ] Banco de dados em produção
- [ ] Testes em produção

---

## 🎉 Pronto!

Você tem:
- ✅ Frontend completo e elegante
- ✅ Backend Node.js (backup completo)
- ✅ Backend PHP (para o grupo)
- ✅ OTP por email funcionando
- ✅ Documentação completa
- ✅ Guias de deploy
- ✅ Estrutura para trabalho em grupo

**Boa sorte no projeto! 🚀**
