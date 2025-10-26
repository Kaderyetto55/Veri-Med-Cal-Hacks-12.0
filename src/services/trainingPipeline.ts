
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { dataCollectionService } from './dataCollectionService';
import { modelArchitecture } from './modelArchitecture';
import { imagePreprocessingService } from '../utils/imagePreprocessing';
import { TrainingConfig, TrainingProgress, ModelMetrics } from '../types';

export interface TrainingResult {
  model: tf.LayersModel;
  metrics: ModelMetrics;
  trainingHistory: any;
  modelPath: string;
  config: TrainingConfig;
}

class TrainingPipeline {
  private isTraining = false;
  private trainingProgress: TrainingProgress | null = null;
  private trainingCallbacks: ((progress: TrainingProgress) => void)[] = [];

  // Default training configurations
  private readonly DEFAULT_CONFIGS: { [key: string]: TrainingConfig } = {
    packaging: {
      modelType: 'packaging',
      epochs: 50,
      batchSize: 16,
      learningRate: 0.001,
      validationSplit: 0.2,
      dataAugmentation: true,
      earlyStopping: true,
      patience: 10,
    },
    pill: {
      modelType: 'pill',
      epochs: 50,
      batchSize: 32,
      learningRate: 0.001,
      validationSplit: 0.2,
      dataAugmentation: true,
      earlyStopping: true,
      patience: 10,
    },
    batchCode: {
      modelType: 'batchCode',
      epochs: 30,
      batchSize: 64,
      learningRate: 0.001,
      validationSplit: 0.2,
      dataAugmentation: false,
      earlyStopping: true,
      patience: 5,
    },
    fusion: {
      modelType: 'fusion',
      epochs: 20,
      batchSize: 32,
      learningRate: 0.0005,
      validationSplit: 0.2,
      dataAugmentation: false,
      earlyStopping: true,
      patience: 5,
    },
  };

  // Initialize training pipeline
  async initialize(): Promise<void> {
    try {
      await modelArchitecture.initializeModels();
      console.log('Training pipeline initialized');
    } catch (error) {
      console.error('Failed to initialize training pipeline:', error);
      throw error;
    }
  }

  // Train a specific model
  async trainModel(
    modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion',
    config?: Partial<TrainingConfig>
  ): Promise<TrainingResult> {
    if (this.isTraining) {
      throw new Error('Training already in progress');
    }

    this.isTraining = true;
    const startTime = Date.now();

    try {
      // Merge config with defaults
      const trainingConfig = { ...this.DEFAULT_CONFIGS[modelType], ...config };
      
      // Get training data
      const trainingData = await this.prepareTrainingData(modelType);
      
      // Get model
      const model = this.getModel(modelType);
      if (!model) {
        throw new Error(`Model ${modelType} not initialized`);
      }

      // Prepare callbacks
      const callbacks = this.createTrainingCallbacks(trainingConfig);

      // Train model
      console.log(`Starting training for ${modelType} model...`);
      const history = await model.fit(
        trainingData.features,
        trainingData.labels,
        {
          epochs: trainingConfig.epochs,
          batchSize: trainingConfig.batchSize,
          validationSplit: trainingConfig.validationSplit,
          callbacks,
          verbose: 1,
        }
      );

      // Evaluate model
      const metrics = await this.evaluateModel(model, trainingData);
      
      // Save model
      const modelPath = await this.saveModel(model, modelType);

      const result: TrainingResult = {
        model,
        metrics: {
          ...metrics,
          trainingTime: Date.now() - startTime,
          modelSize: model.countParams() * 4, // 4 bytes per float32
        },
        trainingHistory: history,
        modelPath,
        config: trainingConfig,
      };

      console.log(`Training completed for ${modelType} model`);
      return result;

    } catch (error) {
      console.error(`Training failed for ${modelType} model:`, error);
      throw error;
    } finally {
      this.isTraining = false;
      this.trainingProgress = null;
    }
  }

  // Prepare training data for a specific model
  private async prepareTrainingData(
    modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion'
  ): Promise<{
    features: tf.Tensor;
    labels: tf.Tensor;
    metadata: any[];
  }> {
    try {
      // Get collected images
      const images = await dataCollectionService.getAllImages();
      
      // Filter images by type
      const filteredImages = images.filter(img => {
        if (modelType === 'fusion') return true; // Fusion uses all types
        return img.imageType === modelType;
      });

      if (filteredImages.length === 0) {
        throw new Error(`No training data found for ${modelType} model`);
      }

      // Prepare features and labels
      const features: number[][] = [];
      const labels: number[] = [];
      const metadata: any[] = [];

      for (const image of filteredImages) {
        try {
          // Preprocess image
          const processed = await imagePreprocessingService.preprocessImage(
            image.uri,
            {
              targetSize: this.getInputSize(modelType),
              normalize: true,
              augment: false,
              imageType: image.imageType,
            }
          );

          if (processed.normalizedData) {
            // Flatten image data
            const flattened = this.flattenImageData(processed.normalizedData);
            features.push(flattened);
            labels.push(image.isAuthentic ? 1 : 0);
            metadata.push({
              id: image.id,
              medicineName: image.medicineName,
              manufacturer: image.manufacturer,
              isAuthentic: image.isAuthentic,
            });
          }
        } catch (error) {
          console.error(`Failed to process image ${image.id}:`, error);
        }
      }

      if (features.length === 0) {
        throw new Error(`No valid features extracted for ${modelType} model`);
      }

      // Convert to tensors
      const featuresTensor = tf.tensor2d(features);
      const labelsTensor = tf.tensor1d(labels);

      return { features: featuresTensor, labels: labelsTensor, metadata };
    } catch (error) {
      console.error('Failed to prepare training data:', error);
      throw error;
    }
  }

  // Get model by type
  private getModel(modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion'): tf.LayersModel | null {
    switch (modelType) {
      case 'packaging': return modelArchitecture['packagingModel'];
      case 'pill': return modelArchitecture['pillModel'];
      case 'batchCode': return modelArchitecture['batchCodeModel'];
      case 'fusion': return modelArchitecture['fusionModel'];
      default: return null;
    }
  }

  // Get input size for model type
  private getInputSize(modelType: string): { width: number; height: number } {
    switch (modelType) {
      case 'packaging': return { width: 800, height: 600 };
      case 'pill': return { width: 512, height: 512 };
      case 'batchCode': return { width: 400, height: 200 };
      case 'fusion': return { width: 3, height: 1 }; // 3 scores
      default: return { width: 224, height: 224 };
    }
  }

  // Flatten image data for model input
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

  // Create training callbacks
  private createTrainingCallbacks(config: TrainingConfig): tf.Callback[] {
    const callbacks: tf.Callback[] = [];

    // Progress callback
    callbacks.push({
      onEpochEnd: async (epoch, logs) => {
        const progress: TrainingProgress = {
          epoch: epoch + 1,
          totalEpochs: config.epochs,
          loss: logs?.loss || 0,
          accuracy: logs?.acc || 0,
          validationLoss: logs?.val_loss || 0,
          validationAccuracy: logs?.val_acc || 0,
          status: 'training',
        };
        
        this.trainingProgress = progress;
        this.notifyProgress(progress);
      },
    });

    // Early stopping
    if (config.earlyStopping) {
      callbacks.push(tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: config.patience,
        restoreBestWeights: true,
      }));
    }

    // Learning rate reduction
    callbacks.push(tf.callbacks.reduceLROnPlateau({
      monitor: 'val_loss',
      factor: 0.5,
      patience: Math.floor(config.patience / 2),
      minLr: 0.0001,
    }));

    return callbacks;
  }

  // Evaluate model performance
  private async evaluateModel(
    model: tf.LayersModel,
    testData: { features: tf.Tensor; labels: tf.Tensor }
  ): Promise<ModelMetrics> {
    try {
      // Make predictions
      const predictions = model.predict(testData.features) as tf.Tensor;
      const predictedClasses = predictions.argMax(-1);
      const trueClasses = testData.labels;

      // Calculate metrics
      const accuracy = await this.calculateAccuracy(predictedClasses, trueClasses);
      const precision = await this.calculatePrecision(predictedClasses, trueClasses);
      const recall = await this.calculateRecall(predictedClasses, trueClasses);
      const f1Score = (2 * precision * recall) / (precision + recall);
      const confusionMatrix = await this.calculateConfusionMatrix(predictedClasses, trueClasses);
      const rocAuc = await this.calculateRocAuc(predictions, trueClasses);

      return {
        accuracy,
        precision,
        recall,
        f1Score,
        confusionMatrix,
        rocAuc,
        trainingTime: 0, // Will be set by caller
        modelSize: model.countParams() * 4,
      };
    } catch (error) {
      console.error('Failed to evaluate model:', error);
      throw error;
    }
  }

  // Calculate accuracy
  private async calculateAccuracy(predicted: tf.Tensor, trueLabels: tf.Tensor): Promise<number> {
    const correct = tf.equal(predicted, trueLabels).sum();
    const total = predicted.shape[0];
    const accuracy = await correct.data();
    return accuracy[0] / total;
  }

  // Calculate precision
  private async calculatePrecision(predicted: tf.Tensor, trueLabels: tf.Tensor): Promise<number> {
    const truePositives = tf.logicalAnd(tf.equal(predicted, 1), tf.equal(trueLabels, 1)).sum();
    const falsePositives = tf.logicalAnd(tf.equal(predicted, 1), tf.equal(trueLabels, 0)).sum();
    
    const tp = await truePositives.data();
    const fp = await falsePositives.data();
    
    return tp[0] / (tp[0] + fp[0]);
  }

  // Calculate recall
  private async calculateRecall(predicted: tf.Tensor, trueLabels: tf.Tensor): Promise<number> {
    const truePositives = tf.logicalAnd(tf.equal(predicted, 1), tf.equal(trueLabels, 1)).sum();
    const falseNegatives = tf.logicalAnd(tf.equal(predicted, 0), tf.equal(trueLabels, 1)).sum();
    
    const tp = await truePositives.data();
    const fn = await falseNegatives.data();
    
    return tp[0] / (tp[0] + fn[0]);
  }

  // Calculate confusion matrix
  private async calculateConfusionMatrix(predicted: tf.Tensor, trueLabels: tf.Tensor): Promise<number[][]> {
    const tp = tf.logicalAnd(tf.equal(predicted, 1), tf.equal(trueLabels, 1)).sum();
    const fp = tf.logicalAnd(tf.equal(predicted, 1), tf.equal(trueLabels, 0)).sum();
    const fn = tf.logicalAnd(tf.equal(predicted, 0), tf.equal(trueLabels, 1)).sum();
    const tn = tf.logicalAnd(tf.equal(predicted, 0), tf.equal(trueLabels, 0)).sum();

    const tpVal = await tp.data();
    const fpVal = await fp.data();
    const fnVal = await fn.data();
    const tnVal = await tn.data();

    return [
      [tnVal[0], fpVal[0]],
      [fnVal[0], tpVal[0]],
    ];
  }

  // Calculate ROC AUC
  private async calculateRocAuc(predictions: tf.Tensor, trueLabels: tf.Tensor): Promise<number> {
    // Simplified ROC AUC calculation
    // In a real implementation, you'd use a proper ROC AUC calculation
    const predData = await predictions.data();
    const trueData = await trueLabels.data();
    
    let auc = 0;
    const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    
    for (const threshold of thresholds) {
      const tp = predData.filter((p, i) => p >= threshold && trueData[i] === 1).length;
      const fp = predData.filter((p, i) => p >= threshold && trueData[i] === 0).length;
      const fn = predData.filter((p, i) => p < threshold && trueData[i] === 1).length;
      const tn = predData.filter((p, i) => p < threshold && trueData[i] === 0).length;
      
      const tpr = tp / (tp + fn);
      const fpr = fp / (fp + tn);
      auc += tpr * (1 - fpr);
    }
    
    return auc / thresholds.length;
  }

  // Save trained model
  private async saveModel(model: tf.LayersModel, modelType: string): Promise<string> {
    try {
      const modelPath = `file://models/${modelType}_model.json`;
      await model.save(modelPath);
      console.log(`Model saved to ${modelPath}`);
      return modelPath;
    } catch (error) {
      console.error('Failed to save model:', error);
      throw error;
    }
  }

  // Convert model to TensorFlow Lite
  async convertToTensorFlowLite(model: tf.LayersModel, modelType: string): Promise<ArrayBuffer> {
    try {
      const converter = tf.lite.TFLiteConverter.fromKerasModel(model);
      converter.optimizations = [tf.lite.Optimize.DEFAULT];
      converter.targetSpec.supportedTypes = [tf.lite.TensorType.FLOAT16];
      
      const tfliteModel = converter.convert();
      console.log(`Model converted to TensorFlow Lite: ${modelType}`);
      return tfliteModel;
    } catch (error) {
      console.error('Failed to convert model to TensorFlow Lite:', error);
      throw error;
    }
  }

  // Train all models
  async trainAllModels(): Promise<{ [key: string]: TrainingResult }> {
    const results: { [key: string]: TrainingResult } = {};
    
    const modelTypes: ('packaging' | 'pill' | 'batchCode' | 'fusion')[] = 
      ['packaging', 'pill', 'batchCode', 'fusion'];
    
    for (const modelType of modelTypes) {
      try {
        console.log(`Training ${modelType} model...`);
        const result = await this.trainModel(modelType);
        results[modelType] = result;
        console.log(`${modelType} model training completed`);
      } catch (error) {
        console.error(`Failed to train ${modelType} model:`, error);
        throw error;
      }
    }
    
    return results;
  }

  // Get training progress
  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress;
  }

  // Subscribe to training progress
  onTrainingProgress(callback: (progress: TrainingProgress) => void): void {
    this.trainingCallbacks.push(callback);
  }

  // Notify progress subscribers
  private notifyProgress(progress: TrainingProgress): void {
    this.trainingCallbacks.forEach(callback => callback(progress));
  }

  // Check if training is in progress
  isTrainingInProgress(): boolean {
    return this.isTraining;
  }

  // Get training statistics
  async getTrainingStats(): Promise<{
    totalImages: number;
    modelTypes: string[];
    lastTraining: Date | null;
  }> {
    try {
      const stats = await dataCollectionService.getStats();
      return {
        totalImages: stats.totalImages,
        modelTypes: ['packaging', 'pill', 'batchCode', 'fusion'],
        lastTraining: null, // Would be stored in a database
      };
    } catch (error) {
      console.error('Failed to get training stats:', error);
      throw error;
    }
  }
}

export const trainingPipeline = new TrainingPipeline();
