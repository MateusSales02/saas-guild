import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  OPERATION_CATEGORIES,
  type OperationCategory,
} from '../finance-operation.entity';
import { ENTRY_KINDS, type EntryKind } from '../finance-operation-entry.entity';

export class CreateOperationDto {
  @IsInt()
  guildId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsIn(OPERATION_CATEGORIES)
  category?: OperationCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  /** Gasto da compra inicial; vira o primeiro movimento de saída */
  @IsInt()
  @Min(0)
  cost: number;

  /** Taxa do mercado em %, descontada de cada venda */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  feeRate?: number;

  @IsInt()
  @Min(0)
  expectedRevenue: number;

  @IsOptional()
  @IsDateString()
  purchasedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Lança a compra inicial como saída na tesouraria */
  @IsOptional()
  @IsBoolean()
  syncTreasury?: boolean;
}

/** Só dados descritivos; dinheiro muda pelos movimentos */
export class UpdateOperationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsIn(OPERATION_CATEGORIES)
  category?: OperationCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedRevenue?: number;

  /** Vale para as próximas vendas; as já lançadas ficam como estão */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  feeRate?: number;

  @IsOptional()
  @IsDateString()
  purchasedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateEntryDto {
  @IsIn(ENTRY_KINDS)
  kind: EntryKind;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  /** Espelha o movimento na tesouraria (entrada ou saída) */
  @IsOptional()
  @IsBoolean()
  syncTreasury?: boolean;
}

export class CloseOperationDto {
  @IsIn(['sold', 'cancelled'])
  result: 'sold' | 'cancelled';
}
