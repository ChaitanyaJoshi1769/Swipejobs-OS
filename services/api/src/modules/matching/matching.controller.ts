import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './services/matching.service';
import { CurrentUser } from '../auth/decorators/tenant.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMatchDto } from './dtos/create-match.dto';

@ApiTags('Matching & Recommendations')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('calculate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async calculateMatch(@Body() createMatchDto: CreateMatchDto) {
    const matchScore = await this.matchingService.calculateMatch(
      createMatchDto.jobId,
      createMatchDto.candidateId,
    );
    return this.matchingService.storeMatch(
      createMatchDto.jobId,
      createMatchDto.candidateId,
      matchScore,
    );
  }

  @Get('job/:jobId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'employer')
  @ApiBearerAuth()
  async getTopMatchesForJob(
    @Param('jobId') jobId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.matchingService.getTopMatchesForJob(jobId, parseInt(limit));
  }

  @Get('candidate/:candidateId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getRecommendationsForCandidate(
    @Param('candidateId') candidateId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.matchingService.getRecommendationsForCandidate(
      candidateId,
      parseInt(limit),
    );
  }

  @Post('generate-recommendations/:candidateId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'system')
  @ApiBearerAuth()
  async generateRecommendations(@Param('candidateId') candidateId: string) {
    await this.matchingService.generateRecommendations(candidateId);
    return { success: true, message: 'Recommendations generated' };
  }

  @Get('match/:jobId/:candidateId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMatch(
    @Param('jobId') jobId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.matchingService.getMatch(jobId, candidateId);
  }
}
