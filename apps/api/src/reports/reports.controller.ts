import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * RF08 - Relatório completo da guilda
   * Inclui estatísticas de eventos, finanças e membros
   */
  @UseGuards(RolesGuard)
  @Roles('leader', 'officer')
  @Get()
  async getGuildReport(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.reportsService.getGuildReport(guildId);
  }

  /**
   * Estatísticas de eventos da guilda
   */
  @UseGuards(RolesGuard)
  @Roles('leader', 'officer')
  @Get('events')
  async getEventStats(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.reportsService.getEventStats(guildId);
  }

  /**
   * Estatísticas financeiras da guilda
   */
  @UseGuards(RolesGuard)
  @Roles('leader', 'officer')
  @Get('finance')
  async getFinanceStats(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.reportsService.getFinanceStats(guildId);
  }

  /**
   * Estatísticas de membros da guilda
   */
  @UseGuards(RolesGuard)
  @Roles('leader', 'officer')
  @Get('members')
  async getMemberStats(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.reportsService.getMemberStats(guildId);
  }
}
