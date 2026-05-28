'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Recommendations } from '@/components/candidate/Recommendations';
import { JobDiscovery } from '@/components/candidate/JobDiscovery';
import { Button } from '@/components/common/Button';

export default function CandidateDashboard() {
  const { data: session } = useSession();
  const candidateId = session?.user?.id;
  const orgId = session?.user?.organization_id;
  const [activeTab, setActiveTab] = useState('recommendations');

  if (!candidateId || !orgId) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Personalized job recommendations and discovery</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <Button
            variant={activeTab === 'recommendations' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('recommendations')}
          >
            For You
          </Button>
          <Button
            variant={activeTab === 'discover' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'recommendations' && <Recommendations candidateId={candidateId} />}
        {activeTab === 'discover' && <JobDiscovery candidateId={candidateId} orgId={orgId} />}
      </div>
    </div>
  );
}
