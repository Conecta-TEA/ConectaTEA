# 🎯 DEPLOY RÁPIDO - 15 MINUTOS

## ✅ Parte 1: Supabase (5 min)

### 1️⃣ Criar Conta
```
🌐 https://supabase.com
👆 "Start your project" → Sign up with GitHub
```

### 2️⃣ Criar Projeto
```
📝 Name: conectatea
🔑 Database Password: [ANOTE AQUI]
🌎 Region: South America (São Paulo)
⏱️ Aguardar ~2 min
```

### 3️⃣ Rodar SQL
```
1. Clique em: 🗄️ SQL Editor (menu lateral)
2. Clique em: ➕ New query
3. Copie SQL do arquivo: DEPLOY-VERCEL-GRATIS.md (linhas 40-150)
4. Cole no editor
5. Clique em: ▶️ RUN
6. ✅ Success! 6 tables created
```

### 4️⃣ Pegar Connection String
```
1. ⚙️ Settings → Database
2. 📋 Connection string → URI
3. Copiar: postgresql://postgres.xxx...
4. Substituir [YOUR-PASSWORD] pela senha do passo 2
5. ✅ Salvar em um arquivo .txt
```

---

## ✅ Parte 2: Vercel (10 min)

### 1️⃣ Criar Conta
```
🌐 https://vercel.com
👆 Sign up with GitHub
🔓 Autorizar Vercel no GitHub
```

### 2️⃣ Importar Projeto
```
1. Clique em: ➕ Add New... → Project
2. Selecione: Conecta-TEA/ConectaTEA
3. Clique em: Import
```

### 3️⃣ Configurar
```
Framework Preset: Other
Root Directory: ./
Build Command: (vazio)
Output Directory: (vazio)
```

### 4️⃣ Adicionar Variáveis de Ambiente
```
Clique em: Environment Variables

Cole TODAS essas (AJUSTE OS VALORES):
```

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres
JWT_SECRET=conectatea_super_secret_2024_jwt_aqui
SESSION_SECRET=conectatea_session_secret_2024_aqui
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app_gmail_16_digitos
FRONTEND_URL=https://conectatea.vercel.app
```

**⚠️ IMPORTANTE:**
- `DATABASE_URL`: Cole a string do Supabase (passo 1.4)
- `EMAIL_USER`: Seu Gmail
- `EMAIL_PASS`: Senha de app do Gmail (veja abaixo)
- `JWT_SECRET`: Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `SESSION_SECRET`: Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5️⃣ Como Gerar Senha de App Gmail

```
1. Acesse: https://myaccount.google.com/security
2. Ative: Verificação em 2 etapas (se ainda não tiver)
3. Acesse: https://myaccount.google.com/apppasswords
4. Nome do app: ConectaTEA
5. Gerar
6. Copie os 16 dígitos (sem espaços)
7. Cole em EMAIL_PASS
```

### 6️⃣ Deploy!
```
1. Clique em: Deploy
2. ⏱️ Aguarde ~2 minutos
3. ✅ Congratulations! 🎉
4. Clique em: Visit para abrir
```

---

## 🧪 Testar

### 1️⃣ Backend Health
```
Abra: https://SEU-PROJETO.vercel.app/api/health

Deve mostrar:
✅ {"status":"ok","database":"connected"}
```

### 2️⃣ Criar Conta Especialista
```
1. Abra: https://SEU-PROJETO.vercel.app
2. Clique em: Criar Conta
3. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Tipo: Especialista
   - Dados adicionais
4. Criar Conta
5. ✅ Código OTP enviado no email
6. Digite o código
7. ✅ Redirecionado para /painel-especialista.html
```

### 3️⃣ Testar Dashboard
```
✅ Visão Geral: Ver estatísticas
✅ Pacientes: Lista vazia (ok)
✅ Agenda: Calendário funcionando
✅ Prontuários: Lista vazia (ok)
✅ Chat: Lista vazia (ok)
✅ Perfil: Ver seus dados
```

---

## 🐛 Problemas?

### ❌ Health retorna erro 500
```
1. Vá em Vercel → Settings → Functions
2. Clique em: View Logs
3. Procure: "Database connection failed"
4. ✅ Verifique DATABASE_URL (Settings → Environment Variables)
5. ✅ Teste conexão no Supabase (SQL Editor → SELECT 1)
```

### ❌ OTP não chega no email
```
1. ✅ Verifique EMAIL_USER e EMAIL_PASS
2. ✅ Use senha de APP (16 dígitos), não senha normal
3. ✅ Veja logs do Vercel (pode ter erro do Gmail)
4. ✅ Tente outro email para receber
```

### ❌ Redirect não funciona
```
1. ✅ Limpe cache do navegador (Ctrl+Shift+Del)
2. ✅ Abra em aba anônima
3. ✅ Verifique tipo_usuario no Supabase:
   SQL Editor → SELECT * FROM usuarios WHERE email = 'seu@email.com'
   Deve ter: tipo_usuario = 'especialista'
```

### ❌ "Module not found"
```
1. ✅ Rode localmente: cd backend && npm install
2. ✅ Commit: git add . && git commit -m "fix: deps"
3. ✅ Push: git push
4. ✅ Vercel redeploy automático
```

---

## 📊 Monitoramento

### Ver Logs
```
🌐 https://vercel.com/seu-usuario/conectatea
📊 Deployments → Último deploy → View Function Logs
```

### Ver Database
```
🌐 https://supabase.com/dashboard/project/SEU-PROJETO
📊 Database → Tables → usuarios (ver cadastros)
```

### Ver Analytics
```
🌐 Vercel → Analytics
📈 Requests, Bandwidth, Function Duration
```

---

## 🎉 PRONTO!

Seu ConectaTEA está no ar 100% GRÁTIS! 🚀

```
Frontend: https://conectatea.vercel.app
Backend: https://conectatea.vercel.app/api
Dashboard: https://conectatea.vercel.app/painel-especialista.html
```

**Custo: R$ 0,00/mês** 🎯

Limites generosos:
- ✅ 100GB bandwidth/mês (Vercel)
- ✅ 500MB database (Supabase)
- ✅ Ilimitados deploys
- ✅ SSL automático
- ✅ Deploy contínuo do GitHub

**Próximos passos:**
1. Compartilhe o link com amigos
2. Cadastre pacientes de teste
3. Agende consultas
4. Teste Google Meet
5. Use o chat
6. Crie prontuários

**Dúvidas?** Veja: `DEPLOY-VERCEL-GRATIS.md` (guia completo)
