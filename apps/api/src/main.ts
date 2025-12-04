import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AuditService } from './audit/audit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  // Habilita validação global dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // RNF06 - Interceptor global de auditoria
  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  // Configuração do Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Guild Mesh API')
    .setDescription(
      'API para gerenciamento de guildas do Albion Online\n\n' +
        'Funcionalidades:\n' +
        '- Autenticação e autorização (JWT)\n' +
        '- Gerenciamento de usuários e guildas\n' +
        '- Sistema de eventos e participantes\n' +
        '- Controle financeiro (entradas/saídas)\n' +
        '- Sistema de builds de personagens\n' +
        '- Auditoria e logs de ações\n' +
        '- Rate limiting para proteção contra abuso',
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação e registro')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('guilds', 'Gerenciamento de guildas')
    .addTag('events', 'Eventos da guilda')
    .addTag('finance', 'Controle financeiro')
    .addTag('builds', 'Builds de personagens')
    .addTag('audit', 'Logs de auditoria')
    .addTag('export', 'Exportação de dados')
    .addTag('reports', 'Relatórios e estatísticas')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido no login',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Guild Mesh API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  Logger.log('Documentação Swagger disponível em /api/docs', 'Bootstrap');

  // Configuração de CORS
  const corsOrigins = config.get<string>('CORS_ORIGINS', '');
  const origins = corsOrigins
    ? corsOrigins.split(',').map((o) => o.trim())
    : true;

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  Logger.log(`API ouvindo em http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(
    `CORS habilitado para: ${Array.isArray(origins) ? origins.join(', ') : 'todos'}`,
    'Bootstrap',
  );
  Logger.log('Sistema de auditoria ativado', 'Bootstrap');
}
bootstrap();
