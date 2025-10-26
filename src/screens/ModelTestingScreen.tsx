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
import { modelTestingService } from '../services/modelTestingService';
import { ModelTestSuite, TestResult, PerformanceMetrics } from '../types';

type ModelTestingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModelTesting'>;

interface Props {
  navigation: ModelTestingScreenNavigationProp;
}

export default function ModelTestingScreen({ navigation }: Props) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<ModelTestSuite | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedModelType, setSelectedModelType] = useState<'packaging' | 'pill' | 'batchCode' | 'fusion' | 'all'>('all');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeTesting();
  }, []);

  const initializeTesting = async () => {
    try {
      await modelTestingService.initialize();
      setIsInitialized(true);
      console.log('Model testing service initialized');
    } catch (error) {
      console.error('Failed to initialize testing service:', error);
      Alert.alert('Error', 'Failed to initialize testing service');
    }
  };

  const handleRunTests = async () => {
    if (isTesting) {
      Alert.alert('Testing in Progress', 'Please wait for current tests to complete');
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      const results = await modelTestingService.runTestSuite(selectedModelType);
      setTestResults(results);

      // Get performance metrics
      const metrics = await modelTestingService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);

      Alert.alert(
        'Tests Complete',
        `Overall Score: ${results.overallScore.toFixed(1)}%\nPassed: ${results.passedTests}/${results.totalTests} tests`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Testing failed. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const TestResultItem = ({ test }: { test: TestResult }) => (
    <View style={[styles.testItem, test.passed ? styles.testPassed : styles.testFailed]}>
      <View style={styles.testHeader}>
        <Ionicons 
          name={test.passed ? 'checkmark-circle' : 'close-circle'} 
          size={20} 
          color={test.passed ? '#2E7D32' : '#D32F2F'} 
        />
        <Text style={styles.testName}>{test.testName}</Text>
        <Text style={styles.testScore}>{test.score.toFixed(0)}%</Text>
      </View>
      <Text style={styles.testDetails}>{test.details}</Text>
      <Text style={styles.testDuration}>Duration: {test.duration}ms</Text>
    </View>
  );

  const ModelTypeButton = ({ type, title }: { type: 'packaging' | 'pill' | 'batchCode' | 'fusion' | 'all'; title: string }) => (
    <TouchableOpacity
      style={[
        styles.modelTypeButton,
        selectedModelType === type && styles.modelTypeButtonActive
      ]}
      onPress={() => setSelectedModelType(type)}
    >
      <Text style={[
        styles.modelTypeButtonText,
        selectedModelType === type && styles.modelTypeButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const PerformanceCard = ({ title, value, unit, icon }: {
    title: string;
    value: number;
    unit: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View style={styles.performanceCard}>
      <View style={styles.performanceHeader}>
        <Ionicons name={icon} size={20} color="#2E7D32" />
        <Text style={styles.performanceTitle}>{title}</Text>
      </View>
      <Text style={styles.performanceValue}>
        {value.toFixed(2)}{unit}
      </Text>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Initializing testing service...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Model Testing</Text>
        <Text style={styles.subtitle}>Test and validate ML models</Text>
      </View>

      {/* Model Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Model Type to Test</Text>
        <View style={styles.modelTypeContainer}>
          <ModelTypeButton type="all" title="All Models" />
          <ModelTypeButton type="packaging" title="Packaging" />
          <ModelTypeButton type="pill" title="Pill" />
          <ModelTypeButton type="batchCode" title="Batch Code" />
          <ModelTypeButton type="fusion" title="Fusion" />
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        <TouchableOpacity 
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={handleRunTests}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="play" size={24} color="white" />
          )}
          <Text style={styles.testButtonText}>
            {isTesting ? 'Running Tests...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {/* Overall Score */}
          <View style={styles.overallScore}>
            <Text style={styles.overallScoreTitle}>Overall Score</Text>
            <Text style={styles.overallScoreValue}>
              {testResults.overallScore.toFixed(1)}%
            </Text>
            <Text style={styles.overallScoreDetails}>
              {testResults.passedTests}/{testResults.totalTests} tests passed
            </Text>
            <Text style={styles.overallScoreDuration}>
              Duration: {(testResults.duration / 1000).toFixed(1)}s
            </Text>
          </View>

          {/* Individual Test Results */}
          <View style={styles.testResultsContainer}>
            {testResults.tests.map((test, index) => (
              <TestResultItem key={index} test={test} />
            ))}
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.performanceGrid}>
            <PerformanceCard
              title="Inference Time"
              value={performanceMetrics.averageInferenceTime}
              unit="ms"
              icon="speedometer"
            />
            <PerformanceCard
              title="Memory Usage"
              value={performanceMetrics.memoryUsage}
              unit="MB"
              icon="hardware-chip"
            />
            <PerformanceCard
              title="Accuracy"
              value={performanceMetrics.accuracy * 100}
              unit="%"
              icon="checkmark-circle"
            />
            <PerformanceCard
              title="Precision"
              value={performanceMetrics.precision * 100}
              unit="%"
              icon="checkmark-circle"
            />
            <PerformanceCard
              title="Recall"
              value={performanceMetrics.recall * 100}
              unit="%"
              icon="refresh"
            />
            <PerformanceCard
              title="F1 Score"
              value={performanceMetrics.f1Score * 100}
              unit="%"
              icon="trending-up"
            />
          </View>
        </View>
      )}

      {/* Testing Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Guide</Text>
        <View style={styles.guideContainer}>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={styles.guideText}>Service Initialization - Tests if all services are ready</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={styles.guideText}>Model Loading - Verifies ML models are loaded</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={styles.guideText}>Inference Capability - Tests model inference</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={styles.guideText}>Performance Tests - Speed and memory usage</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={styles.guideText}>Integration Tests - End-to-end workflow</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  section: {
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
  modelTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  modelTypeButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  modelTypeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modelTypeButtonTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overallScore: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  overallScoreTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  overallScoreDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overallScoreDuration: {
    fontSize: 12,
    color: '#999',
  },
  testResultsContainer: {
    gap: 8,
  },
  testItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testPassed: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D32',
  },
  testFailed: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  testScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  testDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  guideContainer: {
    gap: 8,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});
