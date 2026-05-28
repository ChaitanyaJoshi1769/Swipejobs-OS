import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['full-time', 'part-time', 'contract', 'temporary', 'gig'])
  job_type: string;

  @IsEnum(['permanent', 'temporary', 'contract'])
  employment_type: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  salary_max?: number;

  @IsOptional()
  @IsString()
  location_city?: string;

  @IsOptional()
  @IsString()
  location_state?: string;

  @IsOptional()
  @IsString()
  location_country?: string;

  @IsOptional()
  @IsString()
  remote_work?: string;

  @IsOptional()
  @IsObject()
  required_skills?: Record<string, any>;

  @IsOptional()
  @IsObject()
  benefits?: Record<string, any>;

  @IsOptional()
  @IsArray()
  responsibilities?: string[];
}
