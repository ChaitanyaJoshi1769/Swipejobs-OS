'use client';

import React from 'react';
import { useCandidateRecommendations } from '@/hooks/useMatching';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useCreateApplication } from '@/hooks/useApplications';

interface RecommendationsProps {
  candidateId: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ candidateId }) => {
  const { data: recommendations, isLoading } = useCandidateRecommendations(candidateId);
  const createApplication = useCreateApplication();

  const handleApply = (jobId: string) => {
    createApplication.mutate({
      job_id: jobId,
      candidate_id: candidateId,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended Jobs For You</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div>Loading recommendations...</div>
        ) : recommendations?.length ? (
          recommendations.map((rec: any) => (
            <Card key={rec.job_id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{rec.job?.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {Math.round(rec.match_score)}% Match
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{rec.job?.company_name}</p>
                <p className="text-sm text-gray-700">{rec.job?.description}</p>
              </div>
              <Button
                onClick={() => handleApply(rec.job_id)}
                variant="primary"
                size="sm"
                className="mt-4 w-full"
              >
                Apply
              </Button>
            </Card>
          ))
        ) : (
          <div>No recommendations available yet</div>
        )}
      </div>
    </div>
  );
};
