# 🚀 SEU DEPLOY - Passo a Passo

## ✅ Status Atual

- [x] Código pronto e commitado no GitHub
- [x] Supabase criado
- [x] Connection string obtida
- [x] Chaves de segurança geradas
- [ ] Tabelas criadas no Supabase
- [ ] Senha de App do Gmail configurada
- [ ] Deploy na Vercel

---

## 📋 PRÓXIMOS PASSOS

### 1️⃣ Criar Tabelas no Supabase (5 min)

```bash
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: conectatea
3. No menu lateral, clique em: 🗄️ SQL Editor
4. Clique em: ➕ New query
5. Abra o arquivo: supabase-schema.sql
6. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
7. Cole no SQL Editor do Supabase
8. Clique em: ▶️ RUN (canto inferior direito)
9. ✅ Aguarde ~10 segundos
10. Deve aparecer: "Success. No rows returned"
```

**Verificar se funcionou:**
```sql
1. No SQL Editor, rode:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

2. Deve listar 8 tabelas:
   - usuarios
   - otp_codes
   - especialistas
   - especialista_pacientes
   - reunioes
   - prontuarios
   - mensagens
   - sessoes
```

---

### 2️⃣ Configurar Email Gmail (5 min)

**Para enviar OTP, você precisa de uma "Senha de App":**

```bash
1. Acesse: https://myaccount.google.com/security
2. Procure: "Verificação em duas etapas"
3. Se NÃO estiver ativa:
   - Clique em "Verificação em duas etapas"
   - Siga os passos para ativar
   - Use seu celular para confirmação
4. Depois que 2FA estiver ativo:
   - Volte em: https://myaccount.google.com/security
   - Procure: "Senhas de app" (no final da página)
   - Clique em "Senhas de app"
5. Criar senha:
   - Nome do app: ConectaTEA
   - Clique em "Criar"
6. ✅ Vai aparecer uma senha de 16 dígitos
7. COPIE essa senha (não consegue ver depois!)
8. Cole no arquivo .env.production na linha EMAIL_PASS
```

**Exemplo:**
```env
EMAIL_PASS=abcd efgh ijkl mnop
```

**⚠️ IMPORTANTE:** Remova os espaços! Deve ficar:
```env
EMAIL_PASS=abcdefghijklmnop
```

---

### 3️⃣ Deploy na Vercel (10 min)

#### A. Criar Conta Vercel
```bash
1. Acesse: https://vercel.com
2. Clique em: "Sign Up"
3. Escolha: "Continue with GitHub"
4. Autorize a Vercel acessar seu GitHub
5. ✅ Conta criada!
```

#### B. Importar Projeto
```bash
1. No dashboard da Vercel, clique: ➕ Add New...
2. Selecione: Project
3. Em "Import Git Repository":
   - Procure: ConectaTEA
   - Clique em: Import
4. Configure:
   - Project Name: conectatea (ou deixe padrão)
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
   - Install Command: (deixe vazio)
```

#### C. Adicionar Variáveis de Ambiente
```bash
1. Antes de clicar em "Deploy", role para baixo
2. Encontre: "Environment Variables"
3. Clique em: "Add"
4. Cole TODAS as variáveis do arquivo .env.production
```

**📋 COPIE E COLE (linha por linha):**

```env
NODE_ENV=production
```
```env
PORT=3000
```
```env
DATABASE_URL=postgresql://postgres:Matheus/2006**@db.hazhtlfbevprcrsqamer.supabase.co:5432/postgres
```
```env
JWT_SECRET=08e2d6041372e4fea08b87afc62778c214f4749f6c384d9f525fdbb09c46f57e
```
```env
SESSION_SECRET=0e78e6b84a9bbe8a5ad7310d700b803b4c2f7212c2919bbdb81f20ed05b7f5a2
```
```env
EMAIL_USER=matheuslucindo904@gmail.com
```
```env
EMAIL_PASS=SUA_SENHA_APP_16_DIGITOS_AQUI
```
```env
FRONTEND_URL=https://conectatea.vercel.app
```

**⚠️ ATENÇÃO:**
- Substitua `SUA_SENHA_APP_16_DIGITOS_AQUI` pela senha de app do Gmail
- Mantenha a senha do DATABASE_URL: `Matheus/2006**`

#### D. Deploy!
```bash
1. Após adicionar todas as variáveis
2. Clique em: Deploy
3. ⏱️ Aguarde 2-3 minutos
4. ✅ "Congratulations! Your project has been deployed"
5. Clique em: "Visit" ou copie a URL
```

---

## 🧪 TESTAR

### 1. Backend Health Check
```bash
Abra: https://conectatea.vercel.app/api/health

✅ Deve retornar:
{
  "status": "ok",
  "database": "connected"
}

❌ Se der erro 500:
- Vá em Vercel → Settings → Functions → View Logs
- Procure por erro de conexão
- Verifique se DATABASE_URL está correta
```

### 2. Criar Conta Especialista
```bash
1. Abra: https://conectatea.vercel.app
2. Clique em: "Criar Conta" ou "Cadastro"
3. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Telefone: seu telefone
   - Tipo de Usuário: Especialista
   - Especialidade: Psicologia
   - Outros campos
4. Clique em: "Criar Conta"
5. ✅ Deve enviar código OTP no email
6. Verifique sua caixa de entrada
7. Digite o código de 6 dígitos
8. ✅ Deve redirecionar para: /painel-especialista.html
```

### 3. Testar Dashboard
```bash
✅ Visão Geral: Ver cards de estatísticas
✅ Pacientes: Lista vazia (normal, sem pacientes ainda)
✅ Agenda: Calendário funcionando
✅ Prontuários: Lista vazia (normal)
✅ Chat: Lista vazia (normal)
✅ Perfil: Ver seus dados
```

---

## 🐛 Problemas Comuns

### ❌ Email OTP não chega
```bash
Causa: Senha de app incorreta

Solução:
1. Gere nova senha de app no Gmail
2. Vá em Vercel → Settings → Environment Variables
3. Edite EMAIL_PASS
4. Cole nova senha (sem espaços!)
5. Clique em: Save
6. Vá em Deployments → Latest → ⋮ → Redeploy
```

### ❌ Erro 500 no /api/health
```bash
Causa: Problema na conexão com Supabase

Solução:
1. Verifique DATABASE_URL no Vercel
2. Teste conexão no Supabase:
   SQL Editor → SELECT 1;
3. Se der erro, pegue nova connection string:
   Supabase → Settings → Database → Connection string
```

### ❌ Redirect não funciona
```bash
Causa: tipo_usuario não está como 'especialista'

Solução:
1. Vá no Supabase → Table Editor
2. Selecione tabela: usuarios
3. Encontre seu email
4. Verifique coluna: tipo_usuario
5. Deve estar: especialista
```

---

## 📊 Monitorar

### Ver Logs em Tempo Real
```bash
Vercel → Deployments → Latest → View Function Logs
```

### Ver Database
```bash
Supabase → Table Editor → usuarios
```

### Ver Analytics
```bash
Vercel → Analytics → Ver requests, bandwidth, etc
```

---

## ✅ CHECKLIST FINAL

- [ ] Tabelas criadas no Supabase (8 tabelas)
- [ ] Senha de App do Gmail configurada
- [ ] Variáveis de ambiente na Vercel (8 variáveis)
- [ ] Deploy realizado com sucesso
- [ ] Health check retorna "ok"
- [ ] Email OTP funciona
- [ ] Cadastro de especialista funciona
- [ ] Dashboard carrega corretamente

---

## 🎉 PRONTO!

**Seu ConectaTEA está no ar!** 🚀

```
URL: https://conectatea.vercel.app
Custo: R$ 0,00/mês
```

**Compartilhe com:**
- Famílias
- Especialistas
- Comunidade TEA

---

**Próximos passos:**
1. Cadastre pacientes de teste
2. Agende reuniões
3. Teste o Google Meet
4. Crie prontuários
5. Use o chat

**Dúvidas?**
- Veja: DEPLOY-VERCEL-GRATIS.md (guia detalhado)
- Veja: DEPLOY-15MIN.md (guia rápido)
