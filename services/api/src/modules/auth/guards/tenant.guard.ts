import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organization_id) {
      throw new ForbiddenException('User organization context required');
    }

    // Inject tenant context into request
    request.organization_id = user.organization_id;

    return true;
  }
}
