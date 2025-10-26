import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { dataCollectionService } from '../services/dataCollectionService';
import { imagePreprocessingService } from '../utils/imagePreprocessing';

type DataCollectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DataCollection'>;

interface Props {
  navigation: DataCollectionScreenNavigationProp;
}

export default function DataCollectionScreen({ navigation }: Props) {
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [isAuthentic, setIsAuthentic] = useState(true);
  const [imageType, setImageType] = useState<'packaging' | 'pill' | 'batch_code'>('packaging');
  const [quality, setQuality] = useState(8);
  const [userRole, setUserRole] = useState<'consumer' | 'healthcare_worker' | 'pharmacist'>('consumer');
  const [isCollecting, setIsCollecting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initializeDataCollection();
  }, []);

  const initializeDataCollection = async () => {
    try {
      await dataCollectionService.initialize();
      const currentStats = await dataCollectionService.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Failed to initialize data collection:', error);
    }
  };

  const handleStartTrainingMode = () => {
    Alert.alert(
      'Training Mode',
      'Training mode allows you to collect data for ML model training. Your photos will be used to improve counterfeit detection accuracy.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Training', onPress: () => setIsTrainingMode(true) }
      ]
    );
  };

  const handleCollectData = async () => {
    if (!medicineName.trim() || !manufacturer.trim()) {
      Alert.alert('Error', 'Please fill in medicine name and manufacturer');
      return;
    }

    setIsCollecting(true);
    try {
      // Simulate image collection (in real app, this would use camera)
      const mockImageUri = 'mock://image/uri';
      
      const medicineImage = await dataCollectionService.collectMedicineImage(
        mockImageUri,
        medicineName,
        manufacturer,
        batchCode,
        isAuthentic,
        imageType,
        quality,
        userRole
      );

      Alert.alert(
        'Success',
        `Medicine data collected successfully!\nID: ${medicineImage.id}`,
        [
          { text: 'OK', onPress: () => {
            setMedicineName('');
            setManufacturer('');
            setBatchCode('');
            setIsAuthentic(true);
            setQuality(8);
            initializeDataCollection();
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to collect medicine data');
    } finally {
      setIsCollecting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await dataCollectionService.exportDataForTraining();
      Alert.alert(
        'Export Complete',
        `Exported ${exportData.images.length} images for training`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export training data');
    }
  };

  const handleClearData = () => {
    dataCollectionService.clearAllData();
  };

  const ImageTypeButton = ({ type, title, icon }: {
    type: 'packaging' | 'pill' | 'batch_code';
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <TouchableOpacity
      style={[
        styles.imageTypeButton,
        imageType === type && styles.imageTypeButtonActive
      ]}
      onPress={() => setImageType(type)}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={imageType === type ? '#2E7D32' : '#666'} 
      />
      <Text style={[
        styles.imageTypeButtonText,
        imageType === type && styles.imageTypeButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const QualitySlider = () => (
    <View style={styles.qualityContainer}>
      <Text style={styles.qualityLabel}>Photo Quality: {quality}/10</Text>
      <View style={styles.qualitySlider}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.qualityDot,
              quality >= value && styles.qualityDotActive
            ]}
            onPress={() => setQuality(value)}
          />
        ))}
      </View>
    </View>
  );

  if (!isTrainingMode) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Data Collection</Text>
          <Text style={styles.subtitle}>
            Help improve VeriMed's counterfeit detection by contributing training data
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Collection Statistics</Text>
          {stats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalImages}</Text>
                <Text style={styles.statLabel}>Total Images</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.authenticImages}</Text>
                <Text style={styles.statLabel}>Authentic</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.counterfeitImages}</Text>
                <Text style={styles.statLabel}>Counterfeit</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageQuality.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Quality</Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#2E7D32" />
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Contribute</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="camera" size={20} color="#2E7D32" />
            <Text style={styles.instructionText}>
              Take clear photos of medicine packaging, pills, and batch codes
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="information-circle" size={20} color="#2E7D32" />
            <Text style={styles.instructionText}>
              Provide accurate medicine information and metadata
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="shield-checkmark" size={20} color="#2E7D32" />
            <Text style={styles.instructionText}>
              Mark medicines as authentic or suspicious based on your knowledge
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartTrainingMode}
        >
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.startButtonText}>Start Training Mode</Text>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Ionicons name="download" size={20} color="#2E7D32" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Ionicons name="trash" size={20} color="#D32F2F" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setIsTrainingMode(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>Training Mode</Text>
        <Text style={styles.subtitle}>Collect data for ML model training</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Medicine Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Medicine Name (e.g., Aspirin 100mg)"
          value={medicineName}
          onChangeText={setMedicineName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Manufacturer (e.g., Bayer)"
          value={manufacturer}
          onChangeText={setManufacturer}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Batch Code (optional)"
          value={batchCode}
          onChangeText={setBatchCode}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Authentic Medicine</Text>
          <Switch
            value={isAuthentic}
            onValueChange={setIsAuthentic}
            trackColor={{ false: '#ccc', true: '#2E7D32' }}
            thumbColor={isAuthentic ? 'white' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.sectionTitle}>Image Type</Text>
        <View style={styles.imageTypeContainer}>
          <ImageTypeButton type="packaging" title="Packaging" icon="cube" />
          <ImageTypeButton type="pill" title="Pill" icon="medical" />
          <ImageTypeButton type="batch_code" title="Batch Code" icon="barcode" />
        </View>

        <QualitySlider />

        <Text style={styles.sectionTitle}>User Role</Text>
        <View style={styles.roleContainer}>
          {(['consumer', 'healthcare_worker', 'pharmacist'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                userRole === role && styles.roleButtonActive
              ]}
              onPress={() => setUserRole(role)}
            >
              <Text style={[
                styles.roleButtonText,
                userRole === role && styles.roleButtonTextActive
              ]}>
                {role.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.collectButton, isCollecting && styles.collectButtonDisabled]}
          onPress={handleCollectData}
          disabled={isCollecting}
        >
          {isCollecting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="camera" size={24} color="white" />
          )}
          <Text style={styles.collectButtonText}>
            {isCollecting ? 'Collecting...' : 'Collect Data'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    gap: 8,
  },
  actionButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerButton: {
    borderColor: '#D32F2F',
  },
  dangerText: {
    color: '#D32F2F',
  },
  form: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  imageTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  imageTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  imageTypeButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  imageTypeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  imageTypeButtonTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  qualityContainer: {
    marginBottom: 16,
  },
  qualityLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  qualitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  qualityDotActive: {
    backgroundColor: '#2E7D32',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  roleButtonText: {
    fontSize: 12,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  collectButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  collectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  collectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
