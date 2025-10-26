import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { trainingPipeline } from '../services/trainingPipeline';
import { modelDeploymentService } from '../services/modelDeployment';
import { dataCollectionService } from '../services/dataCollectionService';

type TrainingDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingDashboard'>;

interface Props {
  navigation: TrainingDashboardScreenNavigationProp;
}

export default function TrainingDashboardScreen({ navigation }: Props) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [modelVersions, setModelVersions] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [dataStats, setDataStats] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<'packaging' | 'pill' | 'batchCode' | 'fusion'>('packaging');

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      await trainingPipeline.initialize();
      await modelDeploymentService.initialize();
      
      // Load data
      await loadModelVersions();
      await loadPerformanceMetrics();
      await loadDataStats();
      
      // Subscribe to training progress
      trainingPipeline.onTrainingProgress((progress) => {
        setTrainingProgress(progress);
      });
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  };

  const loadModelVersions = async () => {
    try {
      const versions = modelDeploymentService.getModelVersions();
      setModelVersions(versions);
    } catch (error) {
      console.error('Failed to load model versions:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const metrics = modelDeploymentService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };

  const loadDataStats = async () => {
    try {
      const stats = await dataCollectionService.getStats();
      setDataStats(stats);
    } catch (error) {
      console.error('Failed to load data stats:', error);
    }
  };

  const handleStartTraining = async () => {
    if (isTraining) {
      Alert.alert('Training in Progress', 'Please wait for current training to complete');
      return;
    }

    Alert.alert(
      'Start Training',
      `Train ${selectedModel} model? This may take several minutes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Training',
          onPress: async () => {
            setIsTraining(true);
            try {
              const result = await trainingPipeline.trainModel(selectedModel);
              
              // Deploy the trained model
              await modelDeploymentService.deployModel(
                result.model,
                selectedModel,
                result.metrics,
                {
                  modelType: selectedModel,
                  version: result.config.epochs.toString(),
                  deploymentStrategy: 'immediate',
                  rolloutPercentage: 100,
                  targetUsers: [],
                }
              );
              
              Alert.alert('Success', `${selectedModel} model trained and deployed successfully!`);
              
              // Refresh data
              await loadModelVersions();
              await loadPerformanceMetrics();
            } catch (error) {
              Alert.alert('Error', 'Training failed. Please try again.');
            } finally {
              setIsTraining(false);
              setTrainingProgress(null);
            }
          }
        }
      ]
    );
  };

  const handleTrainAllModels = async () => {
    if (isTraining) {
      Alert.alert('Training in Progress', 'Please wait for current training to complete');
      return;
    }

    Alert.alert(
      'Train All Models',
      'Train all models (packaging, pill, batchCode, fusion)? This will take a long time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Training All',
          onPress: async () => {
            setIsTraining(true);
            try {
              const results = await trainingPipeline.trainAllModels();
              Alert.alert('Success', 'All models trained successfully!');
              
              // Refresh data
              await loadModelVersions();
              await loadPerformanceMetrics();
            } catch (error) {
              Alert.alert('Error', 'Training failed. Please try again.');
            } finally {
              setIsTraining(false);
              setTrainingProgress(null);
            }
          }
        }
      ]
    );
  };

  const handleRollbackModel = async (modelType: string) => {
    Alert.alert(
      'Rollback Model',
      `Rollback ${modelType} model to previous version?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rollback',
          onPress: async () => {
            try {
              const success = await modelDeploymentService.rollbackModel(modelType);
              if (success) {
                Alert.alert('Success', `${modelType} model rolled back successfully`);
                await loadModelVersions();
              } else {
                Alert.alert('Error', 'Rollback failed');
              }
            } catch (error) {
              Alert.alert('Error', 'Rollback failed');
            }
          }
        }
      ]
    );
  };

  const ModelCard = ({ modelType, title, icon }: {
    modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion';
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const activeVersion = modelVersions.find(v => v.modelType === modelType && v.isActive);
    const isSelected = selectedModel === modelType;
    
    return (
      <TouchableOpacity
        style={[
          styles.modelCard,
          isSelected && styles.modelCardSelected
        ]}
        onPress={() => setSelectedModel(modelType)}
      >
        <View style={styles.modelCardHeader}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isSelected ? '#2E7D32' : '#666'} 
          />
          <Text style={[
            styles.modelCardTitle,
            isSelected && styles.modelCardTitleSelected
          ]}>
            {title}
          </Text>
        </View>
        
        {activeVersion ? (
          <View style={styles.modelCardInfo}>
            <Text style={styles.modelCardVersion}>v{activeVersion.version}</Text>
            <Text style={styles.modelCardAccuracy}>
              {(activeVersion.accuracy * 100).toFixed(1)}% accuracy
            </Text>
            <Text style={styles.modelCardSize}>
              {(activeVersion.size / 1024 / 1024).toFixed(1)} MB
            </Text>
          </View>
        ) : (
          <Text style={styles.modelCardNoModel}>No model deployed</Text>
        )}
      </TouchableOpacity>
    );
  };

  const ProgressBar = ({ progress }: { progress: any }) => {
    if (!progress) return null;
    
    const progressPercent = progress.epoch / progress.totalEpochs;
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Training Progress</Text>
        <Text style={styles.progressText}>
          Epoch {progress.epoch}/{progress.totalEpochs} - {progress.status}
        </Text>
        
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progressPercent}
            color="#2E7D32"
          />
        ) : (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent * 100}%` }
              ]} 
            />
          </View>
        )}
        
        <View style={styles.progressMetrics}>
          <Text style={styles.progressMetric}>
            Loss: {progress.loss.toFixed(4)}
          </Text>
          <Text style={styles.progressMetric}>
            Accuracy: {(progress.accuracy * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ML Training Dashboard</Text>
        <Text style={styles.subtitle}>Manage and train VeriMed models</Text>
      </View>

      {/* Data Statistics */}
      {dataStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Data Collection Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.totalImages}</Text>
              <Text style={styles.statLabel}>Total Images</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.authenticImages}</Text>
              <Text style={styles.statLabel}>Authentic</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.counterfeitImages}</Text>
              <Text style={styles.statLabel}>Counterfeit</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dataStats.averageQuality.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Quality</Text>
            </View>
          </View>
        </View>
      )}

      {/* Model Selection */}
      <View style={styles.modelsContainer}>
        <Text style={styles.sectionTitle}>Select Model to Train</Text>
        <View style={styles.modelsGrid}>
          <ModelCard modelType="packaging" title="Packaging" icon="cube" />
          <ModelCard modelType="pill" title="Pill" icon="medical" />
          <ModelCard modelType="batchCode" title="Batch Code" icon="barcode" />
          <ModelCard modelType="fusion" title="Fusion" icon="layers" />
        </View>
      </View>

      {/* Training Progress */}
      {isTraining && trainingProgress && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={trainingProgress} />
        </View>
      )}

      {/* Training Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Training Controls</Text>
        
        <TouchableOpacity 
          style={[styles.trainingButton, isTraining && styles.trainingButtonDisabled]}
          onPress={handleStartTraining}
          disabled={isTraining}
        >
          {isTraining ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="play" size={24} color="white" />
          )}
          <Text style={styles.trainingButtonText}>
            {isTraining ? 'Training...' : `Train ${selectedModel} Model`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.trainingButton, styles.trainAllButton, isTraining && styles.trainingButtonDisabled]}
          onPress={handleTrainAllModels}
          disabled={isTraining}
        >
          <Ionicons name="layers" size={24} color="white" />
          <Text style={styles.trainingButtonText}>Train All Models</Text>
        </TouchableOpacity>
      </View>

      {/* Model Versions */}
      <View style={styles.versionsContainer}>
        <Text style={styles.sectionTitle}>Deployed Models</Text>
        {modelVersions.length > 0 ? (
          modelVersions.map((version, index) => (
            <View key={index} style={styles.versionCard}>
              <View style={styles.versionHeader}>
                <Text style={styles.versionTitle}>
                  {version.modelType.toUpperCase()} v{version.version}
                </Text>
                {version.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.versionMetrics}>
                <Text style={styles.versionMetric}>
                  Accuracy: {(version.accuracy * 100).toFixed(1)}%
                </Text>
                <Text style={styles.versionMetric}>
                  Size: {(version.size / 1024 / 1024).toFixed(1)} MB
                </Text>
                <Text style={styles.versionMetric}>
                  Created: {new Date(version.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              {version.isActive && (
                <TouchableOpacity 
                  style={styles.rollbackButton}
                  onPress={() => handleRollbackModel(version.modelType)}
                >
                  <Ionicons name="arrow-undo" size={16} color="#D32F2F" />
                  <Text style={styles.rollbackButtonText}>Rollback</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noModelsText}>No models deployed yet</Text>
        )}
      </View>

      {/* Performance Metrics */}
      {performanceMetrics.length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          {performanceMetrics.slice(0, 5).map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricTitle}>Model {metric.modelId}</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Accuracy:</Text>
                <Text style={styles.metricValue}>{(metric.accuracy * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Inference Time:</Text>
                <Text style={styles.metricValue}>{metric.inferenceTime}ms</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Memory Usage:</Text>
                <Text style={styles.metricValue}>{metric.memoryUsage.toFixed(1)}MB</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  modelsContainer: {
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
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modelCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  modelCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  modelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modelCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  modelCardTitleSelected: {
    color: '#2E7D32',
  },
  modelCardInfo: {
    marginTop: 8,
  },
  modelCardVersion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  modelCardAccuracy: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelCardSize: {
    fontSize: 12,
    color: '#666',
  },
  modelCardNoModel: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  progressContainer: {
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
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  progressMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMetric: {
    fontSize: 12,
    color: '#666',
  },
  controlsContainer: {
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
  trainingButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  trainingButtonDisabled: {
    backgroundColor: '#ccc',
  },
  trainingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainAllButton: {
    backgroundColor: '#1976D2',
  },
  versionsContainer: {
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
  versionCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  versionMetrics: {
    marginBottom: 8,
  },
  versionMetric: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  rollbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  rollbackButtonText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noModelsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  metricsContainer: {
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
  metricCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
});
