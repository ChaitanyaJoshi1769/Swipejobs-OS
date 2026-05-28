import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import { api } from '@/services/api';
import { SwipeDeck } from '@/components/SwipeDeck';

interface SwipeScreenProps {
  candidateId: string;
  orgId: string;
}

export const SwipeScreen: React.FC<SwipeScreenProps> = ({ candidateId, orgId }) => {
  const { data: jobs, isLoading } = useQuery(
    ['discover-jobs', orgId],
    () => api.get(`/jobs?org_id=${orgId}`)
  );

  const createApplication = useMutation((data: any) => api.post('/applications', data));
  const calculateMatch = useMutation((data: any) => api.post('/matching/calculate', data));

  const handleSwipeRight = async (jobId: string) => {
    try {
      // Calculate match score
      await calculateMatch.mutateAsync({ jobId, candidateId });
      // Create application
      await createApplication.mutateAsync({
        job_id: jobId,
        candidate_id: candidateId,
      });
    } catch (error) {
      console.error('Error applying for job:', error);
    }
  };

  const handleSwipeLeft = () => {
    // Skip job - no action needed
  };

  const handleEnd = () => {
    // All jobs shown
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Your Next Job</Text>
      {jobs && jobs.length > 0 ? (
        <SwipeDeck
          jobs={jobs}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onEnd={handleEnd}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No jobs available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
