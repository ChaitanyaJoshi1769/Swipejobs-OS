import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/services/api';

export const useApplications = (jobId?: string, candidateId?: string) => {
  return useQuery(
    ['applications', jobId, candidateId],
    () => {
      if (jobId) return api.get(`/applications/job/${jobId}`);
      if (candidateId) return api.get(`/applications/candidate/${candidateId}`);
      return Promise.resolve([]);
    },
    {
      enabled: !!jobId || !!candidateId,
    }
  );
};

export const useApplicationStats = (orgId: string) => {
  return useQuery(
    ['application-stats', orgId],
    () => api.get(`/applications/stats/${orgId}`),
    {
      enabled: !!orgId,
    }
  );
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => api.post('/applications', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications');
      },
    }
  );
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, status }: { id: string; status: string }) =>
      api.patch(`/applications/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications');
      },
    }
  );
};
