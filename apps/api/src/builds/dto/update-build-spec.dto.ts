import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildSpecDto } from './create-build-spec.dto';

export class UpdateBuildSpecDto extends PartialType(CreateBuildSpecDto) {}
