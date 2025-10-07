import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Platform-aware API base URL
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000', // Android emulator -> host machine
  ios: 'http://localhost:8000',     // iOS simulator
  default: 'http://192.168.0.166:8000', // fallback to LAN IP if needed
});

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(''); // HH:MM
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); // { uri, width, height } | null

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to add an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          setImage({ uri: asset.uri, width: asset.width, height: asset.height });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter an event name.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Validation', 'Please enter date as YYYY-MM-DD.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Validation', 'Please enter time as HH:MM (24h).');
      return;
    }
    setLoading(true);
    try {
      const url = `${BASE_URL}/events/`;

      let response;
      if (image) {
        // Submit multipart/form-data when image is present
        const formData = new FormData();
        formData.append('title', title);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('location', location);
        formData.append('description', description);
        // Infer mime type by extension; default to image/jpeg
        const fileName = image.uri.split('/').pop() || 'event.jpg';
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        formData.append('image', { uri: image.uri, name: fileName, type: mime });

        response = await fetch(url, {
          method: 'POST',
          // Don't set Content-Type to let fetch add the boundary
          body: formData,
        });
      } else {
        // Fallback to JSON when no image is selected
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, date, time, location, description }),
        });
      }
      if (response.ok) {
        let created = null;
        try {
          created = await response.json();
        } catch {}
        Alert.alert('Success', 'Event created!');
        navigation.navigate('MainTabs', {
          screen: 'Home',
          params: { newEvent: created, refresh: true },
        });
      } else {
        let detail = 'Could not create event.';
        try {
          const data = await response.json();
          detail = data?.detail || JSON.stringify(data);
        } catch {}
        Alert.alert('Error', detail);
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Server not reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>New Event</Text>

      {/* Event Name */}
      <View style={styles.inputCard}>
        <TextInput
          placeholder="Event Name"
          placeholderTextColor="#8aa0b4"
          value={title}
          onChangeText={setTitle}
          style={styles.textInput}
        />
      </View>

      {/* Date + Time Row */}
      <View style={styles.row}>
        <View style={[styles.inputCard, styles.rowItem, styles.rowItemLeft]}>
          <TextInput
            placeholder="Date"
            placeholderTextColor="#8aa0b4"
            value={date}
            onChangeText={setDate}
            style={styles.textInput}
          />
        </View>
        <View style={[styles.inputCard, styles.rowItem]}>
          <TextInput
            placeholder="Time (HH:MM)"
            placeholderTextColor="#8aa0b4"
            value={time}
            onChangeText={setTime}
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Location */}
      <View style={styles.inputCard}>
        <View style={styles.iconInputRow}>
          <Ionicons name="location-outline" size={18} color="#8aa0b4" />
          <TextInput
            placeholder="Location"
            placeholderTextColor="#8aa0b4"
            value={location}
            onChangeText={setLocation}
            style={[styles.textInput, { marginLeft: 8 }]}
          />
        </View>
      </View>

      {/* Event Image */}
      <View style={[styles.inputCard, styles.imageCard]}> 
        {image ? (
          <View>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="cover" />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.secondaryChip} onPress={handlePickImage}>
                <Ionicons name="image" size={16} color="#1f3a77" />
                <Text style={styles.secondaryChipText}>Change Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryChip} onPress={() => setImage(null)}>
                <Ionicons name="trash-outline" size={16} color="#b00020" />
                <Text style={[styles.secondaryChipText, { color: '#b00020' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={20} color="#8aa0b4" />
            <Text style={styles.imagePlaceholderText}>Add event image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      <View style={[styles.inputCard, { minHeight: 100 }]}> 
        <TextInput
          placeholder="Event description..."
          placeholderTextColor="#8aa0b4"
          value={description}
          onChangeText={setDescription}
          style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
          multiline
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={handleCreate} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'CREATING...' : 'CREATE'}</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Helper Text */}
      <Text style={styles.helperText}>You can edit details later</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f6f8',
    paddingTop: Platform.select({ ios: 24, android: 16 }),
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#22303c',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  textInput: {
    fontSize: 16,
    color: '#22303c',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  rowItem: {
    flex: 1,
  },
  rowItemLeft: {
    marginRight: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    color: '#22303c',
    fontSize: 14,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8aa0b4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#1f3a77',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1f3a77',
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#1f3a77',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 4,
  },
  helperText: {
    textAlign: 'center',
    color: '#7c9bb3',
    marginTop: 12,
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2f7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  secondaryChipText: {
    color: '#1f3a77',
    fontWeight: '600',
    marginLeft: 6,
  },
  imagePlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#eef2f7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  imagePlaceholderText: {
    color: '#8aa0b4',
    fontSize: 14,
    marginLeft: 8,
  },
});
 
export default CreateEventScreen;