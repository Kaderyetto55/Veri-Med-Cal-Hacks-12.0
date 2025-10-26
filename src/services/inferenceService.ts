// Real-time Inference Service for VeriMed Phase 3
// This module handles on-device ML inference for counterfeit detection

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { modelDeploymentService } from './modelDeployment';
import { imagePreprocessingService } from '../utils/imagePreprocessing';
import { MLPrediction, ScanResult } from '../types';

export interface InferenceConfig {
  confidenceThreshold: number;
  enableFusion: boolean;
  enablePackaging: boolean;
  enablePill: boolean;
  enableBatchCode: boolean;
  maxInferenceTime: number; // milliseconds
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

class InferenceService {
  private isInitialized = false;
  private config: InferenceConfig = {
    confidenceThreshold: 0.7,
    enableFusion: true,
    enablePackaging: true,
    enablePill: true,
    enableBatchCode: true,
    maxInferenceTime: 5000, // 5 seconds
  };

  // Initialize the inference service
  async initialize(): Promise<void> {
    try {
      await modelDeploymentService.initialize();
      this.isInitialized = true;
      console.log('Inference service initialized');
    } catch (error) {
      console.error('Failed to initialize inference service:', error);
      throw error;
    }
  }

  // Run inference on a medicine image
  async analyzeMedicine(
    imageUri: string,
    imageType: 'packaging' | 'pill' | 'batch_code',
    medicineName?: string,
    manufacturer?: string,
    batchCode?: string
  ): Promise<InferenceResult> {
    if (!this.isInitialized) {
      throw new Error('Inference service not initialized');
    }

    const startTime = Date.now();
    const reasoning: string[] = [];
    const individualScores = {
      packaging: 0,
      pill: 0,
      batchCode: 0,
    };

    try {
      // Preprocess the image
      const processedImage = await this.preprocessImageForInference(imageUri, imageType);
      
      // Run individual model inferences
      const modelResults = await this.runIndividualModels(processedImage, imageType);
      
      // Extract individual scores
      if (modelResults.packaging !== null) {
        individualScores.packaging = modelResults.packaging;
        reasoning.push(`Packaging analysis: ${(modelResults.packaging * 100).toFixed(1)}% authentic`);
      }
      
      if (modelResults.pill !== null) {
        individualScores.pill = modelResults.pill;
        reasoning.push(`Pill recognition: ${(modelResults.pill * 100).toFixed(1)}% authentic`);
      }
      
      if (modelResults.batchCode !== null) {
        individualScores.batchCode = modelResults.batchCode;
        reasoning.push(`Batch code validation: ${(modelResults.batchCode * 100).toFixed(1)}% authentic`);
      }

      // Run fusion model if enabled
      let fusionScore = 0;
      if (this.config.enableFusion && (modelResults.packaging !== null || modelResults.pill !== null || modelResults.batchCode !== null)) {
        fusionScore = await this.runFusionModel(modelResults);
        reasoning.push(`Fusion analysis: ${(fusionScore * 100).toFixed(1)}% authentic`);
      }

      // Calculate final confidence
      const finalConfidence = this.calculateFinalConfidence(individualScores, fusionScore);
      const isCounterfeit = finalConfidence < this.config.confidenceThreshold;

      // Add final reasoning
      if (isCounterfeit) {
        reasoning.push(`⚠️ Medicine appears to be COUNTERFEIT (${(finalConfidence * 100).toFixed(1)}% confidence)`);
      } else {
        reasoning.push(`✅ Medicine appears to be AUTHENTIC (${(finalConfidence * 100).toFixed(1)}% confidence)`);
      }

      // Get model versions
      const modelVersions = await this.getModelVersions();

      const processingTime = Date.now() - startTime;

      return {
        isCounterfeit,
        confidence: finalConfidence,
        individualScores,
        fusionScore,
        reasoning,
        processingTime,
        modelVersions,
      };

    } catch (error) {
      console.error('Inference failed:', error);
      throw error;
    }
  }

  // Preprocess image for inference
  private async preprocessImageForInference(
    imageUri: string,
    imageType: 'packaging' | 'pill' | 'batch_code'
  ): Promise<any> {
    const standardSize = imagePreprocessingService.getStandardSize(imageType);
    
    return await imagePreprocessingService.preprocessImage(imageUri, {
      targetSize: standardSize,
      normalize: true,
      augment: false,
      imageType,
    });
  }

  // Run individual model inferences
  private async runIndividualModels(
    processedImage: any,
    imageType: 'packaging' | 'pill' | 'batch_code'
  ): Promise<{
    packaging: number | null;
    pill: number | null;
    batchCode: number | null;
  }> {
    const results = {
      packaging: null as number | null,
      pill: null as number | null,
      batchCode: null as number | null,
    };

    try {
      // Run packaging model
      if (this.config.enablePackaging && processedImage.normalizedData) {
        const packagingModel = await modelDeploymentService.getActiveModel('packaging');
        if (packagingModel) {
          const packagingInput = this.prepareModelInput(processedImage.normalizedData, 'packaging');
          const packagingPrediction = await modelDeploymentService.runInference('packaging', packagingInput);
          results.packaging = await this.extractConfidence(packagingPrediction);
        }
      }

      // Run pill model
      if (this.config.enablePill && processedImage.normalizedData) {
        const pillModel = await modelDeploymentService.getActiveModel('pill');
        if (pillModel) {
          const pillInput = this.prepareModelInput(processedImage.normalizedData, 'pill');
          const pillPrediction = await modelDeploymentService.runInference('pill', pillInput);
          results.pill = await this.extractConfidence(pillPrediction);
        }
      }

      // Run batch code model
      if (this.config.enableBatchCode && processedImage.normalizedData) {
        const batchCodeModel = await modelDeploymentService.getActiveModel('batchCode');
        if (batchCodeModel) {
          const batchCodeInput = this.prepareModelInput(processedImage.normalizedData, 'batchCode');
          const batchCodePrediction = await modelDeploymentService.runInference('batchCode', batchCodeInput);
          results.batchCode = await this.extractConfidence(batchCodePrediction);
        }
      }

    } catch (error) {
      console.error('Individual model inference failed:', error);
    }

    return results;
  }

  // Run fusion model
  private async runFusionModel(individualResults: {
    packaging: number | null;
    pill: number | null;
    batchCode: number | null;
  }): Promise<number> {
    try {
      const fusionModel = await modelDeploymentService.getActiveModel('fusion');
      if (!fusionModel) {
        throw new Error('Fusion model not available');
      }

      // Prepare fusion input (3 scores)
      const fusionInput = tf.tensor2d([[
        individualResults.packaging || 0.5,
        individualResults.pill || 0.5,
        individualResults.batchCode || 0.5,
      ]]);

      const fusionPrediction = await modelDeploymentService.runInference('fusion', fusionInput);
      return await this.extractConfidence(fusionPrediction);

    } catch (error) {
      console.error('Fusion model inference failed:', error);
      return 0.5; // Default neutral score
    }
  }

  // Prepare model input tensor
  private prepareModelInput(normalizedData: number[][][], modelType: string): tf.Tensor {
    // Flatten the 3D array to 1D
    const flattened = this.flattenImageData(normalizedData);
    
    // Reshape based on model type
    switch (modelType) {
      case 'packaging':
        return tf.tensor4d(flattened, [1, 800, 600, 3]);
      case 'pill':
        return tf.tensor4d(flattened, [1, 512, 512, 3]);
      case 'batchCode':
        return tf.tensor4d(flattened, [1, 400, 200, 3]);
      default:
        return tf.tensor2d([flattened]);
    }
  }

  // Flatten image data
  private flattenImageData(imageData: number[][][]): number[] {
    const flattened: number[] = [];
    for (let i = 0; i < imageData.length; i++) {
      for (let j = 0; j < imageData[i].length; j++) {
        for (let k = 0; k < imageData[i][j].length; k++) {
          flattened.push(imageData[i][j][k]);
        }
      }
    }
    return flattened;
  }

  // Extract confidence score from prediction
  private async extractConfidence(prediction: tf.Tensor): Promise<number> {
    const data = await prediction.data();
    return data[0]; // Assuming single output
  }

  // Calculate final confidence score
  private calculateFinalConfidence(
    individualScores: { packaging: number; pill: number; batchCode: number },
    fusionScore: number
  ): number {
    if (fusionScore > 0) {
      // Use fusion score as primary
      return fusionScore;
    }

    // Weighted average of individual scores
    const scores = [];
    const weights = [];

    if (individualScores.packaging > 0) {
      scores.push(individualScores.packaging);
      weights.push(0.4); // Packaging is most important
    }

    if (individualScores.pill > 0) {
      scores.push(individualScores.pill);
      weights.push(0.3); // Pill recognition is important
    }

    if (individualScores.batchCode > 0) {
      scores.push(individualScores.batchCode);
      weights.push(0.3); // Batch code validation is important
    }

    if (scores.length === 0) {
      return 0.5; // Default neutral score
    }

    // Calculate weighted average
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < scores.length; i++) {
      weightedSum += scores[i] * weights[i];
      totalWeight += weights[i];
    }

    return weightedSum / totalWeight;
  }

  // Get model versions
  private async getModelVersions(): Promise<{
    packaging: string;
    pill: string;
    batchCode: string;
    fusion: string;
  }> {
    const versions = {
      packaging: 'N/A',
      pill: 'N/A',
      batchCode: 'N/A',
      fusion: 'N/A',
    };

    try {
      const packagingVersion = modelDeploymentService.getActiveModelVersion('packaging');
      if (packagingVersion) versions.packaging = packagingVersion.version;

      const pillVersion = modelDeploymentService.getActiveModelVersion('pill');
      if (pillVersion) versions.pill = pillVersion.version;

      const batchCodeVersion = modelDeploymentService.getActiveModelVersion('batchCode');
      if (batchCodeVersion) versions.batchCode = batchCodeVersion.version;

      const fusionVersion = modelDeploymentService.getActiveModelVersion('fusion');
      if (fusionVersion) versions.fusion = fusionVersion.version;

    } catch (error) {
      console.error('Failed to get model versions:', error);
    }

    return versions;
  }

  // Update inference configuration
  updateConfig(newConfig: Partial<InferenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): InferenceConfig {
    return { ...this.config };
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized;
  }

  // Get service status
  async getStatus(): Promise<{
    isReady: boolean;
    modelsLoaded: {
      packaging: boolean;
      pill: boolean;
      batchCode: boolean;
      fusion: boolean;
    };
    config: InferenceConfig;
  }> {
    const modelsLoaded = {
      packaging: false,
      pill: false,
      batchCode: false,
      fusion: false,
    };

    try {
      modelsLoaded.packaging = !!(await modelDeploymentService.getActiveModel('packaging'));
      modelsLoaded.pill = !!(await modelDeploymentService.getActiveModel('pill'));
      modelsLoaded.batchCode = !!(await modelDeploymentService.getActiveModel('batchCode'));
      modelsLoaded.fusion = !!(await modelDeploymentService.getActiveModel('fusion'));
    } catch (error) {
      console.error('Failed to check model status:', error);
    }

    return {
      isReady: this.isInitialized,
      modelsLoaded,
      config: this.config,
    };
  }

  // Test inference with mock data
  async testInference(): Promise<InferenceResult> {
    const mockImageUri = 'mock://test/image';
    
    return await this.analyzeMedicine(
      mockImageUri,
      'packaging',
      'Test Medicine',
      'Test Manufacturer',
      'TEST123'
    );
  }
}

export const inferenceService = new InferenceService();
