import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import Keyv from '@keyv/redis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);

        const store = new Keyv({
          uri: `redis://${redisHost}:${redisPort}`,
          namespace: 'saas-guild',
        });

        return {
          store: () => store,
          ttl: 300000, // 5 minutos em milissegundos (cache-manager v6 usa ms)
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
