import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

/**
 * Decorator para definir quais roles podem acessar um endpoint.
 * Uso: @Roles('leader', 'officer')
 */
export const Roles = (...roles: string[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
