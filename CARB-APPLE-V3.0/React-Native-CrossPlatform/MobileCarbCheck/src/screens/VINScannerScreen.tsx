/**
 * VIN Scanner Screen
 * Tesla-inspired camera view with OCR text recognition
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import TextRecognition from 'react-native-text-recognition';

import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

interface VINScannerScreenProps {
  navigation: any;
  onVINDetected?: (vin: string) => void;
}

export default function VINScannerScreen({ navigation, onVINDetected }: VINScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedVIN, setDetectedVIN] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  // Animation for scanning line
  const scanAnimation = useRef(new Animated.Value(-70)).current;

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Start scanning animation
  useEffect(() => {
    if (isScanning && !detectedVIN) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 70,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: -70,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isScanning, detectedVIN, scanAnimation]);

  // Simulate VIN detection (replace with actual OCR in production)
  useEffect(() => {
    if (isScanning && !detectedVIN) {
      const timer = setTimeout(() => {
        handleVINDetected('1FUJGLDR12LM12345');
      }, 3000); // Demo: auto-detect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isScanning, detectedVIN]);

  const handleVINDetected = (vin: string) => {
    setDetectedVIN(vin);
    setIsScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onVINDetected?.(vin);
  };

  const handleRetry = () => {
    setDetectedVIN(null);
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
    // Navigate to test flow (to be implemented)
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Text style={styles.submessage}>
          Please enable camera access in Settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
      />

      {/* Dark overlay for better contrast */}
      <View style={styles.overlay} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
          <Ionicons name="close-circle" size={36} color={colors.teslaWhite} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
          <Ionicons
            name={flashOn ? 'flash' : 'flash-off'}
            size={36}
            color={flashOn ? colors.teslaYellow : colors.teslaWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Scanning Frame */}
      <View style={styles.centerContainer}>
        <View style={styles.scanFrame}>
          {/* Main frame border */}
          <View
            style={[
              styles.frameBorder,
              {
                borderColor: detectedVIN
                  ? colors.teslaGreen
                  : colors.teslaBlue,
              },
            ]}
          />

          {/* Corner brackets */}
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />

          {/* Scanning line animation */}
          {!detectedVIN && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanAnimation }],
                },
              ]}
            />
          )}

          {/* Success checkmark */}
          {detectedVIN && (
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={colors.teslaGreen}
              />
            </View>
          )}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {detectedVIN ? (
          // Result Card
          <GlassCard style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.teslaGreen}
              />
              <Text style={styles.resultTitle}>VIN Detected</Text>
            </View>

            <View style={styles.vinDisplay}>
              <Text style={styles.vinText}>{detectedVIN}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRetry}
              >
                <Text style={styles.secondaryButtonText}>RETRY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : (
          // Instructions
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Point camera at VIN plate
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.teslaBlack,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
  },
  iconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 320,
    height: 140,
    position: 'relative',
  },
  frameBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderRadius: 20,
    borderColor: colors.teslaBlue,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.teslaWhite,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.teslaWhite,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.teslaWhite,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.teslaWhite,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.teslaBlue,
    shadowColor: colors.teslaBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  successIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 10,
  },
  resultCard: {
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    ...typography.headline,
    color: colors.teslaWhite,
  },
  vinDisplay: {
    backgroundColor: colors.teslaCharcoal,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  vinText: {
    ...typography.monospace,
    fontSize: 17,
    color: colors.teslaWhite,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.teslaGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.teslaWhite,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.teslaGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.teslaBlack,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 30, 36, 0.9)',
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 20,
  },
  instructionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.teslaWhite,
  },
  message: {
    ...typography.headline,
    color: colors.teslaWhite,
    textAlign: 'center',
  },
  submessage: {
    ...typography.body,
    color: colors.teslaGrayText,
    textAlign: 'center',
    marginTop: 8,
  },
});
