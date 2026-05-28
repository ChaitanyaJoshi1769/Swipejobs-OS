import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { CurrentUser } from '../auth/decorators/tenant.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @CurrentUser() user: any,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(
      user.organization_id,
      createApplicationDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Get('job/:jobId')
  async findByJob(@Param('jobId') jobId: string) {
    return this.applicationsService.findByJob(jobId);
  }

  @Get('candidate/:candidateId')
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.applicationsService.findByCandidate(candidateId);
  }

  @Get('status/:status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async findByStatus(
    @CurrentUser() user: any,
    @Param('status') status: string,
  ) {
    return this.applicationsService.findByStatus(user.organization_id, status);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Get('stats/:organizationId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async getApplicationStats(@Param('organizationId') organizationId: string) {
    return this.applicationsService.getApplicationStats(organizationId);
  }

  @Get('job/:jobId/stats')
  async getApplicationsByStatus(@Param('jobId') jobId: string) {
    return this.applicationsService.getApplicationsByStatus(jobId);
  }

  @Patch('bulk/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async bulkUpdateStatus(
    @Body() body: { applicationIds: string[]; status: string },
  ) {
    await this.applicationsService.bulkUpdateStatus(
      body.applicationIds,
      body.status,
    );
    return { success: true };
  }
}
