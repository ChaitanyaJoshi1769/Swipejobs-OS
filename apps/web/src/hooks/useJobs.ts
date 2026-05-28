import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/services/api';

export const useJobs = (orgId?: string) => {
  return useQuery(
    ['jobs', orgId],
    () => api.get(`/jobs${orgId ? `?org_id=${orgId}` : ''}`),
    {
      enabled: !!orgId,
    }
  );
};

export const useJobStats = (orgId: string) => {
  return useQuery(
    ['job-stats', orgId],
    () => api.get(`/jobs/stats/${orgId}`),
    {
      enabled: !!orgId,
    }
  );
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => api.post('/jobs', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('jobs');
      },
    }
  );
};
