import React from 'react';
import { SwipeScreen } from '@/screens/SwipeScreen';

// Mock values - in production these would come from auth context
const CANDIDATE_ID = 'candidate-123';
const ORG_ID = 'org-123';

export default function SwipeTab() {
  return <SwipeScreen candidateId={CANDIDATE_ID} orgId={ORG_ID} />;
}
