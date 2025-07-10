## Tarefas para a plataforma SGRG

### Fase 1: Planejamento e criação da logo/favicon
- [x] Gerar opções de logo
- [x] Selecionar logo e favicon

### Fase 2: Configuração inicial do projeto e estrutura de diretórios
- [x] Criar estrutura de diretórios (root, client, server, prisma, routes, controllers, services, middlewares, utils)
- [x] Inicializar projeto Node.js no diretório server
- [x] Inicializar projeto React no diretório client
- [x] Configurar arquivos .env para variáveis de ambiente

### Fase 3: Configuração do banco de dados PostgreSQL e Prisma ORM
- [x] Instalar Prisma CLI
- [x] Configurar Prisma para PostgreSQL
- [x] Definir schema.prisma para tabelas (User, Repository, Activity)
- [x] Gerar Prisma Client

### Fase 4: Desenvolvimento do backend Node.js/Express com autenticação
- [x] Configurar Express.js
- [x] Implementar autenticação OAuth2 do GitHub
- [x] Implementar autenticação com username + token pessoal
- [x] Gerar JWT para autenticação
- [x] Salvar credenciais de forma segura

### Fase 5: Desenvolvimento da API REST e middlewares de segurança
- [x] Criar rotas REST para interagir com dados do GitHub
- [x] Implementar middlewares de autenticação JWT
- [x] Proteger rotas da API

### Fase 6: Desenvolvimento do frontend React com Vite
- [x] Configurar React com Vite
- [x] Criar componentes básicos de UI
- [x] Integrar com a API REST do backend

### Fase 7: Implementação das funcionalidades de gerenciamento de repositórios
- [x] Listar repositórios (públicos e privados)
- [x] Implementar busca, ordenação e filtragem
- [x] Visualizar detalhes do repositório
- [x] Criar, editar e excluir repositórios
- [x] Adicionar/remover colaboradores

### Fase 8: Criação do dashboard com gráficos e estatísticas
- [x] Coletar estatísticas (total de repositórios, estrelas, linguagens)
- [x] Integrar biblioteca de gráficos (Chart.js ou Recharts)
- [x] Exibir dados no dashboard

### Fase 9: Implementação do histórico de ações e funcionalidades extras
- [x] Registrar ações do usuário na tabela activities
- [x] Exibir histórico de ações
- [x] (Opcional) Integração com Webhooks do GitHub
- [ ] (Opcional) Upload automático de README.md/assets
- [x] (Opcional) Notificações via e-mail

### Fase 10: Configuração de segurança, variáveis de ambiente e testes
- [x] Garantir que tokens não sejam armazenados em texto puro
- [x] Configurar variáveis de ambiente (.env)
- [x] Realizar testes de segurança e funcionais

### Fase 11: Preparação para deploy e documentação
- [x] Otimizar build do frontend
- [x] Preparar scripts de deploy para Render e Vercel/Netlify
- [x] Documentar API e processo de deploy

### Fase 12: Entrega final dos arquivos e instruções de deploy
- [ ] Entregar código-fonte completo
- [ ] Fornecer instruções detalhadas de deploy
- [ ] Entregar logo e favicon finalizados

