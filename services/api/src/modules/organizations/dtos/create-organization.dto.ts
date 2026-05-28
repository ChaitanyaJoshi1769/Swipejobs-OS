import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
