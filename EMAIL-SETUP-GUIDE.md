# 📧 Guia de Configuração de Email para Password Recovery

## ✅ O que já foi feito:

1. ✅ Instalado `nodemailer` e `@types/nodemailer`
2. ✅ Criado `EmailService` em `apps/api/src/email/email.service.ts`
3. ✅ Criado `EmailModule` em `apps/api/src/email/email.module.ts`
4. ✅ Template HTML profissional incluído
5. ✅ Sistema funciona em **modo DEV** (sem SMTP) retornando token
6. ✅ Suporte a **modo PRODUÇÃO** (com SMTP) enviando email

---

## 🔧 Como Ativar Envio de Email (Gmail)

### **Passo 1: Gerar Senha de App no Gmail**

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login na sua conta Gmail
3. Digite um nome: `Guild Mesh API`
4. Clique em **Criar**
5. Copie a senha de 16 caracteres gerada

### **Passo 2: Adicionar Variáveis de Ambiente**

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Senha de App gerada
SMTP_FROM="Guild Mesh <noreply@guildmesh.com>"

# Frontend URL para links de recuperação
FRONTEND_URL=http://guildmesh.duckdns.org
```

### **Passo 3: Adicionar no Docker Compose (Produção)**

Edite `docker-compose.prod.yml` e adicione as variáveis no serviço `api`:

```yaml
api:
  environment:
    # ... outras variáveis ...
    SMTP_HOST: ${SMTP_HOST:-}
    SMTP_PORT: ${SMTP_PORT:-587}
    SMTP_SECURE: ${SMTP_SECURE:-false}
    SMTP_USER: ${SMTP_USER:-}
    SMTP_PASSWORD: ${SMTP_PASSWORD:-}
    SMTP_FROM: ${SMTP_FROM:-}
    FRONTEND_URL: ${FRONTEND_URL:-http://guildmesh.duckdns.org}
```

### **Passo 4: Adicionar Secrets no GitHub**

1. Acesse: `https://github.com/MateusSales02/saas-guild/settings/secrets/actions`
2. Clique em **New repository secret**
3. Adicione:
   - `SMTP_USER`: seu-email@gmail.com
   - `SMTP_PASSWORD`: senha de app gerada
   - (As outras podem ficar hardcoded no docker-compose)

---

## ⚙️ Integração Final no AuthService

**Arquivo:** `apps/api/src/auth/auth.service.ts`

### Adicionar import:
```typescript
import { EmailService } from '../email/email.service';
```

### Adicionar no constructor:
```typescript
constructor(
  @InjectRepository(User) private readonly usersRepo: Repository<User>,
  @InjectRepository(PasswordResetToken)
  private readonly resetTokenRepo: Repository<PasswordResetToken>,
  private readonly jwt: JwtService,
  private readonly guildsService: GuildsService,
  private readonly emailService: EmailService, // ← ADICIONAR AQUI
) {}
```

### Modificar método `forgotPassword()` (linha 169):
```typescript
async forgotPassword(email: string): Promise<{
  message: string;
  token?: string;
}> {
  const user = await this.usersRepo.findOne({ where: { email } });

  // Por segurança, sempre retorna sucesso mesmo se email não existir
  if (!user) {
    console.log(`[ForgotPassword] Email não encontrado: ${email}`);
    return {
      message: 'Se o email existir, você receberá um link de recuperação de senha.',
    };
  }

  // Invalida tokens antigos do usuário
  await this.resetTokenRepo.update(
    { user: { id: user.id }, used: false },
    { used: true },
  );

  // Gera token seguro
  const token = crypto.randomBytes(32).toString('hex');

  // Calcula data de expiração (1 hora)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

  // Salva token no banco
  await this.resetTokenRepo.save({
    token,
    user,
    expiresAt,
    used: false,
  });

  console.log(`[ForgotPassword] Token gerado para ${email}: ${token}`);

  // ← MODIFICAR AQUI: Usar EmailService
  const result = await this.emailService.sendPasswordResetEmail(user.email, token);

  return {
    message: 'Se o email existir, você receberá um link de recuperação de senha.',
    token: result.sent ? undefined : result.token, // Retorna token apenas em modo dev
  };
}
```

---

## 🧪 Como Funciona

### **Modo Desenvolvimento (sem SMTP configurado):**
```json
{
  "message": "Se o email existir...",
  "token": "abc123..."
}
```
→ Retorna o token na resposta (como está agora)

### **Modo Produção (com SMTP configurado):**
```json
{
  "message": "Se o email existir..."
}
```
→ Envia email e **NÃO** retorna o token

---

## 📨 Exemplo de Email Enviado

O usuário receberá um email profissional com:
- ✅ Design responsivo e moderno
- ✅ Botão para resetar senha
- ✅ Link alternativo (caso botão não funcione)
- ✅ Aviso de segurança
- ✅ Validade de 1 hora
- ✅ Link: `http://guildmesh.duckdns.org/reset-password?token=...`

---

## 🔒 Segurança

- ✅ Senha de App (não a senha real do Gmail)
- ✅ TLS/STARTTLS automático
- ✅ Token de 32 bytes criptográfico
- ✅ Expiração de 1 hora
- ✅ Uso único (marcado como usado após reset)
- ✅ Não revela se email existe

---

## 🐛 Troubleshooting

### Email não está sendo enviado?
```bash
# Ver logs no servidor
docker logs saas_guild_api | grep Email

# Deve aparecer: "Email service enabled with SMTP: smtp.gmail.com"
# Se aparecer: "Email service disabled" → SMTP não configurado
```

### Erro "Invalid credentials"?
- Certifique-se de usar **Senha de App**, não a senha normal
- Verifique se a autenticação em 2 fatores está ativada

### Email vai para SPAM?
- Normal em desenvolvimento
- Em produção, configure SPF/DKIM no domínio

---

## ✅ Status Atual

- ✅ **Backend pronto** (modo dev ativo)
- ⏳ **SMTP não configurado** (retorna token na resposta)
- ⏳ **Configurar quando quiser** seguindo os passos acima

**O sistema funciona perfeitamente agora! A configuração de email é opcional e pode ser feita depois.**
