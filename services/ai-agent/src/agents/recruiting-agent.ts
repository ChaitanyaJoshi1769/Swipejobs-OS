import axios from 'axios';

export class RecruitingAgent {
  async analyzeJobRequirements(jobId: string): Promise<{
    skills_needed: string[];
    experience_level: number;
  }> {
    const job = await axios.get(`http://localhost:3000/jobs/${jobId}`);
    
    const skills = job.data.description.match(/\b(?:Python|JavaScript|React|Node|AWS|Docker)\b/gi) || [];
    const yearsMatch = job.data.description.match(/(\d+)\s*years?/i);
    const experience = yearsMatch ? parseInt(yearsMatch[1]) : 0;

    return {
      skills_needed: Array.from(new Set(skills.map((s: string) => s.toLowerCase()))),
      experience_level: experience,
    };
  }

  async findTopCandidatesForJob(jobId: string, limit: number = 10): Promise<string[]> {
    const candidates = await axios.get(`http://localhost:3000/matching/job/${jobId}`, {
      params: { limit },
    });

    return candidates.data
      .filter((c: any) => c.match_score >= 0.7)
      .map((c: any) => c.candidate_id)
      .slice(0, limit);
  }

  async autoApproveApplications(jobId: string, scoreThreshold: number = 0.85): Promise<number> {
    const candidates = await axios.get(`http://localhost:3000/applications/job/${jobId}`);
    let approved = 0;

    for (const application of candidates.data) {
      const match = await axios.get(
        `http://localhost:3000/matching/match/${jobId}/${application.candidate_id}`
      );
      
      if (match.data.match_score >= scoreThreshold) {
        await axios.patch(`http://localhost:3000/applications/${application.id}`, {
          status: 'reviewed',
        });
        approved++;
      }
    }

    return approved;
  }
}
