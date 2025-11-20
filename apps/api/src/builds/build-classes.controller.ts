import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { BuildsService } from './builds.service';
import { CreateBuildClassDto } from './dto/create-build-class.dto';
import { UpdateBuildClassDto } from './dto/update-build-class.dto';

@Controller('build-classes')
export class BuildClassesController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  list() {
    return this.buildsService.listClasses();
  }

  @Post()
  create(@Body() dto: CreateBuildClassDto) {
    return this.buildsService.createClass(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBuildClassDto) {
    return this.buildsService.updateClass(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.removeClass(id);
  }
}
