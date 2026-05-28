# Role-Based Access Control (RBAC)

## Overview

swipejobsOS implements a comprehensive role-based access control (RBAC) system with attribute-based access control (ABAC) capabilities for fine-grained permission management.

## Core Concepts

### Permissions

Permissions are granular operations that can be performed on resources.

**Format**: `{resource}:{action}`

**Example**: 
- `job:create` - Create a job
- `application:read` - Read applications
- `user:update` - Update user information
- `organization:delete` - Delete organization

### Resources

Resources are objects that users interact with:
- `organization` - Organization/tenant
- `user` - User accounts
- `job` - Job postings
- `candidate` - Candidate profiles
- `application` - Job applications
- `shift` - Shifts
- `payment` - Payments & payroll
- `compliance` - Compliance documents

### Actions

Standard CRUD operations:
- `create` - Create new resource
- `read` - View/list resources
- `update` - Modify existing resource
- `delete` - Delete resource

### Roles

Roles are collections of permissions assigned to users.

**Default Roles**:

1. **Admin**
   - All permissions
   - Can manage organization settings
   - Can manage other users
   - Can assign roles

2. **Recruiter**
   - Can create and manage jobs
   - Can review applications
   - Can communicate with candidates
   - Can view candidates
   - Cannot delete jobs or manage billing

3. **Employee/Candidate**
   - Can view available jobs
   - Can apply to jobs
   - Can manage own profile
   - Can view own applications

## Multi-Tenancy

swipejobsOS enforces strict tenant isolation to ensure data security and privacy.

### Tenant Context

Every request includes a tenant context derived from:
1. JWT token claims (`organization_id`)
2. Query parameters (`org_id`)
3. Headers (`X-Organization-Id`)

### Data Isolation

All database queries automatically filter by `organization_id`:

```typescript
// All queries are tenant-aware
await jobsRepository.find({
  where: { organization_id: tenantId }
});
```

### Tenant Boundaries

- Users cannot access data from other organizations
- Roles are organization-specific
- Permissions are checked against user's tenant context
- Audit logs track cross-tenant access attempts

## Implementation

### Decorators

#### @Roles
Restrict endpoint access to specific roles:

```typescript
@Get('users')
@Roles('admin', 'recruiter')
async getUsers(@TenantId() tenantId: string) {
  return this.usersService.findByOrganization(tenantId);
}
```

#### @TenantId
Inject current tenant ID:

```typescript
@Post('jobs')
async createJob(
  @TenantId() tenantId: string,
  @Body() createJobDto: CreateJobDto
) {
  return this.jobsService.create(tenantId, createJobDto);
}
```

#### @CurrentUser
Inject current user object:

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Guards

#### RolesGuard
Enforces role-based access:

```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Delete('organization/:id')
async deleteOrganization(@Param('id') id: string) {
  // Only admins can delete organizations
}
```

#### TenantGuard
Enforces tenant context:

```typescript
@UseGuards(TenantGuard)
@Get('organization-data')
async getOrgData() {
  // Tenant context automatically injected
}
```

### Middleware

#### TenantContextMiddleware
Extracts and injects tenant context into all requests:

```typescript
// Automatically run on all routes
consumer.apply(TenantContextMiddleware).forRoutes('*');
```

## API Usage

### Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "organization_name": "My Company",
    "organization_slug": "my-company",
    "user_type": "employer"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Create Job (Role-Restricted)

```bash
curl -X POST http://localhost:3001/jobs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "...",
    "job_type": "full-time",
    "employment_type": "permanent"
  }'
```

## Audit Logging

All actions are logged for compliance and security:

```typescript
// Automatic logging
await auditService.log({
  organizationId: tenantId,
  userId: currentUser.id,
  action: 'CREATE',
  resourceType: 'job',
  resourceId: jobId,
  newValues: jobData,
  ipAddress: request.ip,
  userAgent: request.get('user-agent'),
});
```

### Query Audit Logs

```typescript
const logs = await auditService.getLogs(tenantId, {
  userId: userId,
  resourceType: 'job',
  action: 'CREATE',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 100,
});
```

## Permission Check Flow

```
Request → JWT Validation → Tenant Context Extraction
         ↓
    TenantGuard → Verify organization context
         ↓
    RolesGuard → Check user role/permissions
         ↓
   Endpoint Handler → Execute with tenant isolation
         ↓
   Audit Service → Log action
         ↓
    Response
```

## Security Best Practices

1. **Always Validate Tenant Context**
   - Never trust client-provided tenant IDs
   - Always use JWT token's organization_id

2. **Default Deny**
   - Explicitly grant permissions
   - Use @Roles on protected endpoints

3. **Audit Everything**
   - Log all state-changing operations
   - Include user, tenant, timestamp, changes

4. **Principle of Least Privilege**
   - Assign minimal required permissions
   - Use specific roles, not admin role

5. **Token Expiration**
   - Access tokens: 1 hour
   - Refresh tokens: 7 days
   - Rotate refresh tokens on use

## Future Enhancements

- Attribute-based access control (ABAC)
- Dynamic role creation via API
- Permission delegation
- Resource-level permissions
- Time-based access restrictions
- IP-based access restrictions
