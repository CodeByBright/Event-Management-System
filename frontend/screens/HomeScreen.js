import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableNativeFeedback, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


// Components


const EventCard = ({ title, date, location, onPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress}>
    <View style={styles.eventDate}>
      <Text style={styles.eventDay}>20</Text>
      <Text style={styles.eventMonth}>AUG</Text>
    </View>
    <View style={styles.eventDetails}>
      <Text style={styles.eventTitle}>{title}</Text>
      <View style={styles.eventMeta}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.eventText}>{date}</Text>
      </View>
      <View style={styles.eventMeta}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.eventText} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const QuickActions = ({ onAddEvent, onViewEvents }) => (
  <View style={styles.quickActions}>
    <Text style={styles.sectionTitle}>Quick Actions</Text>
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={onAddEvent}>
        <Ionicons name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.actionButtonText}>New Event</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onViewEvents}>
        <Ionicons name="calendar" size={24} color="#007AFF" />
        <Text style={styles.actionButtonText}>My Events</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Platform-aware API base URL (align with CreateEventScreen)
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://192.168.0.166:8000',
});

// Main Component
const HomeScreen = ({ navigation, route }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events/`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation, fetchEvents]);

  useEffect(() => {
    const newEvent = route?.params?.newEvent;
    if (newEvent) {
      setEvents(prev => [newEvent, ...prev]);
      // Clear the param so it doesn't re-append on subsequent focuses
      try { navigation.setParams({ newEvent: undefined }); } catch {}
    }
  }, [route?.params?.newEvent]);

  const handleEventPress = (eventId) => {
    // Navigate to event details
    navigation.navigate('EventDetails', { eventId });
  };

  const handleAddEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleViewEvents = () => {
    navigation.navigate('Event');
  };

 

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fullscreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
   
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back, User!</Text>
          <Text style={styles.welcomeSubtitle}>What would you like to do today?</Text>
        </View>

        {/* Quick Actions */}
        <QuickActions 
          onAddEvent={handleAddEvent}
          onViewEvents={handleViewEvents}
        />

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={[styles.emptyStateText, { marginTop: 12 }]}>Loading events...</Text>
            </View>
          ) : events && events.length > 0 ? (
            events.map(event => {
              const dateText = event?.time ? `${event?.date} ${event?.time}` : (event?.date || '');
              return (
                <EventCard
                  key={String(event.id ?? `${event.title}-${dateText}`)}
                  title={event.title}
                  date={dateText}
                  location={event.location || ''}
                  onPress={() => handleEventPress(event.id)}
                />
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No upcoming events</Text>
              <Text style={styles.emptyStateSubtext}>Create your first event to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableNativeFeedback 
        background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('rgba(0, 122, 255, 0.2)', true) : null}
        onPress={handleAddEvent}
      >
        <View style={styles.fab}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  welcomeContainer: {
    padding: 24,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActions: {
    padding: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#007AFF',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  eventDate: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    minWidth: 50,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventMonth: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginTop: -4,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default HomeScreen;
