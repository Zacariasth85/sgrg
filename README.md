# SGRG - Sistema de Gerenciamento de Repositórios no GitHub

![SGRG Logo](./client/public/logo.png)

**Desenvolvido por:** Zacarias Thequimo

## 📋 Sobre o Projeto

O SGRG é uma plataforma web fullstack completa para gerenciamento de repositórios do GitHub. Oferece uma interface intuitiva para visualizar, gerenciar e monitorar todos os seus repositórios em um só lugar, com funcionalidades avançadas de dashboard, estatísticas e colaboração.

## ⚙️ Stack Tecnológica

### Backend
- **Node.js** com Express.js
- **PostgreSQL** (hospedado na Render)
- **Prisma ORM** para gerenciamento de banco de dados
- **JWT** para autenticação
- **bcryptjs** para criptografia de senhas
- **nodemailer** para envio de e-mails

### Frontend
- **React.js** com Vite
- **Recharts** para gráficos e visualizações
- **Lucide React** para ícones
- **Axios** para requisições HTTP
- **React Router** para navegação

### Autenticação
- **OAuth2 do GitHub**
- **Token de Acesso Pessoal** como alternativa

## 🧩 Funcionalidades

### 1. Autenticação Segura
- Login com OAuth2 do GitHub
- Opção de login manual com username + token pessoal
- Tokens criptografados com AES-256-GCM
- JWT para sessões seguras

### 2. Gerenciamento de Repositórios
- Listagem de repositórios públicos e privados
- Busca, ordenação e filtragem avançada
- Visualização detalhada de repositórios
- Criação, edição e exclusão de repositórios
- Gerenciamento de colaboradores

### 3. Dashboard Interativo
- Estatísticas em tempo real
- Gráficos de linguagens mais usadas
- Análise de stars e forks
- Visualização de repositórios recentes

### 4. Histórico de Ações
- Registro completo de todas as atividades
- Paginação e filtragem de atividades
- Timestamps detalhados

### 5. Funcionalidades Extras
- Integração com Webhooks do GitHub
- Notificações por e-mail
- Sincronização automática de dados
- Interface responsiva

## 📦 Estrutura do Projeto

```
sgrg_platform/
├── client/                 # Frontend React
│   ├── public/
│   │   └── logo.png       # Logo da aplicação
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── pages/         # Páginas da aplicação
│   │   └── App.jsx        # Componente principal
│   ├── .env               # Variáveis de ambiente
│   └── package.json
└── server/                # Backend Node.js
    ├── prisma/
    │   └── schema.prisma  # Schema do banco de dados
    ├── routes/            # Rotas da API
    ├── controllers/       # Controladores
    ├── services/          # Serviços (GitHub, Email, Webhook)
    ├── middlewares/       # Middlewares de autenticação
    ├── utils/             # Utilitários (auth, encryption)
    ├── .env               # Variáveis de ambiente
    ├── index.js           # Servidor principal
    └── package.json
```

## 🔐 Segurança

### Criptografia de Tokens
- Tokens do GitHub são criptografados usando AES-256-GCM
- Chaves derivadas do JWT_SECRET usando scrypt
- Autenticação adicional com AAD (Additional Authenticated Data)

### Variáveis de Ambiente
Todas as informações sensíveis são armazenadas em variáveis de ambiente:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
JWT_SECRET=
DATABASE_URL=
FRONTEND_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

### Middlewares de Segurança
- **Helmet.js** para headers de segurança
- **CORS** configurado adequadamente
- **Rate limiting** implícito via Express
- **Validação de entrada** em todas as rotas

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- Conta no GitHub (para OAuth e tokens)

### 1. Clone o Repositório
```bash
git clone https://github.com/Zacariasth85/sgrg.git
cd sgrg_platform
```

### 2. Configuração do Backend
```bash
cd server
npm install
```

Configure as variáveis de ambiente no arquivo `.env`:
```env
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
JWT_SECRET=sua_chave_secreta_muito_forte
DATABASE_URL=postgresql://usuario:senha@host:porta/database
FRONTEND_URL=http://localhost:5173
```

### 3. Configuração do Banco de Dados
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Configuração do Frontend
```bash
cd ../client
npm install
```

Configure as variáveis de ambiente no arquivo `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 5. Executar em Desenvolvimento
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🌐 Deploy

### Backend (Render)
1. Conecte seu repositório ao Render
2. Configure as variáveis de ambiente
3. Use o comando de build: `npm install`
4. Use o comando de start: `npm start`

### Frontend (Vercel/Netlify)
1. Conecte seu repositório
2. Configure o diretório de build: `client/dist`
3. Configure as variáveis de ambiente
4. Deploy automático

### Banco de Dados (Render PostgreSQL)
1. Crie uma instância PostgreSQL no Render
2. Copie a URL de conexão
3. Configure a variável `DATABASE_URL`
4. Execute as migrações: `npx prisma migrate deploy`

## 📱 Uso da Aplicação

### 1. Autenticação
- Acesse a página de login
- Escolha entre OAuth2 do GitHub ou token pessoal
- Para token pessoal, gere em: https://github.com/settings/tokens

### 2. Dashboard
- Visualize estatísticas dos seus repositórios
- Analise gráficos de linguagens e atividades
- Monitore repositórios recentes

### 3. Gerenciamento de Repositórios
- Liste todos os repositórios
- Use filtros e busca para encontrar repositórios específicos
- Crie novos repositórios diretamente pela plataforma
- Gerencie colaboradores

### 4. Histórico de Atividades
- Acompanhe todas as ações realizadas
- Filtre por tipo de atividade
- Visualize timestamps detalhados

## 🔧 API Endpoints

### Autenticação
- `GET /api/auth/github` - Redirect para OAuth GitHub
- `GET /api/auth/github/callback` - Callback OAuth
- `POST /api/auth/token` - Login com token pessoal
- `GET /api/auth/me` - Informações do usuário atual

### Repositórios
- `GET /api/repositories` - Listar repositórios
- `GET /api/repositories/:owner/:repo` - Detalhes do repositório
- `POST /api/repositories` - Criar repositório
- `PATCH /api/repositories/:owner/:repo` - Atualizar repositório
- `DELETE /api/repositories/:owner/:repo` - Excluir repositório

### Usuários
- `GET /api/users/dashboard` - Estatísticas do dashboard
- `GET /api/users/activities` - Histórico de atividades
- `GET /api/users/profile` - Perfil do usuário
- `PATCH /api/users/profile` - Atualizar perfil

### Webhooks
- `POST /api/webhooks/github` - Webhook do GitHub

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Zacarias Thequimo**
- GitHub: [@zacarias-thequimo](https://github.com/Zacariasth85)
- Email: zacariasrichard85@gmail.com

## 🙏 Agradecimentos

- GitHub pela API robusta
- Comunidade React e Node.js
- Render e Vercel pelos serviços de hospedagem
- Todos os contribuidores e testadores

---

**SGRG** - Simplifique o gerenciamento dos seus repositórios GitHub! 🚀

