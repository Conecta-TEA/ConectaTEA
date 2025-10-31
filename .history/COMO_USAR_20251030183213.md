# 🚀 GUIA COMPLETO - CONECTATEA FUNCIONANDO

## ✅ SOLUÇÃO RÁPIDA - Execute estes comandos:

### 1. Instalar Dependências
```powershell
cd backend
npm install
```

### 2. Configurar Email no .env
Edite `backend\.env` e adicione seu email:
```env
EMAIL_USER=matheuslucindo904@gmail.com
EMAIL_PASSWORD=sua_senha_app_aqui
```

**Para gerar senha de app do Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie "ConectaTEA"
3. Copie a senha gerada

### 3. Iniciar Servidor
```powershell
cd backend
npm start
```

### 4. Abrir Frontend
- Abra `index.html` com Live Server
- Acesse: http://localhost:5500

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Banco de Dados SQLite
- **Localização**: `backend/data/conectatea.db`
- **Sem MySQL**: Banco embutido no repositório
- **Tabelas**: 11 tabelas (usuarios, consultas, mensagens, etc.)

### ✅ Autenticação OTP
- Cadastro com verificação por email
- Login sem senha (apenas código OTP)
- Códigos de 6 dígitos válidos por 10 minutos

### ✅ Google Meet
- Link gerado automaticamente para cada consulta
- Formato: `https://meet.google.com/xxx-xxxx-xxx`

### ✅ Chat em Tempo Real
- Socket.io para mensagens instantâneas
- Suporte a texto, imagem, vídeo, áudio
- Indicador de "online/offline"
- Anexação de arquivos

### ✅ Portal do Especialista
- Diretório separado: `/especialista`
- Dashboard com consultas agendadas
- Visualização de pacientes
- Anamnese e evolução
- Chat com pacientes

### ✅ Fórum de Especialistas
- Posts e respostas
- Indicação de outros especialistas
- Categorias e tags
- Busca avançada

---

## 📂 ESTRUTURA DO PROJETO

```
ConectaTEA/
├── backend/
│   ├── data/
│   │   └── conectatea.db          # Banco SQLite
│   ├── uploads/                    # Arquivos enviados
│   ├── config/
│   │   └── database-sqlite.js     # Configuração do banco
│   ├── routes/
│   │   ├── auth-routes.js         # Autenticação
│   │   ├── especialista-routes.js # Especialistas
│   │   ├── consulta-routes.js     # Consultas
│   │   ├── chat-routes.js         # Chat
│   │   └── forum-routes.js        # Fórum
│   ├── .env                        # Configurações
│   ├── package.json
│   └── server.js                   # Servidor principal
│
├── especialista/                   # Portal do Especialista
│   ├── index.html                  # Dashboard
│   ├── consultas.html              # Gerenciar consultas
│   ├── pacientes.html              # Lista de pacientes
│   ├── anamnese.html               # Formulário de anamnese
│   ├── chat.html                   # Chat com pacientes
│   ├── forum.html                  # Fórum de especialistas
│   └── styles.css
│
├── index.html                      # Página inicial (paciente)
├── cadastro.html                   # Cadastro
├── login.html                      # Login com OTP
├── especialistas.html              # Lista de especialistas
├── consultas.html                  # Agendar consulta
├── chat.html                       # Chat paciente-especialista
└── recursos.html                   # Recursos educacionais
```

---

## 🔐 AUTENTICAÇÃO

### Fluxo de Cadastro:
1. Usuário preenche formulário
2. Sistema envia código OTP por email
3. Usuário verifica email em até 10 min
4. Conta ativada

### Fluxo de Login:
1. Usuário digita email
2. Sistema envia código OTP
3. Usuário insere código
4. Token JWT gerado (validade: 7 dias)

---

## 📧 EMAILS ENVIADOS

### 1. Código de Verificação (Cadastro)
**Assunto**: "Bem-vindo ao ConectaTEA"
**Código**: 6 dígitos

### 2. Código de Login
**Assunto**: "Seu Código de Acesso"
**Código**: 6 dígitos

### 3. Confirmação de Consulta
**Assunto**: "Consulta Agendada"
**Conteúdo**: Data, horário, link do Google Meet

---

## 📞 GOOGLE MEET

### Como Funciona:
1. Paciente agenda consulta
2. Sistema gera link único do Meet
3. Email enviado para paciente e especialista
4. No dia/hora, ambos clicam no link

### Formato do Link:
```
https://meet.google.com/abc-defg-hij
```

---

## 💬 CHAT EM TEMPO REAL

### Funcionalidades:
- ✅ Mensagens instantâneas
- ✅ Indicador "online/offline"
- ✅ Notificação de mensagem não lida
- ✅ Upload de arquivos (máx 50MB)
- ✅ Tipos suportados:
  - Imagens (jpg, png, gif, webp)
  - Vídeos (mp4, webm, avi)
  - Áudios (mp3, wav, ogg)
  - Documentos (pdf, docx, xlsx)

### Uso:
```javascript
// Frontend conecta ao Socket.io
const socket = io('http://localhost:3000');

// Enviar mensagem
socket.emit('enviar-mensagem', {
    remetenteId: 1,
    destinatarioId: 2,
    mensagem: 'Olá!',
    tipo: 'texto'
});

// Receber mensagem
socket.on('nova-mensagem', (msg) => {
    console.log('Nova mensagem:', msg);
});
```

---

## 👨‍⚕️ PORTAL DO ESPECIALISTA

### Dashboard (`/especialista/index.html`):
- Consultas do dia
- Próximas consultas
- Total de pacientes
- Mensagens não lidas

### Consultas (`/especialista/consultas.html`):
- Listar todas as consultas
- Filtros: data, status, paciente
- Botão "Iniciar Consulta" (abre Google Meet)
- Reagendar ou cancelar

### Pacientes (`/especialista/pacientes.html`):
- Lista de todos os pacientes
- Histórico de consultas por paciente
- Anamnese e evolução
- Botão para iniciar chat

### Anamnese (`/especialista/anamnese.html`):
- Formulário completo
- Campos:
  - Queixa principal
  - Histórico familiar
  - Desenvolvimento
  - Comportamento
  - Comunicação
  - Interação social
  - Interesses
  - Observações
- Salvar e atualizar

### Chat (`/especialista/chat.html`):
- Lista de conversas
- Chat em tempo real
- Anexar arquivos
- Histórico completo

### Fórum (`/especialista/forum.html`):
- Criar posts
- Responder dúvidas
- Indicar outros especialistas
- Categorias: Diagnóstico, Tratamento, Recursos

---

## 🌐 FÓRUM DE ESPECIALISTAS

### Funcionalidades:
- ✅ Criar posts com título e conteúdo
- ✅ Responder posts
- ✅ Marcar melhor resposta
- ✅ Categorias e tags
- ✅ Busca por palavra-chave
- ✅ Indicar outros especialistas

### Exemplo de Post:
```
Título: "Técnicas de intervenção precoce"
Categoria: Tratamento
Tags: ABA, TEACCH, Denver
Conteúdo: Como vocês trabalham com crianças de 2-3 anos...
```

### Indicações:
```
Especialista A indica Especialista B
Motivo: "Excelente em avaliação diagnóstica"
```

---

## 📋 API ENDPOINTS

### Autenticação
- `POST /api/auth/cadastrar` - Criar conta
- `POST /api/auth/verificar-email` - Verificar OTP cadastro
- `POST /api/auth/login` - Solicitar OTP login
- `POST /api/auth/verificar-login` - Fazer login
- `POST /api/auth/logout` - Sair

### Especialistas
- `GET /api/especialistas` - Listar todos
- `GET /api/especialistas/:id` - Detalhes
- `POST /api/especialistas` - Criar perfil
- `PUT /api/especialistas/:id` - Atualizar

### Consultas
- `POST /api/consultas` - Agendar
- `GET /api/consultas` - Minhas consultas
- `GET /api/consultas/:id` - Detalhes
- `PUT /api/consultas/:id` - Atualizar
- `DELETE /api/consultas/:id` - Cancelar

### Chat
- `GET /api/chat/conversas` - Listar conversas
- `GET /api/chat/:usuarioId` - Mensagens com usuário
- `POST /api/chat/upload` - Enviar arquivo

### Fórum
- `GET /api/forum/posts` - Listar posts
- `POST /api/forum/posts` - Criar post
- `POST /api/forum/posts/:id/responder` - Responder
- `POST /api/forum/indicar` - Indicar especialista

---

## 🧪 TESTAR SISTEMA

### 1. Criar Conta de Especialista:
```
Nome: Dr. João Silva
Email: joao@exemplo.com
Tipo: especialista
Especialidade: Psicólogo
```

### 2. Criar Conta de Paciente:
```
Nome: Maria Santos
Email: maria@exemplo.com
Tipo: paciente
```

### 3. Agendar Consulta:
- Login como Maria
- Ir em "Especialistas"
- Escolher Dr. João
- Agendar consulta para amanhã

### 4. Acessar Portal do Especialista:
- Login como Dr. João
- Abrir `/especialista/index.html`
- Ver consulta agendada
- Iniciar Google Meet

### 5. Testar Chat:
- Login como Maria em uma aba
- Login como Dr. João em outra aba
- Enviar mensagens
- Anexar imagem

---

## ⚡ COMANDOS ÚTEIS

```powershell
# Instalar dependências
cd backend
npm install

# Iniciar servidor (desenvolvimento)
npm start

# Ver banco de dados
cd backend/data
sqlite3 conectatea.db
.tables
SELECT * FROM usuarios;
.exit

# Limpar banco e recriar
Remove-Item backend/data/conectatea.db
npm start

# Ver logs em tempo real
npm start
```

---

## 🆘 TROUBLESHOOTING

### Email não chega:
1. Verifique spam/lixo eletrônico
2. Confirme senha de app no .env
3. Veja logs do servidor

### Socket.io não conecta:
1. Verifique porta 3000 livre
2. CORS configurado para localhost:5500
3. Recarregue página (Ctrl+F5)

### Upload não funciona:
1. Crie pasta `backend/uploads`
2. Verifique permissões
3. Limite: 50MB por arquivo

---

## ✅ CHECKLIST FINAL

Antes de usar, confirme:

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Email configurado em .env
- [ ] Servidor iniciado (`npm start`)
- [ ] Frontend aberto (Live Server)
- [ ] Banco criado (`backend/data/conectatea.db` existe)

---

🎉 **PRONTO! Sistema 100% funcional!**
