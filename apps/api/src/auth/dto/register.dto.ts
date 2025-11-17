import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email: string;
  @MinLength(6) password: string;
  @IsNotEmpty() nickname: string;
  @IsNotEmpty() role: string; // membro | líder | oficial
}
