# 🧩 ConectaTEA - Plataforma de Apoio para Famílias

> Plataforma completa em PHP/HTML/CSS/JS para apoiar famílias com filhos no espectro autista, oferecendo exercícios personalizados, jogos educativos, videochamadas com especialistas e suporte emocional.

## ✨ Funcionalidades

### 🎯 Para Pais e Famílias
- ✅ **CRUD Completo** de perfis de crianças (criar, editar, visualizar, deletar)
- ✅ **Biblioteca de Exercícios** personalizados por nível e área
- ✅ **Jogos Educativos** interativos em JavaScript
- ✅ **Videochamadas** com especialistas via Jitsi Meet
- ✅ **Agendamento** de consultas e sessões
- ✅ **Suporte Emocional** com recursos e comunidade
- ✅ **Dashboard** com estatísticas e progresso
- ✅ **Sistema de Assinaturas** (Gratuito/Básico/Premium)

### 🛠️ Tecnologias
- **Backend**: PHP 8+ com SQLite (migração fácil para MySQL)
- **Frontend**: HTML5, CSS3 (Design System customizado), JavaScript vanilla
- **Autenticação**: Sessões seguras com password_hash
- **Videochamadas**: Jitsi Meet (iframe)
- **Pagamentos**: Stripe (pronto para integração)

## 🚀 Como Rodar

### Requisitos
- PHP 8.0 ou superior
- Navegador moderno (Chrome, Firefox, Edge)

### Instalação

1. **Clone o repositório**
```powershell
git clone https://github.com/Conecta-TEA/ConectaTEA.git
cd ConectaTEA
```

2. **Inicie o servidor**
```powershell
php -S 127.0.0.1:8000 -t public
```

3. **Acesse no navegador**
```
http://127.0.0.1:8000
```

O banco de dados SQLite será criado automaticamente em `data/database.sqlite` na primeira execução.

## 📁 Estrutura do Projeto

```
ConectaTEA/
├── public/              # Arquivos públicos (raiz do servidor)
│   ├── index.php        # Landing page
│   ├── header.php       # Template header
│   ├── footer.php       # Template footer
│   ├── register.php     # Registro de usuário
│   ├── login.php        # Login
│   ├── dashboard.php    # Dashboard principal
│   ├── children.php     # CRUD de crianças
│   ├── exercises.php    # Biblioteca de exercícios
│   ├── appointments.php # Agendamentos e chamadas
│   ├── payments.php     # Assinaturas e pagamentos
│   ├── css/
│   │   └── style.css    # Design System completo
│   └── js/
│       └── app.js       # JavaScript principal
├── src/                 # Código PHP backend
│   ├── db.php          # Conexão e inicialização do banco
│   └── auth.php        # Sistema de autenticação
├── data/               # Banco de dados (criado automaticamente)
│   └── database.sqlite
└── README.md
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

- ✅ Senhas com hash seguro (password_hash/BCrypt)
- ✅ Sessões com httpOnly cookies
- ✅ Prepared statements (proteção SQL injection)
- ✅ Validação de entrada (client + server side)
- ⚠️ **TODO**: Implementar CSRF tokens
- ⚠️ **TODO**: Confirmação de email
- ⚠️ **TODO**: Recuperação de senha

## 📊 Banco de Dados

### Tabelas Principais
- **users**: Pais, especialistas e administradores
- **children**: Perfis das crianças
- **exercises**: Biblioteca de exercícios
- **appointments**: Agendamentos de videochamadas

## 🚢 Deploy / Hospedagem

### Opções Recomendadas

1. **Shared Hosting (cPanel)**
   - Hostinger, HostGator, Locaweb
   - Suporte PHP nativo
   - Banco MySQL incluído

2. **VPS / Cloud**
   - DigitalOcean, Vultr, Linode
   - Maior controle e performance
   - Requer configuração manual

3. **PaaS (Platform as a Service)**
   - Heroku, Railway, Render
   - Deploy automático via Git
   - Fácil escalabilidade

### Checklist de Deploy
- [ ] Migrar SQLite para MySQL/MariaDB
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Ativar HTTPS (SSL/TLS)
- [ ] Configurar backups automáticos
- [ ] Implementar rate limiting
- [ ] Adicionar monitoring (logs, erros)
- [ ] Integrar Stripe (webhooks)
- [ ] Configurar SMTP para emails
- [ ] Otimizar assets (minify CSS/JS)
- [ ] Configurar CDN para static files

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Implementar recuperação de senha
- [ ] Upload de fotos de perfil
- [ ] Edição inline de registros
- [ ] Sistema de notificações push
- [ ] Filtros e busca avançada

### Médio Prazo
- [ ] Gamificação com badges e conquistas
- [ ] Analytics de progresso (gráficos)
- [ ] Chat em tempo real (pais + especialistas)
- [ ] Aplicativo PWA (Progressive Web App)
- [ ] Integração com APIs de telemedicina

### Longo Prazo
- [ ] App mobile nativo (React Native / Flutter)
- [ ] IA para recomendações personalizadas
- [ ] Integração com SUS e planos de saúde
- [ ] Marketplace de conteúdo premium
- [ ] Multi-idioma (i18n)

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