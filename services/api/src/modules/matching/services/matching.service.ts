import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Match } from '../entities/match.entity';
import { Recommendation } from '../entities/recommendation.entity';

export interface MatchScore {
  jobId: string;
  candidateId: string;
  score: number;
  percentage: number;
  reasons: Record<string, any>;
}

export interface MatchingRequest {
  jobId: string;
  candidateId: string;
  organizationId: string;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Recommendation)
    private recommendationsRepository: Repository<Recommendation>,
    private configService: ConfigService,
  ) {}

  /**
   * Calculate match score between a job and candidate
   * In production, this would call an external AI service
   */
  async calculateMatch(
    matchingRequest: MatchingRequest,
  ): Promise<MatchScore> {
    // TODO: Call Python AI service to calculate actual match
    // For now, returning mock scoring logic

    const mockScore = Math.random(); // 0-1
    const mockPercentage = Math.round(mockScore * 100);

    const reasons = {
      skills_match: Math.random(),
      experience_match: Math.random(),
      location_match: Math.random(),
      availability_match: Math.random(),
      salary_match: Math.random(),
    };

    return {
      jobId: matchingRequest.jobId,
      candidateId: matchingRequest.candidateId,
      score: mockScore,
      percentage: mockPercentage,
      reasons,
    };
  }

  /**
   * Store match in database
   */
  async storeMatch(matchScore: MatchScore, organizationId: string): Promise<Match> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

    // Check if match exists
    let match = await this.matchesRepository.findOne({
      where: {
        job_id: matchScore.jobId,
        candidate_id: matchScore.candidateId,
      },
    });

    if (match) {
      // Update existing match
      match.match_score = matchScore.score;
      match.match_percentage = matchScore.percentage;
      match.match_reasons = matchScore.reasons;
      match.expires_at = expiresAt;
      return this.matchesRepository.save(match);
    }

    // Create new match
    match = this.matchesRepository.create({
      id: uuidv4(),
      job_id: matchScore.jobId,
      candidate_id: matchScore.candidateId,
      organization_id: organizationId,
      match_score: matchScore.score,
      match_percentage: matchScore.percentage,
      matching_model_version: 'v1.0.0',
      match_reasons: matchScore.reasons,
      expires_at: expiresAt,
    });

    return this.matchesRepository.save(match);
  }

  /**
   * Get top matches for a job
   */
  async getTopMatchesForJob(
    jobId: string,
    limit = 20,
  ): Promise<Match[]> {
    return this.matchesRepository.find({
      where: { job_id: jobId },
      order: { match_score: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get top job recommendations for a candidate
   */
  async getRecommendationsForCandidate(
    candidateId: string,
    organizationId: string,
    limit = 20,
  ): Promise<Recommendation[]> {
    const recommendations = await this.recommendationsRepository.find({
      where: { candidate_id: candidateId, organization_id: organizationId },
      order: { rank: 'ASC' },
      take: limit,
    });

    return recommendations;
  }

  /**
   * Generate recommendations for a candidate
   * In production, this would be called by a background job
   */
  async generateRecommendations(
    candidateId: string,
    jobIds: string[],
    organizationId: string,
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Calculate scores for each job
    const scores: Array<{ jobId: string; score: number }> = [];

    for (const jobId of jobIds) {
      const matchScore = await this.calculateMatch({
        jobId,
        candidateId,
        organizationId,
      });

      scores.push({
        jobId: matchScore.jobId,
        score: matchScore.score,
      });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Delete existing recommendations
    await this.recommendationsRepository.delete({
      candidate_id: candidateId,
      organization_id: organizationId,
    });

    // Create new recommendations
    for (let i = 0; i < scores.length; i++) {
      const rec = this.recommendationsRepository.create({
        id: uuidv4(),
        candidate_id: candidateId,
        job_id: scores[i].jobId,
        organization_id: organizationId,
        rank: i + 1,
        score: scores[i].score,
        model_version: 'v1.0.0',
        personalization_factors: {
          rank_factor: 1 / (i + 1),
        },
      });

      recommendations.push(rec);
    }

    return this.recommendationsRepository.save(recommendations);
  }
}
