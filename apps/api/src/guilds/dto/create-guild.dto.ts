import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGuildDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
