import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Build } from './build.entity';
import { CreateBuildDto } from './dto/create-build.dto';
import { UpdateBuildDto } from './dto/update-build.dto';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
import { FilterBuildsDto } from './dto/filter-builds.dto';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';
import { GuildMember } from '../guilds/guild-member.entity';
import { CreateBuildClassDto } from './dto/create-build-class.dto';
import { UpdateBuildClassDto } from './dto/update-build-class.dto';
import { CreateBuildSpecDto } from './dto/create-build-spec.dto';
import { UpdateBuildSpecDto } from './dto/update-build-spec.dto';
import { CreateBuildItemDto } from './dto/create-build-item.dto';
import { UpdateBuildItemDto } from './dto/update-build-item.dto';
import * as fs from 'fs';
import * as path from 'path';

interface AlbionItem {
  id: string;
  name: string;
  category: string;
}

// Função helper para carregar albion-items.json
function loadAlbionItems(): AlbionItem[] {
  try {
    console.log('🔍 [loadAlbionItems] Starting to load Albion items...');
    console.log('🔍 [loadAlbionItems] __dirname:', __dirname);
    console.log('🔍 [loadAlbionItems] process.cwd():', process.cwd());

    // Em produção, o arquivo está em dist/data/albion-items.json
    // Em desenvolvimento, está em src/data/albion-items.json
    const possiblePaths = [
      path.join(process.cwd(), 'dist/data/albion-items.json'), // Produção primária
      path.join(__dirname, '../data/albion-items.json'), // Produção (dist/builds -> dist/data)
      path.join(__dirname, '../../data/albion-items.json'), // Produção alternativa 1
      path.join(__dirname, 'data/albion-items.json'), // Produção alternativa 2
      path.join(process.cwd(), 'src/data/albion-items.json'), // Desenvolvimento
    ];

    console.log('🔍 [loadAlbionItems] Checking possible paths:');
    for (const filePath of possiblePaths) {
      console.log(`   🔎 Checking: ${filePath}`);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Found albion-items.json at: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(fileContent) as AlbionItem[];
        console.log(`✅ Loaded ${items.length} items from albion-items.json`);
        return items;
      } else {
        console.log(`   ❌ Not found at: ${filePath}`);
      }
    }

    console.error(
      '❌ albion-items.json not found in any of the expected paths:',
    );
    possiblePaths.forEach((p) => console.error(`   - ${p}`));
    return [];
  } catch (error) {
    console.error('❌ Error loading albion-items.json:', error);
    return [];
  }
}

@Injectable()
export class BuildsService {
  constructor(
    @InjectRepository(Build)
    private readonly buildRepo: Repository<Build>,
    @InjectRepository(BuildClass)
    private readonly classRepo: Repository<BuildClass>,
    @InjectRepository(BuildSpec)
    private readonly specRepo: Repository<BuildSpec>,
    @InjectRepository(BuildItem)
    private readonly itemRepo: Repository<BuildItem>,
    @InjectRepository(Guild)
    private readonly guildRepo: Repository<Guild>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(GuildMember)
    private readonly memberRepo: Repository<GuildMember>,
  ) {}

  async findAll(filters: FilterBuildsDto) {
    const qb = this.buildRepo
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.class', 'class')
      .leftJoinAndSelect('build.spec', 'spec')
      .leftJoinAndSelect('build.items', 'items')
      .leftJoinAndSelect('build.guild', 'guild')
      .leftJoinAndSelect('build.author', 'author')
      .leftJoinAndSelect('build.member', 'member')
      .leftJoinAndSelect('member.user', 'memberUser')
      .orderBy('build.created_at', 'DESC');

    if (filters.search) {
      qb.andWhere('(build.name ILIKE :q OR build.description ILIKE :q)', {
        q: `%${filters.search}%`,
      });
    }

    if (filters.classId)
      qb.andWhere('class.id = :classId', { classId: filters.classId });
    if (filters.specId)
      qb.andWhere('spec.id = :specId', { specId: filters.specId });
    if (filters.guildId)
      qb.andWhere('(guild.id = :guildId OR build.is_public = true)', {
        guildId: filters.guildId,
      });
    if (filters.authorId)
      qb.andWhere('author.id = :authorId', { authorId: filters.authorId });
    if (filters.onlyPublic) qb.andWhere('build.is_public = true');

    return qb.getMany();
  }

  async findOne(id: number) {
    const build = await this.buildRepo.findOne({
      where: { id },
      relations: [
        'class',
        'spec',
        'items',
        'guild',
        'author',
        'member',
        'member.user',
      ],
    });
    if (!build) throw new NotFoundException('Build não encontrada');
    return build;
  }

  async create(dto: CreateBuildDto) {
    const build = this.buildRepo.create({
      name: dto.name,
      description: dto.description,
      role: dto.role,
      is_public: dto.is_public ?? true,
      price: dto.price,
    });

    await this.applyRelations(build, dto);
    return this.buildRepo.save(build);
  }

  async update(id: number, dto: UpdateBuildDto) {
    const build = await this.findOne(id);

    if (dto.name !== undefined) build.name = dto.name;
    if (dto.description !== undefined) build.description = dto.description;
    if (dto.role !== undefined) build.role = dto.role;
    if (dto.is_public !== undefined) build.is_public = dto.is_public;
    if (dto.price !== undefined) build.price = dto.price;

    await this.applyRelations(build, dto);
    return this.buildRepo.save(build);
  }

  async remove(id: number) {
    const build = await this.findOne(id);
    await this.buildRepo.remove(build);
    return { deleted: true };
  }

  // --- Classes ---
  listClasses() {
    return this.classRepo.find({ order: { name: 'ASC' } });
  }

  async createClass(dto: CreateBuildClassDto) {
    const created = this.classRepo.create(dto);
    return this.classRepo.save(created);
  }

  async updateClass(id: number, dto: UpdateBuildClassDto) {
    await this.classRepo.update(id, dto);
    const updated = await this.classRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Classe não encontrada');
    return updated;
  }

  async removeClass(id: number) {
    await this.classRepo.delete(id);
    return { deleted: true };
  }

  // --- Specs ---
  listSpecs(classId?: number) {
    return this.specRepo.find({
      where: classId ? { class: { id: classId } } : {},
      order: { name: 'ASC' },
    });
  }

  async createSpec(dto: CreateBuildSpecDto) {
    const cls = await this.classRepo.findOne({ where: { id: dto.classId } });
    if (!cls) throw new NotFoundException('Classe não encontrada');

    const created = this.specRepo.create({ ...dto, class: cls });
    return this.specRepo.save(created);
  }

  async updateSpec(id: number, dto: UpdateBuildSpecDto) {
    const spec = await this.specRepo.findOne({ where: { id } });
    if (!spec) throw new NotFoundException('Especialização não encontrada');

    if (dto.classId) {
      const cls = await this.classRepo.findOne({ where: { id: dto.classId } });
      if (!cls) throw new NotFoundException('Classe não encontrada');
      spec.class = cls;
    }
    if (dto.name) spec.name = dto.name;
    if (dto.description !== undefined) spec.description = dto.description;

    return this.specRepo.save(spec);
  }

  async removeSpec(id: number) {
    await this.specRepo.delete(id);
    return { deleted: true };
  }

  // --- Items ---
  listItems() {
    return this.itemRepo.find({ order: { name: 'ASC' } });
  }

  async createItem(dto: CreateBuildItemDto) {
    const created = this.itemRepo.create(dto);
    return this.itemRepo.save(created);
  }

  async updateItem(id: number, dto: UpdateBuildItemDto) {
    await this.itemRepo.update(id, dto);
    const updated = await this.itemRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Item não encontrado');
    return updated;
  }

  async removeItem(id: number) {
    await this.itemRepo.delete(id);
    return { deleted: true };
  }

  async reseedItems() {
    try {
      console.log('🗑️ Deleting all existing items...');
      await this.itemRepo.clear();

      console.log('📦 Loading Albion items from JSON...');
      const albionItems = loadAlbionItems();

      if (!albionItems || albionItems.length === 0) {
        const errorMsg = 'Failed to load items from albion-items.json. File may be missing or empty.';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      const itemsToCreate = albionItems.map((item: AlbionItem) =>
        this.itemRepo.create({
          name: item.name,
          slot: item.category,
          albion_id: item.id,
          item_id: item.id,
        }),
      );

      console.log(
        `📦 Seeding ${itemsToCreate.length} items from albion-items.json...`,
      );

      if (itemsToCreate.length > 0) {
        await this.itemRepo.save(itemsToCreate);
      }

      console.log(`✅ Successfully seeded ${itemsToCreate.length} items!`);

      return {
        success: true,
        message: `Successfully reseeded ${itemsToCreate.length} items from Albion database`,
        count: itemsToCreate.length,
      };
    } catch (error) {
      console.error('❌ Error in reseedItems():', error);
      throw error;
    }
  }

  debugFileCheck() {
    const fs = require('node:fs');
    const path = require('node:path');

    const possiblePaths = [
      path.join(__dirname, '../data/albion-items.json'),
      path.join(__dirname, '../../data/albion-items.json'),
      path.join(__dirname, 'data/albion-items.json'),
      path.join(process.cwd(), 'dist/data/albion-items.json'),
      path.join(process.cwd(), 'src/data/albion-items.json'),
    ];

    const results = possiblePaths.map((filePath) => ({
      path: filePath,
      exists: fs.existsSync(filePath),
      size: fs.existsSync(filePath)
        ? fs.statSync(filePath).size + ' bytes'
        : 'N/A',
    }));

    return {
      __dirname,
      'process.cwd()': process.cwd(),
      paths: results,
      foundPath: results.find((r) => r.exists)?.path || 'NOT FOUND',
    };
  }

  async seedDefaults() {
    // Check and seed items from Albion separately
    const itemCount = await this.itemRepo.count();
    console.log(`📊 Current item count in database: ${itemCount}`);

    // If we have fewer than 100 items, reseed with all Albion items
    if (itemCount < 100) {
      console.log('📦 Few items found in database (< 100), reseeding Albion items...');

      // Clear existing items first
      if (itemCount > 0) {
        console.log(`🗑️ Clearing ${itemCount} existing items...`);
        await this.itemRepo.clear();
      }

      const albionItems = loadAlbionItems();

      const itemsToCreate = albionItems.map((item: AlbionItem) =>
        this.itemRepo.create({
          name: item.name,
          slot: item.category,
          albion_id: item.id,
          item_id: item.id,
        }),
      );

      console.log(
        `📦 Seeding ${itemsToCreate.length} items from albion-items.json...`,
      );
      await this.itemRepo.save(itemsToCreate);
      console.log(
        `✅ Successfully seeded ${itemsToCreate.length} items from albion-items.json`,
      );
    } else {
      console.log(`✅ Items already in database: ${itemCount} items`);
    }

    // Check and seed classes/specs/builds
    const hasClasses = await this.classRepo.count();
    if (hasClasses > 0) {
      console.log(`✅ Classes already in database: ${hasClasses} classes`);
      return;
    }

    console.log(
      '📦 No classes found, seeding default classes, specs, and builds...',
    );

    const classes = await this.classRepo.save([
      this.classRepo.create({
        name: 'Guerreiro',
        description: 'Frente de batalha / tank',
      }),
      this.classRepo.create({
        name: 'Mago',
        description: 'Controle e dano mágico',
      }),
      this.classRepo.create({
        name: 'Arqueiro',
        description: 'Dano à distância',
      }),
    ]);

    const specs = await this.specRepo.save([
      this.specRepo.create({ name: 'Defensor', class: classes[0] }),
      this.specRepo.create({ name: 'Berserker', class: classes[0] }),
      this.specRepo.create({ name: 'Elementalista', class: classes[1] }),
      this.specRepo.create({ name: 'Caçador', class: classes[2] }),
    ]);

    const allItems = await this.itemRepo.find();
    if (allItems.length >= 4) {
      await this.buildRepo.save(
        this.buildRepo.create({
          name: 'Tank inicial',
          description: 'Build focada em defesa para iniciantes.',
          role: 'Tank',
          class: classes[0],
          spec: specs[0],
          items: [allItems[0], allItems[1], allItems[3]],
          is_public: true,
        }),
      );
    }
  }

  private async applyRelations(build: Build, dto: Partial<CreateBuildDto>) {
    if (dto.classId !== undefined) {
      const cls = await this.classRepo.findOne({ where: { id: dto.classId } });
      if (!cls) throw new NotFoundException('Classe não encontrada');
      build.class = cls;
    }

    if (dto.specId !== undefined) {
      const spec = await this.specRepo.findOne({ where: { id: dto.specId } });
      if (!spec) throw new NotFoundException('Especialização não encontrada');
      build.spec = spec;
    }

    if (dto.guildId !== undefined) {
      const guild = await this.guildRepo.findOne({
        where: { id: dto.guildId },
      });
      build.guild = guild ?? null;
    }

    if (dto.authorId !== undefined) {
      const author = await this.userRepo.findOne({
        where: { id: dto.authorId },
      });
      build.author = author ?? null;
    }

    if (dto.memberId !== undefined) {
      const member = await this.memberRepo.findOne({
        where: { id: dto.memberId },
      });
      build.member = member ?? null;
    }

    if (dto.itemIds) {
      const items = await this.itemRepo.find({
        where: { id: In(dto.itemIds) },
      });
      build.items = items;
    }
  }
}
