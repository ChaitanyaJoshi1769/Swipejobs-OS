import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cover_letter?: string;

  @IsOptional()
  @IsDate()
  reviewed_at?: Date;

  @IsOptional()
  @IsDate()
  rejected_at?: Date;

  @IsOptional()
  @IsDate()
  hired_at?: Date;
}
