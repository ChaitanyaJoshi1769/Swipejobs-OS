import React from 'react';
import { ApplicationsScreen } from '@/screens/ApplicationsScreen';

const CANDIDATE_ID = 'candidate-123';

export default function ApplicationsTab() {
  return <ApplicationsScreen candidateId={CANDIDATE_ID} />;
}
