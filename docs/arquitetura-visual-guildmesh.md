# Arquitetura GuildMesh - Visão MLOps Style

## Diagrama de Arquitetura (Estilo Pipeline)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🟧 PROCESS DATA  │  🟪 DEVELOP     │  🟣 DEPLOY      │  🟦 MONITOR         │
└──────────────────────────────────────────────────────────────────────────────┘

                             ┌─────────────────┐
                             │  📊 Albion API  │
                             │  🎮 User Input  │
                             │  💬 Discord     │
                             └────────┬────────┘
                                      │
                                      │ Collect Data
                                      ▼
┌────────────────┐              ┌──────────┐               ┌────────────────┐
│   📝 Validate  │              │   API    │               │  🔄 Version    │
│      DTOs      │◄─────────────┤  Layer   │──────────────►│    Control     │
│                │              │ (NestJS) │               │     (Git)      │
└───────┬────────┘              └────┬─────┘               └────────────────┘
        │                            │
        │ Store Data                 │ REST APIs
        ▼                            ▼
┌─────────────────┐          ┌──────────────┐
│  🗄️ PostgreSQL  │◄─────────┤   Frontend   │
│    Database     │          │   (Vue.js)   │
│                 │          │              │
│  • Users        │          │  • Dashboard │
│  • Guilds       │          │  • Events    │
│  • Events       │          │  • Builds    │
│  • Finance      │          │  • Treasury  │
│  • Builds       │          │  • Members   │
│  • Audit Logs   │          └──────┬───────┘
└────────┬────────┘                 │
         │                           │ Component Tests
         │                           ▼
         │                    ┌──────────────┐
         │                    │   Vitest     │
         │                    │  52% Cov.    │
         │                    └──────────────┘
         │
         │ Cache Layer
         ▼
┌─────────────────┐
│   ⚡ Redis      │
│     Cache       │              ┌──────────────────┐
└─────────────────┘              │   🧪 Jest Tests  │
                                 │    158 tests     │
                                 │   76% Coverage   │
         ┌───────────────────────┴──────────────────┘
         │                                  │
         │ Run Tests                        │ Quality Gate
         ▼                                  ▼
┌─────────────────┐              ┌──────────────────┐
│  GitHub Actions │─────────────►│   SonarCloud     │
│                 │              │  Code Quality    │
│  • test.yml     │              └──────────────────┘
│  • deploy.yml   │                       │
│  • sonar.yml    │                       │ Pass/Fail
└────────┬────────┘                       │
         │                                 │
         │ Build & Containerize            │
         ▼                                 ▼
┌─────────────────┐              ┌──────────────────┐
│  🐳 Docker      │              │   📦 Artifacts   │
│    Images       │◄─────────────│   Repository     │
│                 │              └──────────────────┘
│  • API Image    │
│  • Web Image    │
│  • DB Image     │
│  • Redis Image  │
└────────┬────────┘
         │
         │ Deploy to Production
         ▼
┌─────────────────────────────────────────┐
│      🚀 Production Environment          │
│   guildmesh.duckdns.org                 │
│                                         │
│   ┌─────────┐  ┌─────────┐            │
│   │  Nginx  │  │   API   │            │
│   │  Proxy  │◄─┤ NestJS  │            │
│   └────┬────┘  └────┬────┘            │
│        │            │                  │
│        │            ▼                  │
│        │       ┌─────────┐            │
│        │       │   DB    │            │
│        │       │  Redis  │            │
│        │       └─────────┘            │
└────────┼────────────┬──────────────────┘
         │            │
         │            │ Collect Metrics
         ▼            ▼
┌─────────────────────────────┐
│   📊 Prometheus             │
│   Metrics Collection        │
│                             │
│  • API Response Time        │
│  • Request Count            │
│  • Error Rate               │
│  • Database Queries         │
│  • Cache Hit Rate           │
└──────────┬──────────────────┘
           │
           │ Visualize
           ▼
┌─────────────────────────────┐         ┌──────────────┐
│   📈 Grafana Dashboards     │────────►│  🚨 Alerts   │
│                             │         │   Manager    │
│  • System Health            │         └──────────────┘
│  • Performance Metrics      │
│  • User Activity            │
│  • Error Tracking           │
└─────────────────────────────┘
           │
           │ Audit Trail
           ▼
┌─────────────────────────────┐
│   📝 Audit Service          │
│                             │
│  • User Actions             │
│  • Data Changes             │
│  • Security Events          │
│  • API Calls                │
└──────────┬──────────────────┘
           │
           │ Feedback Loop
           │
           └──────────────────────────────────┐
                                              │
                    ┌─────────────────────────┘
                    ▼
           ┌────────────────┐
           │  🔄 Continuous │
           │   Improvement  │
           │                │
           │  • Performance │
           │  • Security    │
           │  • Features    │
           └────────────────┘
```

## Mapeamento: MLOps → GuildMesh

| Componente MLOps | Componente GuildMesh | Descrição |
|------------------|----------------------|-----------|
| **Process Data** | **Data Collection & Processing** | Coleta de dados do Albion API, Discord, usuários |
| **Online Feature Store** | **PostgreSQL Database** | Armazenamento principal de dados |
| **Offline Feature Store** | **Redis Cache** | Cache para performance |
| **Train, Tune, Evaluate** | **Develop & Test** | Desenvolvimento de features com testes (Jest/Vitest) |
| **Model Drift / Active Learning** | **Code Quality & Security** | SonarCloud, testes automatizados |
| **Deploy** | **CI/CD Pipeline** | GitHub Actions → Docker → Production |
| **Application** | **Web Application** | Vue.js frontend + NestJS backend |
| **Monitor** | **Prometheus + Grafana** | Monitoramento de métricas e logs |
| **Alarm Manager** | **Alert System** | Sistema de alertas e notificações |
| **Model Registry** | **Docker Registry** | Armazenamento de imagens Docker |
| **Scheduler** | **Cron Jobs** | NestJS Schedule para tarefas agendadas |
| **Lineage Tracker** | **Git History + Audit Logs** | Rastreamento de mudanças e ações |

## Principais Diferenças

### Arquitetura MLOps (Original)
- Focada em **Machine Learning** e **modelos preditivos**
- **Feature stores** para dados de treinamento
- **Model training** e **evaluation** contínuos
- **Model drift detection**
- **Batch inference** e **real-time inference**

### Arquitetura GuildMesh (Adaptada)
- Focada em **gestão de dados** e **regras de negócio**
- **Database relacional** com cache
- **Desenvolvimento de features** tradicionais
- **Testes automatizados** e quality gates
- **API REST** para comunicação

## Feedback Loops no GuildMesh

1. **Performance Loop**
   - Grafana → Developers
   - Métricas de performance → Otimizações

2. **Quality Loop**
   - SonarCloud → GitHub Actions → Developers
   - Code smells → Refactoring

3. **User Feedback Loop**
   - Audit Logs → Product Decisions
   - User actions → Feature improvements

4. **Security Loop**
   - Audit Service → Security Team
   - Suspicious activities → Security patches

## Fluxo de Deploy

```
Code Change → Git Push → GitHub Actions → Tests → Build → Docker → Production → Monitor
      ↑                                                                           │
      └───────────────────── Feedback from Monitoring ─────────────────────────┘
```

## Ambiente de Produção

**URL**: http://guildmesh.duckdns.org

**Containers**:
- `nginx-web`: Web server (porta 80)
- `guildmesh-api`: Backend NestJS (porta 3000)
- `postgres-db`: PostgreSQL 15 (porta 5432)
- `redis-cache`: Redis 7 (porta 6379)
- `prometheus`: Métricas (porta 9090)
- `grafana`: Dashboards (porta 3001)

## Serviços de Background

- **Email Service**: Envio de emails (recuperação de senha, notificações)
- **Export Service**: Geração de relatórios (CSV/PDF)
- **Albion Integration**: Sincronização com API do Albion Online
- **Discord Integration**: Webhooks para notificações
- **Audit Service**: Log de todas as ações críticas
- **Cache Invalidation**: Limpeza automática de cache
