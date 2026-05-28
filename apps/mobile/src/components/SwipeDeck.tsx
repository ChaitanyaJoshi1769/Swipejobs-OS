import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { JobCard } from './JobCard';

interface SwipeDeckProps {
  jobs: any[];
  onSwipeRight: (jobId: string) => void;
  onSwipeLeft: (jobId: string) => void;
  onEnd: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ jobs, onSwipeRight, onSwipeLeft, onEnd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeRight = () => {
    onSwipeRight(jobs[currentIndex].id);
    const newIndex = currentIndex + 1;
    if (newIndex >= jobs.length) {
      onEnd();
    } else {
      setCurrentIndex(newIndex);
    }
  };

  const handleSwipeLeft = () => {
    onSwipeLeft(jobs[currentIndex].id);
    const newIndex = currentIndex + 1;
    if (newIndex >= jobs.length) {
      onEnd();
    } else {
      setCurrentIndex(newIndex);
    }
  };

  if (currentIndex >= jobs.length) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.container}>
      <JobCard
        job={jobs[currentIndex]}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
