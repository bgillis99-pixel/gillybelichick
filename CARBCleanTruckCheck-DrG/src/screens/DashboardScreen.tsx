/**
 * Dashboard Screen
 * Main hub for CARB testing operations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import { colors } from '../theme/colors';

export default function DashboardScreen({ navigation }: any) {
  const handleVINScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('VINScanner');
  };

  const handleDrGChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('DrG');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.title}>CARB Clean Truck Check</Text>
            <Text style={styles.subtitle}>powered by Dr. G</Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profileBadge}>
              <Ionicons name="shield-checkmark" size={28} color={colors.drGGreen} />
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tests Today</Text>
            <Ionicons name="trending-up" size={20} color={colors.drGGreen} />
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>$5,400</Text>
            <Text style={styles.statLabel}>Revenue</Text>
            <Ionicons name="cash" size={20} color={colors.teslaBlue} />
          </GlassCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity onPress={handleVINScan} activeOpacity={0.8}>
          <GlassCard style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="scan" size={32} color={colors.teslaBlue} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Scan VIN</Text>
              <Text style={styles.actionDescription}>
                Start a new CARB compliance test
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.teslaGrayText} />
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDrGChat} activeOpacity={0.8}>
          <GlassCard style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.drGGreen + '20' }]}>
              <Ionicons name="chatbubbles" size={32} color={colors.drGGreen} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ask Dr. G</Text>
              <Text style={styles.actionDescription}>
                AI-powered CARB compliance assistant
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.teslaGrayText} />
          </GlassCard>
        </TouchableOpacity>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Tests</Text>

        <GlassCard style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityVIN}>1FUJGLDR12LM12345</Text>
              <Text style={styles.activityCustomer}>ABC Trucking Co.</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.statusText}>PASS</Text>
            </View>
          </View>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </GlassCard>

        <GlassCard style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityVIN}>5TDDKRFH8LS123456</Text>
              <Text style={styles.activityCustomer}>Smith Transport</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusWarning]}>
              <Ionicons name="alert-circle" size={20} color={colors.warning} />
              <Text style={styles.statusTextWarning}>NEEDS SERVICE</Text>
            </View>
          </View>
          <Text style={styles.activityTime}>5 hours ago</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.teslaBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 14,
    color: colors.teslaGrayText,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.drGGreen,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teslaGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.drGGreen,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.teslaGrayText,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.teslaBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: colors.teslaGrayText,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityVIN: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  activityCustomer: {
    fontSize: 14,
    color: colors.teslaGrayText,
  },
  activityTime: {
    fontSize: 12,
    color: colors.teslaGrayTextDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusWarning: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  statusTextWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
});
