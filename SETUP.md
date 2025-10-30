# 🚀 Guia de Configuração Rápida - ConectaTEA

## ⚠️ ERRO ATUAL: Conexão com MySQL

O erro `Access denied for user 'root'@'localhost'` significa que você precisa configurar a senha do MySQL no arquivo `.env`.

---

## 📝 PASSOS PARA RESOLVER:

### 1️⃣ Configurar Senha do MySQL

Abra o arquivo: `backend\.env`

Altere a linha:
```env
DB_PASSWORD=
```

Para:
```env
DB_PASSWORD=sua_senha_mysql_aqui
```

**💡 Dica**: Se você não definiu senha durante a instalação do MySQL, tente deixar vazio ou use "root".

---

### 2️⃣ Criar Banco de Dados

Depois de configurar a senha, execute:

```powershell
node backend/setup-database.js
```

Isso criará automaticamente:
- ✅ Banco de dados `conectatea`
- ✅ 8 tabelas (usuarios, otp_codes, consultas, etc.)
- ✅ Usuário admin padrão

---

### 3️⃣ Configurar Email (Gmail)

Para o sistema de OTP funcionar, você precisa de uma **Senha de App do Gmail**:

#### Passo a passo:

1. **Acesse**: https://myaccount.google.com/apppasswords
   (faça login com sua conta Gmail)

2. **Selecione**: "Outro (nome personalizado)"

3. **Digite**: "ConectaTEA"

4. **Clique**: "Gerar"

5. **Copie** a senha gerada (16 caracteres, exemplo: `abcd efgh ijkl mnop`)

6. **Cole** no arquivo `backend\.env`:

```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**⚠️ IMPORTANTE**: Use a senha de app, NÃO sua senha normal do Gmail!

---

### 4️⃣ Iniciar Servidor

Após configurar MySQL e Email, execute:

```powershell
cd backend
npm start
```

Você deve ver:
```
✓ Conectado ao banco de dados MySQL
Servidor rodando na porta 3000
```

---

### 5️⃣ Testar Sistema

1. **Frontend**: Abra `index.html` com Live Server (http://localhost:5500)

2. **Cadastro**: Acesse http://localhost:5500/cadastro.html
   - Preencha o formulário
   - Verifique seu email
   - Copie o código de 6 dígitos

3. **Login**: Acesse http://localhost:5500/login.html
   - Digite seu email
   - Verifique email novamente
   - Digite o código recebido

---

## ❓ Problemas Comuns

### MySQL não está rodando
```powershell
# Verificar status
net start | findstr MySQL

# Iniciar MySQL (caso não esteja rodando)
net start MySQL80
```

### Não consigo gerar Senha de App no Gmail

**Requisitos**:
- Verificação em 2 etapas ATIVADA
- Conta pessoal (não funciona com contas G Suite de empresas)

**Alternativa temporária** (apenas para testes):
- Use um serviço como Mailtrap.io
- Configure no `.env`:
  ```env
  EMAIL_HOST=smtp.mailtrap.io
  EMAIL_PORT=2525
  EMAIL_USER=seu-user-mailtrap
  EMAIL_PASSWORD=sua-senha-mailtrap
  ```

### Backend continua dando erro

**Verifique os logs completos**:
```powershell
cd backend
npm start
```

Procure por mensagens de erro específicas.

---

## 📋 Checklist Final

Antes de testar, confirme:

- [ ] MySQL instalado e rodando
- [ ] Senha do MySQL configurada em `.env`
- [ ] Banco de dados criado (`node backend/setup-database.js`)
- [ ] Email configurado em `.env` (Gmail App Password)
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend iniciado (`npm start` na pasta backend)
- [ ] Frontend aberto no Live Server (porta 5500)

---

## 🎯 Comandos Resumidos

```powershell
# 1. Configurar .env (edite manualmente DB_PASSWORD e EMAIL)

# 2. Criar banco de dados
node backend/setup-database.js

# 3. Iniciar backend
cd backend
npm start

# 4. Abrir frontend
# Clique com botão direito em index.html > Open with Live Server
```

---

## ✅ Tudo Funcionando?

Se você vir:
- ✅ Backend: "Servidor rodando na porta 3000"
- ✅ Frontend: Página abre sem erros no console
- ✅ Cadastro: Email recebido com código

**Parabéns! 🎉 O sistema está funcionando!**

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique os logs do terminal onde o backend está rodando
2. Abra o Console do navegador (F12) e veja os erros
3. Confirme que as portas 3000 (backend) e 5500 (frontend) estão livres
