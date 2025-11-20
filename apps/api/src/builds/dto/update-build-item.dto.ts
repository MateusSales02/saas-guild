import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildItemDto } from './create-build-item.dto';

export class UpdateBuildItemDto extends PartialType(CreateBuildItemDto) {}
