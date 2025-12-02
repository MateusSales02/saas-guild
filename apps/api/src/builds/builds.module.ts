import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Build } from './build.entity';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
import { BuildsService } from './builds.service';
import { BuildsController } from './builds.controller';
import { BuildClassesController } from './build-classes.controller';
import { BuildSpecsController } from './build-specs.controller';
import { BuildItemsController } from './build-items.controller';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';
import { GuildMember } from '../guilds/guild-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Build,
      BuildClass,
      BuildSpec,
      BuildItem,
      Guild,
      User,
      GuildMember,
    ]),
  ],
  providers: [BuildsService],
  controllers: [
    BuildsController,
    BuildClassesController,
    BuildSpecsController,
    BuildItemsController,
  ],
})
export class BuildsModule implements OnModuleInit {
  constructor(private readonly buildsService: BuildsService) {}

  async onModuleInit() {
    await this.buildsService.seedDefaults();
  }
}
