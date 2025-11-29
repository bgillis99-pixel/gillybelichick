/**
 * Settings Screen
 * User preferences and app configuration
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [hapticFeedback, setHapticFeedback] = React.useState(true);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter((prev) => !prev);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightElement,
  }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={styles.settingCard}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color={colors.teslaBlue} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || (showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.teslaGrayText}
          />
        ))}
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>CARB Clean Truck Check</Text>
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileBadge}>
            <Ionicons name="person" size={32} color={colors.drGGreen} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Mobile Tester</Text>
            <Text style={styles.profileEmail}>tester@carbcleantruckcheck.app</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="create" size={24} color={colors.teslaGrayText} />
          </TouchableOpacity>
        </GlassCard>

        {/* General Settings */}
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem
          icon="notifications"
          title="Notifications"
          subtitle="Test reminders and updates"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={() => handleToggle(setNotifications)}
              trackColor={{ false: colors.teslaGray, true: colors.drGGreen }}
              thumbColor={colors.teslaWhite}
            />
          }
          showChevron={false}
        />
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Always enabled (Tesla style)"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={() => handleToggle(setDarkMode)}
              trackColor={{ false: colors.teslaGray, true: colors.drGGreen }}
              thumbColor={colors.teslaWhite}
            />
          }
          showChevron={false}
        />
        <SettingItem
          icon="phone-portrait"
          title="Haptic Feedback"
          subtitle="Touch vibration"
          rightElement={
            <Switch
              value={hapticFeedback}
              onValueChange={() => handleToggle(setHapticFeedback)}
              trackColor={{ false: colors.teslaGray, true: colors.drGGreen }}
              thumbColor={colors.teslaWhite}
            />
          }
          showChevron={false}
        />

        {/* Business Settings */}
        <Text style={styles.sectionTitle}>Business</Text>
        <SettingItem
          icon="card"
          title="Subscription"
          subtitle="Tester Pro - $199/year"
          onPress={() => {}}
        />
        <SettingItem
          icon="stats-chart"
          title="Analytics"
          subtitle="View your testing stats"
          onPress={() => {}}
        />
        <SettingItem
          icon="document-text"
          title="Reports"
          subtitle="Access past test reports"
          onPress={() => {}}
        />

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon="help-circle"
          title="Help Center"
          subtitle="FAQs and guides"
          onPress={() => {}}
        />
        <SettingItem
          icon="call"
          title="Contact Support"
          subtitle="844-685-8922"
          onPress={() => {}}
        />
        <SettingItem
          icon="information-circle"
          title="About"
          subtitle="Version 1.0.0"
          onPress={() => {}}
        />

        {/* Logout */}
        <TouchableOpacity activeOpacity={0.7}>
          <GlassCard style={styles.logoutCard}>
            <Ionicons name="log-out" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>powered by Dr. G</Text>
          <Text style={styles.footerCopyright}>© 2025 CARB Clean Truck Check</Text>
        </View>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.teslaGrayText,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.teslaWhite,
    marginTop: 20,
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.drGGreen + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.teslaGrayText,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.teslaBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teslaWhite,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.teslaGrayText,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.drGGreen,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 12,
    color: colors.teslaGrayTextDark,
  },
});
