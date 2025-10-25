import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';

type ReportsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Reports'>;

interface Props {
  navigation: ReportsScreenNavigationProp;
}

interface CounterfeitReport {
  id: string;
  medicineName: string;
  location: string;
  date: string;
  status: 'pending' | 'verified' | 'rejected';
  description: string;
  reporterType: 'consumer' | 'healthcare_worker' | 'pharmacist';
}

export default function ReportsScreen({ navigation }: Props) {
  const [reports, setReports] = useState<CounterfeitReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    // TODO: Load reports from Firebase
    // Mock data for now
    const mockReports: CounterfeitReport[] = [
      {
        id: '1',
        medicineName: 'Aspirin 100mg',
        location: 'San Francisco, CA',
        date: '2 hours ago',
        status: 'verified',
        description: 'Packaging shows spelling errors and incorrect batch code format',
        reporterType: 'pharmacist',
      },
      {
        id: '2',
        medicineName: 'Paracetamol 500mg',
        location: 'Oakland, CA',
        date: '1 day ago',
        status: 'pending',
        description: 'Pills appear different from authentic version',
        reporterType: 'consumer',
      },
      {
        id: '3',
        medicineName: 'Ibuprofen 200mg',
        location: 'Berkeley, CA',
        date: '3 days ago',
        status: 'rejected',
        description: 'Batch code not found in manufacturer database',
        reporterType: 'healthcare_worker',
      },
    ];
    setReports(mockReports);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#2E7D32';
      case 'pending': return '#F57C00';
      case 'rejected': return '#D32F2F';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getReporterIcon = (type: string) => {
    switch (type) {
      case 'pharmacist': return 'medical';
      case 'healthcare_worker': return 'person';
      case 'consumer': return 'people';
      default: return 'person';
    }
  };

  const FilterButton = ({ filterValue, title }: { filterValue: string; title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterValue as any)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterValue && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Counterfeit Reports</Text>
        <Text style={styles.headerSubtitle}>
          {reports.length} total reports
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton filterValue="all" title="All" />
        <FilterButton filterValue="pending" title="Pending" />
        <FilterButton filterValue="verified" title="Verified" />
        <FilterButton filterValue="rejected" title="Rejected" />
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.reportsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'No counterfeit reports available'
                : `No ${filter} reports found`
              }
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <TouchableOpacity key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportTitleContainer}>
                  <Text style={styles.medicineName}>{report.medicineName}</Text>
                  <View style={styles.statusContainer}>
                    <Ionicons 
                      name={getStatusIcon(report.status) as keyof typeof Ionicons.glyphMap} 
                      size={16} 
                      color={getStatusColor(report.status)} 
                    />
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(report.status) }
                    ]}>
                      {report.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportDate}>{report.date}</Text>
              </View>

              <Text style={styles.reportDescription}>{report.description}</Text>

              <View style={styles.reportFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.locationText}>{report.location}</Text>
                </View>
                <View style={styles.reporterContainer}>
                  <Ionicons 
                    name={getReporterIcon(report.reporterType) as keyof typeof Ionicons.glyphMap} 
                    size={14} 
                    color="#666" 
                  />
                  <Text style={styles.reporterText}>
                    {report.reporterType.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to report creation screen
          Alert.alert('Report Counterfeit', 'This feature will be implemented in the next phase.');
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  reportsList: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitleContainer: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  reportDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  reporterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reporterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

