import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Swipejobs</Text>
        <Text style={styles.tagline}>Find Your Next Job</Text>
        
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Swipe to Apply</Text>
          <Text style={styles.featureText}>Discover jobs that match your skills</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/swipe')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#e0e0e0',
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
