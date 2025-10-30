# 🚨 RESET DE SENHA DO MYSQL - GUIA PASSO A PASSO

## ❌ Problema: Não consigo conectar ao MySQL

Nenhuma senha comum funcionou. Você precisa resetar a senha do MySQL.

---

## ✅ SOLUÇÃO RÁPIDA (Recomendada)

### Passo 1: Parar o MySQL

Abra o PowerShell **como Administrador** e execute:

```powershell
net stop MySQL80
```

Se der erro "Nome de serviço inválido", tente:

```powershell
Get-Service *mysql* | Stop-Service
```

---

### Passo 2: Criar arquivo de inicialização temporário

Crie um arquivo `C:\mysql-init.txt` com este conteúdo:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'conectatea123';
FLUSH PRIVILEGES;
```

Você pode fazer isso com:

```powershell
@"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'conectatea123';
FLUSH PRIVILEGES;
"@ | Out-File -FilePath C:\mysql-init.txt -Encoding ASCII
```

---

### Passo 3: Iniciar MySQL com o arquivo de inicialização

```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --init-file=C:\mysql-init.txt --console
```

Aguarde aparecer: **"ready for connections"**

---

### Passo 4: Parar o MySQL (Ctrl+C no terminal)

Pressione `Ctrl + C` para parar o servidor.

---

### Passo 5: Deletar arquivo temporário

```powershell
Remove-Item C:\mysql-init.txt
```

---

### Passo 6: Iniciar MySQL normalmente

```powershell
net start MySQL80
```

---

### Passo 7: Testar nova senha

```powershell
mysql -u root -p
# Digite: conectatea123
```

---

### Passo 8: Atualizar .env

Edite `backend\.env`:

```env
DB_PASSWORD=conectatea123
```

---

### Passo 9: Criar banco de dados

```powershell
cd backend
node setup-database.js
```

---

## 🎯 ALTERNATIVA: Usar MySQL Workbench

Se você tem o MySQL Workbench:

1. Abra o MySQL Workbench
2. Tente conectar (se já estiver salvo)
3. Se funcionar, veja qual senha está salva
4. Use essa senha no `.env`

---

## 🆘 AINDA NÃO FUNCIONA?

Execute estes comandos para eu verificar:

```powershell
# Ver serviços MySQL
Get-Service *mysql*

# Ver processos MySQL
Get-Process *mysql*

# Testar conexão
mysql -u root -p
```

Cole os resultados que eu te ajudo!

---

## 📝 RESUMO COMANDOS (Como Administrador)

```powershell
# 1. Parar MySQL
net stop MySQL80

# 2. Criar arquivo de reset
@"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'conectatea123';
FLUSH PRIVILEGES;
"@ | Out-File -FilePath C:\mysql-init.txt -Encoding ASCII

# 3. Iniciar com reset (aguarde "ready for connections" e pressione Ctrl+C)
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --init-file=C:\mysql-init.txt --console

# 4. Limpar arquivo
Remove-Item C:\mysql-init.txt

# 5. Iniciar normalmente
net start MySQL80

# 6. Testar
mysql -u root -p
# Senha: conectatea123
```

Depois disso, configure `DB_PASSWORD=conectatea123` no `.env`
