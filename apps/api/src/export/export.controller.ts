import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('export')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('leader', 'officer')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * RF12 - Exporta membros da guilda para CSV
   */
  @Get('members')
  async exportMembers(
    @Query('guildId', ParseIntPipe) guildId: number,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportMembers(guildId);
    const filename = `membros-guild-${guildId}-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  /**
   * RF12 - Exporta eventos da guilda para CSV
   */
  @Get('events')
  async exportEvents(
    @Query('guildId', ParseIntPipe) guildId: number,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportEvents(guildId);
    const filename = `eventos-guild-${guildId}-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  /**
   * RF12 - Exporta transações financeiras da guilda para CSV
   */
  @Get('finance')
  async exportFinance(
    @Query('guildId', ParseIntPipe) guildId: number,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportFinance(guildId);
    const filename = `financeiro-guild-${guildId}-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  /**
   * RF12 - Exporta relatório completo da guilda para CSV
   */
  @Get('full')
  async exportFullReport(
    @Query('guildId', ParseIntPipe) guildId: number,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportFullReport(guildId);
    const filename = `relatorio-completo-guild-${guildId}-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
