import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { BuildsService } from './builds.service';
import { CreateBuildItemDto } from './dto/create-build-item.dto';
import { UpdateBuildItemDto } from './dto/update-build-item.dto';

@Controller('build-items')
export class BuildItemsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  list() {
    return this.buildsService.listItems();
  }

  @Post()
  create(@Body() dto: CreateBuildItemDto) {
    return this.buildsService.createItem(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBuildItemDto) {
    return this.buildsService.updateItem(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.removeItem(id);
  }
}
