# 🚀 Deploy Rápido - ConectaTEA

## 📦 1. Deploy do Backend no Render

### Passo a Passo:

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Login com GitHub

2. **Novo Web Service**
   - Dashboard → "New +" → "Web Service"
   - Conecte o repositório: `Conecta-TEA/ConectaTEA`

3. **Configurações**
   ```
   Name: conectatea-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Variáveis de Ambiente**
   
   Vá em **Environment** e adicione:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `EMAIL_USER` | `seu_email@gmail.com` |
   | `EMAIL_PASS` | `sua_senha_app_gmail` |
   | `JWT_SECRET` | Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `SESSION_SECRET` | Gere outra chave diferente |
   | `FRONTEND_URL` | `https://seu-site.vercel.app` |

5. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde 5-10 minutos
   - URL: `https://conectatea-backend.onrender.com`

### ⚠️ Primeira vez?
O Render demora uns 50 segundos no primeiro acesso (cold start). Depois é rápido.

---

## 🌐 2. Deploy do Frontend no Vercel

### Passo a Passo:

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Fazer Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd c:\app3\ConectaTEA
   vercel
   ```

4. **Configurar**
   - Set up and deploy? → **Yes**
   - Which scope? → Sua conta
   - Link to existing project? → **No**
   - Project name? → `conectatea`
   - In which directory? → `.` (raiz)
   - Override settings? → **No**

5. **URL Final**
   - Production: `https://conectatea.vercel.app`
   - Preview: URLs automáticas para cada commit

### Alternativa: Deploy Manual

1. Acesse https://vercel.com
2. Import Git Repository
3. Selecione `ConectaTEA`
4. Deploy (1 clique!)

---

## 🔧 3. Conectar Frontend ao Backend

### Atualizar config.js

Abra `config.js` e atualize a URL do backend:

```javascript
get API_URL() {
    if (this.isDevelopment) {
        return 'http://localhost:3000/api';
    }
    
    // ⬇️ SUBSTITUA PELA SUA URL DO RENDER
    return 'https://conectatea-backend.onrender.com/api';
},
```

### Adicionar config.js nos HTMLs

Adicione ANTES dos outros scripts:

```html
<!-- index.html, login.html, etc -->
<script src="config.js"></script>
<script src="auth.js"></script>
```

### Atualizar JavaScript Files

Em todos os arquivos JS, substitua:

```javascript
// ANTES
const API_URL = 'http://localhost:3000/api';

// DEPOIS
const API_URL = window.CONFIG.API_URL;
```

Arquivos para atualizar:
- ✅ `auth.js`
- ✅ `perfil.js`
- ✅ `especialista-painel.js`
- ✅ E outros que usem API_URL

---

## ✅ 4. Checklist Final

- [ ] Backend deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployado no Vercel
- [ ] `config.js` criado e incluído nos HTMLs
- [ ] URLs do backend atualizadas
- [ ] Testar login
- [ ] Testar recuperação de senha (email)
- [ ] Testar painel do especialista
- [ ] Verificar CORS (F12 → Console)

---

## 🐛 Troubleshooting

### Erro de CORS
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS
```

**Solução:**
1. Verifique se `FRONTEND_URL` está correto no Render
2. Adicione a URL no array `allowedOrigins` em `server.js`
3. Faça commit e push (Render redeploya automaticamente)

### Email não envia
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solução:**
1. Gere senha de app do Gmail: https://myaccount.google.com/apppasswords
2. Use a senha de 16 caracteres em `EMAIL_PASS`

### Banco não inicializa
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**Solução:**
1. Verifique logs do Render
2. O diretório `data/` é criado automaticamente por `init-db.js`
3. Espere o build terminar completamente

### Cold Start (primeiro acesso lento)
Render.com desliga serviços gratuitos após 15 minutos de inatividade.

**Soluções:**
1. Use UptimeRobot para fazer ping a cada 10 minutos
2. Upgrade para plano pago ($7/mês)
3. Aceite os 50 segundos iniciais

---

## 🎯 URLs Finais

Após deploy, você terá:

- 🌐 **Frontend:** `https://conectatea.vercel.app`
- 🔌 **Backend API:** `https://conectatea-backend.onrender.com/api`
- ❤️ **Health Check:** `https://conectatea-backend.onrender.com/api/health`
- 👤 **Admin:** `admin@especialista.com` / `admin123`

---

## 📞 Suporte

Problemas? Verifique:
1. Logs do Render (Dashboard → Logs)
2. Console do navegador (F12)
3. Network tab (requisições falhando?)
4. Variáveis de ambiente corretas?

**Boa sorte! 🚀**
