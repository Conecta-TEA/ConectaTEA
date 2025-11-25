# 🎭 Modo Demonstração - ConectaTEA

## 📋 O que é o Modo Demo?

O **Modo Demonstração** permite apresentar todas as funcionalidades do painel de especialistas **sem precisar de backend rodando**. Ideal para:

- ✅ Demonstrações para clientes/stakeholders
- ✅ Testes de interface sem configurar servidor
- ✅ Desenvolvimento frontend isolado
- ✅ Apresentações e protótipos

---

## 🎯 Como Funciona

### No Login
- Um **popup elegante** aparece 500ms após carregar a página
- O usuário clica em "Entrar na Plataforma"
- É criado um usuário demo fictício no localStorage
- Redireciona automaticamente para o dashboard

### No Dashboard
- Todos os dados são carregados de um objeto `DADOS_DEMO`
- Inclui 3 pacientes, 2 reuniões, 2 prontuários e 1 mensagem
- Todas as ações de formulário mostram mensagens de sucesso
- Socket.IO é desabilitado automaticamente
- Google Meet funciona normalmente (abre nova reunião)

---

## 🔧 Como Ativar/Desativar

### ✅ Para ATIVAR o Modo Demo (Atual)

**1. No arquivo `login.html`:**
```javascript
// Linha ~150
const MODO_DEMO = true; // ✅ MODO DEMO ATIVO
```

**2. No arquivo `especialista-painel.js`:**
```javascript
// Linha ~3
const MODO_DEMO = true; // ✅ MODO DEMO ATIVO
```

### ❌ Para DESATIVAR o Modo Demo (Conectar ao Backend)

**1. No arquivo `login.html`:**
```javascript
// Linha ~150
const MODO_DEMO = false; // ❌ MODO DEMO DESATIVADO
```

**2. No arquivo `especialista-painel.js`:**
```javascript
// Linha ~3
const MODO_DEMO = false; // ❌ MODO DEMO DESATIVADO
```

**3. No arquivo `login.html`, descomentar o script de autenticação:**
```html
<!-- Linha ~190 -->
<script src="auth.js"></script> <!-- ✅ Descomenta esta linha -->
```

**4. Certifique-se que o backend está rodando:**
```bash
cd backend-nodejs-backup
npm start
```

---

## 📦 Dados Demo Disponíveis

### 👥 Pacientes (3)
1. **Maria Silva** - 8 anos - maria.silva@email.com
2. **João Santos** - 10 anos - joao.santos@email.com  
3. **Ana Costa** - 6 anos - ana.costa@email.com

### 📅 Reuniões (2)
1. **Consulta de Avaliação** - Daqui 2 horas - com João Santos
2. **Avaliação Mensal** - Amanhã 14:00 - com Ana Costa

### 📋 Prontuários (2)
1. **Avaliação Inicial** - Paciente: Maria Silva - Tipo: avaliacao
2. **Evolução - Sessão 5** - Paciente: Maria Silva - Tipo: evolucao

### 💬 Mensagens (1)
1. Mensagem não lida de **João Santos** - "Olá, podemos remarcar?"

---

## 🎨 O que Funciona no Modo Demo

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| **Login com popup** | ✅ | Redireciona automaticamente |
| **Dashboard com estatísticas** | ✅ | Mostra contadores dos dados demo |
| **Lista de pacientes** | ✅ | 3 pacientes com detalhes |
| **Lista de reuniões** | ✅ | 2 reuniões agendadas |
| **Google Meet** | ✅ | Abre nova reunião no Google |
| **Chat/Mensagens** | ✅ | 1 conversa com mensagem |
| **Prontuários** | ✅ | 2 registros médicos |
| **Formulário vincular** | ✅ | Mostra mensagem de sucesso |
| **Formulário reunião** | ✅ | Mostra mensagem de sucesso |
| **Formulário prontuário** | ✅ | Mostra mensagem de sucesso |
| **Cancelar reunião** | ✅ | Mostra mensagem de sucesso |
| **Enviar mensagem** | ✅ | Mostra mensagem de sucesso |
| **Socket.IO** | 🚫 | Desabilitado automaticamente |
| **API fetch** | 🚫 | Não faz requisições HTTP |

---

## 🔍 Console Logs do Modo Demo

Quando ativo, o console mostrará:
```
Modo Demo: Socket.IO desabilitado
Dashboard carregado em modo demo
Pacientes carregados em modo demo
Reuniões carregadas em modo demo
Chat carregado em modo demo
Pacientes (select) carregados em modo demo
Prontuários carregados em modo demo
Conversa carregada em modo demo
Mensagem enviada em modo demo
```

---

## 🚀 Fluxo Completo

### Modo Demo Ativo:
```
1. Abrir login.html
2. Popup aparece automaticamente
3. Clicar "Entrar na Plataforma"
4. Redireciona para especialista-dashboard.html
5. Dashboard carrega dados fake
6. Todas as funcionalidades visuais funcionam
7. Formulários mostram sucesso sem salvar
```

### Modo Demo Desativo:
```
1. Abrir login.html
2. Preencher email e senha
3. Clicar "Entrar"
4. auth.js valida credenciais no backend
5. Recebe token JWT real
6. Dashboard carrega dados reais da API
7. Todas as ações salvam no banco de dados
```

---

## 💡 Dicas

### Para Desenvolvedores
- Use `MODO_DEMO = true` para trabalhar no frontend sem backend
- Os dados demo estão em `DADOS_DEMO` no arquivo `especialista-painel.js`
- Pode adicionar mais dados demo conforme necessário
- Mantenha a estrutura igual à resposta da API real

### Para Apresentações
- O modo demo é ideal para demos ao vivo
- Não precisa configurar nada, funciona instantaneamente
- Todas as telas são navegáveis
- Dados realistas para demonstração

### Para Testes
- Use modo demo para testar responsividade
- Validar design sem dados reais
- Testar fluxos de usuário
- Performance do frontend isolado

---

## ⚠️ Avisos Importantes

1. **LocalStorage**: Mesmo em modo demo, o usuário fake é salvo no localStorage
2. **Popup**: Aparece 500ms após carregar login.html quando MODO_DEMO = true
3. **Formulários**: Não salvam dados, apenas mostram mensagem de sucesso
4. **Socket.IO**: Completamente desabilitado para evitar erros de conexão
5. **Google Meet**: Sempre abre nova reunião (https://meet.google.com/new)

---

## 🎯 Checklist de Ativação

### Para Demo:
- [x] `MODO_DEMO = true` em login.html
- [x] `MODO_DEMO = true` em especialista-painel.js
- [x] Script auth.js comentado
- [x] Backend pode estar desligado

### Para Produção:
- [ ] `MODO_DEMO = false` em login.html
- [ ] `MODO_DEMO = false` em especialista-painel.js
- [ ] Script auth.js descomentado
- [ ] Backend Node.js rodando
- [ ] Banco de dados configurado

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique se ambos `MODO_DEMO` estão com o mesmo valor
2. Limpe o localStorage: `localStorage.clear()` no console
3. Recarregue a página (Ctrl+Shift+R)
4. Verifique o console para logs do modo demo

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0.0
