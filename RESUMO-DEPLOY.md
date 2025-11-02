# 🎯 RESUMO - DEPLOY EM 3 PASSOS

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código completo no GitHub
- ✅ Supabase criado (PostgreSQL)
- ✅ Connection string: `postgresql://postgres:Matheus/2006**@db.hazhtlfbevprcrsqamer.supabase.co:5432/postgres`
- ✅ Chaves de segurança geradas
- ✅ Email configurado: matheuslucindo904@gmail.com

---

## 🚀 FAÇA AGORA (15 minutos)

### 1️⃣ SUPABASE - Criar Tabelas (5 min)

```
🌐 https://supabase.com/dashboard
📂 Seu projeto → SQL Editor → New query
📄 Copie: supabase-schema.sql (arquivo na raiz)
▶️ Cole e clique em RUN
✅ Success!
```

### 2️⃣ GMAIL - Senha de App (5 min)

```
🌐 https://myaccount.google.com/security
🔐 Ative: Verificação em 2 etapas
🔑 Crie: Senha de app → Nome: "ConectaTEA"
📋 Copie os 16 dígitos (sem espaços)
📝 Anote para usar na Vercel
```

### 3️⃣ VERCEL - Deploy (5 min)

```
🌐 https://vercel.com
➕ Add New → Project → Import ConectaTEA
⚙️ Environment Variables → Adicionar 8 variáveis:
```

**Cole estas variáveis (AJUSTE A SENHA DO EMAIL!):**

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres:Matheus/2006**@db.hazhtlfbevprcrsqamer.supabase.co:5432/postgres` |
| `JWT_SECRET` | `08e2d6041372e4fea08b87afc62778c214f4749f6c384d9f525fdbb09c46f57e` |
| `SESSION_SECRET` | `0e78e6b84a9bbe8a5ad7310d700b803b4c2f7212c2919bbdb81f20ed05b7f5a2` |
| `EMAIL_USER` | `matheuslucindo904@gmail.com` |
| `EMAIL_PASS` | `SUA_SENHA_APP_16_DIGITOS` ⬅️ **COLOQUE A SENHA DO GMAIL AQUI** |
| `FRONTEND_URL` | `https://conectatea.vercel.app` |

```
🚀 Deploy
⏱️ Aguarde 2 minutos
✅ Pronto!
```

---

## 🧪 TESTAR

### Health Check
```
https://conectatea.vercel.app/api/health
✅ {"status":"ok","database":"connected"}
```

### Criar Conta
```
https://conectatea.vercel.app
→ Criar Conta
→ Preencher formulário
→ Verificar email (código OTP)
→ Dashboard carrega!
```

---

## 📁 ARQUIVOS IMPORTANTES

```
.env.production          ← Suas variáveis (NÃO commitar!)
supabase-schema.sql      ← SQL para criar tabelas
SEU-DEPLOY.md            ← Guia completo passo a passo
DEPLOY-15MIN.md          ← Guia rápido visual
```

---

## 🆘 PROBLEMAS?

Veja o arquivo `SEU-DEPLOY.md` com soluções detalhadas!

---

## 🎉 RESULTADO FINAL

```
🌐 https://conectatea.vercel.app
💰 Custo: R$ 0,00/mês
✅ 100% Funcional
🚀 Deploy Contínuo
🔒 SSL/HTTPS Automático
```

**BOM DEPLOY! 🎊**
