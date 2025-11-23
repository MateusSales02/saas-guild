import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class CreatePlayerDto {
  @IsEmail()
  email: string;
  @MinLength(6)
  password: string;
  @IsNotEmpty()
  nickname: string;
}
