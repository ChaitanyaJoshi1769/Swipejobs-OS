import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  resource: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsEnum(['user', 'system'])
  permission_type?: string;
}
