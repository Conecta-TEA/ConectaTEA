# ✅ Checklist Deploy Vercel FREE

## 📋 Pré-Deploy (COMPLETO)

- [x] PostgreSQL adapter criado (`database-postgres.js`)
- [x] Database selector criado (`db-selector.js`)
- [x] `server.js` atualizado para usar db-selector
- [x] `package.json` com dependências PostgreSQL
- [x] `vercel.json` configurado
- [x] Documentação completa criada
- [x] Git commit realizado
- [x] Dependências instaladas (`npm install`)

## 🚀 Deploy Step-by-Step

### 1. Criar Conta Supabase (GRÁTIS)
```bash
1. Acesse: https://supabase.com
2. Sign up with GitHub
3. Create New Project
   - Name: conectatea
   - Database Password: [crie uma senha forte]
   - Region: South America (São Paulo)
4. Aguarde ~2 minutos (projeto criando)
```

### 2. Configurar Database no Supabase
```bash
1. No projeto, vá em: SQL Editor
2. Clique em: New Query
3. Cole o SQL do arquivo: DEPLOY-VERCEL-GRATIS.md (linhas 40-150)
4. Clique em: RUN
5. Verifique: Deve criar 6 tabelas + 1 usuário admin
```

### 3. Pegar Connection String
```bash
1. No Supabase, vá em: Settings → Database
2. Copie: Connection string → URI
3. Substitua [YOUR-PASSWORD] pela senha que criou
4. Exemplo: postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres
5. Salve em arquivo .env-vercel.txt
```

### 4. Deploy no Vercel

#### Opção A: Via Dashboard (RECOMENDADO)
```bash
1. Acesse: https://vercel.com
2. Sign up with GitHub
3. Import Git Repository
4. Selecione: Conecta-TEA/ConectaTEA
5. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
6. Add Environment Variables:
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres
JWT_SECRET=seu_segredo_super_secreto_aqui_123
SESSION_SECRET=outro_segredo_para_sessoes_456
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
FRONTEND_URL=https://conectatea.vercel.app
```

```bash
7. Clique em: Deploy
8. Aguarde ~2 minutos
9. ✅ Deploy concluído!
```

#### Opção B: Via CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# No diretório do projeto
cd C:\app3\ConectaTEA

# Login
vercel login

# Deploy preview
vercel

# Adicionar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SESSION_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add NODE_ENV
vercel env add FRONTEND_URL

# Deploy production
vercel --prod
```

## 🧪 Testar Deploy

### 1. Teste Backend
```bash
# Abra no navegador:
https://conectatea.vercel.app/api/health

# Deve retornar:
{"status":"ok","database":"connected"}
```

### 2. Teste Login
```bash
# Abra:
https://conectatea.vercel.app

# Login com admin criado no SQL:
Email: admin@conectatea.com
OTP: Será enviado no email
```

### 3. Teste Dashboard Especialista
```bash
# Cadastre-se como especialista
# Faça login
# Deve redirecionar para: /painel-especialista.html
# Todas as 6 abas devem funcionar
```

## 🐛 Troubleshooting

### Erro: "Database connection failed"
```bash
✅ Verifique DATABASE_URL no Vercel
✅ Teste conexão no Supabase (Settings → Database → Connection pooler)
✅ Verifique se SSL está habilitado
✅ Veja logs: vercel logs [deployment-url]
```

### Erro: "Module not found"
```bash
✅ Rode: cd backend && npm install
✅ Commit: git add . && git commit -m "fix: dependencies"
✅ Push: git push
✅ Redeploy automático no Vercel
```

### Erro: "Function timeout"
```bash
✅ Free tier tem limite de 10s por request
✅ Otimize queries lentas
✅ Considere upgrade ($20/mês para 60s)
```

### Email não envia OTP
```bash
✅ Use Gmail App Password (não senha normal)
✅ Ative 2FA no Gmail
✅ Crie App Password em: myaccount.google.com/apppasswords
✅ Use essa senha em EMAIL_PASS
```

## 📊 Limites Free Tier

### Vercel FREE
- ✅ Bandwidth: 100GB/mês
- ✅ Invocações: 100GB-Hrs
- ✅ Função timeout: 10 segundos
- ✅ Deployments: Ilimitados
- ✅ Serverless Functions: 12 simultâneas

### Supabase FREE
- ✅ Database: 500MB
- ✅ Bandwidth: 2GB/mês
- ✅ Rows: Ilimitadas
- ✅ API requests: Ilimitadas (fair use)
- ✅ Pausado após 7 dias inativo (reativa automático)

## 🎯 URLs Finais

```bash
Frontend: https://conectatea.vercel.app
Backend API: https://conectatea.vercel.app/api
Health Check: https://conectatea.vercel.app/api/health
Dashboard: https://conectatea.vercel.app/painel-especialista.html
```

## 🔐 Credenciais Admin Padrão

```
Email: admin@conectatea.com
Senha: Admin123!
Tipo: especialista
```

**⚠️ IMPORTANTE:** Altere essas credenciais após primeiro login!

---

## ✨ Pronto!

Seu ConectaTEA está 100% GRÁTIS no ar! 🎉

- ✅ Frontend estático na Vercel
- ✅ Backend serverless na Vercel
- ✅ Database PostgreSQL no Supabase
- ✅ SSL automático (HTTPS)
- ✅ Deploy contínuo do GitHub
- ✅ Escalável e profissional

**Custo total: R$ 0,00/mês** 🚀
