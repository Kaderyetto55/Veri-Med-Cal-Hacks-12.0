
import * as ImageManipulator from 'expo-image-manipulator';

export interface PreprocessingOptions {
  targetSize: { width: number; height: number };
  normalize: boolean;
  augment: boolean;
  imageType: 'packaging' | 'pill' | 'batch_code';
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  normalizedData?: number[][][]; // For ML model input
  metadata: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    preprocessingSteps: string[];
  };
}

class ImagePreprocessingService {
  // Standard image sizes for different model types
  private readonly STANDARD_SIZES = {
    packaging: { width: 800, height: 600 },
    pill: { width: 512, height: 512 },
    batch_code: { width: 400, height: 200 },
  };

  async preprocessImage(
    imageUri: string,
    options: PreprocessingOptions
  ): Promise<ProcessedImage> {
    try {
      const preprocessingSteps: string[] = [];
      let processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Get original size
      const originalSize = {
        width: processedImage.width,
        height: processedImage.height,
      };

      // Step 1: Resize to target size
      processedImage = await this.resizeImage(
        processedImage.uri,
        options.targetSize
      );
      preprocessingSteps.push('resize');

      // Step 2: Apply image type specific preprocessing
      processedImage = await this.applyTypeSpecificPreprocessing(
        processedImage.uri,
        options.imageType
      );
      preprocessingSteps.push('type_specific_processing');

      // Step 3: Normalize if requested
      let normalizedData: number[][][] | undefined;
      if (options.normalize) {
        normalizedData = await this.normalizeImage(processedImage.uri);
        preprocessingSteps.push('normalize');
      }

      // Step 4: Apply augmentation if requested
      if (options.augment) {
        processedImage = await this.applyAugmentation(processedImage.uri);
        preprocessingSteps.push('augmentation');
      }

      return {
        uri: processedImage.uri,
        width: processedImage.width,
        height: processedImage.height,
        normalizedData,
        metadata: {
          originalSize,
          processedSize: {
            width: processedImage.width,
            height: processedImage.height,
          },
          preprocessingSteps,
        },
      };
    } catch (error) {
      console.error('Failed to preprocess image:', error);
      throw error;
    }
  }

  private async resizeImage(
    imageUri: string,
    targetSize: { width: number; height: number }
  ): Promise<{ uri: string; width: number; height: number }> {
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: targetSize.width,
            height: targetSize.height,
          },
        },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  private async applyTypeSpecificPreprocessing(
    imageUri: string,
    imageType: 'packaging' | 'pill' | 'batch_code'
  ): Promise<{ uri: string; width: number; height: number }> {
    switch (imageType) {
      case 'packaging':
        return await this.preprocessPackagingImage(imageUri);
      case 'pill':
        return await this.preprocessPillImage(imageUri);
      case 'batch_code':
        return await this.preprocessBatchCodeImage(imageUri);
      default:
        throw new Error(`Unknown image type: ${imageType}`);
    }
  }

  private async preprocessPackagingImage(
    imageUri: string
  ): Promise<{ uri: string; width: number; height: number }> {
    // Enhance packaging images for text and logo recognition
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Enhance contrast for better text recognition
        { flip: ImageManipulator.FlipType.None },
        // Ensure consistent orientation
        { rotate: 0 },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  private async preprocessPillImage(
    imageUri: string
  ): Promise<{ uri: string; width: number; height: number }> {
    // Enhance pill images for shape and color recognition
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Enhance for shape recognition
        { flip: ImageManipulator.FlipType.None },
        { rotate: 0 },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  private async preprocessBatchCodeImage(
    imageUri: string
  ): Promise<{ uri: string; width: number; height: number }> {
    // Enhance batch code images for OCR
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Enhance for OCR
        { flip: ImageManipulator.FlipType.None },
        { rotate: 0 },
      ],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  private async normalizeImage(imageUri: string): Promise<number[][][]> {
    // Mock normalized array for demonstration
    // In a real implementation, this would use TensorFlow.js
    const mockNormalizedData: number[][][] = [];
    
    // Create a 3D array representing RGB channels
    for (let i = 0; i < 224; i++) {
      mockNormalizedData[i] = [];
      for (let j = 0; j < 224; j++) {
        mockNormalizedData[i][j] = [0.5, 0.5, 0.5]; // Normalized RGB values
      }
    }
    
    return mockNormalizedData;
  }

  private async applyAugmentation(
    imageUri: string
  ): Promise<{ uri: string; width: number; height: number }> {
    // Apply random augmentation for data diversity
    const augmentations = [
      { rotate: Math.random() * 20 - 10 }, // Random rotation -10 to +10 degrees
      { flip: Math.random() > 0.5 ? ImageManipulator.FlipType.Horizontal : ImageManipulator.FlipType.None },
    ];

    return await ImageManipulator.manipulateAsync(
      imageUri,
      augmentations,
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  // Batch preprocessing for multiple images
  async preprocessBatch(
    imageUris: string[],
    options: PreprocessingOptions
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    
    for (const imageUri of imageUris) {
      try {
        const processed = await this.preprocessImage(imageUri, options);
        results.push(processed);
      } catch (error) {
        console.error(`Failed to preprocess image ${imageUri}:`, error);
        // Continue with other images
      }
    }
    
    return results;
  }

  // Get standard size for image type
  getStandardSize(imageType: 'packaging' | 'pill' | 'batch_code'): {
    width: number;
    height: number;
  } {
    return this.STANDARD_SIZES[imageType];
  }

  // Create training dataset from collected images
  async createTrainingDataset(
    images: Array<{
      uri: string;
      isAuthentic: boolean;
      imageType: 'packaging' | 'pill' | 'batch_code';
    }>
  ): Promise<{
    features: number[][];
    labels: number[];
    metadata: Array<{
      uri: string;
      imageType: string;
      isAuthentic: boolean;
    }>;
  }> {
    const features: number[][] = [];
    const labels: number[] = [];
    const metadata: Array<{
      uri: string;
      imageType: string;
      isAuthentic: boolean;
    }> = [];

    for (const image of images) {
      try {
        const standardSize = this.getStandardSize(image.imageType);
        const processed = await this.preprocessImage(image.uri, {
          targetSize: standardSize,
          normalize: true,
          augment: false,
          imageType: image.imageType,
        });

        if (processed.normalizedData) {
          // Flatten the 3D array to 1D for ML model input
          const flattened = this.flattenImageData(processed.normalizedData);
          features.push(flattened);
          labels.push(image.isAuthentic ? 1 : 0);
          metadata.push({
            uri: image.uri,
            imageType: image.imageType,
            isAuthentic: image.isAuthentic,
          });
        }
      } catch (error) {
        console.error(`Failed to process image for training:`, error);
      }
    }

    return { features, labels, metadata };
  }

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

  // Quality assessment for collected images
  async assessImageQuality(imageUri: string): Promise<{
    score: number; // 1-10 scale
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
      );

      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 10;

      // Check image size
      if (imageInfo.width < 200 || imageInfo.height < 200) {
        issues.push('Image too small');
        recommendations.push('Use higher resolution camera');
        score -= 3;
      }

      // Check aspect ratio
      const aspectRatio = imageInfo.width / imageInfo.height;
      if (aspectRatio < 0.5 || aspectRatio > 2.0) {
        issues.push('Unusual aspect ratio');
        recommendations.push('Ensure proper framing');
        score -= 1;
      }

      // Additional quality checks would go here
      // (blur detection, lighting assessment, etc.)

      return {
        score: Math.max(1, score),
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Failed to assess image quality:', error);
      return {
        score: 1,
        issues: ['Failed to analyze image'],
        recommendations: ['Retake the image'],
      };
    }
  }
}

export const imagePreprocessingService = new ImagePreprocessingService();
