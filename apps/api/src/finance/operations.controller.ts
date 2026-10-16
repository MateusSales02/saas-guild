import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OperationsService } from './operations.service';
import {
  CloseOperationDto,
  CreateEntryDto,
  CreateOperationDto,
  UpdateOperationDto,
} from './dto/operation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('finance')
@UseGuards(AuthGuard('jwt'))
@Controller('finance-operations')
export class OperationsController {
  constructor(private service: OperationsService) {}

  @Get()
  list(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.service.listByGuild(guildId);
  }

  @Get('summary')
  summary(@Query('guildId', ParseIntPipe) guildId: number) {
    return this.service.summary(guildId);
  }

  @Post()
  create(@Body() dto: CreateOperationDto, @CurrentUser() user?: JwtPayload) {
    return this.service.create(dto, user?.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/entries')
  addEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEntryDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.service.addEntry(id, dto, user?.sub);
  }

  @Delete(':id/entries/:entryId')
  removeEntry(
    @Param('id', ParseIntPipe) id: number,
    @Param('entryId', ParseIntPipe) entryId: number,
  ) {
    return this.service.removeEntry(id, entryId);
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseOperationDto) {
    return this.service.close(id, dto.result);
  }

  @Post(':id/reopen')
  reopen(@Param('id', ParseIntPipe) id: number) {
    return this.service.reopen(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
