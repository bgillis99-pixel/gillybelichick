import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme/colors';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile */}
        <GlassCard style={styles.card}>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.teslaBlue} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Mobile Tester</Text>
              <Text style={styles.profileEmail}>info@carbcleantruckcheck.app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.teslaGrayText} />
          </View>
        </GlassCard>

        {/* Settings Sections */}
        <Text style={styles.sectionTitle}>GENERAL</Text>
        <GlassCard style={styles.card}>
          <SettingsRow icon="notifications" title="Notifications" color={colors.teslaYellow} />
          <Divider />
          <SettingsRow icon="moon" title="Dark Mode" subtitle="Always On" color={colors.teslaBlue} />
          <Divider />
          <SettingsRow icon="mic" title="Voice Input" color={colors.teslaGreen} />
        </GlassCard>

        <Text style={styles.sectionTitle}>BUSINESS</Text>
        <GlassCard style={styles.card}>
          <SettingsRow icon="card" title="Billing" color={colors.teslaBlue} />
          <Divider />
          <SettingsRow icon="bar-chart" title="Analytics" color={colors.teslaGreen} />
          <Divider />
          <SettingsRow icon="document-text" title="Reports" color={colors.teslaRed} />
        </GlassCard>

        <Text style={styles.version}>Version 3.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingsRow = ({ icon, title, subtitle, color }: any) => (
  <TouchableOpacity style={styles.row}>
    <Ionicons name={icon} size={20} color={color} style={{ width: 32 }} />
    <Text style={styles.rowTitle}>{title}</Text>
    {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    <Ionicons name="chevron-forward" size={16} color={colors.teslaGrayText} />
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.teslaBlack },
  header: { padding: 20, paddingTop: 40 },
  title: { ...typography.title, color: colors.teslaWhite },
  card: { marginHorizontal: 20, marginBottom: 16 },
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(62, 106, 225, 0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { ...typography.headline, color: colors.teslaWhite },
  profileEmail: { ...typography.caption, color: colors.teslaGrayText, marginTop: 4 },
  sectionTitle: { ...typography.caption, color: colors.teslaGrayText, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowTitle: { ...typography.body, color: colors.teslaWhite, flex: 1, marginLeft: 16 },
  rowSubtitle: { ...typography.caption, color: colors.teslaGrayText, marginRight: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 8 },
  version: { ...typography.caption, color: colors.teslaGrayText, textAlign: 'center', marginTop: 20, marginBottom: 40 },
});
