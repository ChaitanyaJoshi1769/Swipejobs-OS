'use client';

import React, { useState } from 'react';
import { useDiscoverCandidates } from '@/hooks/useCandidates';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface CandidatesDiscoveryProps {
  orgId: string;
}

export const CandidatesDiscovery: React.FC<CandidatesDiscoveryProps> = ({ orgId }) => {
  const [filters, setFilters] = useState({
    org_id: orgId,
    location: '',
    skills: '',
    min_years: '',
  });

  const { data: candidates, isLoading, error } = useDiscoverCandidates(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  if (error) return <div>Error loading candidates</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={filters.skills}
          onChange={(e) => handleFilterChange('skills', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="Min Years"
          value={filters.min_years}
          onChange={(e) => handleFilterChange('min_years', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <Button>Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div>Loading candidates...</div>
        ) : (
          candidates?.map((candidate: any) => (
            <Card key={candidate.id}>
              <h3 className="text-lg font-semibold mb-2">{candidate.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{candidate.summary}</p>
              <div className="space-y-1 text-sm">
                <p><strong>Location:</strong> {candidate.location_city}, {candidate.location_state}</p>
                <p><strong>Experience:</strong> {candidate.years_experience} years</p>
              </div>
              <Button variant="primary" size="sm" className="mt-4 w-full">
                View Profile
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
