# Casos de Uso - Sistema SaaS Guild

## Atores

### 1. Jogador (Player)
Usuário básico do sistema que pode visualizar informações e gerenciar seus próprios dados.

### 2. Oficial (Officer)
Usuário com permissões intermediárias, herda todas as permissões do Jogador e tem acesso a relatórios e exportações.

### 3. Líder da Guilda (Leader)
Usuário com permissões completas, herda todas as permissões do Oficial e pode criar/editar/remover recursos da guilda.

### 4. Sistema Externo (Albion/Discord)
Sistemas externos que se integram com a aplicação (Albion Online API e Discord).

---

## Casos de Uso por Módulo

### 📝 Autenticação

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC01 - Registrar usuário** | Jogador | Permite que novos usuários se cadastrem no sistema |
| **UC02 - Fazer login** | Jogador | Autenticação de usuários no sistema |
| **UC03 - Criar jogador** | Líder | Líder pode criar contas de jogador (simplificado ou completo) |
| **UC04 - Consultar perfil** | Jogador | Visualizar dados do próprio perfil |

### 🏰 Gerenciamento de Guildas

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC05 - Visualizar guildas** | Jogador | Listar todas as guildas disponíveis |
| **UC06 - Consultar guilda** | Jogador | Ver detalhes de uma guilda específica |
| **UC07 - Listar minhas guildas** | Jogador | Ver guildas das quais o usuário é membro |
| **UC08 - Criar guilda** | Líder | Criar nova guilda |
| **UC09 - Atualizar guilda** | Líder | Modificar informações da guilda |
| **UC10 - Remover guilda** | Líder | Excluir uma guilda |

### 👥 Gerenciamento de Membros

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC11 - Listar membros** | Jogador | Ver lista de membros da guilda |
| **UC12 - Consultar membro** | Jogador | Ver detalhes de um membro específico |
| **UC13 - Adicionar membro** | Líder | Adicionar novo membro à guilda |
| **UC14 - Atualizar membro** | Líder | Modificar informações/permissões de membro |
| **UC15 - Remover membro** | Líder | Remover membro da guilda |

### 📅 Gerenciamento de Eventos

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC16 - Listar eventos** | Jogador | Ver lista de eventos da guilda |
| **UC17 - Consultar evento** | Jogador | Ver detalhes de um evento |
| **UC18 - Criar evento** | Líder | Criar novo evento (raid, PvP, etc.) |
| **UC19 - Atualizar evento** | Líder | Modificar informações do evento |
| **UC20 - Remover evento** | Líder | Excluir evento |
| **UC21 - Gerenciar participantes** | Líder | Adicionar/remover/atualizar participantes |
| **UC22 - Atualizar status participante** | Jogador | Confirmar/recusar presença em evento |

### 💰 Gerenciamento Financeiro

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC23 - Criar transação** | Jogador | Registrar receita ou despesa |
| **UC24 - Listar transações** | Jogador | Ver histórico de transações |
| **UC25 - Consultar resumo financeiro** | Jogador | Ver balanço e estatísticas financeiras |
| **UC26 - Remover transação** | Jogador | Excluir transação registrada |

### ⚔️ Gerenciamento de Builds

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC27 - Listar builds** | Jogador | Ver lista de builds disponíveis |
| **UC28 - Consultar build** | Jogador | Ver detalhes de uma build específica |
| **UC29 - Criar build** | Jogador | Criar nova configuração de build |
| **UC30 - Atualizar build** | Jogador | Modificar build existente |
| **UC31 - Remover build** | Jogador | Excluir build |
| **UC32 - Gerenciar classes** | Líder | CRUD de classes de personagem |
| **UC33 - Gerenciar especializações** | Líder | CRUD de especializações |
| **UC34 - Gerenciar itens** | Líder | CRUD de itens/equipamentos |

### 📊 Relatórios e Estatísticas

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC35 - Gerar relatório completo** | Líder, Oficial | Relatório geral com eventos, finanças e membros |
| **UC36 - Estatísticas de eventos** | Líder, Oficial | Estatísticas de participação em eventos |
| **UC37 - Estatísticas financeiras** | Líder, Oficial | Balanço e análise financeira |
| **UC38 - Estatísticas de membros** | Líder, Oficial | Estatísticas sobre membros ativos |

### 📥 Exportação de Dados

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC39 - Exportar membros (CSV)** | Líder, Oficial | Exportar lista de membros em CSV |
| **UC40 - Exportar eventos (CSV)** | Líder, Oficial | Exportar eventos em CSV |
| **UC41 - Exportar finanças (CSV)** | Líder, Oficial | Exportar transações em CSV |
| **UC42 - Exportar relatório completo (CSV)** | Líder, Oficial | Exportar relatório completo em CSV |

### 🔌 Integrações Externas

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC43 - Consultar status Albion** | Jogador, Sistema Externo | Ver status do servidor Albion Online |
| **UC44 - Atualizar dados Albion** | Jogador | Forçar atualização dos dados do Albion |
| **UC45 - Enviar notificação Discord** | Jogador, Sistema Externo | Enviar mensagem para canal Discord |
| **UC46 - Consultar última notificação** | Jogador | Ver última notificação enviada |

### 🔍 Auditoria

| Caso de Uso | Atores | Descrição |
|-------------|--------|-----------|
| **UC47 - Listar logs de auditoria** | Líder | Ver todos os logs de ações do sistema |
| **UC48 - Consultar logs por usuário** | Líder | Ver histórico de ações de um usuário |
| **UC49 - Consultar logs por entidade** | Líder | Ver histórico de modificações em uma entidade |

---

## Hierarquia de Permissões

```
Líder (Leader)
  └─ Todas as permissões do Oficial
  └─ Criar/editar/remover guildas
  └─ Gerenciar membros
  └─ Criar jogadores
  └─ Gerenciar classes/specs/itens
  └─ Acessar logs de auditoria

Oficial (Officer)
  └─ Todas as permissões do Jogador
  └─ Gerar relatórios
  └─ Exportar dados

Jogador (Player)
  └─ Visualizar dados públicos
  └─ Gerenciar próprias builds
  └─ Registrar transações financeiras
  └─ Participar de eventos
```

---

## Endpoints da API

### Autenticação (`/auth`)
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login
- `POST /auth/players` - Criar jogador (completo)
- `POST /auth/create-player` - Criar jogador (simplificado)
- `GET /auth/me` - Perfil autenticado

### Guildas (`/guilds`)
- `GET /guilds` - Listar todas
- `GET /guilds/my` - Minhas guildas
- `GET /guilds/:id` - Detalhes
- `POST /guilds` - Criar
- `PUT /guilds/:id` - Atualizar
- `DELETE /guilds/:id` - Remover

### Membros (`/guild-members`)
- `GET /guild-members?guildId=X` - Listar
- `GET /guild-members/:id` - Detalhes
- `POST /guild-members` - Adicionar
- `PUT /guild-members/:id` - Atualizar
- `DELETE /guild-members/:id` - Remover

### Eventos (`/events`)
- `GET /events?guildId=X` - Listar
- `GET /events/:id` - Detalhes
- `POST /events` - Criar
- `PATCH /events/:id` - Atualizar
- `DELETE /events/:id` - Remover
- `PATCH /events/:eventId/participants/:memberId/status` - Atualizar status

### Participantes (`/events/:eventId/participants`)
- `GET /events/:eventId/participants` - Listar
- `POST /events/:eventId/participants` - Adicionar
- `PATCH /events/:eventId/participants/:memberId` - Atualizar
- `DELETE /events/:eventId/participants/:userId` - Remover

### Finanças (`/finance-transactions`)
- `GET /finance-transactions?guildId=X` - Listar
- `GET /finance-transactions/summary?guildId=X` - Resumo
- `POST /finance-transactions` - Criar
- `DELETE /finance-transactions/:id` - Remover

### Builds (`/builds`, `/build-classes`, `/build-specs`, `/build-items`)
- `GET /builds` - Listar builds
- `GET /builds/:id` - Detalhes
- `POST /builds` - Criar
- `PUT /builds/:id` - Atualizar
- `DELETE /builds/:id` - Remover
- `GET /build-classes` - Listar classes
- `POST /build-classes` - Criar classe
- Similar para specs e items

### Relatórios (`/reports`)
- `GET /reports?guildId=X` - Relatório completo
- `GET /reports/events?guildId=X` - Estatísticas de eventos
- `GET /reports/finance?guildId=X` - Estatísticas financeiras
- `GET /reports/members?guildId=X` - Estatísticas de membros

### Exportação (`/export`)
- `GET /export/members?guildId=X` - Exportar membros
- `GET /export/events?guildId=X` - Exportar eventos
- `GET /export/finance?guildId=X` - Exportar finanças
- `GET /export/full?guildId=X` - Exportar relatório completo

### Integrações (`/integrations`)
- `GET /integrations/albion` - Status Albion
- `POST /integrations/albion/refresh` - Atualizar Albion
- `POST /integrations/notify` - Notificar Discord
- `GET /integrations/notify/last` - Última notificação

### Auditoria (`/audit`)
- `GET /audit` - Listar logs (com filtros)
- `GET /audit/user?userId=X` - Logs por usuário
- `GET /audit/entity?entityType=X&entityId=Y` - Logs por entidade
