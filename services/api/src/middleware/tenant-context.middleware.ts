import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from JWT or query parameters
    if (req.user) {
      req['organization_id'] = (req.user as any).organization_id;
    } else if (req.query.org_id) {
      req['organization_id'] = req.query.org_id;
    } else if (req.headers['x-organization-id']) {
      req['organization_id'] = req.headers['x-organization-id'];
    }

    next();
  }
}
