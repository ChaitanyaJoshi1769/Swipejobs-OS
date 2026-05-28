import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/services/api';

export const useCandidates = (orgId?: string) => {
  return useQuery(
    ['candidates', orgId],
    () => api.get(`/candidates${orgId ? `?org_id=${orgId}` : ''}`),
    {
      enabled: !!orgId,
    }
  );
};

export const useCandidateStats = (orgId: string) => {
  return useQuery(
    ['candidate-stats', orgId],
    () => api.get(`/candidates/stats/${orgId}`),
    {
      enabled: !!orgId,
    }
  );
};

export const useDiscoverCandidates = (filters: any) => {
  return useQuery(
    ['discover-candidates', filters],
    () => {
      const params = new URLSearchParams(filters).toString();
      return api.get(`/candidates/discover?${params}`);
    },
    {
      enabled: !!filters,
    }
  );
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: any }) => api.patch(`/candidates/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('candidates');
      },
    }
  );
};
