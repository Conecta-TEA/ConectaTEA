# 🔐 Como Descobrir/Resetar a Senha do MySQL

## ⚠️ PROBLEMA ATUAL

Você está recebendo o erro: **"Access denied for user 'root'@'localhost'"**

Isso significa que a senha do MySQL está configurada, mas você não sabe qual é.

---

## 💡 SOLUÇÃO 1: Tentar senhas comuns

Tente estas senhas mais comuns em ordem:

1. **Senha vazia** (já tentamos - não funcionou)
2. **root**
3. **admin**  
4. **password**
5. **123456**
6. **mysql**

### Como testar:

Edite o arquivo `backend\.env` e altere a linha `DB_PASSWORD=` para cada senha:

```env
DB_PASSWORD=root
```

Depois execute:
```powershell
node setup-database.js
```

---

## 💡 SOLUÇÃO 2: Usar MySQL Workbench

Se você tem o MySQL Workbench instalado:

1. Abra o MySQL Workbench
2. Tente conectar com senha vazia
3. Se funcionar, use senha vazia no .env
4. Se pedir senha, tente as senhas da lista acima

---

## 💡 SOLUÇÃO 3: Resetar a senha do MySQL (Método seguro)

### Passo 1: Parar o serviço MySQL

```powershell
net stop MySQL80
```

### Passo 2: Iniciar MySQL sem verificação de senha

```powershell
mysqld --skip-grant-tables
```

### Passo 3: Em OUTRO terminal, conectar sem senha

```powershell
mysql -u root
```

### Passo 4: Resetar a senha

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha_aqui';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 5: Parar o MySQL e reiniciar normalmente

No primeiro terminal, pressione `Ctrl+C`

Depois:
```powershell
net start MySQL80
```

### Passo 6: Atualizar o .env

```env
DB_PASSWORD=nova_senha_aqui
```

---

## 💡 SOLUÇÃO 4: Usar outro usuário MySQL

Crie um novo usuário MySQL com senha conhecida:

### Conectar como root (se souber a senha):

```powershell
mysql -u root -p
```

### Criar novo usuário:

```sql
CREATE USER 'conectatea'@'localhost' IDENTIFIED BY 'senha123';
GRANT ALL PRIVILEGES ON *.* TO 'conectatea'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

### Atualizar .env:

```env
DB_USER=conectatea
DB_PASSWORD=senha123
```

---

## 💡 SOLUÇÃO 5: Reinstalar MySQL (última opção)

Se nada funcionar:

1. Desinstale o MySQL completamente
2. Reinstale definindo uma senha que você vai lembrar
3. Anote a senha em algum lugar seguro
4. Configure no .env

---

## ✅ TESTE RÁPIDO

Depois de configurar a senha correta, teste:

```powershell
# Teste 1: Conectar via linha de comando
mysql -u root -p
# Digite a senha quando pedir

# Teste 2: Se conectar, execute:
SHOW DATABASES;
EXIT;

# Teste 3: Criar banco pelo nosso script
node setup-database.js
```

---

## 📞 PRECISA DE AJUDA?

**Qual senha você definiu quando instalou o MySQL?**

Se não lembra, siga a SOLUÇÃO 3 para resetar a senha.

**Dica**: Depois de resetar, use uma senha fácil de lembrar, como:
- `conectatea123`
- `mysql123`  
- `dev123`

E guarde em algum lugar seguro!
