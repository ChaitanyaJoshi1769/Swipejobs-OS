import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  organization_name: string;

  @IsString()
  organization_slug: string;

  @IsOptional()
  @IsEnum(['candidate', 'employer', 'recruiter', 'admin'])
  user_type?: 'candidate' | 'employer' | 'recruiter' | 'admin';
}
