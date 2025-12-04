import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('finance-transactions')
export class FinanceController {
  constructor(private service: FinanceService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query('guildId') guildId: string) {
    return this.service.listByGuild(Number(guildId));
  }

  @Get('summary')
  summary(@Query('guildId') guildId: string) {
    return this.service.summary(Number(guildId));
  }

  @Get('daily-history')
  dailyHistory(
    @Query('guildId') guildId: string,
    @Query('days') days: string,
  ) {
    return this.service.dailyHistory(Number(guildId), Number(days) || 7);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
