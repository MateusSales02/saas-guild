import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://54.161.67.120',
      'http://54.161.67.120:3000',
    ],
    credentials: true,
  });

  // 👇 ESSA É A MUDANÇA IMPORTANTE
  await app.listen(port, '0.0.0.0');
}
bootstrap();
