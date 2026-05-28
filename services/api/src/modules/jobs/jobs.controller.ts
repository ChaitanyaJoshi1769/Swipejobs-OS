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
}
