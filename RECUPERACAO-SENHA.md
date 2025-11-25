# 🔐 Sistema de Recuperação de Senha - ConectaTEA

## ✅ Implementado com Sucesso!

O sistema completo de "Esqueci minha senha" está funcionando com envio de código OTP por email.

---

## 📋 Como Funciona

### 1️⃣ **Solicitar Recuperação**
- Usuário acessa a página de login
- Clica em "Esqueci minha senha"
- Digita o email cadastrado
- Sistema envia um código de 6 dígitos por email

### 2️⃣ **Validar Código e Redefinir**
- Usuário recebe email com código OTP
- Código expira em **10 minutos**
- Digita o código + nova senha
- Sistema valida e atualiza a senha

### 3️⃣ **Segurança**
- Código de uso único (single-use)
- Hash bcrypt para senhas
- Invalidação de todas as sessões anteriores
- Expiração automática em 10 minutos

---

## 🧪 Como Testar

### Passo 1: Garantir que o servidor está rodando
```powershell
cd backend
node server.js
```

### Passo 2: Abrir a página de login
```
http://localhost:5500/login.html
```

### Passo 3: Clicar em "Esqueci minha senha"

### Passo 4: Digitar um email válido cadastrado no sistema

### Passo 5: Verificar o email
- Abra o email cadastrado
- Procure o email da ConectaTEA
- Copie o código de 6 dígitos

### Passo 6: Redefinir senha
- Cole o código no campo
- Digite a nova senha (mínimo 6 caracteres)
- Confirme a nova senha
- Clique em "Redefinir Senha"

### Passo 7: Fazer login com a nova senha
- Você será redirecionado para a página de login
- Use a nova senha para acessar

---

## 📁 Arquivos Criados/Modificados

### Frontend:
- ✅ `esqueci-senha.html` - Página de recuperação (3 etapas)
- ✅ `esqueci-senha.js` - Lógica do frontend
- ✅ `login.html` - Adicionado link "Esqueci minha senha"
- ✅ `auth.css` - Estilos adicionados

### Backend:
- ✅ `backend/routes/auth-simple.js` - Adicionadas 2 rotas:
  - `POST /api/auth/esqueci-senha` - Envia código OTP
  - `POST /api/auth/redefinir-senha` - Valida código e muda senha
- ✅ `backend/config/email.js` - Template de email tipo "recuperacao"

---

## 🔌 Endpoints da API

### 1. Solicitar Código de Recuperação
```http
POST /api/auth/esqueci-senha
Content-Type: application/json

{
  "email": "usuario@exemplo.com"
}
```

**Resposta de Sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Código de recuperação enviado para seu email",
  "email": "usuario@exemplo.com"
}
```

---

### 2. Redefinir Senha
```http
POST /api/auth/redefinir-senha
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "codigo": "123456",
  "novaSenha": "minhaNovaSenh@123"
}
```

**Resposta de Sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Senha redefinida com sucesso! Faça login com a nova senha."
}
```

**Erros Possíveis:**
- Código inválido ou expirado
- Email não encontrado
- Senha muito curta (< 6 caracteres)
- Campos obrigatórios vazios

---

## 🎨 Interface

### Página de Recuperação - 3 Etapas:

1. **Solicitar Código**
   - Campo de email
   - Botão "Enviar Código"
   - Link para voltar ao login

2. **Validar e Redefinir**
   - Campo de código (6 dígitos)
   - Campos de nova senha + confirmação
   - Botão "Reenviar código"
   - Botão "Voltar"

3. **Sucesso**
   - Ícone de check verde
   - Mensagem de sucesso
   - Botão "Fazer Login"

---

## 📧 Configuração de Email

O sistema usa o Nodemailer com as configurações do `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app
```

### ⚠️ Importante para Gmail:
1. Ative a "Verificação em 2 etapas"
2. Gere uma "Senha de app" nas configurações
3. Use a senha de app no `.env`

---

## 🔒 Segurança Implementada

- ✅ Código OTP de 6 dígitos aleatório
- ✅ Expiração em 10 minutos
- ✅ Código de uso único (marcado como "usado")
- ✅ Validação de senha forte
- ✅ Hash bcrypt para senhas
- ✅ Invalidação de sessões anteriores
- ✅ Rate limiting (proteção contra spam)
- ✅ Mensagens genéricas (não revela se email existe)

---

## 🐛 Troubleshooting

### Email não está sendo enviado?
1. Verifique as configurações no `.env`
2. Confirme que o servidor de email está acessível
3. Veja os logs do servidor: `✅ Servidor de email pronto`
4. Use uma "senha de app" se estiver usando Gmail

### Código expira muito rápido?
- Padrão: 10 minutos
- Modifique em `auth-simple.js` linha: `new Date(Date.now() + 10 * 60 * 1000)`

### Código inválido mesmo estando correto?
- Verifique se não há espaços no código
- Código é case-sensitive? Não, só números
- Confirme que o código não foi usado

---

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar captcha para evitar spam
- [ ] Limitar tentativas de código inválido (3x)
- [ ] Histórico de recuperações no perfil
- [ ] SMS como alternativa ao email
- [ ] Autenticação de dois fatores (2FA)

---

## ✨ Recursos Adicionais

- Design responsivo (mobile-friendly)
- Animações suaves
- Loading states
- Alertas de sucesso/erro
- Auto-format do código (apenas números)
- Reenvio de código
- Validação em tempo real

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do servidor
- Confirme que o email está configurado
- Teste com um email válido cadastrado

---

**Desenvolvido com ❤️ para ConectaTEA**
