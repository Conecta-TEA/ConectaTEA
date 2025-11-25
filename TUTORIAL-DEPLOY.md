# 🎯 TUTORIAL VISUAL: Deploy ConectaTEA

## 📋 PASSO A PASSO COMPLETO

### 🔥 PARTE 1: BACKEND NO RENDER (10 minutos)

#### 1️⃣ Criar Conta
```
🌐 Acesse: https://render.com
👤 Clique em "Get Started"
🔗 Login com GitHub
✅ Autorize o Render a acessar seus repositórios
```

#### 2️⃣ Criar Web Service
```
📊 Dashboard → Clique "New +"
🌐 Selecione "Web Service"
📂 Encontre o repositório "ConectaTEA"
✅ Clique "Connect"
```

#### 3️⃣ Configurar Serviço

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `conectatea-backend` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

#### 4️⃣ Variáveis de Ambiente

**🔴 IMPORTANTE: Configure ANTES de fazer deploy!**

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione uma por uma:

```bash
# 1. Ambiente
NODE_ENV = production

# 2. Email do Gmail
EMAIL_USER = seu_email@gmail.com

# 3. Senha de App do Gmail (veja instruções abaixo)
EMAIL_PASS = xxxx xxxx xxxx xxxx

# 4. JWT Secret (gere com comando abaixo)
JWT_SECRET = cole_aqui_a_chave_gerada

# 5. Session Secret (gere outra chave)
SESSION_SECRET = cole_aqui_outra_chave_gerada

# 6. Frontend URL (atualizar depois)
FRONTEND_URL = https://conectatea.vercel.app
```

**🔑 COMO GERAR AS CHAVES:**

No terminal do seu computador:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Execute 2 vezes e use as chaves geradas para `JWT_SECRET` e `SESSION_SECRET`.

**📧 COMO GERAR SENHA DE APP DO GMAIL:**

1. Acesse: https://myaccount.google.com/security
2. Procure por "Verificação em duas etapas" → **Ativar**
3. Volte e procure "Senhas de app"
4. Clique em "Selecionar app" → "Outro (nome personalizado)"
5. Digite: `ConectaTEA Backend`
6. Clique em "Gerar"
7. **Copie a senha de 16 caracteres** (formato: xxxx xxxx xxxx xxxx)
8. Cole em `EMAIL_PASS`

#### 5️⃣ Fazer Deploy

```
✅ Clique em "Create Web Service"
⏳ Aguarde 5-10 minutos (acompanhe os logs)
🎉 Quando aparecer "Build successful", está pronto!
```

#### 6️⃣ Testar Backend

Copie a URL (ex: `https://conectatea-backend.onrender.com`)

Teste no navegador:
```
https://conectatea-backend.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "conectado",
  "usuarios": 1
}
```

✅ **Backend funcionando!**

---

### 🌐 PARTE 2: FRONTEND NO VERCEL (5 minutos)

#### Opção A: Deploy pelo Site (Mais Fácil)

1. **Acesse**: https://vercel.com
2. **Login** com GitHub
3. **Import Git Repository**
4. Selecione: `Conecta-TEA/ConectaTEA`
5. **Configure:**
   - Project Name: `conectatea`
   - Framework Preset: `Other`
   - Root Directory: `./` (deixe vazio)
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
6. **Deploy** (1 clique!)
7. Aguarde 2-3 minutos
8. URL: `https://conectatea.vercel.app` (ou similar)

✅ **Frontend no ar!**

#### Opção B: Deploy pelo Terminal

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd c:\app3\ConectaTEA
vercel

# Seguir instruções:
# - Set up and deploy? Yes
# - Which scope? (sua conta)
# - Link to existing? No
# - Project name? conectatea
# - Directory? . (raiz)
# - Override settings? No

# Aguardar deploy
# URL será exibida no final
```

---

### 🔗 PARTE 3: CONECTAR FRONTEND AO BACKEND (3 minutos)

#### 1️⃣ Atualizar config.js

Abra o arquivo `config.js` e edite:

```javascript
get API_URL() {
    if (this.isDevelopment) {
        return 'http://localhost:3000/api';
    }
    
    // ⬇️ COLE AQUI A URL DO SEU BACKEND (Render)
    return 'https://conectatea-backend.onrender.com/api';
},

get SOCKET_URL() {
    if (this.isDevelopment) {
        return 'http://localhost:3000';
    }
    
    // ⬇️ COLE AQUI A URL DO SEU BACKEND (Render)
    return 'https://conectatea-backend.onrender.com';
}
```

#### 2️⃣ Adicionar config.js nos HTMLs

Em **TODOS** os arquivos HTML, adicione antes dos outros scripts:

```html
<!-- ADICIONE ESTA LINHA ANTES DOS OUTROS SCRIPTS -->
<script src="config.js"></script>

<!-- Seus scripts -->
<script src="auth.js"></script>
<script src="perfil.js"></script>
<!-- etc -->
```

Arquivos para editar:
- ✅ index.html
- ✅ login.html
- ✅ perfil.html
- ✅ consultas.html
- ✅ especialistas.html
- ✅ recursos.html
- ✅ especialista-dashboard.html

#### 3️⃣ Atualizar JavaScript

Em todos os arquivos `.js`, substitua:

**ANTES:**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**DEPOIS:**
```javascript
const API_URL = window.CONFIG?.API_URL || 'http://localhost:3000/api';
```

Arquivos para editar:
- ✅ auth.js
- ✅ perfil.js
- ✅ especialista-painel.js

#### 4️⃣ Atualizar URL do Frontend no Render

1. Volte ao **Render Dashboard**
2. Clique no seu serviço `conectatea-backend`
3. Vá em **Environment**
4. Edite `FRONTEND_URL`
5. Cole a URL do Vercel: `https://conectatea.vercel.app`
6. **Save Changes**
7. Aguarde o redeploy automático

#### 5️⃣ Fazer Commit e Push

```bash
cd c:\app3\ConectaTEA
git add .
git commit -m "fix: Atualizar URLs para produção"
git push
```

Vercel vai redeployar automaticamente em 1-2 minutos!

---

### ✅ PARTE 4: TESTAR TUDO (5 minutos)

#### 1️⃣ Acessar o Site

```
🌐 https://conectatea.vercel.app
```

#### 2️⃣ Testar Login

```
📧 Email: admin@especialista.com
🔑 Senha: admin123
```

#### 3️⃣ Verificar Redirecionamento

Deve ir para: `Painel do Especialista`

#### 4️⃣ Testar Email

1. Faça logout
2. Clique em "Esqueci minha senha"
3. Digite: `admin@especialista.com`
4. Verifique se recebeu o email com código OTP

#### 5️⃣ Verificar Console (F12)

Não deve ter erros de CORS ou API!

Se tiver erro de CORS:
```
❌ Access to fetch ... has been blocked by CORS
```

**Solução:**
1. Verifique se `FRONTEND_URL` está correto no Render
2. Aguarde 1 minuto (cache do navegador)
3. Limpe cache (Ctrl + Shift + Delete)
4. Tente novamente

---

## 🎉 PRONTO!

Seu sistema está no ar!

**URLs Finais:**

- 🌐 **Site:** https://conectatea.vercel.app
- 🔌 **API:** https://conectatea-backend.onrender.com/api
- 👤 **Admin:** admin@especialista.com / admin123

---

## 📊 MONITORAMENTO

### Render Dashboard
```
https://dashboard.render.com
```

- Ver logs em tempo real
- Métricas de uso
- Configurar alertas

### Vercel Dashboard
```
https://vercel.com/dashboard
```

- Ver deploys
- Analytics
- Logs de erros

---

## ⚠️ AVISOS IMPORTANTES

### Cold Start (Render Free)
- Primeiro acesso demora **50 segundos**
- Após 15 min inativo, servidor "dorme"
- **Solução:** Use UptimeRobot (gratuito) para fazer ping

### UptimeRobot (Manter sempre ativo)
1. Acesse: https://uptimerobot.com
2. Crie conta grátis
3. Add Monitor → HTTP(s)
4. URL: `https://conectatea-backend.onrender.com/api/health`
5. Interval: 10 minutos
6. Save

Pronto! Seu backend nunca mais vai dormir! 🎉

---

## 🐛 PROBLEMAS COMUNS

### 1. Erro 502 Bad Gateway
```
Render está reiniciando. Aguarde 1 minuto.
```

### 2. Email não envia
```
✅ Senha de app do Gmail correta?
✅ Verificação em 2 etapas ativada?
✅ EMAIL_USER e EMAIL_PASS configurados no Render?
```

### 3. CORS Error
```
✅ FRONTEND_URL correto no Render?
✅ Esperou 1 minuto após mudança?
✅ Limpou cache do navegador?
```

### 4. Banco de dados não inicializa
```
✅ Verificar logs do Render
✅ Build terminou com sucesso?
✅ Procurar por "Banco de dados inicializado" nos logs
```

---

## 🎯 CHECKLIST FINAL

- [ ] Backend no Render funcionando
- [ ] Frontend no Vercel funcionando
- [ ] config.js atualizado com URLs corretas
- [ ] Variáveis de ambiente configuradas
- [ ] Login funcionando
- [ ] Email de recuperação funcionando
- [ ] Painel do especialista acessível
- [ ] Sem erros no console (F12)
- [ ] UptimeRobot configurado (opcional)

---

**TUDO CERTO? Seu sistema está ONLINE! 🚀🎉**
