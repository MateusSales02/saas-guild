import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import type { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /**
   * Cria um usuário "player" para ser vinculado a uma guilda.
   * Apenas líderes podem criar jogadores.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('leader')
  @Post('players')
  createPlayer(@Body() dto: CreatePlayerDto) {
    return this.auth.createPlayer(dto.email, dto.password, dto.nickname);
  }

  /**
   * Cria um usuário "player" de forma simplificada (apenas nickname).
   * O backend gera email e senha automaticamente.
   * Qualquer usuário autenticado pode criar jogadores para adicionar à guilda.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('create-player')
  createPlayerSimple(@Body() dto: { nickname: string }) {
    return this.auth.createPlayerSimple(dto.nickname);
  }

  /**
   * Retorna os dados do usuário autenticado.
   * Usado para verificar se o token é válido.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.findById(user.sub);
  }
}
