import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
