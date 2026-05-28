'use client';

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useCreateApplication } from '@/hooks/useApplications';

interface JobDiscoveryProps {
  candidateId: string;
  orgId: string;
}

export const JobDiscovery: React.FC<JobDiscoveryProps> = ({ candidateId, orgId }) => {
  const [filters, setFilters] = useState({
    org_id: orgId,
    location: '',
    job_type: '',
    min_salary: '',
  });

  const { data: jobs, isLoading } = useQuery(
    ['discover-jobs', filters],
    () => {
      const params = new URLSearchParams(filters).toString();
      return api.get(`/jobs/discover?${params}`);
    }
  );

  const createApplication = useCreateApplication();

  const handleApply = (jobId: string) => {
    createApplication.mutate({
      job_id: jobId,
      candidate_id: candidateId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Location"
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <select onChange={(e) => setFilters({ ...filters, job_type: e.target.value })} className="border rounded-lg px-3 py-2">
          <option value="">Job Type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div>Loading jobs...</div>
        ) : (
          jobs?.map((job: any) => (
            <Card key={job.id}>
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-3">{job.company_name}</p>
              <p className="text-sm mb-3">{job.description}</p>
              <div className="space-y-1 text-sm mb-4">
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Type:</strong> {job.job_type}</p>
                <p><strong>Salary:</strong> ${job.min_salary} - ${job.max_salary}</p>
              </div>
              <Button
                onClick={() => handleApply(job.id)}
                loading={createApplication.isLoading}
                className="w-full"
              >
                Apply Now
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
