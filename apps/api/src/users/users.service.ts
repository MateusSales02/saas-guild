// apps/api/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.entity';

export type PublicUser = Omit<User, 'password_hash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Helpers para remover password_hash
  private toPublic(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...rest } = user;
    return rest;
  }
  private toPublicOrNull(user: User | null): PublicUser | null {
    return user ? this.toPublic(user) : null;
  }

  private toPublicList(users: User[]): PublicUser[] {
    return users.map((u) => this.toPublic(u));
  }

  // === CRUD ===
  async findAll(): Promise<PublicUser[]> {
    const rows = await this.usersRepository.find();
    return this.toPublicList(rows);
  }

  async findOne(id: number): Promise<PublicUser | null> {
    const row = await this.usersRepository.findOne({ where: { id } });
    return this.toPublicOrNull(row);
  }

  async create(userData: Partial<User>): Promise<PublicUser> {
    // Observação: hashing de senha deve ser feito no AuthService (register).
    const user = this.usersRepository.create(userData);
    const saved = await this.usersRepository.save(user);
    return this.toPublic(saved);
  }

  async update(
    id: number,
    userData: Partial<User>,
  ): Promise<PublicUser | null> {
    await this.usersRepository.update(id, userData);
    const updated = await this.usersRepository.findOne({ where: { id } });
    return this.toPublicOrNull(updated);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // === BUSCA ===
  // GET /users/search?q=texto  (email OU nickname contém "q", case-insensitive)
  async search(q: string): Promise<PublicUser[]> {
    const term = (q ?? '').trim();
    if (!term) return [];

    const rows = await this.usersRepository.find({
      where: [
        {
          email: ILike(`%${term}%`),
        },
        {
          nickname: ILike(`%${term}%`),
        },
      ],
      order: { id: 'ASC' },
    });

    return this.toPublicList(rows);
  }

  // (opcional) buscar por e-mail, útil no AuthService
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
