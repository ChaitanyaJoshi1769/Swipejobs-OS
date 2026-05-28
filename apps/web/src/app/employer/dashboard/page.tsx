'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useJobStats, useJobs } from '@/hooks/useJobs';
import { useApplicationStats } from '@/hooks/useApplications';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { JobsList } from '@/components/employer/JobsList';

export default function EmployerDashboard() {
  const { data: session } = useSession();
  const orgId = session?.user?.organization_id;
  const [activeTab, setActiveTab] = useState('jobs');

  const { data: jobStats } = useJobStats(orgId as string);
  const { data: appStats } = useApplicationStats(orgId as string);
  const { data: jobs } = useJobs(orgId as string);

  if (!orgId) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Employer Dashboard</h1>
          <p className="text-gray-600">Manage your jobs, candidates, and applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Active Jobs</p>
              <p className="text-3xl font-bold">{jobStats?.active || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Total Applications</p>
              <p className="text-3xl font-bold">{appStats?.total || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Reviewed</p>
              <p className="text-3xl font-bold">{appStats?.reviewed || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Hired</p>
              <p className="text-3xl font-bold">{appStats?.hired || 0}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <Button
            variant={activeTab === 'jobs' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </Button>
          <Button
            variant={activeTab === 'candidates' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'jobs' && orgId && <JobsList orgId={orgId} />}
      </div>
    </div>
  );
}
