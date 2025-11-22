import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://54.161.67.120', // frontend em produção (porta 80)
    ],
    credentials: true,
  });
}
bootstrap();