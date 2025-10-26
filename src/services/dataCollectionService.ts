
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';
import { ScanImage, DataCollectionStats } from '../types';

export interface MedicineImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  medicineName: string;
  manufacturer: string;
  batchCode: string;
  isAuthentic: boolean;
  imageType: 'packaging' | 'pill' | 'batch_code';
  quality: number; // 1-10 scale
  metadata: {
    timestamp: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    userRole: 'consumer' | 'healthcare_worker' | 'pharmacist';
    deviceInfo: string;
  };
}

// DataCollectionStats is now imported from types

class DataCollectionService {
  private collectionDir = `${FileSystem.cacheDirectory}medicine_data/`;
  private stats: DataCollectionStats = {
    totalImages: 0,
    authenticImages: 0,
    counterfeitImages: 0,
    packagingImages: 0,
    pillImages: 0,
    batchCodeImages: 0,
    averageQuality: 0,
    lastUpdated: new Date(),
  };

  async initialize(): Promise<void> {
    try {
      // Create data collection directory
      const dirInfo = await FileSystem.getInfoAsync(this.collectionDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.collectionDir, { intermediates: true });
      }

      // Create subdirectories for different image types
      const subdirs = ['packaging', 'pills', 'batch_codes', 'authentic', 'counterfeit'];
      for (const subdir of subdirs) {
        const subdirPath = `${this.collectionDir}${subdir}/`;
        const subdirInfo = await FileSystem.getInfoAsync(subdirPath);
        if (!subdirInfo.exists) {
          await FileSystem.makeDirectoryAsync(subdirPath, { intermediates: true });
        }
      }

      await this.loadStats();
      console.log('Data collection service initialized');
    } catch (error) {
      console.error('Failed to initialize data collection service:', error);
      throw error;
    }
  }

  async collectMedicineImage(
    imageUri: string,
    medicineName: string,
    manufacturer: string,
    batchCode: string,
    isAuthentic: boolean,
    imageType: 'packaging' | 'pill' | 'batch_code',
    quality: number,
    userRole: 'consumer' | 'healthcare_worker' | 'pharmacist',
    location?: { latitude: number; longitude: number }
  ): Promise<MedicineImage> {
    try {
      // Generate unique ID
      const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Process and optimize image
      const processedImage = await this.processImage(imageUri, imageType);
      
      // Create medicine image object
      const medicineImage: MedicineImage = {
        id,
        uri: processedImage.uri,
        width: processedImage.width,
        height: processedImage.height,
        medicineName,
        manufacturer,
        batchCode,
        isAuthentic,
        imageType,
        quality,
        metadata: {
          timestamp: new Date(),
          location,
          userRole,
          deviceInfo: await this.getDeviceInfo(),
        },
      };

      // Save image and metadata
      await this.saveMedicineImage(medicineImage);
      
      // Update statistics
      await this.updateStats(medicineImage);
      
      return medicineImage;
    } catch (error) {
      console.error('Failed to collect medicine image:', error);
      throw error;
    }
  }

  private async processImage(
    imageUri: string, 
    imageType: 'packaging' | 'pill' | 'batch_code'
  ): Promise<{ uri: string; width: number; height: number }> {
    try {
      // Get image info
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024, height: 1024 } }, // Standardize size
          { crop: { originX: 0, originY: 0, width: 1024, height: 1024 } },
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false 
        }
      );

      // Apply image type specific processing
      let processedImage = imageInfo;
      
      if (imageType === 'packaging') {
        // Enhance packaging images for text recognition
        processedImage = await ImageManipulator.manipulateAsync(
          imageInfo.uri,
          [
            { resize: { width: 800, height: 600 } },
          ],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
      } else if (imageType === 'pill') {
        // Enhance pill images for shape/color recognition
        processedImage = await ImageManipulator.manipulateAsync(
          imageInfo.uri,
          [
            { resize: { width: 512, height: 512 } },
          ],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
      } else if (imageType === 'batch_code') {
        // Enhance batch code images for OCR
        processedImage = await ImageManipulator.manipulateAsync(
          imageInfo.uri,
          [
            { resize: { width: 400, height: 200 } },
          ],
          { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
        );
      }

      return {
        uri: processedImage.uri,
        width: processedImage.width,
        height: processedImage.height,
      };
    } catch (error) {
      console.error('Failed to process image:', error);
      throw error;
    }
  }

  private async saveMedicineImage(medicineImage: MedicineImage): Promise<void> {
    try {
      // Determine save directory based on authenticity and type
      const authenticityDir = medicineImage.isAuthentic ? 'authentic' : 'counterfeit';
      const typeDir = medicineImage.imageType === 'batch_code' ? 'batch_codes' : 
                     medicineImage.imageType === 'pill' ? 'pills' : 'packaging';
      
      const saveDir = `${this.collectionDir}${authenticityDir}/${typeDir}/`;
      
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(saveDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(saveDir, { intermediates: true });
      }

      // Copy image to collection directory
      const fileName = `${medicineImage.id}.jpg`;
      const destinationUri = `${saveDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: medicineImage.uri,
        to: destinationUri,
      });

      // Save metadata as JSON
      const metadataUri = `${saveDir}${medicineImage.id}.json`;
      const metadata = {
        ...medicineImage,
        uri: destinationUri, // Update URI to local path
      };
      
      await FileSystem.writeAsStringAsync(
        metadataUri,
        JSON.stringify(metadata, null, 2)
      );

      console.log(`Saved medicine image: ${fileName}`);
    } catch (error) {
      console.error('Failed to save medicine image:', error);
      throw error;
    }
  }

  private async updateStats(medicineImage: MedicineImage): Promise<void> {
    this.stats.totalImages++;
    
    if (medicineImage.isAuthentic) {
      this.stats.authenticImages++;
    } else {
      this.stats.counterfeitImages++;
    }

    switch (medicineImage.imageType) {
      case 'packaging':
        this.stats.packagingImages++;
        break;
      case 'pill':
        this.stats.pillImages++;
        break;
      case 'batch_code':
        this.stats.batchCodeImages++;
        break;
    }

    // Update average quality
    this.stats.averageQuality = 
      (this.stats.averageQuality * (this.stats.totalImages - 1) + medicineImage.quality) / 
      this.stats.totalImages;

    this.stats.lastUpdated = new Date();

    // Save stats to file
    await this.saveStats();
  }

  private async loadStats(): Promise<void> {
    try {
      const statsUri = `${this.collectionDir}stats.json`;
      const statsInfo = await FileSystem.getInfoAsync(statsUri);
      
      if (statsInfo.exists) {
        const statsData = await FileSystem.readAsStringAsync(statsUri);
        this.stats = { ...this.stats, ...JSON.parse(statsData) };
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  private async saveStats(): Promise<void> {
    try {
      const statsUri = `${this.collectionDir}stats.json`;
      await FileSystem.writeAsStringAsync(
        statsUri,
        JSON.stringify(this.stats, null, 2)
      );
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  private async getDeviceInfo(): Promise<string> {
    // Get basic device information
    return `React Native - ${Platform.OS} ${Platform.Version}`;
  }

  // Public methods for data access
  async getStats(): Promise<DataCollectionStats> {
    return { ...this.stats };
  }

  async getAllImages(): Promise<MedicineImage[]> {
    try {
      const images: MedicineImage[] = [];
      
      // Load from authentic directory
      const authenticDir = `${this.collectionDir}authentic/`;
      const authenticImages = await this.loadImagesFromDirectory(authenticDir);
      images.push(...authenticImages);

      // Load from counterfeit directory
      const counterfeitDir = `${this.collectionDir}counterfeit/`;
      const counterfeitImages = await this.loadImagesFromDirectory(counterfeitDir);
      images.push(...counterfeitImages);

      return images;
    } catch (error) {
      console.error('Failed to get all images:', error);
      return [];
    }
  }

  private async loadImagesFromDirectory(directory: string): Promise<MedicineImage[]> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) return [];

      const files = await FileSystem.readDirectoryAsync(directory);
      const images: MedicineImage[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const metadataUri = `${directory}${file}`;
          const metadataData = await FileSystem.readAsStringAsync(metadataUri);
          const metadata = JSON.parse(metadataData);
          images.push(metadata);
        }
      }

      return images;
    } catch (error) {
      console.error('Failed to load images from directory:', error);
      return [];
    }
  }

  async exportDataForTraining(): Promise<{
    images: MedicineImage[];
    stats: DataCollectionStats;
    exportDate: Date;
  }> {
    try {
      const images = await this.getAllImages();
      const stats = await this.getStats();
      
      return {
        images,
        stats,
        exportDate: new Date(),
      };
    } catch (error) {
      console.error('Failed to export data for training:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all collected medicine images. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await FileSystem.deleteAsync(this.collectionDir, { idempotent: true });
              await this.initialize();
              console.log('All data cleared');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}

export const dataCollectionService = new DataCollectionService();
