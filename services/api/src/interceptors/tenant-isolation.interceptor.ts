import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Ensure tenant context is available for all database operations
    if (request.user && !request.organization_id) {
      request.organization_id = (request.user as any).organization_id;
    }

    return next.handle();
  }
}
