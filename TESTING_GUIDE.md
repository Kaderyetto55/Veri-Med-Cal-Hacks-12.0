# 🧪 VeriMed Testing Guide

## 🎯 **Complete System Testing for Cal Hacks 12.0**

This guide covers testing all features of the VeriMed counterfeit detection platform.

---

## 📱 **App Testing Checklist**

### **✅ Phase 1: Basic App Functionality**

**1. App Launch & Navigation**
- [ ] App launches without crashes
- [ ] Login screen displays correctly
- [ ] Navigation between screens works
- [ ] Bottom tab navigation functions
- [ ] Stack navigation works properly

**2. Authentication Flow**
- [ ] Login screen UI displays
- [ ] Register screen UI displays
- [ ] Role selection works (Consumer/Healthcare/Pharmacist)
- [ ] Navigation to main app after login

**3. Core Screens**
- [ ] Home screen displays with stats
- [ ] Scan screen camera interface works
- [ ] Results screen shows mock data
- [ ] Reports screen displays reports
- [ ] Profile screen shows user info

---

### **✅ Phase 2: Data Collection System**

**1. Data Collection Screen**
- [ ] Navigate to Profile → Data Collection
- [ ] Training mode interface displays
- [ ] Statistics show correctly
- [ ] Medicine information form works
- [ ] Image type selection functions
- [ ] Quality slider works
- [ ] User role selection works
- [ ] Export data functionality

**2. Image Preprocessing**
- [ ] Image preprocessing service initializes
- [ ] Type-specific preprocessing works
- [ ] Quality assessment functions
- [ ] Batch processing works
- [ ] Metadata collection works

---

### **✅ Phase 3: ML Training System**

**1. Training Dashboard**
- [ ] Navigate to Profile → ML Training Dashboard
- [ ] Data statistics display correctly
- [ ] Model selection works (Packaging/Pill/Batch Code/Fusion)
- [ ] Training controls function
- [ ] Progress tracking works
- [ ] Model versions display
- [ ] Performance metrics show

**2. Model Architecture**
- [ ] Model initialization works
- [ ] CNN architectures load correctly
- [ ] Model configurations display
- [ ] Parameter counts show
- [ ] Model sizes calculated

**3. Training Pipeline**
- [ ] Training pipeline initializes
- [ ] Model training starts
- [ ] Progress callbacks work
- [ ] Model evaluation functions
- [ ] Model deployment works
- [ ] Version management functions

---

## 🔧 **Testing Steps**

### **Step 1: Basic App Testing**

1. **Launch the App**
   ```bash
   # In terminal
   cd "/Users/kaderyettocamara/VeriMed Cal Hacks 12.0/VeriMed"
   npx expo start --clear
   ```

2. **Test in Expo Go**
   - Open Expo Go on your phone
   - Scan the QR code
   - App should load without errors

3. **Navigation Testing**
   - Test all bottom tab navigation
   - Test stack navigation
   - Test back button functionality

### **Step 2: Data Collection Testing**

1. **Access Data Collection**
   - Go to Profile tab
   - Tap "Data Collection"
   - Verify interface loads

2. **Test Training Mode**
   - Tap "Start Training Mode"
   - Fill in medicine information
   - Test image type selection
   - Test quality slider
   - Test user role selection

3. **Test Data Collection**
   - Enter medicine name: "Aspirin 100mg"
   - Enter manufacturer: "Bayer"
   - Enter batch code: "ABC123"
   - Select image type: "Packaging"
   - Set quality: 8
   - Select role: "Healthcare Worker"
   - Tap "Collect Data"

### **Step 3: ML Training Testing**

1. **Access Training Dashboard**
   - Go to Profile tab
   - Tap "ML Training Dashboard"
   - Verify dashboard loads

2. **Test Model Selection**
   - Tap different model cards
   - Verify selection highlights
   - Check model information displays

3. **Test Training Process**
   - Select a model (e.g., "Packaging")
   - Tap "Train [Model] Model"
   - Verify training starts
   - Check progress tracking
   - Monitor training completion

4. **Test Model Management**
   - View deployed models
   - Check model versions
   - Test rollback functionality
   - View performance metrics

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: App Crashes on Launch**
**Symptoms:** App crashes immediately after opening
**Solutions:**
- Check for missing dependencies
- Clear Metro cache: `npx expo start --clear`
- Restart Expo server
- Check for TypeScript errors

### **Issue 2: Navigation Errors**
**Symptoms:** Navigation between screens fails
**Solutions:**
- Check navigation imports
- Verify screen components exist
- Check navigation prop types
- Restart the app

### **Issue 3: Camera Not Working**
**Symptoms:** Camera interface doesn't load
**Solutions:**
- Check camera permissions
- Verify expo-camera installation
- Test on physical device (not simulator)
- Check camera API usage

### **Issue 4: ML Models Not Loading**
**Symptoms:** Training dashboard shows errors
**Solutions:**
- Check TensorFlow.js installation
- Verify model architecture files
- Check for memory issues
- Test on device with sufficient RAM

### **Issue 5: Data Collection Fails**
**Symptoms:** Data collection screen shows errors
**Solutions:**
- Check data collection service
- Verify image preprocessing
- Check file system permissions
- Test with mock data first

---

## 📊 **Performance Testing**

### **Memory Usage**
- [ ] App uses <100MB RAM
- [ ] No memory leaks during navigation
- [ ] ML models load efficiently
- [ ] Image processing doesn't crash

### **Speed Testing**
- [ ] App launches in <3 seconds
- [ ] Navigation is smooth (<1 second)
- [ ] Camera opens quickly
- [ ] ML inference <5 seconds

### **Battery Usage**
- [ ] App doesn't drain battery excessively
- [ ] Camera usage is efficient
- [ ] ML processing is optimized

---

## 🎯 **Demo Scenarios**

### **Scenario 1: Healthcare Worker Demo**
1. **Login as Healthcare Worker**
2. **Navigate to Data Collection**
3. **Collect 3 medicine images**
4. **Navigate to Training Dashboard**
5. **Train Packaging model**
6. **View results and metrics**

### **Scenario 2: Consumer Demo**
1. **Login as Consumer**
2. **Navigate to Scan screen**
3. **Test camera functionality**
4. **Navigate to Profile**
5. **Access Data Collection**
6. **Contribute training data**

### **Scenario 3: Pharmacist Demo**
1. **Login as Pharmacist**
2. **Navigate to Reports**
3. **View counterfeit reports**
4. **Access Training Dashboard**
5. **Train all models**
6. **Monitor performance**

---

## 📱 **Device Testing**

### **iOS Testing**
- [ ] Test on iPhone (iOS 14+)
- [ ] Test camera functionality
- [ ] Test ML model loading
- [ ] Test navigation
- [ ] Test data collection

### **Android Testing**
- [ ] Test on Android device (API 21+)
- [ ] Test camera functionality
- [ ] Test ML model loading
- [ ] Test navigation
- [ ] Test data collection

---

## 🚀 **Production Readiness**

### **Pre-Demo Checklist**
- [ ] All screens load without errors
- [ ] Navigation works smoothly
- [ ] Camera functionality works
- [ ] Data collection works
- [ ] ML training works
- [ ] Performance is acceptable
- [ ] No crashes or freezes

### **Demo Flow**
1. **Show app launch and login**
2. **Demonstrate data collection**
3. **Show ML training dashboard**
4. **Train a model live**
5. **Show results and metrics**
6. **Demonstrate navigation**

---

## 📞 **Support & Troubleshooting**

### **If App Doesn't Start**
1. Check Expo CLI version: `npx expo --version`
2. Clear cache: `npx expo start --clear`
3. Restart Metro bundler
4. Check for dependency conflicts

### **If ML Features Don't Work**
1. Check TensorFlow.js installation
2. Verify model files exist
3. Test on device with sufficient RAM
4. Check for JavaScript errors in console

### **If Camera Doesn't Work**
1. Test on physical device (not simulator)
2. Check camera permissions
3. Verify expo-camera installation
4. Test with different camera types

---

## 🎉 **Success Criteria**

**✅ App is ready for demo when:**
- All screens load without errors
- Navigation works smoothly
- Data collection functions
- ML training works
- Performance is acceptable
- No crashes or freezes
- Demo flow is smooth

**🚀 Ready for Cal Hacks 12.0!**

---

## 📋 **Final Testing Checklist**

- [ ] App launches successfully
- [ ] All navigation works
- [ ] Camera functionality works
- [ ] Data collection works
- [ ] ML training works
- [ ] Performance is good
- [ ] No crashes or errors
- [ ] Demo flow is ready
- [ ] All features functional
- [ ] Ready for presentation

**🎯 VeriMed is ready for Cal Hacks 12.0! 🎉**
