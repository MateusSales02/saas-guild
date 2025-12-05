# Segurança da Aplicação

## Security Headers Implementados

A aplicação utiliza o [Helmet](https://helmetjs.github.io/) para adicionar headers de segurança HTTP que protegem contra vulnerabilidades comuns.

### Headers Configurados

#### 1. Content Security Policy (CSP)
Previne ataques XSS ao controlar quais recursos podem ser carregados.

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}
```

**Proteção**: Cross-Site Scripting (XSS)

#### 2. HTTP Strict Transport Security (HSTS)
Força o navegador a usar HTTPS por 1 ano.

```javascript
hsts: {
  maxAge: 31536000,        // 1 ano em segundos
  includeSubDomains: true, // Aplica a subdomínios
  preload: true,           // Elegível para HSTS preload list
}
```

**Proteção**: Man-in-the-Middle attacks, Protocol downgrade attacks

#### 3. X-Frame-Options
Previne clickjacking ao bloquear incorporação em iframes.

```javascript
frameguard: {
  action: 'deny',
}
```

**Proteção**: Clickjacking

#### 4. X-Content-Type-Options
Previne MIME sniffing.

```javascript
noSniff: true
```

**Proteção**: MIME type confusion attacks

#### 5. X-XSS-Protection
Ativa proteção XSS do navegador.

```javascript
xssFilter: true
```

**Proteção**: Reflected XSS attacks

#### 6. Referrer-Policy
Controla quanto de informação do referrer é enviado.

```javascript
referrerPolicy: {
  policy: 'strict-origin-when-cross-origin',
}
```

**Proteção**: Information disclosure

## Rate Limiting

A aplicação implementa rate limiting em múltiplos níveis usando `@nestjs/throttler`.

### Configuração Global

```javascript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,      // 1 segundo
    limit: 10,      // 10 requests/segundo
  },
  {
    name: 'medium',
    ttl: 60000,     // 60 segundos
    limit: 100,     // 100 requests/minuto
  },
  {
    name: 'long',
    ttl: 3600000,   // 1 hora
    limit: 1000,    // 1000 requests/hora
  },
])
```

### Endpoints Sensíveis (Autenticação)

Endpoints de autenticação possuem rate limiting mais rigoroso:

- **Login/Register**: 5 requests por minuto
- **Forgot Password**: 3 requests por minuto
- **Reset Password**: 5 requests por minuto

```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
login(@Body() dto: LoginDto) {
  return this.auth.login(dto);
}
```

**Proteção**: Brute force attacks, Credential stuffing, API abuse

## Validação de Dados

Toda entrada de dados é validada usando `class-validator`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Remove propriedades não decoradas
    forbidNonWhitelisted: true, // Rejeita propriedades não permitidas
    transform: true,           // Transforma tipos automaticamente
  }),
);
```

**Proteção**: Mass assignment, Injection attacks, Invalid data

## CORS

CORS configurável via variável de ambiente:

```typescript
const corsOrigins = config.get<string>('CORS_ORIGINS', '');
const origins = corsOrigins
  ? corsOrigins.split(',').map((o) => o.trim())
  : true;

app.enableCors({
  origin: origins,
  credentials: true,
});
```

**Proteção**: Cross-Origin attacks

## Auditoria

Sistema de auditoria global que registra todas as ações:

- Cria logs automáticos para operações sensíveis
- Registra usuário, ação, recurso e timestamp
- Permite rastreamento de mudanças

```typescript
app.useGlobalInterceptors(new AuditInterceptor(auditService));
```

**Endpoint de acesso**: `GET /audit` (restrito a emails autorizados)

## Configuração de Produção

### Variáveis de Ambiente Necessárias

```bash
# CORS - Lista de origens permitidas separadas por vírgula
CORS_ORIGINS=https://guildmesh.duckdns.org,http://guildmesh.duckdns.org

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=saas_user
DB_PASSWORD=strong_password_here
DB_DATABASE=saas_guild

# JWT
JWT_SECRET=your_very_strong_secret_here

# Email (para recuperação de senha)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=email_password_here
```

### Recomendações Adicionais

1. **HTTPS**: Sempre use HTTPS em produção
2. **Secrets**: Use secrets manager para credenciais sensíveis
3. **Database**: Configure SSL/TLS para conexão com PostgreSQL
4. **Logs**: Configure log aggregation (ex: ELK, CloudWatch)
5. **Monitoring**: Configure alertas para rate limiting e tentativas de autenticação
6. **Backups**: Configure backups automáticos do banco de dados
7. **Updates**: Mantenha dependências atualizadas (`npm audit fix`)

## Testando Security Headers

### Usando curl

```bash
# Verificar headers de segurança
curl -I https://sua-api.com/api/docs

# Headers esperados:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

### Ferramentas Online

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

## Vulnerabilidades Conhecidas

Execute regularmente:

```bash
npm audit
```

Para corrigir vulnerabilidades:

```bash
npm audit fix
```

## Contato de Segurança

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com os mantenedores
3. Forneça detalhes sobre a vulnerabilidade e como reproduzi-la
4. Aguarde resposta antes de divulgar publicamente

## Última Atualização

Data: 2025-12-04
Versão: 1.0.0
