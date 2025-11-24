import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GuildsModule } from './guilds/guilds.module';
import { GuildMembersModule } from './guilds/guild-members.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { BuildsModule } from './builds/builds.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ReportsModule } from './reports/reports.module';
import { ExportModule } from './export/export.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'saas_user',
      password: process.env.DB_PASSWORD || 'saas_pass',
      database: process.env.DB_DATABASE || 'saas_guild',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ScheduleModule.forRoot(),
    UsersModule,
    GuildsModule,
    GuildMembersModule,
    EventsModule,
    FinanceModule,
    BuildsModule,
    AuthModule,
    IntegrationsModule,
    ReportsModule,
    ExportModule,
    AuditModule,
  ],
})
export class AppModule {}
