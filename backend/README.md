# ConectaTEA - Backend API

Backend completo para a plataforma ConectaTEA com autenticação OTP por email e CRUD completo.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Nodemailer** - Envio de emails
- **bcryptjs** - Criptografia de senhas

## 📋 Pré-requisitos

- Node.js 14+ instalado
- MySQL 5.7+ ou MariaDB instalado
- Conta de email (Gmail recomendado) para envio de OTPs

## 🔧 Instalação

1. **Instalar dependências:**
```powershell
cd backend
npm install
```

2. **Configurar banco de dados:**
   - Abra o MySQL e execute o arquivo `database.sql`
   - Ou use o comando:
   ```powershell
   mysql -u root -p < database.sql
   ```

3. **Configurar variáveis de ambiente:**
   - Edite o arquivo `.env`
   - Configure suas credenciais de email:
     - Para Gmail: ative "Senhas de app" em https://myaccount.google.com/apppasswords
     - Use a senha de app gerada no campo `EMAIL_PASSWORD`

4. **Iniciar servidor:**
```powershell
npm start
```

Ou para desenvolvimento com auto-reload:
```powershell
npm run dev
```

## 📡 Endpoints da API

### Autenticação (sem token)

#### Cadastro
```http
POST /api/auth/cadastrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "data_nascimento": "1990-01-15",
  "tipo_usuario": "paciente"
}
```

#### Verificar Email (após cadastro)
```http
POST /api/auth/verificar-email
Content-Type: application/json

{
  "email": "joao@email.com",
  "codigo": "123456"
}
```

#### Solicitar Login OTP
```http
POST /api/auth/login/solicitar-otp
Content-Type: application/json

{
  "email": "joao@email.com"
}
```

#### Verificar Login OTP
```http
POST /api/auth/login/verificar-otp
Content-Type: application/json

{
  "email": "joao@email.com",
  "codigo": "123456"
}
```

#### Reenviar OTP
```http
POST /api/auth/reenviar-otp
Content-Type: application/json

{
  "email": "joao@email.com",
  "tipo": "login"
}
```

### Usuários (requer token)

#### Listar Usuários (Admin)
```http
GET /api/usuarios?tipo=paciente&status=ativo&pagina=1&limite=10&busca=joão
Authorization: Bearer {token}
```

#### Buscar Usuário
```http
GET /api/usuarios/1
Authorization: Bearer {token}
```

#### Atualizar Usuário
```http
PUT /api/usuarios/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "telefone": "(11) 99999-9999",
  "data_nascimento": "1990-01-15",
  "foto_perfil": "url-da-foto.jpg"
}
```

#### Alterar Senha
```http
POST /api/usuarios/alterar-senha
Authorization: Bearer {token}
Content-Type: application/json

{
  "senha_atual": "senha123",
  "senha_nova": "novaSenha456"
}
```

#### Deletar Usuário (Admin)
```http
DELETE /api/usuarios/1
Authorization: Bearer {token}
```

### Consultas (requer token)

#### Criar Consulta
```http
POST /api/consultas
Authorization: Bearer {token}
Content-Type: application/json

{
  "especialista_id": 1,
  "tipo_atendimento": "primeira",
  "data_consulta": "2025-11-15",
  "horario_consulta": "14:00",
  "observacoes": "Primeira consulta"
}
```

#### Listar Consultas
```http
GET /api/consultas?status=agendada&pagina=1&limite=10
Authorization: Bearer {token}
```

#### Buscar Consulta
```http
GET /api/consultas/1
Authorization: Bearer {token}
```

#### Atualizar Consulta
```http
PUT /api/consultas/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "data_consulta": "2025-11-20",
  "horario_consulta": "15:00"
}
```

#### Cancelar Consulta
```http
PUT /api/consultas/1/cancelar
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo_cancelamento": "Imprevisto"
}
```

#### Deletar Consulta (Admin)
```http
DELETE /api/consultas/1
Authorization: Bearer {token}
```

## 🗄️ Estrutura do Banco de Dados

- **usuarios** - Dados dos usuários
- **otp_codes** - Códigos de verificação OTP
- **especialistas** - Informações dos profissionais
- **consultas** - Agendamentos
- **recursos** - Materiais educativos
- **atividades** - Atividades terapêuticas
- **sessoes** - Sessões ativas (JWT)
- **auditoria** - Log de todas as ações

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Códigos OTP com expiração de 10 minutos
- Uso único de códigos OTP
- Log de auditoria completo
- Validação de permissões por tipo de usuário

## 📧 Configuração de Email (Gmail)

1. Acesse https://myaccount.google.com/security
2. Ative a verificação em 2 etapas
3. Acesse https://myaccount.google.com/apppasswords
4. Gere uma senha de app para "Mail"
5. Use essa senha no `.env` em `EMAIL_PASSWORD`

## 🐛 Troubleshooting

**Erro de conexão com MySQL:**
- Verifique se o MySQL está rodando
- Confira as credenciais no `.env`
- Verifique se o banco `conectatea` foi criado

**Emails não estão sendo enviados:**
- Verifique as credenciais de email no `.env`
- Para Gmail, use senha de app (não a senha normal)
- Verifique se a porta 587 está aberta

**Token inválido:**
- Certifique-se de incluir o header: `Authorization: Bearer {token}`
- Verifique se o token não expirou (7 dias)

## 📝 Licença

Projeto educacional - ConectaTEA 2025
