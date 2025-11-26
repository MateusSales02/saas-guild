import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuildsService } from '../guilds/guilds.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly guildsService: GuildsService,
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

    const password_hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.usersRepo.create({
      email: dto.email,
      password_hash,
      nickname: dto.nickname,
      role: 'leader',
      uid: null,
    });

    const saved = await this.usersRepo.save(user);

    // Cria automaticamente uma guilda com o nome informado pelo usuário e associa como líder
    const guild = await this.guildsService.createGuildWithLeader(
      saved.id,
      dto.nickname,
    );

    const token = await this.signToken(saved);

    return {
      user: this.publicUser(saved),
      token,
      guild: {
        id: guild.id,
        name: guild.name,
      },
    };
  }

  /**
   * Login normal.
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

    // Busca a guilda do usuário
    const guilds = await this.guildsService.findByMember(user.id);
    const guild = guilds.length > 0 ? guilds[0] : null;

    const token = await this.signToken(user);
    return {
      user: this.publicUser(user),
      token,
      guild: guild
        ? {
            id: guild.id,
            name: guild.name,
          }
        : null,
    };
  }

  /**
   * Cria um usuário "player" para ser vinculado como membro de guilda.
   * NÃO faz login e NÃO retorna token.
   */
  async createPlayer(email: string, password: string, nickname: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = this.usersRepo.create({
      email,
      password_hash,
      nickname,
      role: 'player',
      uid: null,
    });

    const saved = await this.usersRepo.save(user);
    return this.publicUser(saved);
  }

  /**
   * Cria um usuário "player" de forma simplificada.
   * Gera email e senha automaticamente baseado no nickname.
   * NÃO faz login e NÃO retorna token.
   */
  async createPlayerSimple(nickname: string) {
    // Gera email único baseado no nickname
    const baseEmail = nickname.toLowerCase().replaceAll(/\s+/g, '') + '@guild.local';
    let email = baseEmail;
    let counter = 1;

    // Verifica se email já existe e incrementa contador se necessário
    while (await this.usersRepo.findOne({ where: { email } })) {
      email = nickname.toLowerCase().replaceAll(/\s+/g, '') + counter + '@guild.local';
      counter++;
    }

    // Gera senha aleatória de 10 caracteres
    const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

    return this.createPlayer(email, password, nickname);
  }

  /**
   * Busca usuário por ID (para o endpoint /auth/me)
   */
  async findById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.publicUser(user);
  }

  private async signToken(user: User) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private publicUser(u: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = u;
    return rest;
  }
}
