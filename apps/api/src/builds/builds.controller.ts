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
import { CreateBuildDto } from './dto/create-build.dto';
import { UpdateBuildDto } from './dto/update-build.dto';
import { FilterBuildsDto } from './dto/filter-builds.dto';

@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  findAll(@Query() filters: FilterBuildsDto) {
    return this.buildsService.findAll(filters);
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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.remove(id);
  }
}
