import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme/colors';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with leads, payments, and activity</Text>
        </View>

        <NotificationCard
          icon="person-add"
          title="New Lead"
          subtitle="Mike Johnson wants CARB test for 2020 Kenworth"
          time="5 min ago"
          color={colors.teslaYellow}
        />
        <NotificationCard
          icon="cash-outline"
          title="Payment Received"
          subtitle="$450 from Joe's Trucking"
          time="23 min ago"
          color={colors.teslaGreen}
        />
        <NotificationCard
          icon="document-text"
          title="Blog Ready"
          subtitle="Understanding CARB DPF Rules"
          time="2h ago"
          color={colors.teslaBlue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const NotificationCard = ({ icon, title, subtitle, time, color }: any) => (
  <GlassCard style={styles.card}>
    <View style={styles.cardContent}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}33` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.textContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.teslaGrayText} />
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.teslaBlack },
  header: { padding: 20, paddingTop: 40 },
  title: { ...typography.title, color: colors.teslaWhite },
  subtitle: { ...typography.body, color: colors.teslaGrayText, marginTop: 8 },
  card: { marginHorizontal: 20, marginBottom: 16 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContent: { flex: 1 },
  cardTitle: { ...typography.body, fontWeight: '600', color: colors.teslaWhite },
  cardSubtitle: { ...typography.caption, color: colors.teslaGrayText, marginTop: 4 },
  time: { ...typography.caption, fontSize: 11, color: colors.teslaGrayText, marginTop: 4 },
});
