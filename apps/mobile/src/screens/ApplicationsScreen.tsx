import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useQuery } from 'react-query';
import { api } from '@/services/api';

interface ApplicationsScreenProps {
  candidateId: string;
}

export const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({ candidateId }) => {
  const { data: applications, isLoading } = useQuery(
    ['candidate-applications', candidateId],
    () => api.get(`/applications/candidate/${candidateId}`)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#3B82F6';
      case 'reviewed':
        return '#8B5CF6';
      case 'hired':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderApplication = ({ item }: { item: any }) => (
    <View style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.jobTitle}>{item.job?.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.company}>{item.job?.company_name}</Text>
      <Text style={styles.appliedDate}>Applied: {new Date(item.applied_at).toLocaleDateString()}</Text>
      {item.reviewed_at && (
        <Text style={styles.reviewedDate}>Reviewed: {new Date(item.reviewed_at).toLocaleDateString()}</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Applications</Text>
      {applications && applications.length > 0 ? (
        <FlatList
          data={applications}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No applications yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appliedDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
