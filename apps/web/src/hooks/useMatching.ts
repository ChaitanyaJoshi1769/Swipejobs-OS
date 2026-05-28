import { useQuery, useMutation } from 'react-query';
import { api } from '@/services/api';

export const useJobMatches = (jobId: string, limit: number = 10) => {
  return useQuery(
    ['job-matches', jobId, limit],
    () => api.get(`/matching/job/${jobId}?limit=${limit}`),
    {
      enabled: !!jobId,
    }
  );
};

export const useCandidateRecommendations = (candidateId: string, limit: number = 10) => {
  return useQuery(
    ['candidate-recommendations', candidateId, limit],
    () => api.get(`/matching/candidate/${candidateId}?limit=${limit}`),
    {
      enabled: !!candidateId,
    }
  );
};

export const useCalculateMatch = () => {
  return useMutation((data: { jobId: string; candidateId: string }) =>
    api.post('/matching/calculate', data)
  );
};

export const useGenerateRecommendations = () => {
  return useMutation((candidateId: string) =>
    api.post(`/matching/generate-recommendations/${candidateId}`, {})
  );
};
