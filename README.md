# VeriMed - Counterfeit Medicine Detection App

 Project Overview

VeriMed is a mobile-first platform that empowers consumers, healthcare workers, and pharmacies to detect counterfeit medications using smartphone cameras and AI/ML technology. The system aims to reduce the estimated 250,000+ annual deaths caused by fake medicines, particularly in developing countries where up to 70% of certain medications may be counterfeit.

Key Objectives

- Provide instant, accessible counterfeit detection via smartphone
- Create a crowdsourced global database of counterfeit medicine reports
- Enable offline functionality for areas with limited connectivity
- Partner with pharmacies and health authorities for data validation

 Features

 Phase 1 (Current)
-  React Native/Expo mobile app
-  Camera-based medicine scanning
-  User authentication and profiles
-  Counterfeit report system
-  Offline functionality
-  Modern, intuitive UI

 Phase 2 (Planned)
-  ML model development
-  Computer vision for packaging analysis
-  Pill recognition system
-  Batch code validation
-  Heatmap visualization

 Tech Stack

 Mobile App
- **React Native** with **Expo** for rapid development
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Camera** for image capture

 ML/AI
- **TensorFlow Lite** for on-device inference
- **Custom CNN models** for counterfeit detection

 Getting Started

 Prerequisites
- Node.js (v16 or higher)
- npm
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VeriMed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

 Configuration
```

##  Data Collection Strategy

Synthetic Data Generation
For hackathon purposes, we generate synthetic data including:

- **Packaging Analysis**: 50-100 images of real medicine boxes with subtle alterations
- **Pill Recognition**: Using NIH Pill Image Recognition dataset

 Data Augmentation
- Image rotation, brightness, blur
- Color variations
- Font and spelling modifications
- Logo quality variations

##  ML Model Development

### Model Architecture
- **Packaging Detector**: CNN for packaging authenticity
- **Pill Recognizer**: CNN for pill identification
- **Batch Code Validator**: OCR + pattern matching

### Training Pipeline
1. Data collection and preprocessing
2. Model training with TensorFlow
3. Model conversion to TensorFlow Lite
4. On-device deployment

##  User Roles

### Consumer
- Scan medicines for authenticity
- View scan history
- Report suspicious medicines

### Healthcare Worker
- Access to verified reports
- Enhanced scanning capabilities
- Professional verification tools

### Pharmacist
- Batch code verification
- Inventory management
- Professional reporting tools

##  Privacy & Security

- No personal health information stored
- Local processing for sensitive data
- Encrypted data transmission

##  Offline Functionality

- Core detection features work offline
- Pre-downloaded ML models
- Local data caching
- Sync when connectivity available

##  Future Enhancements

- **Phase 3**: Advanced ML models
- **Phase 4**: Real-time alert system

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🏆 Cal Hacks 12.0

This project was developed for Cal Hacks 12.0 with the goal of creating a real-world solution to combat counterfeit medicines and improve global health outcomes.

## Contact

For questions or support, please submit an issue.

---

**VeriMed** - Fighting counterfeit medicines, one scan at a time. 

