# 🛡️ SaaS para Gerenciamento de Clãs em MMORPGs

Plataforma web desenvolvida como Trabalho de Conclusão de Curso (TCC) para o curso de Engenharia de Software. O projeto propõe uma solução SaaS (Software como Serviço) escalável, segura e moderna para a **gestão de clãs em jogos online**, com foco inicial no **Albion Online**.

## 📌 Objetivo

Oferecer uma solução centralizada que permita a líderes e membros de clãs organizarem eventos, gerirem finanças, builds (equipamentos e habilidades), distribuírem recompensas e se comunicarem com eficiência — eliminando a dependência de planilhas e mensagens soltas.

---

## ✨ Funcionalidades Principais

- 👥 **Gestão de Membros:** Cadastro, edição e controle de cargos e permissões.
- 📅 **Eventos:** Agendamento, confirmação de presença e recorrência.
- 💰 **Controle Financeiro:** Registro de entradas/saídas e auditoria completa.
- 🧠 **Gerenciamento de Builds:** Armazenamento de builds.
- 📊 **Dashboard Dinâmico:** Informações personalizadas.
- 🔗 **Integrações com APIs:** Albion Online (economia) e Discord (notificações).
- 📤 **Exportação de Dados:** Histórico financeiro, membros e eventos em CSV/PDF.

---

## ⚙️ Stack Tecnológica

### 🔧 Backend

- [NestJS](https://nestjs.com/) (TypeScript)
- Express.js
- PostgreSQL (banco relacional)
- Redis (cache)
- Firebase Auth / Auth0 (autenticação)
- Axios (HTTP client)

### 🖥️ Frontend

- [Vue.js](https://vuejs.org/)
- Tailwind CSS

### 🧱 DevOps e Infra

- Docker
- GitHub Actions (CI/CD)
- Prometheus + Grafana (monitoramento)
- GitHub Projects / Azure DevOps (Kanban)

---

## 🧠 Arquitetura

O projeto adota **Arquitetura de Microserviços**, com documentação em **modelagem C4** (Contexto, Contêineres, Componentes e Código). Padrões utilizados:

- **MVC** (no frontend)
- **Event-Driven Architecture**
- **Repository Pattern**
- Comunicação via RESTful APIs

---

## 🔐 Requisitos Não Funcionais

- 🔒 Autenticação via OAuth2/JWT e criptografia AES-256
- ⚙️ Alta disponibilidade (>99.5%) e escalabilidade
- 📱 Responsivo (desktop e mobile)
- 🧾 Logs de auditoria e backups automáticos
- 🌍 Suporte a múltiplos idiomas
- 🚀 Operações críticas < 300ms

---

## 🚧 Limitações da Primeira Versão (MVP)

- Compatível apenas com **Albion Online**
- Integração inicial apenas com APIs do Albion e Discord
- Sem app mobile nativo (interface responsiva)
- Permissões baseadas em níveis hierárquicos no clã

---

## 📈 Próximos Passos

- Refinamento da arquitetura
- Testes automatizados e validação com usuários reais
- Expansão para outros MMORPGs
- Suporte a mais integrações externas (APIs de outros jogos)
- Lançamento de app mobile futuramente

---

## 📚 Referências

- Fowler, M. *Patterns of Enterprise Application Architecture*
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Node.js Docs](https://nodejs.org/en/docs/)
- [Vue.js Guide](https://vuejs.org/guide/)
- [Discord API](https://discord.com/developers/docs)
- [Albion Online API](https://www.albion-online-data.com/)
- [Express.js](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 👨‍🎓 Sobre o Autor

**Mateus Sales de Oliveira**  
Projeto de Conclusão de Curso em Engenharia de Software  
Centro Universitário Católica de Santa Catarina  
Orientadores: Claudinei Dias, Manfred Heil Junior e Paulo Rogerio Pires Manseira
