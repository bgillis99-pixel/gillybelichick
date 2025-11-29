/**
 * Dashboard Screen
 * Tesla-inspired main dashboard with glass cards
 */

import React, { useState } from 'react';
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

import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme/colors';

export default function DashboardScreen({ navigation }: any) {
  const [todayTests] = useState(6);
  const [revenue] = useState(10350);

  const handleStartTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('VINScanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>MOBILE CARB CHECK</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>

          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.teslaBlue} />
          </TouchableOpacity>
        </View>

        {/* Next Appointment Card */}
        <GlassCard style={styles.cardMargin}>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.cardLabel}>NEXT TEST</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>On Schedule</Text>
              </View>
            </View>

            <Text style={styles.appointmentName}>Joe's Trucking</Text>

            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.teslaGrayText}
                />
                <Text style={styles.detailText}>2:00 PM</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.teslaGrayText}
                />
                <Text style={styles.detailText}>5.2 mi away</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="call" size={20} color={colors.teslaWhite} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons
                  name="navigate"
                  size={20}
                  color={colors.teslaBlack}
                />
                <Text style={styles.primaryButtonText}>GET DIRECTIONS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={colors.teslaGreen}
            />
            <Text style={styles.statLabel}>TODAY</Text>
            <Text style={styles.statValue}>{todayTests}</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons
              name="cash-outline"
              size={28}
              color={colors.teslaBlue}
            />
            <Text style={styles.statLabel}>REVENUE</Text>
            <Text style={styles.statValue}>${revenue.toLocaleString()}</Text>
          </GlassCard>
        </View>

        {/* Quick Actions */}
        <GlassCard style={styles.cardMargin}>
          <QuickAction
            icon="scan"
            title="Start New Test"
            color={colors.teslaGreen}
            onPress={handleStartTest}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="chatbubbles"
            title="Messages"
            badge={3}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="notifications"
            title="Notifications"
            badge={2}
            onPress={() => navigation.navigate('Notifications')}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="calendar"
            title="Schedule"
            onPress={() => {}}
          />
        </GlassCard>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <GlassCard style={styles.cardMargin}>
          <ActivityRow
            icon="checkmark-circle"
            title="Test Completed"
            subtitle="John Smith - PASSED"
            time="2h ago"
            color={colors.teslaGreen}
          />
          <View style={styles.divider} />
          <ActivityRow
            icon="cash-outline"
            title="Payment Received"
            subtitle="$450.00"
            time="3h ago"
            color={colors.teslaBlue}
          />
          <View style={styles.divider} />
          <ActivityRow
            icon="person-add"
            title="New Lead"
            subtitle="Mike Johnson"
            time="5h ago"
            color={colors.teslaYellow}
          />
        </GlassCard>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Quick Action Component
const QuickAction = ({
  icon,
  title,
  badge,
  color = colors.teslaBlue,
  onPress,
}: any) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} style={styles.quickActionIcon} />
    <Text style={styles.quickActionTitle}>{title}</Text>
    {badge && (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color={colors.teslaGrayText} />
  </TouchableOpacity>
);

// Activity Row Component
const ActivityRow = ({ icon, title, subtitle, time, color }: any) => (
  <View style={styles.activityRow}>
    <Ionicons name={icon} size={20} color={color} style={styles.activityIcon} />
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.teslaBlack,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.teslaGrayText,
    marginBottom: 4,
  },
  headerTitle: {
    ...typography.title,
    color: colors.teslaWhite,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(62, 106, 225, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMargin: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  appointmentCard: {
    padding: 0,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.teslaGrayText,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teslaGreen,
    marginRight: 6,
  },
  statusText: {
    ...typography.caption,
    color: colors.teslaGreen,
  },
  appointmentName: {
    ...typography.headline,
    color: colors.teslaWhite,
    marginBottom: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    ...typography.body,
    color: colors.teslaGrayText,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.teslaCharcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.teslaBlue,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.teslaBlack,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statLabel: {
    ...typography.caption,
    color: colors.teslaGrayText,
    marginTop: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginTop: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionIcon: {
    width: 32,
    marginRight: 16,
  },
  quickActionTitle: {
    ...typography.body,
    color: colors.teslaWhite,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.teslaBlack,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.teslaGrayText,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginBottom: 4,
  },
  activitySubtitle: {
    ...typography.caption,
    color: colors.teslaGrayText,
  },
  activityTime: {
    ...typography.caption,
    color: colors.teslaGrayText,
  },
});
