import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceTransaction } from './finance-transaction.entity';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Guild } from '../guilds/guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceTransaction, Guild])],
  providers: [FinanceService],
  controllers: [FinanceController],
  exports: [TypeOrmModule, FinanceService],
})
export class FinanceModule {}
