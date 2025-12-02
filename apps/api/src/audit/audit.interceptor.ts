import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction } from './audit-log.entity';
import { Request } from 'express';
import { JwtPayload } from '../auth/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method;
    const url = request.url;
    const user = request.user;

    // Ignora métodos GET (apenas leitura) e rotas de health/status
    if (
      method === 'GET' ||
      url.includes('/health') ||
      url.includes('/integrations/albion')
    ) {
      return next.handle();
    }

    const action = this.methodToAction(method);
    const entityType = this.extractEntityType(url);
    const entityId = this.extractEntityId(url);

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Log após sucesso
          void this.auditService.log({
            userId: user?.sub,
            userEmail: user?.email,
            action,
            entityType,
            entityId: entityId ?? (response as { id?: number })?.id,
            description: `${method} ${url}`,
            newValues:
              method === 'DELETE'
                ? undefined
                : (request.body as Record<string, unknown>),
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
          });
        },
        error: () => {
          // Não loga erros para não poluir o audit log
        },
      }),
    );
  }

  private methodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'VIEW';
    }
  }

  private extractEntityType(url: string): string {
    // Remove query params e extrai o primeiro segmento após /
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    return segments[0] ?? 'unknown';
  }

  private extractEntityId(url: string): number | undefined {
    // Procura por números no URL
    const match = /\/(\d+)/.exec(url);
    return match ? Number.parseInt(match[1], 10) : undefined;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip ?? 'unknown';
  }
}
