
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export interface ModelConfig {
  name: string;
  inputShape: [number, number, number];
  numClasses: number;
  learningRate: number;
  batchSize: number;
  epochs: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  validationAccuracy: number;
}

export interface ModelPrediction {
  isCounterfeit: boolean;
  confidence: number;
  packagingScore: number;
  pillScore: number;
  batchCodeScore: number;
  overallScore: number;
  reasoning: string[];
}

class VeriMedModelArchitecture {
  private packagingModel: tf.LayersModel | null = null;
  private pillModel: tf.LayersModel | null = null;
  private batchCodeModel: tf.LayersModel | null = null;
  private fusionModel: tf.LayersModel | null = null;

  // Model configurations
  private readonly MODEL_CONFIGS = {
    packaging: {
      name: 'PackagingDetector',
      inputShape: [800, 600, 3] as [number, number, number],
      numClasses: 2,
      learningRate: 0.001,
      batchSize: 16,
      epochs: 50,
    },
    pill: {
      name: 'PillRecognizer',
      inputShape: [512, 512, 3] as [number, number, number],
      numClasses: 2,
      learningRate: 0.001,
      batchSize: 32,
      epochs: 50,
    },
    batchCode: {
      name: 'BatchCodeValidator',
      inputShape: [400, 200, 3] as [number, number, number],
      numClasses: 2,
      learningRate: 0.001,
      batchSize: 64,
      epochs: 30,
    },
    fusion: {
      name: 'FusionNetwork',
      inputShape: [3] as [number, number, number], // 3 scores from other models
      numClasses: 2,
      learningRate: 0.0005,
      batchSize: 32,
      epochs: 20,
    },
  };

  // Create Packaging Analysis CNN
  createPackagingModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.inputLayer({ inputShape: this.MODEL_CONFIGS.packaging.inputShape }),
        
        // Convolutional layers for feature extraction
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv1'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv3'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Text recognition specific layers
        tf.layers.conv2d({
          filters: 256,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'text_conv'
        }),
        tf.layers.globalAveragePooling2d(),
        
        // Dense layers for classification
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ]
    });

    model.compile({
      optimizer: tf.train.adam(this.MODEL_CONFIGS.packaging.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  // Create Pill Recognition CNN
  createPillModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.inputLayer({ inputShape: this.MODEL_CONFIGS.pill.inputShape }),
        
        // Convolutional layers for shape and color recognition
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 5,
          activation: 'relu',
          padding: 'same',
          name: 'conv1'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 5,
          activation: 'relu',
          padding: 'same',
          name: 'conv2'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv3'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Shape recognition specific layers
        tf.layers.conv2d({
          filters: 256,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'shape_conv'
        }),
        tf.layers.globalAveragePooling2d(),
        
        // Dense layers
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ]
    });

    model.compile({
      optimizer: tf.train.adam(this.MODEL_CONFIGS.pill.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  // Create Batch Code Validation CNN
  createBatchCodeModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.inputLayer({ inputShape: this.MODEL_CONFIGS.batchCode.inputShape }),
        
        // Convolutional layers for OCR
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv1'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // OCR specific layers
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'ocr_conv'
        }),
        tf.layers.globalAveragePooling2d(),
        
        // Dense layers
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ]
    });

    model.compile({
      optimizer: tf.train.adam(this.MODEL_CONFIGS.batchCode.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  // Create Fusion Network
  createFusionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer (3 scores from other models)
        tf.layers.inputLayer({ inputShape: this.MODEL_CONFIGS.fusion.inputShape }),
        
        // Dense layers for fusion
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ]
    });

    model.compile({
      optimizer: tf.train.adam(this.MODEL_CONFIGS.fusion.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  // Initialize all models
  async initializeModels(): Promise<void> {
    try {
      console.log('Initializing VeriMed models...');
      
      this.packagingModel = this.createPackagingModel();
      this.pillModel = this.createPillModel();
      this.batchCodeModel = this.createBatchCodeModel();
      this.fusionModel = this.createFusionModel();
      
      console.log('All models initialized successfully');
    } catch (error) {
      console.error('Failed to initialize models:', error);
      throw error;
    }
  }

  // Get model summary
  getModelSummary(modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion'): string {
    const model = this.getModel(modelType);
    if (!model) return 'Model not initialized';
    
    return model.summary();
  }

  private getModel(modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion'): tf.LayersModel | null {
    switch (modelType) {
      case 'packaging': return this.packagingModel;
      case 'pill': return this.pillModel;
      case 'batchCode': return this.batchCodeModel;
      case 'fusion': return this.fusionModel;
      default: return null;
    }
  }

  // Get model configuration
  getModelConfig(modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion'): ModelConfig {
    switch (modelType) {
      case 'packaging': return this.MODEL_CONFIGS.packaging;
      case 'pill': return this.MODEL_CONFIGS.pill;
      case 'batchCode': return this.MODEL_CONFIGS.batchCode;
      case 'fusion': return this.MODEL_CONFIGS.fusion;
      default: throw new Error(`Unknown model type: ${modelType}`);
    }
  }

  // Get total parameters count
  getTotalParameters(): number {
    let totalParams = 0;
    
    if (this.packagingModel) {
      totalParams += this.packagingModel.countParams();
    }
    if (this.pillModel) {
      totalParams += this.pillModel.countParams();
    }
    if (this.batchCodeModel) {
      totalParams += this.batchCodeModel.countParams();
    }
    if (this.fusionModel) {
      totalParams += this.fusionModel.countParams();
    }
    
    return totalParams;
  }

  // Get model sizes (for mobile deployment)
  getModelSizes(): { [key: string]: number } {
    return {
      packaging: this.packagingModel ? this.packagingModel.countParams() * 4 : 0, // 4 bytes per float32
      pill: this.pillModel ? this.pillModel.countParams() * 4 : 0,
      batchCode: this.batchCodeModel ? this.batchCodeModel.countParams() * 4 : 0,
      fusion: this.fusionModel ? this.fusionModel.countParams() * 4 : 0,
    };
  }

  // Cleanup models
  dispose(): void {
    if (this.packagingModel) {
      this.packagingModel.dispose();
      this.packagingModel = null;
    }
    if (this.pillModel) {
      this.pillModel.dispose();
      this.pillModel = null;
    }
    if (this.batchCodeModel) {
      this.batchCodeModel.dispose();
      this.batchCodeModel = null;
    }
    if (this.fusionModel) {
      this.fusionModel.dispose();
      this.fusionModel = null;
    }
  }
}

export const modelArchitecture = new VeriMedModelArchitecture();