# 🧩 ConectaTEA - Plataforma de Apoio para Famílias

> Plataforma completa em Node.js/HTML/CSS/JS para apoiar famílias com filhos no espectro autista, oferecendo recursos educacionais, agendamento de consultas com especialistas, autenticação segura via OTP e gestão completa de perfis.

## ✨ Funcionalidades

### 🎯 Para Pais e Famílias
- ✅ **Cadastro e Login** com autenticação OTP via email
- ✅ **Agendamento de Consultas** com especialistas
- ✅ **Gestão de Perfil** (CRUD completo)
- ✅ **Recursos Educacionais** para apoio
- ✅ **Atividades Terapêuticas** personalizadas
- ✅ **Dashboard** com histórico de consultas

### 👨‍⚕️ Para Especialistas
- ✅ **Perfil Profissional** com especialidades
- ✅ **Gerenciamento de Consultas** agendadas
- ✅ **Histórico de Atendimentos**
- ✅ **Comunicação com Pacientes**

### 🛠️ Tecnologias
- **Backend**: Node.js 14+ com Express 4.18.2
- **Banco de Dados**: MySQL 5.7+ com mysql2
- **Autenticação**: JWT + OTP via email (Nodemailer)
- **Segurança**: bcryptjs, sessões JWT, auditoria completa
- **Frontend**: HTML5, CSS3, JavaScript vanilla, Font Awesome 6.4.0

## 🚀 Como Rodar

### Requisitos
- **Node.js** 14 ou superior
- **MySQL** 5.7 ou superior
- **Conta Gmail** para envio de emails OTP
- Navegador moderno (Chrome, Firefox, Edge)

### Instalação do Backend

1. **Instalar dependências**
```powershell
cd backend
npm install
```

2. **Configurar banco de dados**
```sql
CREATE DATABASE conectatea;
```

```powershell
mysql -u root -p conectatea < database.sql
```

3. **Configurar variáveis de ambiente**

Edite o arquivo `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=conectatea
JWT_SECRET=sua_chave_secreta_super_segura
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail
FRONTEND_URL=http://localhost:5500
```

**⚠️ Gmail App Password**: Acesse https://myaccount.google.com/apppasswords para gerar

4. **Iniciar servidor backend**
```powershell
cd backend
npm start
```

### Frontend

1. **Abrir com Live Server**
   - Instale a extensão Live Server no VS Code
   - Clique com botão direito em `index.html`
   - Selecione "Open with Live Server"
   - Acesse: http://localhost:5500

## 📁 Estrutura do Projeto

```
ConectaTEA/
├── backend/                    # Backend Node.js
│   ├── config/
│   │   ├── database.js        # Conexão MySQL
│   │   └── email.js           # Configuração Nodemailer
│   ├── controllers/
│   │   ├── authController.js  # Autenticação OTP
│   │   ├── usuarioController.js # CRUD usuários
│   │   └── consultaController.js # CRUD consultas
│   ├── middleware/
│   │   └── auth.js            # Verificação JWT
│   ├── routes/
│   │   ├── authRoutes.js      # Rotas de autenticação
│   │   ├── usuarioRoutes.js   # Rotas de usuários
│   │   └── consultaRoutes.js  # Rotas de consultas
│   ├── utils/
│   │   └── otp.js             # Geração de códigos
│   ├── .env                   # Variáveis de ambiente
│   ├── database.sql           # Schema do banco
│   ├── package.json           # Dependências
│   ├── server.js              # Servidor Express
│   └── README.md              # Documentação da API
│
├── index.html                 # Página inicial
├── especialistas.html         # Lista de especialistas
├── consultas.html             # Agendamento
├── recursos.html              # Recursos educacionais
├── login.html                 # Login com OTP
├── cadastro.html              # Cadastro de usuário
├── styles.css                 # Estilos globais
├── auth.css                   # Estilos de autenticação
├── auth.js                    # Lógica de login/cadastro
├── session.js                 # Gerenciamento de sessão
└── README.md                  # Este arquivo
```

## 🎨 Identidade Visual

A plataforma possui um **Design System completo** com:
- Paleta de cores moderna (azul/roxo/cyan)
- Tipografia elegante (Inter)
- Componentes reutilizáveis (cards, botões, formulários)
- Animações suaves e responsivas
- Gradientes e sombras profissionais
- Layout mobile-first

## 🔐 Segurança

- ✅ **Autenticação OTP** via email (sem senha no login)
- ✅ **Senhas criptografadas** com bcryptjs (10 salt rounds)
- ✅ **Tokens JWT** com expiração de 7 dias
- ✅ **Códigos OTP** de uso único (10 minutos de validade)
- ✅ **Prepared statements** (proteção SQL injection)
- ✅ **Validação de sessão** em todas as requisições
- ✅ **Auditoria completa** de ações no banco
- ✅ **CORS configurado** para domínios permitidos

## 📊 Banco de Dados

### Tabelas (8 no total)
- **usuarios**: Contas de usuários (pacientes, especialistas, admin)
- **otp_codes**: Códigos de verificação temporários
- **especialistas**: Perfis profissionais com especialidades
- **consultas**: Agendamentos e histórico de atendimentos
- **recursos**: Biblioteca de conteúdo educacional
- **atividades**: Atividades terapêuticas personalizadas
- **sessoes**: Tokens JWT ativos
- **auditoria**: Log completo de todas as ações

## � Sistema de Emails

O sistema envia emails HTML estilizados para:

### 1. Verificação de Cadastro
- **Assunto**: "Bem-vindo ao ConectaTEA - Verifique seu Email"
- **Conteúdo**: Código de 6 dígitos para ativar conta

### 2. Login com OTP
- **Assunto**: "Seu Código de Acesso - ConectaTEA"
- **Conteúdo**: Código de 6 dígitos para fazer login

### 3. Recuperação de Senha
- **Assunto**: "Redefinir Senha - ConectaTEA"
- **Conteúdo**: Código de 6 dígitos para criar nova senha

Todos os emails seguem o design system da plataforma com gradientes roxo/rosa.

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/cadastrar` - Criar nova conta
- `POST /api/auth/verificar-email` - Verificar código de cadastro
- `POST /api/auth/login/solicitar-otp` - Solicitar código de login
- `POST /api/auth/login/verificar-otp` - Fazer login com OTP
- `POST /api/auth/reenviar-otp` - Reenviar código
- `POST /api/auth/logout` - Fazer logout (protegido)

### Usuários
- `GET /api/usuarios` - Listar usuários (admin)
- `GET /api/usuarios/:id` - Buscar por ID
- `PUT /api/usuarios/:id` - Atualizar perfil
- `DELETE /api/usuarios/:id` - Deletar (admin)
- `POST /api/usuarios/alterar-senha` - Alterar senha

### Consultas
- `POST /api/consultas` - Agendar consulta
- `GET /api/consultas` - Listar minhas consultas
- `GET /api/consultas/:id` - Detalhes da consulta
- `PUT /api/consultas/:id` - Atualizar/reagendar
- `PUT /api/consultas/:id/cancelar` - Cancelar consulta
- `DELETE /api/consultas/:id` - Deletar (admin)

Documentação completa em `backend/README.md`

## 🚢 Deploy

### Backend (Node.js)
- **Heroku**: `git push heroku main`
- **Railway**: Deploy automático via GitHub
- **Render**: Deploy com MySQL gerenciado
- **VPS**: PM2 + Nginx + MySQL

### Frontend (Estático)
- **Vercel**: Deploy gratuito
- **Netlify**: CI/CD integrado
- **GitHub Pages**: Apenas frontend estático
- **Cloudflare Pages**: Performance global

### Checklist de Deploy
- [ ] Configurar variáveis de ambiente (.env) no servidor
- [ ] Ativar HTTPS (SSL/TLS)
- [ ] Configurar backups automáticos do MySQL
- [ ] Implementar rate limiting nas rotas
- [ ] Adicionar monitoring (logs, uptime)
- [ ] Configurar domínio personalizado
- [ ] Otimizar assets (minify CSS/JS)
- [ ] Configurar CDN para static files
- [ ] Testar envio de emails em produção
- [ ] Alterar senha do usuário admin padrão

## 👤 Usuário Admin Padrão

Criado automaticamente no banco:
- **Email**: admin@conectatea.com.br
- **Senha**: admin123
- **Tipo**: admin

⚠️ **IMPORTANTE**: Altere a senha após primeiro acesso!

## 🎯 Próximos Passos

### Curto Prazo (em desenvolvimento)
- [ ] Integrar páginas frontend com API backend
- [ ] CRUD de Especialistas (controller + rotas)
- [ ] CRUD de Recursos (controller + rotas)
- [ ] Upload de fotos de perfil (multer)
- [ ] Sistema de notificações por email
- [ ] Filtros e busca avançada

### Médio Prazo
- [ ] Dashboard com estatísticas (gráficos)
- [ ] Chat em tempo real (Socket.io)
- [ ] Sistema de avaliações de especialistas
- [ ] Calendário de disponibilidade
- [ ] Aplicativo PWA (Progressive Web App)
- [ ] Integração com Google Calendar

### Longo Prazo
- [ ] App mobile nativo (React Native / Flutter)
- [ ] IA para recomendações personalizadas
- [ ] Videochamadas integradas (WebRTC/Jitsi)
- [ ] Gamificação com badges e conquistas
- [ ] Multi-idioma (i18n)
- [ ] Marketplace de conteúdo premium

## 📄 Licença

Verifique o arquivo `LICENSE` para detalhes.

## 💙 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🆘 Suporte

- **Email**: suporte@conectatea.com.br (exemplo)
- **Issues**: [GitHub Issues](https://github.com/Conecta-TEA/ConectaTEA/issues)
- **Documentação**: Em construção

---

**Desenvolvido com 💙 para ajudar famílias**