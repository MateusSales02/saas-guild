import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuildsService } from '../guilds/guilds.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';

const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRATION_HOURS = 1;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly jwt: JwtService,
    private readonly guildsService: GuildsService,
    private readonly emailService: EmailService,
  ) {}

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

  async createPlayerSimple(nickname: string) {
    const baseEmail =
      nickname.toLowerCase().replaceAll(/\s+/g, '') + '@guild.local';
    let email = baseEmail;
    let counter = 1;

    while (await this.usersRepo.findOne({ where: { email } })) {
      email =
        nickname.toLowerCase().replaceAll(/\s+/g, '') +
        counter +
        '@guild.local';
      counter++;
    }

    // Generate a cryptographically secure random password
    const password = crypto.randomBytes(16).toString('base64').slice(0, 20);

    return this.createPlayer(email, password, nickname);
  }

  async findById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.publicUser(user);
  }

  async forgotPassword(email: string): Promise<{
    message: string;
    token?: string;
  }> {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      console.log(`[ForgotPassword] Email não encontrado: ${email}`);
      return {
        message:
          'Se o email existir, você receberá um link de recuperação de senha.',
      };
    }

    await this.resetTokenRepo.update(
      { user: { id: user.id }, used: false },
      { used: true },
    );

    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

    await this.resetTokenRepo.save({
      token,
      user,
      expiresAt,
      used: false,
    });

    console.log(`[ForgotPassword] Token gerado para ${email}: ${token}`);

    const result = await this.emailService.sendPasswordResetEmail(
      user.email,
      token,
    );

    return {
      message:
        'Se o email existir, você receberá um link de recuperação de senha.',
      token: result.sent ? undefined : result.token,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{
    message: string;
  }> {
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido ou já utilizado');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token expirado');
    }

    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersRepo.update(resetToken.user.id, { password_hash });

    await this.resetTokenRepo.update(resetToken.id, { used: true });

    console.log(
      `[ResetPassword] Senha alterada para usuário ID: ${resetToken.user.id}`,
    );

    return {
      message: 'Senha alterada com sucesso! Você já pode fazer login.',
    };
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.resetTokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
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
    return rest;
  }
}
