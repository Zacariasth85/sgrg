# 🚀 Guia de Deploy - SGRG

Este guia fornece instruções detalhadas para fazer o deploy da plataforma SGRG em produção.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Conta no [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
- Repositório Git com o código da aplicação
- Aplicação OAuth do GitHub configurada

## 🗄️ 1. Deploy do Banco de Dados (Render PostgreSQL)

### 1.1 Criar Instância PostgreSQL
1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name:** `sgrg-database`
   - **Database:** `sgrg`
   - **User:** `sgrg_user`
   - **Region:** Escolha a região mais próxima
   - **PostgreSQL Version:** 15 (recomendado)
   - **Plan:** Free (para desenvolvimento) ou Starter (para produção)

### 1.2 Obter URL de Conexão
1. Após a criação, acesse a aba "Info"
2. Copie a **External Database URL**
3. Formato: `postgresql://usuario:senha@host:porta/database`

## 🖥️ 2. Deploy do Backend (Render Web Service)

### 2.1 Criar Web Service
1. No Render Dashboard, clique em "New +" → "Web Service"
2. Conecte seu repositório Git
3. Configure:
   - **Name:** `sgrg-backend`
   - **Environment:** `Node`
   - **Region:** Mesma região do banco de dados
   - **Branch:** `main` (ou sua branch principal)
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`

### 2.2 Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```env
NODE_ENV=production
DATABASE_URL=postgresql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta_muito_forte_e_aleatoria
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
GITHUB_WEBHOOK_SECRET=sua_chave_webhook_secreta
FRONTEND_URL=https://seu-frontend.vercel.app
EMAIL_FROM=noreply@seudominio.com

# Configuração SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# Ou SendGrid (alternativa)
SENDGRID_API_KEY=sua_chave_sendgrid
```

### 2.3 Deploy e Migrações
1. Clique em "Create Web Service"
2. Aguarde o build e deploy
3. Após o deploy, execute as migrações:
   - Acesse o Shell do serviço no Render
   - Execute: `npx prisma migrate deploy`

## 🌐 3. Deploy do Frontend (Vercel)

### 3.1 Preparar para Deploy
1. No diretório `client`, crie/atualize o arquivo `.env.production`:
```env
VITE_API_URL=https://sgrg-backend.onrender.com
```

### 3.2 Deploy no Vercel
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.3 Configurar Variáveis de Ambiente
Na seção "Environment Variables":
```env
VITE_API_URL=https://sgrg-backend.onrender.com
```

### 3.4 Deploy
1. Clique em "Deploy"
2. Aguarde o build e deploy
3. Anote a URL do frontend (ex: `https://sgrg.vercel.app`)

## 🔧 4. Configuração do GitHub OAuth

### 4.1 Criar Aplicação OAuth
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Configure:
   - **Application name:** SGRG - Sistema de Gerenciamento de Repositórios
   - **Homepage URL:** `https://sgrg.vercel.app`
   - **Authorization callback URL:** `https://sgrg-backend.onrender.com/api/auth/github/callback`

### 4.2 Obter Credenciais
1. Após criar, copie o **Client ID**
2. Gere um **Client Secret**
3. Atualize as variáveis de ambiente no Render com esses valores

## 🔗 5. Configuração de Webhooks (Opcional)

### 5.1 Configurar Webhook Global
1. Acesse [GitHub Webhook Settings](https://github.com/settings/hooks)
2. Clique em "Add webhook"
3. Configure:
   - **Payload URL:** `https://sgrg-backend.onrender.com/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Sua chave webhook secreta
   - **Events:** Selecione os eventos desejados (repository, push, star, fork, member)

### 5.2 Webhook por Repositório
Para webhooks específicos por repositório:
1. Acesse as configurações do repositório
2. Vá em "Webhooks" → "Add webhook"
3. Use as mesmas configurações acima

## 📧 6. Configuração de E-mail (Opcional)

### 6.1 Gmail SMTP
1. Ative a verificação em 2 etapas na sua conta Google
2. Gere uma senha de app específica
3. Use as configurações SMTP do Gmail

### 6.2 SendGrid
1. Crie uma conta no [SendGrid](https://sendgrid.com)
2. Gere uma API Key
3. Configure a variável `SENDGRID_API_KEY`

## ✅ 7. Verificação do Deploy

### 7.1 Testes Backend
1. Acesse `https://sgrg-backend.onrender.com/health`
2. Deve retornar: `{"status":"OK","message":"SGRG API is running"}`

### 7.2 Testes Frontend
1. Acesse sua URL do Vercel
2. Teste o login com GitHub OAuth
3. Verifique se o dashboard carrega corretamente

### 7.3 Testes de Integração
1. Faça login na aplicação
2. Teste criação de repositório
3. Verifique se as atividades são registradas
4. Teste webhooks (se configurados)

## 🔄 8. Atualizações e Manutenção

### 8.1 Deploy Automático
- Render e Vercel fazem deploy automático quando você faz push para a branch principal
- Certifique-se de testar em ambiente de desenvolvimento antes

### 8.2 Monitoramento
- Use os logs do Render para monitorar o backend
- Configure alertas para erros críticos
- Monitore o uso de recursos

### 8.3 Backup do Banco
- Configure backups automáticos no Render
- Teste a restauração periodicamente

## 🚨 9. Solução de Problemas

### 9.1 Problemas Comuns

**Backend não inicia:**
- Verifique as variáveis de ambiente
- Confirme se o DATABASE_URL está correto
- Verifique os logs no Render

**Frontend não conecta com backend:**
- Verifique se VITE_API_URL está correto
- Confirme se CORS está configurado no backend
- Teste a URL da API diretamente

**OAuth não funciona:**
- Verifique se as URLs de callback estão corretas
- Confirme se Client ID e Secret estão corretos
- Verifique se a aplicação OAuth está ativa

**Banco de dados não conecta:**
- Confirme se a URL de conexão está correta
- Verifique se as migrações foram executadas
- Teste a conexão diretamente

### 9.2 Logs e Debugging
```bash
# Ver logs do backend no Render
# Acesse o dashboard → seu serviço → Logs

# Executar comandos no servidor
# Acesse o dashboard → seu serviço → Shell
npx prisma migrate status
npx prisma db seed
```

## 📞 10. Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs detalhadamente
2. Consulte a documentação oficial:
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
3. Verifique as configurações de rede e CORS
4. Entre em contato com o desenvolvedor: Zacarias Thequimo

---

**Boa sorte com seu deploy! 🚀**

