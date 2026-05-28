import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dtos/create-candidate.dto';
import { UpdateCandidateDto } from './dtos/update-candidate.dto';
import { CurrentUser, TenantId } from '../auth/decorators/tenant.decorator';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @CurrentUser() user: any,
    @Body() createCandidateDto: CreateCandidateDto,
  ) {
    return this.candidatesService.create(
      user.organization_id,
      user.id,
      createCandidateDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getProfile(@CurrentUser() user: any) {
    return this.candidatesService.findByUserId(user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Get('discover/by-location')
  async findByLocation(
    @Query('org_id') orgId: string,
    @Query('location') location: string,
  ) {
    if (!orgId || !location) return [];
    return this.candidatesService.findByLocation(orgId, location);
  }

  @Get('discover/by-skills')
  async findBySkills(
    @Query('org_id') orgId: string,
    @Query('skills') skills: string,
  ) {
    if (!orgId || !skills) return [];
    const skillArray = skills.split(',').map((s) => s.trim());
    return this.candidatesService.findBySkills(orgId, skillArray);
  }

  @Get('discover/by-experience')
  async findByExperience(
    @Query('org_id') orgId: string,
    @Query('min_years') minYears: string,
    @Query('max_years') maxYears?: string,
  ) {
    if (!orgId || !minYears) return [];
    return this.candidatesService.findByExperience(
      orgId,
      parseInt(minYears),
      maxYears ? parseInt(maxYears) : undefined,
    );
  }

  @Get('discover/available')
  async findAvailable(@Query('org_id') orgId: string) {
    if (!orgId) return [];
    return this.candidatesService.findAvailable(orgId);
  }

  @Get('stats/:orgId')
  async getStats(@Param('orgId') orgId: string) {
    return this.candidatesService.getCandidateStats(orgId);
  }
}
