import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Build } from './build.entity';
import { CreateBuildDto } from './dto/create-build.dto';
import { UpdateBuildDto } from './dto/update-build.dto';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
import { BuildVote } from './build-vote.entity';
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

    // Usar require.resolve para garantir que o módulo fs/path estão acessíveis
    const fsModule = require('node:fs');
    const pathModule = require('node:path');

    // Em produção, o arquivo está em dist/data/albion-items.json
    // Em desenvolvimento, está em src/data/albion-items.json
    const possiblePaths = [
      pathModule.join(process.cwd(), 'dist/data/albion-items.json'), // Produção primária
      pathModule.join(__dirname, '../data/albion-items.json'), // Produção (dist/builds -> dist/data)
      pathModule.join(__dirname, '../../data/albion-items.json'), // Produção alternativa 1
      pathModule.join(__dirname, 'data/albion-items.json'), // Produção alternativa 2
      pathModule.join(process.cwd(), 'src/data/albion-items.json'), // Desenvolvimento
    ];

    console.log('🔍 [loadAlbionItems] Checking possible paths:');
    for (const filePath of possiblePaths) {
      console.log(`   🔎 Checking: ${filePath}`);
      if (fsModule.existsSync(filePath)) {
        console.log(`✅ Found albion-items.json at: ${filePath}`);
        const fileContent = fsModule.readFileSync(filePath, 'utf8');
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
    @InjectRepository(BuildVote)
    private readonly voteRepo: Repository<BuildVote>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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
      .leftJoinAndSelect('member.user', 'memberUser');

    if (filters.sort === 'popular') {
      qb.orderBy('build.vote_count', 'DESC').addOrderBy(
        'build.created_at',
        'DESC',
      );
    } else if (filters.sort === 'name') {
      qb.orderBy('build.name', 'ASC');
    } else if (filters.sort === 'recent') {
      qb.orderBy('build.updated_at', 'DESC');
    } else {
      qb.orderBy('build.created_at', 'DESC');
    }

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
    if (filters.category)
      qb.andWhere('build.category = :category', {
        category: filters.category,
      });
    if (filters.voterId)
      qb.innerJoin(
        BuildVote,
        'vote',
        'vote.build_id = build.id AND vote.user_id = :voterId',
        { voterId: filters.voterId },
      );
    // Rascunhos só aparecem para o próprio autor
    if (!filters.authorId)
      qb.andWhere("(build.status IS NULL OR build.status <> 'draft')");

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
      category: dto.category,
      tags: dto.tags,
      loadout: dto.loadout,
      author_name: dto.author_name,
      videos: dto.videos,
      status: dto.status ?? 'published',
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
    if (dto.category !== undefined) build.category = dto.category;
    if (dto.tags !== undefined) build.tags = dto.tags;
    if (dto.loadout !== undefined) build.loadout = dto.loadout;
    if (dto.author_name !== undefined) build.author_name = dto.author_name;
    if (dto.videos !== undefined) build.videos = dto.videos;
    if (dto.status !== undefined) build.status = dto.status;

    await this.applyRelations(build, dto);
    return this.buildRepo.save(build);
  }

  // --- Votos ---
  async toggleVote(buildId: number, userId: number) {
    await this.findOne(buildId);
    const existing = await this.voteRepo.findOne({
      where: { build: { id: buildId }, user: { id: userId } },
    });
    if (existing) {
      await this.voteRepo.remove(existing);
    } else {
      await this.voteRepo.save(
        this.voteRepo.create({
          build: { id: buildId } as Build,
          user: { id: userId } as User,
        }),
      );
    }
    const voteCount = await this.voteRepo.count({
      where: { build: { id: buildId } },
    });
    await this.buildRepo.update(buildId, { vote_count: voteCount });
    return { voted: !existing, vote_count: voteCount };
  }

  async votedBuildIds(userId: number): Promise<number[]> {
    const rows = await this.voteRepo
      .createQueryBuilder('vote')
      .select('vote.build_id', 'id')
      .where('vote.user_id = :userId', { userId })
      .getRawMany<{ id: number }>();
    return rows.map((r) => Number(r.id));
  }

  async remove(id: number) {
    const build = await this.findOne(id);
    await this.buildRepo.softRemove(build);
    return { deleted: true };
  }

  async findDeleted() {
    return this.buildRepo
      .find({
        where: {},
        withDeleted: true,
        relations: [
          'class',
          'spec',
          'items',
          'guild',
          'author',
          'member',
          'member.user',
        ],
      })
      .then((builds) => builds.filter((b) => b.deleted_at !== null));
  }

  async restore(id: number) {
    await this.buildRepo.restore(id);
    return { restored: true };
  }

  async hardRemove(id: number) {
    const build = await this.buildRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!build) throw new NotFoundException('Build não encontrada');
    await this.buildRepo.remove(build);
    return { deleted: true };
  }

  // --- Classes ---
  async listClasses(): Promise<BuildClass[]> {
    const cacheKey = 'build-classes:all';
    const cached = await this.cacheManager.get<BuildClass[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const classes = await this.classRepo.find({ order: { name: 'ASC' } });
    await this.cacheManager.set(cacheKey, classes, 600000); // 10 minutos
    return classes;
  }

  async createClass(dto: CreateBuildClassDto) {
    const created = this.classRepo.create(dto);
    const saved = await this.classRepo.save(created);

    // Invalida o cache
    await this.cacheManager.del('build-classes:all');

    return saved;
  }

  async updateClass(id: number, dto: UpdateBuildClassDto) {
    await this.classRepo.update(id, dto);
    const updated = await this.classRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Classe não encontrada');

    // Invalida o cache
    await this.cacheManager.del('build-classes:all');

    return updated;
  }

  async removeClass(id: number) {
    await this.classRepo.delete(id);

    // Invalida o cache
    await this.cacheManager.del('build-classes:all');

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
  async listItems(): Promise<BuildItem[]> {
    const cacheKey = 'build-items:all';
    const cached = await this.cacheManager.get<BuildItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const items = await this.itemRepo.find({ order: { name: 'ASC' } });
    await this.cacheManager.set(cacheKey, items, 600000); // 10 minutos
    return items;
  }

  async createItem(dto: CreateBuildItemDto) {
    const created = this.itemRepo.create(dto);
    const saved = await this.itemRepo.save(created);

    // Invalida o cache
    await this.cacheManager.del('build-items:all');

    return saved;
  }

  async updateItem(id: number, dto: UpdateBuildItemDto) {
    await this.itemRepo.update(id, dto);
    const updated = await this.itemRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Item não encontrado');

    // Invalida o cache
    await this.cacheManager.del('build-items:all');

    return updated;
  }

  async removeItem(id: number) {
    await this.itemRepo.delete(id);

    // Invalida o cache
    await this.cacheManager.del('build-items:all');

    return { deleted: true };
  }

  async reseedItems() {
    try {
      console.log('🗑️ Deleting all existing items...');
      // Usar createQueryBuilder para deletar todos os itens
      await this.itemRepo.createQueryBuilder().delete().execute();

      console.log('📦 Loading Albion items from JSON...');

      // Carregar arquivo JSON diretamente aqui (sem depender de função externa)
      const fsModule = require('node:fs');
      const pathModule = require('node:path');
      const filePath = pathModule.join(process.cwd(), 'dist/data/albion-items.json');

      console.log(`📂 Tentando ler arquivo: ${filePath}`);
      console.log(`📂 Arquivo existe? ${fsModule.existsSync(filePath)}`);

      if (!fsModule.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      const fileContent = fsModule.readFileSync(filePath, 'utf8');
      const albionItems = JSON.parse(fileContent) as AlbionItem[];
      console.log(`✅ Loaded ${albionItems.length} items from file`);

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

      // Invalida o cache
      await this.cacheManager.del('build-items:all');

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

  async clearAllItems() {
    console.log('🗑️ Clearing all items from database...');
    const count = await this.itemRepo.count();
    // Usar delete({}) em vez de clear() para respeitar foreign keys
    await this.itemRepo.delete({});
    console.log(`✅ Cleared ${count} items from database`);

    // Invalida o cache
    await this.cacheManager.del('build-items:all');

    return {
      success: true,
      message: `Cleared ${count} items from database. Restart server to auto-seed 309+ items.`,
      itemsCleared: count,
    };
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

    // Tentar ler o arquivo e parse JSON
    const foundPath = results.find((r) => r.exists)?.path;
    let parseResult = { success: false, itemCount: 0, error: null };

    if (foundPath) {
      try {
        const fileContent = fs.readFileSync(foundPath, 'utf8');
        const items = JSON.parse(fileContent);
        parseResult = {
          success: true,
          itemCount: items.length,
          error: null,
        };
      } catch (error) {
        parseResult = {
          success: false,
          itemCount: 0,
          error: error.message,
        };
      }
    }

    return {
      __dirname,
      'process.cwd()': process.cwd(),
      paths: results,
      foundPath: foundPath || 'NOT FOUND',
      parseTest: parseResult,
    };
  }

  async seedDefaults() {
    try {
      // Check and seed items from Albion separately
      const itemCount = await this.itemRepo.count();
      console.log(`📊 Current item count in database: ${itemCount}`);

      // If we have fewer than 100 items, reseed with all Albion items
      if (itemCount < 100) {
        console.log(
          '📦 Few items found in database (< 100), reseeding Albion items...',
        );

        // Clear existing items first
        if (itemCount > 0) {
          console.log(`🗑️ Clearing ${itemCount} existing items...`);
          // Usar delete({}) em vez de clear() para respeitar foreign keys
          await this.itemRepo.delete({});
        }

        const albionItems = loadAlbionItems();

        if (!albionItems || albionItems.length === 0) {
          console.error(
            '⚠️ Failed to load Albion items, skipping seed. Server will continue starting.',
          );
        } else {
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
        }
      } else {
        console.log(`✅ Items already in database: ${itemCount} items`);
      }
    } catch (error) {
      console.error(
        '❌ Error in seedDefaults (Albion items):',
        error,
      );
      console.error(
        '⚠️ Server will continue starting despite seed error.',
      );
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
