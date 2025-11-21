import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: ['http://localhost:5173', 'http://54.161.67.120'],
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
