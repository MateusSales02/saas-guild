import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceTransaction } from './finance-transaction.entity';
import { FinanceOperation } from './finance-operation.entity';
import { FinanceOperationEntry } from './finance-operation-entry.entity';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinanceTransaction,
      FinanceOperation,
      FinanceOperationEntry,
      Guild,
      User,
    ]),
  ],
  providers: [FinanceService, OperationsService],
  controllers: [FinanceController, OperationsController],
  exports: [TypeOrmModule, FinanceService, OperationsService],
})
export class FinanceModule {}
