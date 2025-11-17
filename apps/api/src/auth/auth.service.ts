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
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password_hash,
      nickname: dto.nickname,
      role: dto.role,
      uid: null,
    });
    const saved = await this.usersRepo.save(user);
    const token = await this.signToken(saved);
    return { user: this.publicUser(saved), token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const token = await this.signToken(user);
    return { user: this.publicUser(user), token };
  }

  private async signToken(user: User) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private publicUser(u: User) {
    // remove o campo sem “guardar” a variável (evita no-unused-vars)
    const { password_hash, ...rest } = u;
    void password_hash; // marca como usado sem efeito
    return rest;
  }
}
