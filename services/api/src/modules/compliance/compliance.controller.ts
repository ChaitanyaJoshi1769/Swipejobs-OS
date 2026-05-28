import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/tenant.decorator';

@ApiTags('Compliance & Onboarding')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('documents')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async uploadDocument(
    @CurrentUser() user: any,
    @Body() body: { type: string; document_url: string }
  ) {
    return this.complianceService.uploadDocument(
      user.organization_id,
      user.id,
      body.type,
      body.document_url
    );
  }

  @Patch('documents/:documentId/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'compliance')
  @ApiBearerAuth()
  async approveDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Body() body: { notes?: string }
  ) {
    return this.complianceService.approveDocument(documentId, user.id, body.notes);
  }

  @Patch('documents/:documentId/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'compliance')
  @ApiBearerAuth()
  async rejectDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Body() body: { notes: string }
  ) {
    return this.complianceService.rejectDocument(documentId, user.id, body.notes);
  }

  @Get('candidate/:candidateId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getCandidateDocuments(@Param('candidateId') candidateId: string) {
    return this.complianceService.getCandidateDocuments(candidateId);
  }

  @Get('status/:candidateId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getComplianceStatus(@Param('candidateId') candidateId: string) {
    return this.complianceService.getComplianceStatus(candidateId);
  }

  @Get('report/:orgId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async getComplianceReport(@Param('orgId') orgId: string) {
    return this.complianceService.getOrganizationComplianceReport(orgId);
  }
}
