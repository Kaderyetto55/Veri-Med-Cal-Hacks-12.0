// TypeScript type definitions for VeriMed
// This module defines core types and interfaces used throughout the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export type UserRole = 'consumer' | 'healthcare_worker' | 'pharmacist';

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  batchCode: string;
  expiryDate: string;
  isAuthentic: boolean;
  confidence: number;
  detectedAt: Date;
}

export interface ScanResult {
  medicine: Medicine;
  isCounterfeit: boolean;
  confidence: number;
  analysisDetails: {
    packagingScore: number;
    pillScore: number;
    batchCodeScore: number;
    overallScore: number;
    processingTime?: number;
    modelVersions?: {
      packaging: string;
      pill: string;
      batchCode: string;
      fusion: string;
    };
  };
  recommendations: string[];
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  imageUri?: string;
}

export interface Report {
  id: string;
  userId: string;
  medicineId: string;
  reportType: 'counterfeit' | 'suspicious' | 'verified_authentic';
  description: string;
  evidence: string[];
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MLPrediction {
  isCounterfeit: boolean;
  confidence: number;
  packagingScore: number;
  pillScore: number;
  batchCodeScore: number;
  overallScore: number;
  reasoning: string[];
  recommendations: string[];
}

export interface ScanImage {
  id: string;
  uri: string;
  medicineName: string;
  manufacturer: string;
  batchCode: string;
  isAuthentic: boolean;
  imageType: 'packaging' | 'pill' | 'batch_code';
  quality: number;
  userRole: UserRole;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface DataCollectionStats {
  totalImages: number;
  authenticImages: number;
  counterfeitImages: number;
  packagingImages: number;
  pillImages: number;
  batchCodeImages: number;
  averageQuality: number;
  lastUpdated: Date;
}

export interface ModelVersion {
  id: string;
  modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion';
  version: string;
  accuracy: number;
  size: number;
  createdAt: Date;
  isActive: boolean;
  modelPath: string;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
}

export interface TrainingConfig {
  modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion';
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  dataAugmentation: boolean;
  earlyStopping: boolean;
  patience: number;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  status: 'training' | 'validation' | 'completed' | 'failed';
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  rocAuc: number;
  trainingTime: number;
  modelSize: number;
}

export interface InferenceConfig {
  confidenceThreshold: number;
  enableFusion: boolean;
  enablePackaging: boolean;
  enablePill: boolean;
  enableBatchCode: boolean;
  maxInferenceTime: number;
}

export interface InferenceResult {
  isCounterfeit: boolean;
  confidence: number;
  individualScores: {
    packaging: number;
    pill: number;
    batchCode: number;
  };
  fusionScore: number;
  reasoning: string[];
  processingTime: number;
  modelVersions: {
    packaging: string;
    pill: string;
    batchCode: string;
    fusion: string;
  };
}

export interface TestResult {
  testName: string;
  passed: boolean;
  score: number;
  details: string;
  duration: number;
  timestamp: Date;
}

export interface ModelTestSuite {
  modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion' | 'all';
  tests: TestResult[];
  overallScore: number;
  passedTests: number;
  totalTests: number;
  duration: number;
}

export interface PerformanceMetrics {
  averageInferenceTime: number;
  memoryUsage: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  errorRate: number;
  modelId?: string;
  inferenceTime?: number;
}