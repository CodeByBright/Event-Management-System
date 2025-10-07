import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Platform-aware API base URL
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
});

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/events/`);
      if (response.ok) {
        const events = await response.json();
        const foundEvent = events.find(e => e.id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          Alert.alert('Error', 'Event not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (isRegistered) {
      Alert.alert(
        'Unregister',
        'Are you sure you want to unregister from this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unregister', 
            style: 'destructive',
            onPress: () => setIsRegistered(false)
          }
        ]
      );
    } else {
      Alert.alert(
        'Register',
        'Would you like to register for this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Register', 
            onPress: () => {
              setIsRegistered(true);
              Alert.alert('Success', 'You have been registered for this event!');
            }
          }
        ]
      );
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this event: ${event.title}\n\nDate: ${event.date} at ${event.time}\nLocation: ${event.location}\n\n${event.description}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLocationPress = () => {
    const query = encodeURIComponent(event.location);
    const url = Platform.select({
      ios: `maps://app?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Maps application is not available');
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Image */}
      <View style={styles.header}>
        {event.image_url ? (
          <Image 
            source={{ uri: `${BASE_URL}${event.image_url}` }} 
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.headerImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.placeholderContent}>
              <Ionicons name="calendar" size={60} color="rgba(255,255,255,0.8)" />
              <Text style={styles.placeholderText}>Event Image</Text>
            </View>
          </LinearGradient>
        )}
        
        {/* Header Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.3)']}
          style={styles.headerOverlay}
        />
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={20} style={styles.blurButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleShare}
          >
            <BlurView intensity={20} style={styles.blurButton}>
              <Ionicons name="share-outline" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Registration Status Badge */}
        {isRegistered && (
          <View style={styles.statusBadge}>
            <BlurView intensity={40} style={styles.statusBlur}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.statusText}>Registered</Text>
            </BlurView>
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Event Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Quick Info Section */}
          <View style={styles.quickInfoSection}>
            <View style={styles.quickInfoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color="#667eea" />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Date</Text>
                <Text style={styles.quickInfoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.quickInfoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={20} color="#667eea" />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Time</Text>
                <Text style={styles.quickInfoValue}>{formatTime(event.time)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.quickInfoItem} onPress={handleLocationPress}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color="#667eea" />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Location</Text>
                <Text style={[styles.quickInfoValue, styles.locationLink]}>{event.location}</Text>
                <Text style={styles.tapHint}>Tap to open in maps</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>About This Event</Text>
            </View>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.primaryButton, isRegistered && styles.unregisterButton]} 
              onPress={handleRegister}
            >
              <LinearGradient
                colors={isRegistered ? ['#e74c3c', '#c0392b'] : ['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons 
                  name={isRegistered ? "close-circle" : "checkmark-circle"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.primaryButtonText}>
                  {isRegistered ? 'Unregister' : 'Register Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Ionicons name="share-social" size={18} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Share Event</Text>
            </TouchableOpacity>
          </View>

          {/* Event Meta Info */}
          <View style={styles.metaInfo}>
            <Text style={styles.eventId}>Event #{event.id}</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // New Header Design
  header: {
    height: height * 0.35,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  navBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 70,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Content Area
  scrollContainer: {
    flex: 1,
    marginTop: -20,
  },
  contentCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 24,
    minHeight: height * 0.7,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  titleContainer: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 38,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 50,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  // Quick Info Section
  quickInfoSection: {
    marginBottom: 32,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickInfoText: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    lineHeight: 22,
  },
  locationLink: {
    color: '#667eea',
  },
  tapHint: {
    fontSize: 12,
    color: '#8e8e93',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Description Section
  descriptionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#34495e',
    backgroundColor: '#f8f9ff',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  // Action Buttons
  actionSection: {
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#f8f9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e8eaed',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Meta Info
  metaInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  eventId: {
    fontSize: 12,
    color: '#bdc3c7',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default EventDetailsScreen;
