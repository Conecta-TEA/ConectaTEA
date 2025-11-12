# 🚀 Backend PHP - ConectaTEA

Backend PHP simples para o grupo trabalhar. Mantém a funcionalidade de OTP por email!

## 📋 O que tem aqui

- ✅ **Cadastro de usuários** (com envio de OTP)
- ✅ **Login com OTP** (código por email)
- ✅ **Verificação de email**
- ✅ **MySQL 8.0** (MySQL Workbench)
- ✅ **PHPMailer** (envio de emails)
- ✅ **JWT simples** (sessões)

---

## 🛠️ Instalação

### 1. Instalar XAMPP (ou WAMP/LAMP)

```
Windows: https://www.apachefriends.org/pt_br/index.html
```

**O que vem no XAMPP:**
- ✅ Apache (servidor web)
- ✅ MySQL 8.0
- ✅ PHP 8.x
- ✅ phpMyAdmin

### 2. Instalar Composer (gerenciador PHP)

```
https://getcomposer.org/download/
```

### 3. Configurar Projeto

```bash
# 1. Copie esta pasta (backend-php) para:
C:\xampp\htdocs\conectatea\

# 2. Instale dependências (PHPMailer)
cd C:\xampp\htdocs\conectatea\backend-php
composer install

# 3. Configure o banco de dados
# Edite: config/database.php
# Ajuste: DB_HOST, DB_USER, DB_PASS, DB_NAME

# 4. Configure o email
# Edite: config/email.php
# Ajuste: EMAIL_USER, EMAIL_PASS (senha de app do Gmail)
```

---

## 🗄️ Configurar Banco de Dados

### Opção 1: MySQL Workbench 8.0 (Recomendado para o grupo)

```bash
1. Abra MySQL Workbench
2. Crie uma conexão:
   - Hostname: localhost
   - Port: 3306
   - Username: root
   - Password: (deixe vazio ou a senha do MySQL)
3. Clique em "Test Connection"
4. Se conectar, clique em "OK"
5. Abra o arquivo: database-mysql.sql
6. Execute todo o script (⚡ botão)
7. ✅ Banco criado com 8 tabelas!
```

### Opção 2: phpMyAdmin (Mais simples)

```bash
1. Inicie XAMPP → Start Apache e MySQL
2. Abra navegador: http://localhost/phpmyadmin
3. Clique em "New" (criar banco)
4. Nome: conectatea
5. Collation: utf8mb4_unicode_ci
6. Clique em "Import"
7. Escolha: database-mysql.sql
8. Clique em "Go"
9. ✅ Banco criado!
```

### Opção 3: Linha de comando

```bash
mysql -u root -p
CREATE DATABASE conectatea;
USE conectatea;
SOURCE database-mysql.sql;
EXIT;
```

---

## 🚀 Rodar o Projeto

### 1. Iniciar XAMPP

```
1. Abra o XAMPP Control Panel
2. Clique em "Start" no Apache
3. Clique em "Start" no MySQL
4. ✅ Verde = rodando!
```

### 2. Acessar API

```
Backend: http://localhost/conectatea/backend-php/api/

Endpoints disponíveis:
- POST /cadastro.php         → Criar conta
- POST /verificar-email.php  → Verificar código
- POST /login.php            → Solicitar OTP
- POST /verificar-login.php  → Fazer login com OTP
```

### 3. Testar com Frontend

```html
<!-- No seu JS, mude a URL da API: -->
const API_URL = 'http://localhost/conectatea/backend-php/api';

// Exemplo de cadastro:
fetch(`${API_URL}/cadastro.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: '123456',
        tipo_usuario: 'paciente'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📁 Estrutura

```
backend-php/
├── config/
│   ├── database.php        ← Conexão MySQL
│   └── email.php          ← Configuração OTP/PHPMailer
├── includes/
│   └── functions.php      ← Funções auxiliares
├── api/
│   ├── cadastro.php       ← API de cadastro
│   ├── login.php          ← API de login (solicitar OTP)
│   ├── verificar-email.php← API verificar cadastro
│   └── verificar-login.php← API verificar login
├── database-mysql.sql     ← Script SQL (MySQL 8.0)
├── composer.json          ← Dependências PHP
└── README.md             ← Este arquivo
```

---

## 🔧 Configuração de Email

Para enviar OTP por email, você precisa de uma **senha de app do Gmail**:

```bash
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em 2 etapas"
3. Acesse: https://myaccount.google.com/apppasswords
4. Nome: ConectaTEA
5. Gerar
6. Copie os 16 dígitos (sem espaços)
7. Cole em config/email.php na linha EMAIL_PASS
```

---

## 🧪 Testar APIs

### Com Postman:

```
1. Baixe: https://www.postman.com/downloads/
2. Crie uma request POST
3. URL: http://localhost/conectatea/backend-php/api/cadastro.php
4. Body → raw → JSON:
{
    "nome": "Teste Silva",
    "email": "seu_email@gmail.com",
    "senha": "123456",
    "tipo_usuario": "paciente"
}
5. Send
6. ✅ Deve retornar success:true e enviar email!
```

### Com cURL (terminal):

```bash
curl -X POST http://localhost/conectatea/backend-php/api/cadastro.php \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456"}'
```

---

## 🐛 Problemas Comuns

### ❌ "Connection refused"
```
Solução: Verifique se Apache e MySQL estão rodando no XAMPP
```

### ❌ "Access denied for user 'root'"
```
Solução: 
1. config/database.php
2. Ajuste DB_USER e DB_PASS conforme seu MySQL
```

### ❌ "Class 'PHPMailer' not found"
```
Solução:
cd backend-php
composer install
```

### ❌ Email não envia
```
Solução:
1. Use senha de APP do Gmail (não senha normal)
2. Verifique config/email.php
3. Teste manualmente: php -f test-email.php
```

### ❌ "CORS error"
```
Solução: Já está configurado nas APIs
Se persistir, adicione no Apache (.htaccess):
Header set Access-Control-Allow-Origin "*"
```

---

## 📊 Diferenças Node.js vs PHP

| Recurso | Node.js (backup) | PHP (atual) |
|---------|------------------|-------------|
| Banco | SQLite/PostgreSQL | MySQL 8.0 |
| Email | Nodemailer | PHPMailer |
| Servidor | Express | Apache (XAMPP) |
| Sessão | JWT (jsonwebtoken) | JWT (função própria) |
| Async | async/await | Síncrono |

**✅ Funcionalidade mantida:** OTP por email funciona igual!

---

## 🎯 Próximos Passos para o Grupo

### Backend (vocês fazem):
- [ ] Criar API de listagem de especialistas
- [ ] Criar API de agendamento de consultas
- [ ] Criar API de chat simples
- [ ] Upload de fotos de perfil
- [ ] Sistema de avaliações

### Frontend (você já fez):
- [x] Design completo
- [x] Painel do especialista
- [x] Integração Google Meet
- [x] Chat em tempo real
- [x] Todas as páginas

---

## 💡 Dicas para o Grupo

### PHP é mais simples que Node.js:
```php
// PHP: tudo síncrono, sem callbacks
$usuario = buscarUsuario($id);  // Já retorna resultado
echo $usuario['nome'];

// Node.js: precisa de async/await
const usuario = await buscarUsuario(id);
console.log(usuario.nome);
```

### MySQL Workbench é visual:
- ✅ Ver tabelas clicando
- ✅ Editar dados manualmente
- ✅ Testar queries facilmente
- ✅ Exportar/importar SQL

### XAMPP tudo em um lugar:
- ✅ Servidor web (Apache)
- ✅ Banco de dados (MySQL)
- ✅ PHP já configurado
- ✅ phpMyAdmin (interface web)

---

## 🔗 Links Úteis

- **XAMPP**: https://www.apachefriends.org/
- **Composer**: https://getcomposer.org/
- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
- **PHPMailer**: https://github.com/PHPMailer/PHPMailer
- **PHP Docs**: https://www.php.net/manual/pt_BR/
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## ✅ Checklist de Setup

- [ ] XAMPP instalado
- [ ] Apache rodando (verde)
- [ ] MySQL rodando (verde)
- [ ] Composer instalado
- [ ] Projeto em `htdocs/conectatea/`
- [ ] `composer install` executado
- [ ] Banco de dados criado (MySQL Workbench ou phpMyAdmin)
- [ ] `config/database.php` configurado
- [ ] `config/email.php` configurado (senha de app)
- [ ] Teste de cadastro funcionando
- [ ] Email OTP chegando

---

**🎉 Pronto! Backend PHP simplificado funcionando!**

**Custo: R$ 0,00** (tudo local)
