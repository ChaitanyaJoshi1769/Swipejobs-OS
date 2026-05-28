import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import { api } from '@/services/api';

interface ProfileScreenProps {
  candidateId: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ candidateId }) => {
  const { data: profile, isLoading, refetch } = useQuery(
    ['candidate-profile', candidateId],
    () => api.get(`/candidates/${candidateId}`)
  );

  const updateProfile = useMutation(
    (data: any) => api.patch(`/candidates/${candidateId}`, data),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile || {});

  const handleSave = () => {
    updateProfile.mutate(formData);
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        {!editMode && (
          <TouchableOpacity onPress={() => setEditMode(true)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={formData.summary}
            onChangeText={(text) => setFormData({ ...formData, summary: text })}
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.text}>{profile?.summary}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={`${formData.location_city}, ${formData.location_state}`}
            onChangeText={(text) => setFormData({ ...formData, location_city: text })}
          />
        ) : (
          <Text style={styles.text}>{profile?.location_city}, {profile?.location_state}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={String(formData.years_experience)}
            onChangeText={(text) => setFormData({ ...formData, years_experience: parseInt(text) })}
            keyboardType="number-pad"
          />
        ) : (
          <Text style={styles.text}>{profile?.years_experience} years</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={styles.text}>{profile?.highest_education}</Text>
      </View>

      {editMode && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
