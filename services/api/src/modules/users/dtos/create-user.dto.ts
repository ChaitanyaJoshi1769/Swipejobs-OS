import { IsEmail, IsString, MinLength, IsEnum, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEnum(['candidate', 'employer', 'recruiter', 'admin'])
  user_type: 'candidate' | 'employer' | 'recruiter' | 'admin';

  @IsUUID()
  organization_id: string;
}
