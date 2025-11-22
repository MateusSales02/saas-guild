import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: true, // libera tudo por enquanto (TCC/dev)
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  Logger.log(`API ouvindo em http://0.0.0.0:${port}`, 'Bootstrap');
}
bootstrap();
