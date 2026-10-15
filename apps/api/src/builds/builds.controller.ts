import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { BuildsService } from './builds.service';
import { CreateBuildDto } from './dto/create-build.dto';
import { UpdateBuildDto } from './dto/update-build.dto';
import { FilterBuildsDto } from './dto/filter-builds.dto';

@ApiTags('builds')
@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  findAll(@Query() filters: FilterBuildsDto) {
    return this.buildsService.findAll(filters);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.buildsService.findDeleted();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('votes/mine')
  myVotes(@CurrentUser() user: JwtPayload) {
    return this.buildsService.votedBuildIds(user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/vote')
  vote(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.buildsService.toggleVote(id, user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBuildDto) {
    return this.buildsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBuildDto) {
    return this.buildsService.update(id, dto);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.remove(id);
  }

  @Delete(':id/hard')
  hardRemove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.hardRemove(id);
  }
}
