import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  guildId: number;

  @IsIn(['in', 'out'])
  type: 'in' | 'out';

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
