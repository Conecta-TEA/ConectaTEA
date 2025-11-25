# 🧪 Como Testar o Sistema de Recuperação de Senha

## ⚠️ IMPORTANTE: Você PRECISA usar um servidor web!

O navegador bloqueia requisições de `file://` para `http://localhost:3000` por segurança (CORS).

---

## 📋 Passos para Testar:

### 1️⃣ **Abrir o Servidor Backend**

Abra um terminal PowerShell e execute:

```powershell
cd c:\app3\ConectaTEA\backend
node server.js
```

✅ Você deve ver:
```
🚀 Servidor ConectaTEA rodando na porta 3000
```

**DEIXE ESTE TERMINAL ABERTO!**

---

### 2️⃣ **Instalar Live Server no VS Code**

1. Abra o VS Code
2. Vá em **Extensions** (Ctrl+Shift+X)
3. Procure por: **Live Server**
4. Clique em **Install** (por Ritwick Dey)

OU use Python:

```powershell
cd c:\app3\ConectaTEA
python -m http.server 5500
```

---

### 3️⃣ **Iniciar o Live Server**

**Opção A: VS Code Live Server**
1. Abra o arquivo `test-esqueci-senha.html` no VS Code
2. Clique com botão direito → **Open with Live Server**
3. OU clique no botão **Go Live** no canto inferior direito

**Opção B: Python**
```powershell
cd c:\app3\ConectaTEA
python -m http.server 5500
```

✅ Abrirá automaticamente: `http://localhost:5500/test-esqueci-senha.html`

---

### 4️⃣ **Testar a Recuperação**

1. **Digite**: `matheuslucindo904@gmail.com`
2. **Clique**: "Enviar Código"
3. **Observe o painel DEBUG** (canto superior direito):
   - ✅ "Submit etapa 1"
   - ✅ "Resposta: {sucesso: true...}"
   - ✅ "Mudando para etapa 2..."

4. **Verifique seu email** (matheuslucindo904@gmail.com)
5. **Copie o código de 6 dígitos**
6. **Digite o código** na tela que apareceu
7. **Clique**: "Continuar"
8. **Digite nova senha** 2 vezes
9. **Clique**: "Redefinir Senha"
10. ✅ **Sucesso!**

---

## ❌ Erros Comuns:

### "Failed to fetch" ou "ERR_CONNECTION_REFUSED"

**Causa**: Servidor backend não está rodando

**Solução**:
```powershell
cd c:\app3\ConectaTEA\backend
node server.js
```

---

### "CORS error" ou "Blocked by CORS policy"

**Causa**: Abrindo HTML direto do arquivo (file://)

**Solução**: Use Live Server ou Python HTTP server

---

### "Network error" mesmo com servidor rodando

**Causa**: Porta errada ou cache do navegador

**Solução**:
1. Verifique se backend está na porta 3000
2. Aperte **Ctrl+Shift+R** no navegador (hard reload)
3. Verifique se Live Server está na porta 5500

---

## 🔍 Verificar Status dos Servidores:

### Backend (porta 3000):
Abra: http://localhost:3000/api/usuarios/perfil

Se der erro 401, está funcionando! (precisa de token)

### Frontend (porta 5500):
Abra: http://localhost:5500/test-esqueci-senha.html

Deve abrir a página de teste

---

## 📧 Últimos Códigos OTP Gerados:

Para testar rapidamente, veja os códigos recentes no terminal do backend:

```sql
INSERT INTO otp_codes ... VALUES (..., '582335', 'recuperacao', ...)
```

O código é: **582335**

---

## ✅ Checklist de Teste:

- [ ] Servidor backend rodando (porta 3000)
- [ ] Live Server rodando (porta 5500) OU Python HTTP server
- [ ] Página aberta em `http://localhost:5500/test-esqueci-senha.html`
- [ ] NÃO em `file:///c:/app3/ConectaTEA/test-esqueci-senha.html`
- [ ] Email válido digitado
- [ ] Código OTP recebido no email
- [ ] Senha redefinida com sucesso

---

## 🚀 Comando Rápido (Tudo de Uma Vez):

Abra 2 terminais:

**Terminal 1 (Backend):**
```powershell
cd c:\app3\ConectaTEA\backend
node server.js
```

**Terminal 2 (Frontend):**
```powershell
cd c:\app3\ConectaTEA
python -m http.server 5500
```

Depois abra: **http://localhost:5500/test-esqueci-senha.html**

---

✅ **PRONTO PARA TESTAR!**
