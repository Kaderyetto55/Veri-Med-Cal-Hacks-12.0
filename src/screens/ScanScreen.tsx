import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../navigation/AppNavigator';
import { RootStackParamList } from '../navigation/AppNavigator';

type ScanScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Scan'> &
    StackNavigationProp<RootStackParamList>;

interface Props {
    navigation: ScanScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function ScanScreen({ navigation }: Props) {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState<CameraType>('back');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'packaging' | 'pill' | 'batch_code' | 'auto'>('auto');
    const cameraRef = useRef<CameraView>(null);

    const handleScan = async () => {
        if (!cameraRef.current) return;

        setIsScanning(true);
        try {
            // Take a picture using the new API
            const photo = await cameraRef.current.takePictureAsync();

            // TODO: Implement actual ML scanning
            // For now, simulate scanning process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate scan result
            const mockResult = {
                medicine: {
                    id: '1',
                    name: 'Aspirin 100mg',
                    manufacturer: 'Bayer',
                    batchCode: 'ABC123',
                    expiryDate: '2025-12-31',
                    isAuthentic: Math.random() > 0.3,
                    confidence: Math.random() * 0.3 + 0.7,
                    detectedAt: new Date(),
                },
                isCounterfeit: Math.random() > 0.7,
                confidence: Math.random() * 0.3 + 0.7,
                analysisDetails: {
                    packagingScore: Math.random() * 0.3 + 0.7,
                    pillScore: Math.random() * 0.3 + 0.7,
                    batchCodeScore: Math.random() * 0.3 + 0.7,
                    overallScore: Math.random() * 0.3 + 0.7,
                },
                recommendations: [
                    'Verify batch code with manufacturer',
                    'Check packaging for spelling errors',
                    'Report if suspicious',
                ],
            };

            navigation.navigate('Results', { scanResult: mockResult });
        } catch (error) {
            Alert.alert('Error', 'Failed to scan medicine. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const toggleCameraType = () => {
        setCameraType(current =>
            current === 'back' ? 'front' : 'back'
        );
    };

    const ModeButton = ({ mode, title, icon }: {
        mode: 'packaging' | 'pill' | 'batch_code' | 'auto';
        title: string;
        icon: string;
    }) => (
        <TouchableOpacity
            style={[
                styles.modeButton,
                scanMode === mode && styles.modeButtonActive
            ]}
            onPress={() => setScanMode(mode)}
        >
            <Text style={[
                styles.modeButtonText,
                scanMode === mode && styles.modeButtonTextActive
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    if (!permission) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={cameraType}
                ref={cameraRef}
            >
                <View style={styles.overlay}>
                    {/* Top Controls */}
                    <View style={styles.topControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                            <Text style={styles.controlButtonText}>Flip</Text>
                        </TouchableOpacity>
                        <Text style={styles.scanTitle}>Scan Medicine</Text>
                        <TouchableOpacity style={styles.controlButton}>
                            <Text style={styles.controlButtonText}>Help</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scan Modes */}
                    <View style={styles.modeContainer}>
                        <ModeButton mode="auto" title="Auto" icon="scan" />
                        <ModeButton mode="packaging" title="Packaging" icon="cube" />
                        <ModeButton mode="pill" title="Pill" icon="medical" />
                        <ModeButton mode="batch_code" title="Batch Code" icon="barcode" />
                    </View>

                    {/* Scan Area */}
                    <View style={styles.scanArea}>
                        <View style={styles.scanFrame}>
                            <View style={styles.corner} />
                            <View style={[styles.corner, styles.cornerTopRight]} />
                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                            <View style={[styles.corner, styles.cornerBottomRight]} />
                        </View>
                        <Text style={styles.scanInstructions}>
                            Position medicine within the frame
                        </Text>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <TouchableOpacity style={styles.galleryButton}>
                            <Text style={styles.galleryButtonText}>Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                            onPress={handleScan}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <ActivityIndicator size="large" color="white" />
                            ) : (
                                <View style={styles.scanButtonInner} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.flashButton}>
                            <Text style={styles.flashButtonText}>Flash</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

// ... rest of your styles remain the same


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  modeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  modeButtonActive: {
    backgroundColor: '#2E7D32',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#2E7D32',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    right: 0,
    left: 'auto',
  },
  cornerBottomLeft: {
    borderTopWidth: 0,
    borderBottomWidth: 3,
    bottom: 0,
    top: 'auto',
  },
  cornerBottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    right: 0,
    bottom: 0,
    top: 'auto',
    left: 'auto',
  },
  scanInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flashButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

