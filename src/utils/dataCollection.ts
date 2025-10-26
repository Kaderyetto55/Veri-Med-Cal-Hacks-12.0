
export interface MedicineData {
  id: string;
  name: string;
  manufacturer: string;
  batchCode: string;
  expiryDate: string;
  imagePath: string;
  isAuthentic: boolean;
  packagingFeatures: PackagingFeatures;
  pillFeatures: PillFeatures;
  batchCodeFeatures: BatchCodeFeatures;
}

export interface PackagingFeatures {
  colorAccuracy: number;
  fontConsistency: number;
  logoQuality: number;
  spellingErrors: number;
  barcodeQuality: number;
  overallQuality: number;
}

export interface PillFeatures {
  shape: string;
  color: string;
  size: number;
  markings: string[];
  texture: string;
  authenticity: number;
}

export interface BatchCodeFeatures {
  format: string;
  length: number;
  checksum: boolean;
  manufacturer: string;
  date: string;
  validity: number;
}

class DataCollectionService {
  private medicineDatabase: MedicineData[] = [];

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Initialize with common medicines
    const commonMedicines = [
      {
        name: 'Aspirin 100mg',
        manufacturer: 'Bayer',
        authenticBatchCodes: ['BAY2024001', 'BAY2024002', 'BAY2024003'],
        fakeBatchCodes: ['BAY2024001', 'BAY2024002'], // Same codes but fake
      },
      {
        name: 'Paracetamol 500mg',
        manufacturer: 'Tylenol',
        authenticBatchCodes: ['TYL2024001', 'TYL2024002', 'TYL2024003'],
        fakeBatchCodes: ['TYL2024001', 'TYL2024002'],
      },
      {
        name: 'Ibuprofen 200mg',
        manufacturer: 'Advil',
        authenticBatchCodes: ['ADV2024001', 'ADV2024002', 'ADV2024003'],
        fakeBatchCodes: ['ADV2024001', 'ADV2024002'],
      },
    ];

    // Generate synthetic data
    commonMedicines.forEach(medicine => {
      // Generate authentic samples
      medicine.authenticBatchCodes.forEach(batchCode => {
        this.medicineDatabase.push(this.generateMedicineData(medicine, batchCode, true));
      });

      // Generate counterfeit samples
      medicine.fakeBatchCodes.forEach(batchCode => {
        this.medicineDatabase.push(this.generateMedicineData(medicine, batchCode, false));
      });
    });
  }

  private generateMedicineData(
    medicine: any, 
    batchCode: string, 
    isAuthentic: boolean
  ): MedicineData {
    return {
      id: `${medicine.name.replace(/\s+/g, '_').toLowerCase()}_${batchCode}`,
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      batchCode,
      expiryDate: this.generateExpiryDate(),
      imagePath: `images/${medicine.name.replace(/\s+/g, '_').toLowerCase()}_${batchCode}.jpg`,
      isAuthentic,
      packagingFeatures: this.generatePackagingFeatures(isAuthentic),
      pillFeatures: this.generatePillFeatures(isAuthentic),
      batchCodeFeatures: this.generateBatchCodeFeatures(batchCode, isAuthentic),
    };
  }

  private generatePackagingFeatures(isAuthentic: boolean): PackagingFeatures {
    if (isAuthentic) {
      return {
        colorAccuracy: Math.random() * 0.2 + 0.8, // 80-100%
        fontConsistency: Math.random() * 0.2 + 0.8, // 80-100%
        logoQuality: Math.random() * 0.2 + 0.8, // 80-100%
        spellingErrors: Math.random() * 0.1, // 0-10%
        barcodeQuality: Math.random() * 0.2 + 0.8, // 80-100%
        overallQuality: Math.random() * 0.2 + 0.8, // 80-100%
      };
    } else {
      return {
        colorAccuracy: Math.random() * 0.4 + 0.4, // 40-80%
        fontConsistency: Math.random() * 0.4 + 0.4, // 40-80%
        logoQuality: Math.random() * 0.4 + 0.4, // 40-80%
        spellingErrors: Math.random() * 0.3 + 0.1, // 10-40%
        barcodeQuality: Math.random() * 0.4 + 0.4, // 40-80%
        overallQuality: Math.random() * 0.4 + 0.4, // 40-80%
      };
    }
  }

  private generatePillFeatures(isAuthentic: boolean): PillFeatures {
    const shapes = ['round', 'oval', 'capsule', 'tablet'];
    const colors = ['white', 'blue', 'red', 'yellow', 'green'];
    const markings = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const textures = ['smooth', 'rough', 'coated', 'uncoated'];

    return {
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5, // 5-15mm
      markings: markings.slice(0, Math.floor(Math.random() * 3) + 1),
      texture: textures[Math.floor(Math.random() * textures.length)],
      authenticity: isAuthentic ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4 + 0.4,
    };
  }

  private generateBatchCodeFeatures(batchCode: string, isAuthentic: boolean): BatchCodeFeatures {
    return {
      format: this.detectBatchCodeFormat(batchCode),
      length: batchCode.length,
      checksum: isAuthentic ? Math.random() > 0.1 : Math.random() > 0.5,
      manufacturer: batchCode.substring(0, 3),
      date: this.extractDateFromBatchCode(batchCode),
      validity: isAuthentic ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4 + 0.4,
    };
  }

  private generateExpiryDate(): string {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 3); // 0-3 years
    return futureDate.toISOString().split('T')[0];
  }

  private detectBatchCodeFormat(batchCode: string): string {
    if (/^[A-Z]{3}\d{7}$/.test(batchCode)) return 'AAA0000000';
    if (/^\d{10}$/.test(batchCode)) return '0000000000';
    if (/^[A-Z]{2}\d{6}$/.test(batchCode)) return 'AA000000';
    return 'unknown';
  }

  private extractDateFromBatchCode(batchCode: string): string {
    // Simple date extraction logic
    const year = '2024';
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Public methods for data access
  getAllData(): MedicineData[] {
    return this.medicineDatabase;
  }

  getAuthenticData(): MedicineData[] {
    return this.medicineDatabase.filter(medicine => medicine.isAuthentic);
  }

  getCounterfeitData(): MedicineData[] {
    return this.medicineDatabase.filter(medicine => !medicine.isAuthentic);
  }

  getDataByMedicine(medicineName: string): MedicineData[] {
    return this.medicineDatabase.filter(medicine => 
      medicine.name.toLowerCase().includes(medicineName.toLowerCase())
    );
  }

  getDataByManufacturer(manufacturer: string): MedicineData[] {
    return this.medicineDatabase.filter(medicine => 
      medicine.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
    );
  }

  // Generate training dataset
  generateTrainingDataset(): {
    features: number[][];
    labels: number[];
    metadata: MedicineData[];
  } {
    const features: number[][] = [];
    const labels: number[] = [];
    const metadata: MedicineData[] = [];

    this.medicineDatabase.forEach(medicine => {
      // Extract features
      const featureVector = [
        medicine.packagingFeatures.colorAccuracy,
        medicine.packagingFeatures.fontConsistency,
        medicine.packagingFeatures.logoQuality,
        medicine.packagingFeatures.spellingErrors,
        medicine.packagingFeatures.barcodeQuality,
        medicine.packagingFeatures.overallQuality,
        medicine.pillFeatures.authenticity,
        medicine.batchCodeFeatures.checksum ? 1 : 0,
        medicine.batchCodeFeatures.validity,
      ];

      features.push(featureVector);
      labels.push(medicine.isAuthentic ? 1 : 0);
      metadata.push(medicine);
    });

    return { features, labels, metadata };
  }

  // Generate test dataset
  generateTestDataset(testSize: number = 20): {
    features: number[][];
    labels: number[];
    metadata: MedicineData[];
  } {
    const allData = this.medicineDatabase;
    const shuffled = [...allData].sort(() => Math.random() - 0.5);
    const testData = shuffled.slice(0, testSize);

    const features: number[][] = [];
    const labels: number[] = [];
    const metadata: MedicineData[] = [];

    testData.forEach(medicine => {
      const featureVector = [
        medicine.packagingFeatures.colorAccuracy,
        medicine.packagingFeatures.fontConsistency,
        medicine.packagingFeatures.logoQuality,
        medicine.packagingFeatures.spellingErrors,
        medicine.packagingFeatures.barcodeQuality,
        medicine.packagingFeatures.overallQuality,
        medicine.pillFeatures.authenticity,
        medicine.batchCodeFeatures.checksum ? 1 : 0,
        medicine.batchCodeFeatures.validity,
      ];

      features.push(featureVector);
      labels.push(medicine.isAuthentic ? 1 : 0);
      metadata.push(medicine);
    });

    return { features, labels, metadata };
  }
}

export const dataCollectionService = new DataCollectionService();

