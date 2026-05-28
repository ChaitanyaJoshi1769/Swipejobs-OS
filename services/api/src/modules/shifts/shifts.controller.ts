import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CurrentUser } from '../auth/decorators/tenant.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Shifts & Scheduling')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async createShift(@CurrentUser() user: any, @Body() createShiftDto: any) {
    return this.shiftsService.createShift(user.organization_id, createShiftDto);
  }

  @Get('job/:jobId')
  async findShiftsForJob(@Param('jobId') jobId: string) {
    return this.shiftsService.findShiftsForJob(jobId);
  }

  @Get('upcoming/:orgId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getUpcomingShifts(@Param('orgId') orgId: string) {
    return this.shiftsService.findUpcomingShifts(orgId);
  }

  @Post('assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async assignShift(
    @CurrentUser() user: any,
    @Body() body: { shiftId: string; candidateId: string }
  ) {
    return this.shiftsService.assignShift(body.shiftId, body.candidateId, user.organization_id);
  }

  @Patch(':assignmentId/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async acceptShift(@Param('assignmentId') assignmentId: string) {
    return this.shiftsService.acceptShift(assignmentId);
  }

  @Patch(':assignmentId/reject')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async rejectShift(@Param('assignmentId') assignmentId: string) {
    return this.shiftsService.rejectShift(assignmentId);
  }

  @Post(':assignmentId/check-in')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async checkIn(@Param('assignmentId') assignmentId: string) {
    return this.shiftsService.checkIn(assignmentId);
  }

  @Post(':assignmentId/check-out')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async checkOut(@Param('assignmentId') assignmentId: string) {
    return this.shiftsService.checkOut(assignmentId);
  }

  @Get('candidate/:candidateId')
  async getCandidateShifts(@Param('candidateId') candidateId: string) {
    return this.shiftsService.getCandidateShifts(candidateId);
  }

  @Get('stats/:orgId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getShiftStats(@Param('orgId') orgId: string) {
    return this.shiftsService.getShiftStats(orgId);
  }
}
