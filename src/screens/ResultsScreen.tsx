import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ScanResult } from '../types';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: {
    params: {
      scanResult: ScanResult;
    };
  };
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { scanResult } = route.params;
  const [isReporting, setIsReporting] = useState(false);

  const handleReportCounterfeit = async () => {
    setIsReporting(true);
    try {
      // TODO: Implement counterfeit reporting
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this counterfeit medicine. Your report will help protect others.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scanned a medicine with VeriMed. Result: ${scanResult.isCounterfeit ? 'COUNTERFEIT DETECTED' : 'AUTHENTIC'}. Medicine: ${scanResult.medicine.name}`,
        title: 'VeriMed Scan Result',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getStatusColor = () => {
    if (scanResult.isCounterfeit) return '#D32F2F';
    if (scanResult.confidence < 0.8) return '#F57C00';
    return '#2E7D32';
  };

  const getStatusText = () => {
    if (scanResult.isCounterfeit) return 'COUNTERFEIT DETECTED';
    if (scanResult.confidence < 0.8) return 'SUSPICIOUS';
    return 'AUTHENTIC';
  };

  const getStatusIcon = () => {
    if (scanResult.isCounterfeit) return 'warning';
    if (scanResult.confidence < 0.8) return 'alert-circle';
    return 'checkmark-circle';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
        <Ionicons 
          name={getStatusIcon() as keyof typeof Ionicons.glyphMap} 
          size={48} 
          color="white" 
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.confidenceText}>
          Confidence: {Math.round(scanResult.confidence * 100)}%
        </Text>
      </View>

      {/* Medicine Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medicine Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{scanResult.medicine.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Manufacturer:</Text>
            <Text style={styles.detailValue}>{scanResult.medicine.manufacturer}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Batch Code:</Text>
            <Text style={styles.detailValue}>{scanResult.medicine.batchCode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiry Date:</Text>
            <Text style={styles.detailValue}>{scanResult.medicine.expiryDate}</Text>
          </View>
        </View>
      </View>

      {/* Analysis Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis Breakdown</Text>
        <View style={styles.analysisCard}>
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Packaging Score:</Text>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { width: `${scanResult.analysisDetails.packagingScore * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreText}>
                {Math.round(scanResult.analysisDetails.packagingScore * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Pill Recognition:</Text>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { width: `${scanResult.analysisDetails.pillScore * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreText}>
                {Math.round(scanResult.analysisDetails.pillScore * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Batch Code:</Text>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { width: `${scanResult.analysisDetails.batchCodeScore * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreText}>
                {Math.round(scanResult.analysisDetails.batchCodeScore * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {scanResult.recommendations.map((recommendation: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark" size={16} color="#2E7D32" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {scanResult.isCounterfeit && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reportButton]}
            onPress={handleReportCounterfeit}
            disabled={isReporting}
          >
            <Ionicons name="warning" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {isReporting ? 'Reporting...' : 'Report Counterfeit'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Ionicons name="share" size={20} color="white" />
          <Text style={styles.actionButtonText}>Share Result</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.scanAgainButton]}
          onPress={() => navigation.navigate('Scan' as never)}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.actionButtonText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  analysisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisRow: {
    marginBottom: 16,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    minWidth: 40,
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  reportButton: {
    backgroundColor: '#D32F2F',
  },
  shareButton: {
    backgroundColor: '#1976D2',
  },
  scanAgainButton: {
    backgroundColor: '#2E7D32',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

