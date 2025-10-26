import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DataCollectionScreen from '../screens/DataCollectionScreen';
import TrainingDashboardScreen from '../screens/TrainingDashboardScreen';

// Types
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Results: {
    scanResult: any; // Will be properly typed later
  };
  DataCollection: undefined;
  TrainingDashboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Reports: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'VeriMed' }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{ title: 'Scan Medicine' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Reports' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen} 
          options={{ title: 'Scan Results' }}
        />
        <Stack.Screen 
          name="DataCollection" 
          component={DataCollectionScreen} 
          options={{ title: 'Data Collection' }}
        />
        <Stack.Screen 
          name="TrainingDashboard" 
          component={TrainingDashboardScreen} 
          options={{ title: 'ML Training' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

