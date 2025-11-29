/**
 * VIN Scanner Screen
 * Camera-based VIN scanning with OCR
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

export default function VINScannerScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // TODO: Implement OCR text recognition
    // For now, simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'VIN Detected',
        '1FUJGLDR12LM12345\n\nWould you like to start a compliance test?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Test', onPress: () => navigation.goBack() },
        ]
      );
    }, 2000);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>
          Camera access is required to scan VINs
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera style={styles.camera} type={type}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color={colors.teslaWhite} />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanArea}>
          <View style={styles.instructions}>
            <Ionicons name="scan" size={32} color={colors.drGGreen} />
            <Text style={styles.instructionText}>
              Position VIN within frame
            </Text>
          </View>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {isScanning && (
              <View style={styles.scanLine}>
                <View style={styles.scanLineGlow} />
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.captureButtonInner,
                isScanning && styles.captureButtonScanning,
              ]}
            >
              {isScanning ? (
                <Ionicons name="hourglass" size={32} color={colors.teslaWhite} />
              ) : (
                <Ionicons name="camera" size={32} color={colors.teslaWhite} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.controlLabel}>
            {isScanning ? 'Scanning...' : 'Tap to Scan'}
          </Text>
        </View>
      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.teslaBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scanFrame: {
    width: '100%',
    aspectRatio: 3,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.drGGreen,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.drGGreen,
    position: 'absolute',
  },
  scanLineGlow: {
    width: '100%',
    height: 20,
    backgroundColor: colors.drGGreen + '40',
    position: 'absolute',
    top: -9,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.teslaWhite,
    marginBottom: 16,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.drGGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonScanning: {
    backgroundColor: colors.teslaBlue,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teslaWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.teslaGrayText,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.teslaGray,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teslaWhite,
  },
});
