// Core types for VeriMed application

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  batchCode: string;
  expiryDate: string;
  imageUrl?: string;
  isAuthentic: boolean;
  confidence: number;
  detectedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
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
  };
  recommendations: string[];
}

export interface CounterfeitReport {
  id: string;
  medicineId: string;
  reporterId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description: string;
  evidence: string[]; // Array of image URLs
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'healthcare_worker' | 'pharmacist' | 'admin';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  isVerified: boolean;
}

export interface OfflineData {
  medicines: Medicine[];
  reports: CounterfeitReport[];
  lastSync: Date;
}

export type ScanMode = 'packaging' | 'pill' | 'batch_code' | 'auto';

export interface MLModel {
  name: string;
  version: string;
  accuracy: number;
  lastUpdated: Date;
  isDownloaded: boolean;
  size: number; // in MB
}

