import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import type { Request } from 'express';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

const bearerExtractor = (req?: Request): string | null => {
  const auth = req?.headers?.authorization;
  if (typeof auth !== 'string') return null;

  const space = auth.indexOf(' ');
  if (space < 0) return null;

  const scheme = auth.slice(0, space);
  const token = auth.slice(space + 1).trim();

  if (!/^Bearer$/i.test(scheme)) return null;
  return token || null;
};

interface JwtOpts {
  jwtFromRequest: (req?: Request) => string | null;
  secretOrKey: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const opts: JwtOpts = {
      jwtFromRequest: bearerExtractor,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
    };

    // O construtor do Strategy aceita StrategyOptions.
    // Esta conversão é segura e evita os falsos-positivos do linter.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(opts as unknown as StrategyOptions);
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
