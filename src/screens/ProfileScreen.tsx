import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'> & 
  StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout
            console.log('Logout');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Delete account');
          }
        }
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={20} color="#2E7D32" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userRole}>Healthcare Worker</Text>
        <Text style={styles.userEmail}>john.doe@example.com</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Counterfeits</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <MenuItem
          icon="notifications"
          title="Notifications"
          subtitle="Get alerts about counterfeit reports"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#2E7D32' }}
              thumbColor={notificationsEnabled ? 'white' : '#f4f3f4'}
            />
          }
        />
        
        <MenuItem
          icon="cloud-offline"
          title="Offline Mode"
          subtitle="Download models for offline scanning"
          rightComponent={
            <Switch
              value={offlineModeEnabled}
              onValueChange={setOfflineModeEnabled}
              trackColor={{ false: '#ccc', true: '#2E7D32' }}
              thumbColor={offlineModeEnabled ? 'white' : '#f4f3f4'}
            />
          }
        />
        
        <MenuItem
          icon="location"
          title="Location Sharing"
          subtitle="Share location with reports"
          rightComponent={
            <Switch
              value={locationSharingEnabled}
              onValueChange={setLocationSharingEnabled}
              trackColor={{ false: '#ccc', true: '#2E7D32' }}
              thumbColor={locationSharingEnabled ? 'white' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <MenuItem
          icon="person"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => {
            // TODO: Navigate to edit profile
            console.log('Edit profile');
          }}
        />
        
        <MenuItem
          icon="shield-checkmark"
          title="Verification Status"
          subtitle="Healthcare Worker - Verified"
          onPress={() => {
            // TODO: Show verification details
            console.log('Verification status');
          }}
        />
        
        <MenuItem
          icon="key"
          title="Change Password"
          onPress={() => {
            // TODO: Navigate to change password
            console.log('Change password');
          }}
        />
      </View>

      {/* ML & Data Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ML & Data Collection</Text>
        
        <MenuItem
          icon="camera"
          title="Data Collection"
          subtitle="Contribute to training data"
          onPress={() => {
            navigation.navigate('DataCollection');
          }}
        />
        
        <MenuItem
          icon="layers"
          title="ML Training Dashboard"
          subtitle="Train and manage models"
          onPress={() => {
            navigation.navigate('TrainingDashboard');
          }}
        />
        
        <MenuItem
          icon="flask"
          title="Model Testing"
          subtitle="Test and validate ML models"
          onPress={() => {
            navigation.navigate('ModelTesting');
          }}
        />
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <MenuItem
          icon="download"
          title="Download Data"
          subtitle="Export your scan history"
          onPress={() => {
            // TODO: Implement data export
            console.log('Download data');
          }}
        />
        
        <MenuItem
          icon="trash"
          title="Clear Scan History"
          subtitle="Remove all local scan data"
          onPress={() => {
            Alert.alert(
              'Clear Scan History',
              'This will remove all your local scan data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => console.log('Clear history') }
              ]
            );
          }}
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <MenuItem
          icon="help-circle"
          title="Help & FAQ"
          onPress={() => {
            // TODO: Navigate to help
            console.log('Help');
          }}
        />
        
        <MenuItem
          icon="mail"
          title="Contact Support"
          onPress={() => {
            // TODO: Open contact support
            console.log('Contact support');
          }}
        />
        
        <MenuItem
          icon="information-circle"
          title="About VeriMed"
          onPress={() => {
            // TODO: Show about screen
            console.log('About');
          }}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F57C00' }]}>
              <Ionicons name="log-out" size={20} color="white" />
            </View>
            <Text style={[styles.menuTitle, { color: '#F57C00' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#D32F2F' }]}>
              <Ionicons name="trash" size={20} color="white" />
            </View>
            <Text style={[styles.menuTitle, { color: '#D32F2F' }]}>Delete Account</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>VeriMed v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 VeriMed. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#2E7D32',
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 1,
    borderRadius: 8,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 1,
    borderRadius: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 10,
    color: '#ccc',
  },
});

