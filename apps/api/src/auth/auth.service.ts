import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Registro público (tela "Criar conta").
   * Sempre cria um LÍDER da guilda.
   */
  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      email: dto.email,
      password_hash,
      nickname: dto.nickname,
      role: 'leader', // <--- sempre leader
      uid: null,
    });

    const saved = await this.usersRepo.save(user);
    const token = await this.signToken(saved);

    return { user: this.publicUser(saved), token };
  }

  /**
   * Login normal.
   * (Depois você pode filtrar por role === 'leader' no guard/front.)
   */
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = await this.signToken(user);
    return { user: this.publicUser(user), token };
  }

  /**
   * Cria um usuário "player" para ser vinculado como membro de guilda.
   * NÃO faz login e NÃO retorna token.
   * Ideal para ser usado por um serviço de Members.
   */
  async createPlayer(email: string, password: string, nickname: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      email,
      password_hash,
      nickname,
      role: 'player', // jogador comum, não entra no dashboard
      uid: null,
    });

    const saved = await this.usersRepo.save(user);
    return this.publicUser(saved);
  }

  private async signToken(user: User) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private publicUser(u: User) {
    const { password_hash, ...rest } = u;
    void password_hash; // só pra não ficar "unused"
    return rest;
  }
}
