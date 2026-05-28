import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './services/matching.service';
import { MatchingController } from './matching.controller';
import { Match } from './entities/match.entity';
import { Recommendation } from './entities/recommendation.entity';
import { JobsModule } from '../jobs/jobs.module';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Recommendation]),
    JobsModule,
    CandidatesModule,
  ],
  providers: [MatchingService],
  controllers: [MatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
