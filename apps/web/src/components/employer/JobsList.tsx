'use client';

import React from 'react';
import { useJobs } from '@/hooks/useJobs';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface JobsListProps {
  orgId: string;
}

export const JobsList: React.FC<JobsListProps> = ({ orgId }) => {
  const { data: jobs, isLoading, error } = useJobs(orgId);

  if (isLoading) return <div>Loading jobs...</div>;
  if (error) return <div>Error loading jobs</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs?.map((job: any) => (
        <Card key={job.id} className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{job.description}</p>
            <div className="flex gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {job.status}
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                {job.applications_count || 0} Applications
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Card>
      ))}
    </div>
  );
};
