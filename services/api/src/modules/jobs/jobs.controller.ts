import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @Req() req: any,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(req.user.organization_id, createJobDto);
  }

  @Get()
  async findAll(@Query('org_id') orgId: string) {
    if (!orgId) return [];
    return this.jobsService.findByOrganization(orgId);
  }

  @Get('active/:orgId')
  async findActive(@Param('orgId') orgId: string) {
    return this.jobsService.findActive(orgId);
  }

  @Get('search')
  async search(
    @Query('org_id') orgId: string,
    @Query('q') query: string,
  ) {
    if (!orgId || !query) return [];
    return this.jobsService.search(orgId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    await this.jobsService.delete(id);
    return { message: 'Job deleted successfully' };
  }

  @Get('discover/by-location')
  async findByLocation(
    @Query('org_id') orgId: string,
    @Query('location') location: string,
    @Query('radius') radius?: number,
  ) {
    if (!orgId || !location) return [];
    return this.jobsService.findByLocation(orgId, location, radius);
  }

  @Get('discover/by-job-type')
  async findByJobType(
    @Query('org_id') orgId: string,
    @Query('job_type') jobType: string,
  ) {
    if (!orgId || !jobType) return [];
    return this.jobsService.findByJobType(orgId, jobType);
  }

  @Get('discover/by-skills')
  async findBySkills(
    @Query('org_id') orgId: string,
    @Query('skills') skills: string,
  ) {
    if (!orgId || !skills) return [];
    const skillArray = skills.split(',').map((s) => s.trim());
    return this.jobsService.findBySkills(orgId, skillArray);
  }

  @Get('discover/by-experience')
  async findByExperience(
    @Query('org_id') orgId: string,
    @Query('min_years') minYears: string,
    @Query('max_years') maxYears?: string,
  ) {
    if (!orgId || !minYears) return [];
    return this.jobsService.findByExperience(
      orgId,
      parseInt(minYears),
      maxYears ? parseInt(maxYears) : undefined,
    );
  }

  @Get('stats/:orgId')
  async getStats(@Param('orgId') orgId: string) {
    return this.jobsService.getJobStats(orgId);
  }
}
