import React from 'react';
import { ProfileScreen } from '@/screens/ProfileScreen';

const CANDIDATE_ID = 'candidate-123';

export default function ProfileTab() {
  return <ProfileScreen candidateId={CANDIDATE_ID} />;
}
