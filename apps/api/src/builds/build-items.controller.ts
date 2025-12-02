import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BuildsService } from './builds.service';
import { CreateBuildItemDto } from './dto/create-build-item.dto';
import { UpdateBuildItemDto } from './dto/update-build-item.dto';

@Controller('build-items')
export class BuildItemsController {
  constructor(private readonly buildsService: BuildsService) {}

  // IMPORTANTE: Rotas específicas devem vir ANTES de rotas genéricas
  @Get('fresh')
  async listFresh() {
    console.log(
      '🔥 [BuildItemsController] GET /build-items/fresh called - NEW ENDPOINT',
    );
    const items = await this.buildsService.listItems();
    console.log(
      `✅✅ [BuildItemsController/fresh] Returning ${items.length} items`,
    );
    console.log(
      `📦📦 [BuildItemsController/fresh] First 5 items:`,
      items
        .slice(0, 5)
        .map((i) => ({ id: i.id, name: i.name, albion_id: i.albion_id })),
    );
    return items;
  }

  @Get()
  async list() {
    console.log('🔍 [BuildItemsController] GET /build-items called');
    const items = await this.buildsService.listItems();
    console.log(`✅ [BuildItemsController] Returning ${items.length} items`);
    console.log(
      `📦 [BuildItemsController] First 3 items:`,
      items
        .slice(0, 3)
        .map((i) => ({ id: i.id, name: i.name, albion_id: i.albion_id })),
    );
    return items;
  }

  @Post()
  create(@Body() dto: CreateBuildItemDto) {
    return this.buildsService.createItem(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBuildItemDto,
  ) {
    return this.buildsService.updateItem(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildsService.removeItem(id);
  }

  @Post('reseed')
  async reseed() {
    console.log('🔄 [BuildItemsController] POST /build-items/reseed called');
    return this.buildsService.reseedItems();
  }

  @Get('debug/file-check')
  async debugFileCheck() {
    console.log('🐛 [BuildItemsController] GET /build-items/debug/file-check called');
    return this.buildsService.debugFileCheck();
  }

  @Post('clear-all')
  async clearAll() {
    console.log('🗑️ [BuildItemsController] POST /build-items/clear-all called');
    return this.buildsService.clearAllItems();
  }
}
