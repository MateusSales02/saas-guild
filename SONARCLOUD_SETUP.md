# 🔧 Configuração do SonarCloud - Guia Passo a Passo

## ⚠️ Problema Atual
O workflow do GitHub Actions está falando com erro:
```
ERROR: Project not found. Please check the 'sonar.projectKey' and 'sonar.organization' properties
```

Isso acontece porque o projeto ainda não foi criado no SonarCloud.

## ✅ Solução: Criar o Projeto no SonarCloud

### Passo 1: Acessar o SonarCloud
1. Abra seu navegador
2. Acesse: https://sonarcloud.io
3. Clique em **"Log in"** (canto superior direito)
4. Escolha **"Log in with GitHub"**
5. Autorize o SonarCloud a acessar sua conta do GitHub

### Passo 2: Importar o Repositório
1. Após fazer login, clique no **"+"** (canto superior direito)
2. Selecione **"Analyze new project"**
3. Você verá uma lista dos seus repositórios do GitHub
4. **Procure por "saas-guild"** na lista
5. **Marque a caixa** ao lado do repositório `saas-guild`
6. Clique em **"Set Up"** (botão azul no canto superior direito)

### Passo 3: Configurar o Método de Análise
1. Na tela "How do you want to analyze your repository?":
   - Selecione **"With GitHub Actions"**
2. O SonarCloud vai confirmar:
   - ✅ Project Key: `MateusSales02_saas-guild`
   - ✅ Organization: `mateussales02`

### Passo 4: Gerar o Token de Autenticação
1. Na mesma tela, clique em **"Generate a token"**
2. Dê um nome ao token:
   - Sugestão: `GitHub Actions saas-guild`
3. Clique em **"Generate"**
4. **⚠️ IMPORTANTE**: Copie o token AGORA (você só verá ele uma vez!)
   - O token será algo como: `sqp_1a2b3c4d5e6f7g8h9i0j...`

### Passo 5: Adicionar o Token no GitHub
1. Abra uma nova aba e vá para:
   ```
   https://github.com/MateusSales02/saas-guild/settings/secrets/actions
   ```
2. Você já tem um secret chamado `SONAR_TOKEN`
3. Clique em **`SONAR_TOKEN`**
4. Clique em **"Update secret"**
5. Cole o token que você copiou do SonarCloud
6. Clique em **"Update secret"**

### Passo 6: Executar o Workflow Novamente
1. Vá para: https://github.com/MateusSales02/saas-guild/actions
2. Clique no workflow **"SonarCloud Analysis"** que falhou
3. Clique em **"Re-run failed jobs"** ou **"Re-run all jobs"**

## ✨ Resultado Esperado

Após seguir esses passos, o workflow do GitHub Actions deve:
- ✅ Executar os testes
- ✅ Gerar relatórios de cobertura
- ✅ Enviar os dados para o SonarCloud
- ✅ Quality Gate deve passar

Você poderá ver os resultados em:
```
https://sonarcloud.io/project/overview?id=MateusSales02_saas-guild
```

## 📋 Checklist de Verificação

- [ ] Fiz login no SonarCloud com minha conta do GitHub
- [ ] Encontrei o repositório "saas-guild" na lista
- [ ] Marquei a caixa e cliquei em "Set Up"
- [ ] Selecionei "With GitHub Actions"
- [ ] Gerei um novo token no SonarCloud
- [ ] Copiei o token (começa com `sqp_...`)
- [ ] Atualizei o secret `SONAR_TOKEN` no GitHub
- [ ] Executei novamente o workflow

## 🆘 Ainda com Problemas?

Se o erro persistir, verifique:

1. **Token correto?**
   - O token deve começar com `sqp_`
   - Deve ter sido gerado recentemente

2. **Projeto criado?**
   - Acesse: https://sonarcloud.io/organizations/mateussales02/projects
   - Você deve ver "saas-guild" na lista

3. **Organização correta?**
   - Deve ser: `mateussales02`
   - Verifique em: https://sonarcloud.io/account/organizations

## 📊 Configuração Atual

Arquivos já configurados no projeto:
- ✅ `sonar-project.properties` - Configuração do SonarCloud
- ✅ `.github/workflows/sonarcloud.yml` - Workflow do GitHub Actions
- ✅ Testes implementados (Backend: 84%, Frontend: 25%)

Só falta criar o projeto no SonarCloud e configurar o token! 🚀
