import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateCandidateDto {
  @IsOptional()
  @IsString()
  resume_url?: string;

  @IsOptional()
  @IsString()
  summary?: string;

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
  @IsBoolean()
  willing_to_relocate?: boolean;

  @IsOptional()
  @IsNumber()
  years_experience?: number;

  @IsOptional()
  @IsString()
  highest_education?: string;

  @IsOptional()
  @IsString()
  employment_status?: string;

  @IsOptional()
  @IsObject()
  work_preferences?: Record<string, any>;

  @IsOptional()
  @IsObject()
  salary_expectations?: Record<string, any>;

  @IsOptional()
  @IsObject()
  skills?: Record<string, any>;

  @IsOptional()
  @IsArray()
  languages?: string[];
}
