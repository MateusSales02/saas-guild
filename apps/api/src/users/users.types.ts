import { User } from './user.entity';
export type PublicUser = Omit<User, 'password_hash'>;
export function toPublicUser(u: User | null): PublicUser | null {
  if (!u) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...pub } = u;
  return pub as PublicUser;
}
export function toPublicUsers(list: User[]): PublicUser[] {
  return list.map(toPublicUser).filter(Boolean) as PublicUser[];
}
