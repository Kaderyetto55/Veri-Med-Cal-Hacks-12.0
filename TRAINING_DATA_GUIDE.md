# 📸 VeriMed Training Data Collection Guide

## 🎯 **How to Collect Training Data for Counterfeit Detection**

This guide explains how to collect high-quality training data for VeriMed's ML models using your smartphone camera.

---

## 📱 **Step-by-Step Data Collection Process**

### **Step 1: Prepare Your Environment**

**🔧 Setup Requirements:**
- Smartphone with good camera (8MP+ recommended)
- Good lighting (natural light preferred)
- Clean, flat surface for medicine placement
- Stable hands or phone stand
- VeriMed app installed and running

**📋 What You'll Need:**
- Authentic medicines from verified pharmacies
- Access to different medicine types
- Time: 5-10 minutes per medicine
- Patience for quality photos

---

### **Step 2: Medicine Selection Strategy**

**✅ Choose These Medicine Types:**
1. **Common Over-the-Counter (OTC)**
   - Aspirin, Paracetamol, Ibuprofen
   - Vitamins and supplements
   - Cold and flu medications

2. **Prescription Medicines**
   - Antibiotics, Blood pressure medications
   - Diabetes medications, Heart medications
   - (Only if you have legitimate prescriptions)

3. **Different Manufacturers**
   - Bayer, Pfizer, Johnson & Johnson
   - Generic brands
   - International brands

**⚠️ Important Notes:**
- Only photograph medicines you legally possess
- Never photograph controlled substances
- Respect privacy and confidentiality
- Follow local laws and regulations

---

### **Step 3: Photography Guidelines**

**📸 **Packaging Photos (Most Important):**

1. **Front of Package**
   - Full medicine name visible
   - Manufacturer logo clear
   - Dosage information readable
   - Expiry date visible

2. **Back of Package**
   - Ingredients list
   - Batch code/lot number
   - Manufacturing details
   - Barcode (if present)

3. **Side Views**
   - Medicine name on sides
   - Any additional markings
   - Package dimensions

**💊 **Pill Photos:**

1. **Individual Pills**
   - Clear view of pill shape
   - Color and markings visible
   - Size relative to common objects
   - Multiple angles if possible

2. **Pill Blister Packs**
   - Individual pill compartments
   - Blister pack markings
   - Batch information

**🔢 **Batch Code Photos:**

1. **Batch/Lot Numbers**
   - Clear, readable text
   - Good contrast
   - No shadows or glare
   - Multiple angles if needed

---

### **Step 4: Photo Quality Standards**

**✅ **Good Photo Characteristics:**
- **Lighting**: Bright, even lighting (no shadows)
- **Focus**: Sharp, clear details
- **Stability**: No motion blur
- **Framing**: Medicine fills most of frame
- **Angles**: Straight-on view preferred
- **Background**: Clean, uncluttered

**❌ **Avoid These:**
- Blurry or out-of-focus images
- Poor lighting or shadows
- Cluttered backgrounds
- Partial medicine views
- Reflections or glare
- Fingerprints on medicine

---

### **Step 5: Using VeriMed App for Data Collection**

**🔧 **App Setup:**

1. **Open VeriMed App**
2. **Go to Profile → Data Collection**
3. **Enable "Training Mode"**
4. **Select your role** (Consumer/Healthcare Worker/Pharmacist)

**📸 **Taking Photos:**

1. **Select Medicine Type**
   - Choose: Packaging, Pill, or Batch Code
   - Enter medicine name and manufacturer
   - Add batch code if available

2. **Take Photos**
   - Use the app's camera interface
   - Follow quality guidelines
   - Take multiple angles if needed
   - Review photos before saving

3. **Add Metadata**
   - Medicine name (exact spelling)
   - Manufacturer
   - Batch code
   - Expiry date
   - Your role (Consumer/Healthcare/Pharmacist)
   - Location (optional)

4. **Quality Assessment**
   - Rate photo quality (1-10)
   - Add any notes
   - Mark as authentic or suspicious

---

### **Step 6: Data Collection Workflow**

**📋 **Daily Collection Routine:**

**Morning (5 minutes):**
- Take 2-3 packaging photos
- Focus on different medicine types
- Ensure good lighting

**Afternoon (5 minutes):**
- Take pill photos
- Different angles and lighting
- Include batch code photos

**Evening (5 minutes):**
- Review and organize photos
- Add missing metadata
- Quality check all images

**📊 **Weekly Goals:**
- **Week 1**: 50 authentic medicine photos
- **Week 2**: 50 more authentic photos
- **Week 3**: 25 suspicious/counterfeit photos (if available)
- **Week 4**: Review and quality check all data

---

### **Step 7: Creating Counterfeit Samples**

**⚠️ **Important: Only for Training Purposes**

**🎭 **Safe Counterfeit Creation:**

1. **Digital Alterations**
   - Use photo editing software
   - Change font styles slightly
   - Modify colors subtly
   - Add spelling errors
   - Alter batch codes

2. **Physical Variations**
   - Use expired medicines
   - Damaged packaging
   - Different packaging materials
   - Modified logos (digitally)

3. **Labeling**
   - Clearly mark as "TRAINING ONLY"
   - Never use for actual consumption
   - Store separately from real medicines

---

### **Step 8: Data Organization**

**📁 **File Structure:**
```
training_data/
├── authentic/
│   ├── packaging/
│   ├── pills/
│   └── batch_codes/
├── counterfeit/
│   ├── packaging/
│   ├── pills/
│   └── batch_codes/
└── metadata/
    ├── medicine_info.json
    └── quality_scores.json
```

**📝 **Metadata Requirements:**
- Medicine name
- Manufacturer
- Batch code
- Expiry date
- Photo quality score
- User role
- Timestamp
- Location (optional)

---

### **Step 9: Quality Control**

**🔍 **Review Process:**

1. **Daily Review**
   - Check photo quality
   - Verify metadata accuracy
   - Remove poor quality images

2. **Weekly Review**
   - Organize by medicine type
   - Balance authentic vs counterfeit
   - Check for duplicates

3. **Monthly Review**
   - Export data for training
   - Backup all data
   - Update collection strategy

---

### **Step 10: Exporting Training Data**

**📤 **Export Process:**

1. **In VeriMed App:**
   - Go to Profile → Data Collection
   - Select "Export Training Data"
   - Choose date range
   - Select data types

2. **Export Options:**
   - JSON format for metadata
   - Images in organized folders
   - Quality scores and statistics
   - User information (anonymized)

3. **Backup:**
   - Save to cloud storage
   - Create multiple copies
   - Document export date

---

## 🎯 **Training Data Targets**

### **Minimum Requirements:**
- **Authentic Images**: 1,000+ photos
- **Counterfeit Images**: 200+ photos
- **Packaging Photos**: 60% of total
- **Pill Photos**: 30% of total
- **Batch Code Photos**: 10% of total

### **Quality Standards:**
- **Average Quality Score**: 7+ out of 10
- **Sharp Focus**: 90%+ of images
- **Good Lighting**: 85%+ of images
- **Complete Metadata**: 100% of images

### **Diversity Requirements:**
- **Medicine Types**: 20+ different medicines
- **Manufacturers**: 10+ different brands
- **User Roles**: Mix of all three roles
- **Locations**: Multiple geographic areas

---

## 🚀 **Getting Started**

1. **Download VeriMed App** (if not already installed)
2. **Enable Training Mode** in settings
3. **Start with 5 medicines** you have at home
4. **Follow the photo guidelines** above
5. **Take 3-5 photos per medicine** (packaging, pills, batch codes)
6. **Add complete metadata** for each photo
7. **Review and export** your first batch

**Remember**: Quality over quantity! Better to have 100 high-quality photos than 500 poor ones.

---

## 📞 **Support**

If you need help with data collection:
- Check the app's help section
- Review photo quality guidelines
- Contact support through the app
- Join the VeriMed community forum

**Happy Data Collecting! 📸💊**
