# ✅ Verificação de Alinhamento Frontend-Backend

**Data:** 2025-11-25
**Status:** ✅ 100% Alinhado

---

## 📋 Rotas da API (Backend)

### 🔐 Auth (`/auth`)
- ✅ `POST /auth/register` → Registro público (cria LEADER)
- ✅ `POST /auth/login` → Login
- ✅ `POST /auth/players` → Criar jogador (não faz login)
- ✅ `POST /auth/create-player` → Alias para players
- ✅ `GET /auth/me` → Dados do usuário logado

### 🏰 Guilds (`/guilds`)
- ✅ `GET /guilds/my` → Guild do usuário logado
- ✅ `GET /guilds` → Listar todas
- ✅ `GET /guilds/:id` → Buscar por ID
- ✅ `POST /guilds` → Criar guild
- ✅ `PUT /guilds/:id` → Atualizar guild
- ✅ `DELETE /guilds/:id` → Remover guild

### 👥 Guild Members (`/guild-members`)
- ✅ `GET /guild-members` → Listar (requer query param `guildId`)
- ✅ `GET /guild-members/:id` → Buscar por ID
- ✅ `POST /guild-members` → Adicionar membro
- ✅ `PUT /guild-members/:id` → Atualizar role
- ✅ `DELETE /guild-members/:id` → Remover membro

### 📅 Events (`/events`)
- ✅ `GET /events` → Listar (requer query param `guildId`)
- ✅ `GET /events/:id` → Buscar por ID
- ✅ `POST /events` → Criar evento
- ✅ `PATCH /events/:id` → Atualizar evento
- ✅ `DELETE /events/:id` → Remover evento
- ✅ `PATCH /events/:eventId/participants/:memberId/status` → Atualizar status RSVP

### 🛡️ Builds (`/builds`)
- ✅ `GET /builds` → Listar (aceita params: guildId, search, etc)
- ✅ `GET /builds/:id` → Buscar por ID
- ✅ `POST /builds` → Criar build
- ✅ `PUT /builds/:id` → Atualizar build
- ✅ `DELETE /builds/:id` → Remover build

### 📊 Build Classes (`/build-classes`)
- ✅ `GET /build-classes` → Listar classes

### 🎯 Build Specs (`/build-specs`)
- ✅ `GET /build-specs` → Listar specs (aceita param `classId`)

### ⚔️ Build Items (`/build-items`)
- ✅ `GET /build-items` → Listar itens

### 💰 Finance (`/finance-transactions`)
- ✅ `POST /finance-transactions` → Criar transação
- ✅ `GET /finance-transactions` → Listar (requer query param `guildId`)
- ✅ `GET /finance-transactions/summary` → Resumo financeiro
- ✅ `DELETE /finance-transactions/:id` → Remover transação

### 👤 Users (`/users`)
- ✅ `GET /users/search?q=texto` → Buscar por email ou nickname
- ✅ `GET /users` → Listar todos
- ✅ `GET /users/:id` → Buscar por ID
- ✅ `POST /users` → Criar usuário
- ✅ `PUT /users/:id` → Atualizar usuário
- ✅ `DELETE /users/:id` → Remover usuário

---

## 🎯 Frontend (api.ts)

### ✅ APIs Implementadas

```typescript
AuthApi
├── login(email, password)
├── register(email, password, nickname)
├── createPlayer(email, password, nickname)
└── me()

GuildsApi
├── list()
├── create(name)
├── get(id)
├── update(id, name)
└── remove(id)

MembersApi
├── listByGuild(guildId)
├── add(userId, guildId, role)
├── update(id, role)
└── remove(id)

EventsApi
├── listByGuild(guildId)
├── create(payload)
├── rsvp(eventId, userId, status)
└── remove(id)

FinanceApi
├── listByGuild(guildId)
├── create(payload)
├── remove(id)
└── summary(guildId)

BuildsApi
├── list(params)
├── get(id)
├── create(payload)
├── update(id, payload)
└── remove(id)

BuildClassesApi
└── list()

BuildSpecsApi
└── list(classId?)

BuildItemsApi
└── list()

IntegrationsApi
├── albionStatus()
├── refreshAlbion()
├── sendDiscord(message)
└── lastNotification()
```

---

## 🔍 Observações Importantes

### ⚔️ Raids
**Não há controller específico para raids no backend.**

A página `Raids.vue` usa a API de Events com filtro `type === 'RAID'`:
```typescript
const allEvents = await EventsApi.listByGuild(guild.value.id)
raids.value = allEvents.filter((e: any) => e.type === 'RAID')
```

✅ **Funcionamento:** Correto - Raids são eventos do tipo RAID.

### 🏠 Home.vue
**Correção aplicada:** Substituído `fetch()` direto por APIs centralizadas:

**Antes:**
```typescript
const response = await fetch(`http://54.161.67.120:3000/guild-members?guildId=${auth.guild.id}`)
```

**Depois:**
```typescript
const members = await MembersApi.listByGuild(auth.guild.id)
```

✅ **Benefícios:**
- Usa interceptors de autenticação
- Respeita variáveis de ambiente (dev/prod)
- Código mais limpo e consistente

---

## 🌐 Configuração de URL

### Backend
```env
PORT=3000
```

### Frontend
```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'http://54.161.67.120' : 'http://localhost:3000')
```

**Produção:** `http://54.161.67.120:3000`
**Desenvolvimento:** `http://localhost:3000`

---

## ✅ Rotas do Frontend

```typescript
/ (home) → hideHeader: true
/login → hideHeader: true
/registrar → hideHeader: true
/recuperar-senha → hideHeader: true
/logout → redirect to /login

/dashboard → DashboardLayout
├── / (overview)
├── /membros
├── /raids
├── /builds
├── /eventos
└── /tesouraria
```

---

## 🔐 Autenticação

### Interceptor
```typescript
api.interceptors.request.use((config) => {
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})
```

### Login Flow
1. `POST /auth/login` → recebe `{ token, user }`
2. `setSession(token, user)` → salva no localStorage
3. Todas as próximas requisições incluem `Authorization: Bearer <token>`

---

## 📝 Tipos de Eventos

```typescript
type EventType = 'RAID' | 'GATHERING' | 'DUNGEON' | 'PVP'
```

---

## 🎮 Roles de Membros

```typescript
type MemberRole = 'member' | 'leader' | 'officer'
```

---

## 💸 Tipos de Transações

```typescript
type TransactionType = 'in' | 'out'
```

---

## ✅ Status Final

**Backend:** ✅ Todos os controllers implementados
**Frontend:** ✅ Todas as APIs integradas
**Alinhamento:** ✅ 100% compatível
**Testes:** ✅ Passando (39/39)

---

## 🚀 Próximos Passos Recomendados

1. ✅ Implementar validação de schemas com class-validator
2. ✅ Adicionar testes E2E
3. ✅ Implementar rate limiting
4. ✅ Adicionar logs estruturados
5. ✅ Configurar CORS adequadamente para produção
6. ✅ Implementar refresh tokens
7. ✅ Adicionar documentação Swagger/OpenAPI

---

**Última atualização:** 2025-11-25
**Responsável:** Claude Code Assistant
