# 🛡️ SaaS para Gerenciamento de Clãs em MMORPGs

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MateusSales02_saas-guild&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=MateusSales02_saas-guild)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=MateusSales02_saas-guild&metric=coverage)](https://sonarcloud.io/summary/new_code?id=MateusSales02_saas-guild)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=MateusSales02_saas-guild&metric=bugs)](https://sonarcloud.io/summary/new_code?id=MateusSales02_saas-guild)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=MateusSales02_saas-guild&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=MateusSales02_saas-guild)

Plataforma web desenvolvida como Trabalho de Conclusão de Curso (TCC) para o curso de Engenharia de Software. O projeto propõe uma solução SaaS (Software como Serviço) escalável, segura e moderna para a **gestão de clãs em jogos online**, com foco inicial no **Albion Online**.

## 📌 Objetivo

Oferecer uma solução centralizada que permita a líderes e membros de clãs organizarem eventos, gerirem finanças, builds (equipamentos e habilidades) e membros com eficiência — eliminando a dependência de planilhas e mensagens soltas.

---

## ✨ Funcionalidades Implementadas

- 👥 **Gestão de Membros:** Cadastro, edição e controle de cargos (Líder, Oficial, Membro)
- 📅 **Eventos Recorrentes:** Agendamento, confirmação de presença (RSVP) e eventos que se repetem automaticamente (diário, semanal, mensal)
- 💰 **Controle Financeiro:** Registro de entradas/saídas, visualização de saldo, histórico diário e soft delete
- 📦 **Compras e Lucros:** Operações de flip, craft, refino, transporte e coleta com movimentos parciais (compras, gastos extras e vendas em lotes), taxa do mercado em % descontada de cada venda, lucro esperado × realizado, ROI, taxa de acerto, gráfico mensal, integração opcional com a tesouraria e exportação CSV
- 🧠 **Gerenciamento de Builds:** Armazenamento e compartilhamento de builds de personagens com 309+ itens do Albion Online
- 📊 **Dashboard Dinâmico:** Visão geral com KPIs e gráficos em tempo real
- 📤 **Exportação de Dados:** Histórico financeiro, membros e eventos em CSV e PDF
- 🔐 **Autenticação Segura:** Sistema próprio com JWT e recuperação de senha por email
- 📋 **Logs de Auditoria:** Rastreamento de ações críticas no sistema
- 💹 **Integração com Market API:** Preços e valores em tempo real dos itens do Albion Online
- 🎮 **Catálogo Completo de Itens:** Base de dados com todos os equipamentos, armas e recursos do jogo
- ⚡ **Cache Redis:** Sistema de cache para melhor performance
- 🛡️ **Rate Limiting:** Proteção contra abuso de APIs com throttling

---

## ⚙️ Stack Tecnológica

### 🔧 Backend

- [NestJS](https://nestjs.com/) (TypeScript)
- PostgreSQL (banco relacional com TypeORM)
- Redis (cache com @keyv/redis)
- Jest (testes unitários - **76% de cobertura**, 158 testes)
- JWT (autenticação)
- Nodemailer (envio de emails)
- Class-validator (validação de DTOs)
- @nestjs/schedule (tarefas agendadas - cron jobs)
- @nestjs/throttler (rate limiting)
- Prometheus (métricas e monitoramento)

### 🖥️ Frontend

- [Vue.js 3](https://vuejs.org/) (Composition API)
- [Tailwind CSS](https://tailwindcss.com/)
- Vue Router
- Pinia (gerenciamento de estado)
- Vitest (testes unitários - **52% de cobertura**)

### 🧱 DevOps e Infra

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- SonarCloud (análise de qualidade de código)
- Prometheus + Grafana (monitoramento)
- Nginx (servidor web)

---

## 🧠 Arquitetura

O projeto adota **Arquitetura Monolítica Modular** em monorepo, com separação clara entre frontend e backend. Padrões utilizados:

- **Repository Pattern** (acesso a dados)
- **DTOs com validação** (class-validator)
- **Guards e Decorators** (autenticação e autorização)
- **Modularização** (NestJS modules)
- Comunicação via **RESTful APIs**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) e Docker Compose
- [pnpm](https://pnpm.io/) (instalável via `npm install -g pnpm`)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# JWT
JWT_SECRET=sua-chave-secreta-muito-segura-mude-em-producao

# Grafana
GRAFANA_PASSWORD=admin123

# Discord Webhook (opcional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/seu-webhook
```

### Rodando em Desenvolvimento

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir banco de dados e Redis
docker compose up -d db redis

# 3. Rodar API (em um terminal)
pnpm api:dev

# 4. Rodar Frontend (em outro terminal)
pnpm web:dev
```

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:3000

### Rodando com Docker (Produção)

```bash
# Subir todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```

Acesse:
- Frontend: http://localhost (porta 80)
- API: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

---

## 📁 Estrutura do Projeto

```
saas-guild/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/          # Autenticação e autorização
│   │   │   ├── guilds/        # Guildas e membros
│   │   │   ├── events/        # Eventos e participantes
│   │   │   ├── finance/       # Tesouraria e operações de compra/venda (lucros)
│   │   │   ├── builds/        # Sistema de builds
│   │   │   ├── audit/         # Logs de auditoria
│   │   │   ├── export/        # Exportação de dados
│   │   │   └── integrations/  # APIs externas (Albion, Discord)
│   │   └── Dockerfile
│   │
│   └── web/                    # Frontend Vue.js
│       ├── src/
│       │   ├── pages/         # Páginas da aplicação
│       │   ├── components/    # Componentes reutilizáveis
│       │   ├── stores/        # Estado global (auth)
│       │   ├── router/        # Rotas
│       │   └── lib/           # API client
│       └── Dockerfile
│
├── monitoring/                 # Configurações Prometheus/Grafana
├── .github/workflows/          # Pipelines CI/CD
├── docker-compose.yml          # Orquestração de containers
└── package.json                # Scripts do monorepo
```

---

## 🔐 Requisitos Não Funcionais

- 🔒 **Segurança:** Autenticação via JWT, senhas com bcrypt, validação de inputs
- 📱 **Responsivo:** Interface adaptável para desktop e mobile
- 🧾 **Auditoria:** Logs de ações críticas (criação, edição, exclusão)
- 🐳 **Containerizado:** Todos os serviços em Docker para portabilidade
- 📊 **Monitorável:** Métricas com Prometheus e dashboards no Grafana

---

## 🚧 Limitações da Versão Atual (MVP)

- Compatível apenas com **Albion Online**
- Sem app mobile nativo (interface web responsiva)
- Permissões baseadas em 3 níveis hierárquicos (Líder, Oficial, Membro)
- Integrações externas em fase inicial de expansão

---

## 📈 Próximos Passos

### Funcionalidades Planejadas
- 💬 Sistema de comunicação interna (chat/mensagens)
- 🎁 Distribuição de recompensas
- 🔄 Eventos recorrentes (diário, semanal, mensal)
- 📊 Dashboard de auditoria com interface visual
- 🌍 Internacionalização (i18n)
- 🔗 Expansão das integrações com APIs do Albion Online
- 🔔 Notificações via Discord webhook

### Melhorias Técnicas
- ✅ Testes automatizados (unitários, integração, E2E)
- 📚 Documentação da API com Swagger/OpenAPI
- 🚀 Cache com Redis
- 🔒 Rate limiting e proteção contra abuso
- 📄 Paginação em listagens
- 🎯 Permissões granulares
- 📱 Aplicativo mobile nativo

### Expansão
- Suporte a outros MMORPGs (WoW, Final Fantasy XIV, etc.)
- Sistema multi-tenant (SaaS real com múltiplas organizações)
- Gamificação e sistema de conquistas

---

## 🌐 Aplicação em Produção

**URL:** http://guildmesh.duckdns.org

### 🔑 Credenciais de Teste

Para testar a aplicação, utilize as seguintes credenciais:

- **Email:** teste@gmail.com
- **Senha:** 123456

> **Nota:** Servidor de demonstração para avaliação do TCC. Pode estar offline fora do período de apresentação.

---

## 📚 Referências

- Fowler, M. _Patterns of Enterprise Application Architecture_
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue.js Guide](https://vuejs.org/guide/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Discord API](https://discord.com/developers/docs)
- [Albion Online Data API](https://www.albion-online-data.com/)

---

## 🤝 Contribuindo

Este é um projeto acadêmico de TCC, mas contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Backend:** ESLint + Prettier (configurado)
- **Frontend:** ESLint + Prettier (configurado)
- **Commits:** Conventional Commits (feat, fix, docs, etc.)

---

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso e está disponível para fins educacionais.

---

## 👨‍🎓 Sobre o Autor

**Mateus Sales de Oliveira**
Projeto de Conclusão de Curso em Engenharia de Software
Centro Universitário Católica de Santa Catarina
Orientadores: Claudinei Dias, Manfred Heil Junior e Paulo Rogerio Pires Manseira

---

<div align="center">
  <sub>Desenvolvido com ❤️ como TCC de Engenharia de Software</sub>
</div>
