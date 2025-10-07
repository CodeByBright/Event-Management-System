import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Header = ({ title, onNotificationPress, onSettingsPress }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerIcons}>
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={onSettingsPress}
      >
        <Ionicons name="settings-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>View and edit your profile here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default ProfileScreen;
