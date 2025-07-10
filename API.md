# 📚 Documentação da API - SGRG

Esta documentação descreve todos os endpoints disponíveis na API REST do SGRG.

## 🔗 Base URL

```
Desenvolvimento: http://localhost:5000
Produção: https://sgrg-backend.onrender.com
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header Authorization:

```
Authorization: Bearer <seu_jwt_token>
```

## 📋 Endpoints

### 🔑 Autenticação

#### `GET /api/auth/github`
Redireciona para a página de autorização OAuth do GitHub.

**Resposta:**
- Redirecionamento para GitHub OAuth

#### `GET /api/auth/github/callback`
Callback do OAuth GitHub. Processa o código de autorização e retorna JWT.

**Query Parameters:**
- `code` (string): Código de autorização do GitHub

**Resposta:**
- Redirecionamento para frontend com token JWT

#### `POST /api/auth/token`
Autenticação usando token pessoal do GitHub.

**Body:**
```json
{
  "username": "seu-usuario-github",
  "token": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

**Resposta:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": "uuid",
    "username": "seu-usuario",
    "email": "seu@email.com"
  }
}
```

**Códigos de Status:**
- `200`: Login realizado com sucesso
- `400`: Dados inválidos
- `401`: Token ou usuário inválido

#### `POST /api/auth/logout`
Realiza logout (lado cliente).

**Resposta:**
```json
{
  "message": "Logged out successfully"
}
```

#### `GET /api/auth/me`
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "username": "seu-usuario",
    "email": "seu@email.com",
    "githubId": "12345678"
  }
}
```

### 📁 Repositórios

#### `GET /api/repositories`
Lista todos os repositórios do usuário autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (string, opcional): `all`, `public`, `private` (padrão: `all`)
- `sort` (string, opcional): `updated`, `created`, `pushed`, `full_name` (padrão: `updated`)
- `search` (string, opcional): Termo de busca

**Resposta:**
```json
[
  {
    "id": 123456789,
    "name": "meu-repositorio",
    "full_name": "usuario/meu-repositorio",
    "description": "Descrição do repositório",
    "private": false,
    "html_url": "https://github.com/usuario/meu-repositorio",
    "language": "JavaScript",
    "stargazers_count": 10,
    "forks_count": 5,
    "watchers_count": 8,
    "updated_at": "2024-01-15T10:30:00Z",
    "owner": {
      "login": "usuario",
      "id": 12345678
    }
  }
]
```

#### `GET /api/repositories/:owner/:repo`
Obtém detalhes de um repositório específico.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parâmetros:**
- `owner` (string): Nome do proprietário
- `repo` (string): Nome do repositório

**Resposta:**
```json
{
  "id": 123456789,
  "name": "meu-repositorio",
  "full_name": "usuario/meu-repositorio",
  "description": "Descrição detalhada",
  "private": false,
  "html_url": "https://github.com/usuario/meu-repositorio",
  "clone_url": "https://github.com/usuario/meu-repositorio.git",
  "language": "JavaScript",
  "stargazers_count": 10,
  "forks_count": 5,
  "watchers_count": 8,
  "size": 1024,
  "default_branch": "main",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "pushed_at": "2024-01-15T10:30:00Z"
}
```

#### `POST /api/repositories`
Cria um novo repositório.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "novo-repositorio",
  "description": "Descrição do novo repositório",
  "private": false
}
```

**Resposta:**
```json
{
  "id": 123456789,
  "name": "novo-repositorio",
  "full_name": "usuario/novo-repositorio",
  "description": "Descrição do novo repositório",
  "private": false,
  "html_url": "https://github.com/usuario/novo-repositorio"
}
```

**Códigos de Status:**
- `201`: Repositório criado com sucesso
- `400`: Dados inválidos
- `500`: Erro interno

#### `PATCH /api/repositories/:owner/:repo`
Atualiza um repositório existente.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "novo-nome",
  "description": "Nova descrição",
  "private": true
}
```

**Resposta:**
```json
{
  "id": 123456789,
  "name": "novo-nome",
  "description": "Nova descrição",
  "private": true
}
```

#### `DELETE /api/repositories/:owner/:repo`
Exclui um repositório.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "message": "Repository deleted successfully"
}
```

**Códigos de Status:**
- `200`: Repositório excluído com sucesso
- `404`: Repositório não encontrado
- `403`: Sem permissão para excluir

#### `GET /api/repositories/:owner/:repo/collaborators`
Lista colaboradores de um repositório.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
[
  {
    "login": "colaborador1",
    "id": 87654321,
    "avatar_url": "https://avatars.githubusercontent.com/u/87654321",
    "permissions": {
      "admin": false,
      "push": true,
      "pull": true
    }
  }
]
```

#### `POST /api/repositories/:owner/:repo/collaborators`
Adiciona um colaborador ao repositório.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "username": "novo-colaborador",
  "permission": "push"
}
```

**Resposta:**
```json
{
  "message": "Collaborator added successfully"
}
```

#### `DELETE /api/repositories/:owner/:repo/collaborators/:username`
Remove um colaborador do repositório.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "message": "Collaborator removed successfully"
}
```

### 👤 Usuários

#### `GET /api/users/dashboard`
Obtém estatísticas para o dashboard do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "totalRepos": 25,
  "totalStars": 150,
  "languages": {
    "JavaScript": 10,
    "Python": 8,
    "TypeScript": 5,
    "Java": 2
  },
  "repos": [
    {
      "id": 123456789,
      "name": "repositorio-exemplo",
      "description": "Descrição",
      "language": "JavaScript",
      "stargazers_count": 10,
      "forks_count": 5,
      "updated_at": "2024-01-15T10:30:00Z",
      "html_url": "https://github.com/usuario/repositorio-exemplo",
      "private": false
    }
  ]
}
```

#### `GET /api/users/activities`
Lista atividades do usuário com paginação.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number, opcional): Página atual (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)

**Resposta:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "action": "CREATE_REPOSITORY",
      "details": "Created repository: novo-projeto",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### `GET /api/users/profile`
Obtém perfil completo do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "id": "uuid",
  "username": "usuario",
  "email": "usuario@email.com",
  "githubId": "12345678",
  "repositories": [
    {
      "id": "uuid",
      "name": "repositorio",
      "description": "Descrição",
      "language": "JavaScript",
      "forks": 5,
      "stars": 10
    }
  ],
  "activities": [
    {
      "action": "CREATE_REPOSITORY",
      "details": "Created repository: projeto",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `PATCH /api/users/profile`
Atualiza perfil do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "email": "novo@email.com"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "username": "usuario",
  "email": "novo@email.com",
  "githubId": "12345678"
}
```

### 🔗 Webhooks

#### `POST /api/webhooks/github`
Endpoint para receber webhooks do GitHub.

**Headers:**
```
X-GitHub-Event: repository
X-Hub-Signature-256: sha256=...
Content-Type: application/json
```

**Body:**
Payload do webhook do GitHub (varia por evento)

**Resposta:**
```json
{
  "message": "Webhook processed successfully"
}
```

**Eventos Suportados:**
- `repository`: Criação, edição, exclusão de repositórios
- `push`: Push para repositórios
- `star`: Star/unstar de repositórios
- `fork`: Fork de repositórios
- `member`: Adição/remoção de colaboradores

### 🏥 Health Check

#### `GET /health`
Verifica se a API está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "message": "SGRG API is running"
}
```

## 📊 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

## 🔒 Segurança

### Rate Limiting
- A API implementa rate limiting implícito
- Evite fazer muitas requisições simultâneas

### CORS
- CORS configurado para permitir requisições do frontend
- Headers de segurança implementados com Helmet.js

### Validação
- Todos os inputs são validados
- Tokens são criptografados antes do armazenamento

## 📝 Exemplos de Uso

### JavaScript/Axios
```javascript
const api = axios.create({
  baseURL: 'https://sgrg-backend.onrender.com',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Listar repositórios
const repos = await api.get('/api/repositories');

// Criar repositório
const newRepo = await api.post('/api/repositories', {
  name: 'meu-novo-repo',
  description: 'Descrição do repositório',
  private: false
});
```

### cURL
```bash
# Listar repositórios
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://sgrg-backend.onrender.com/api/repositories

# Criar repositório
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"novo-repo","description":"Teste","private":false}' \
     https://sgrg-backend.onrender.com/api/repositories
```

## 🐛 Tratamento de Erros

Todos os erros retornam um objeto JSON com a seguinte estrutura:

```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Erros Comuns

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Invalid or expired token"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Something went wrong!"
}
```

---

**Documentação da API SGRG v1.0** - Desenvolvido por Zacarias Thequimo

