import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    description: string;
    location: string;
    job_type: string;
    min_salary: number;
    max_salary: number;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSwipeLeft, onSwipeRight }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }]),
      onPanResponderRelease: (evt, { dx, vx }) => {
        if (dx > 100 || vx > 0.5) {
          onSwipeRight();
        } else if (dx < -100 || vx < -0.5) {
          onSwipeLeft();
        }
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-20deg', '0deg', '20deg'] }) },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name}</Text>
          <Text style={styles.location}>{job.location}</Text>
          
          <View style={styles.description}>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{job.job_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Salary</Text>
              <Text style={styles.detailValue}>${job.min_salary} - ${job.max_salary}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 500,
    marginVertical: 16,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    color: '#f0f0f0',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 12,
  },
  description: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
