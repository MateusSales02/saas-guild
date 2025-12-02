import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BuildsService } from './builds.service';
import { CreateBuildSpecDto } from './dto/create-build-spec.dto';
import { UpdateBuildSpecDto } from './dto/update-build-spec.dto';

@Controller('build-specs')
export class BuildSpecsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  list(@Query('classId') classId?: string) {
    return this.buildsService.listSpecs(classId ? Number(classId) : undefined);
  }

  @Post()
  create(@Body() dto: CreateBuildSpecDto) {
    return this.buildsService.createSpec(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBuildSpecDto,
  ) {
    return this.buildsService.updateSpec(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.removeSpec(id);
  }
}
