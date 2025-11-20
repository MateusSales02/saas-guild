import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GuildsModule } from './guilds/guilds.module';
import { GuildMembersModule } from './guilds/guild-members.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { BuildsModule } from './builds/builds.module';
=======
import { IntegrationsModule } from './integrations/integrations.module';
>>>>>>> theirs
=======
>>>>>>> theirs
=======
import { IntegrationsModule } from './integrations/integrations.module';
>>>>>>> theirs

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'saas_user',
      password: 'saas_pass',
      database: 'saas_guild',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    // módulos da aplicação
    UsersModule,
    GuildsModule,
    GuildMembersModule,
    EventsModule,
    FinanceModule,
    BuildsModule,
    AuthModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
