import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildClassDto } from './create-build-class.dto';

export class UpdateBuildClassDto extends PartialType(CreateBuildClassDto) {}
