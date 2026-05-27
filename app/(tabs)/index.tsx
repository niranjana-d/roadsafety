/**
 * Home Dashboard Screen
 */
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../_layout';
import { useLocationStore } from '../../src/store/locationStore';
import { useOfflineStore } from '../../src/store/offlineStore';
import { useUserStore } from '../../src/store/userStore';
import { getGreeting, timeAgo } from '../../src/utils/formatDate';
import { spacing, borderRadius } from '../../src/constants/theme';

const DYK_FACTS = [
  'Using a mobile phone while driving in Maharashtra carries a fine of ₹5,000 for the first offence under the Motor Vehicles (Amendment) Act, 2019.',
  'India has the highest number of road accident deaths globally — over 1.5 lakh annually. Helmet and seatbelt usage could prevent 40% of fatalities.',
  'The MV Act 2019 increased the fine for drunk driving from ₹2,000 to ₹10,000 — a 5x increase.',
  'You can carry your driving licence and RC digitally via DigiLocker — it is legally valid during traffic checks.',
];

const TICKER_VIOLATIONS = [
  { name: 'No Helmet (Two-Wheeler)', fine: '₹1,000' },
  { name: 'Signal Jumping', fine: '₹5,000' },
  { name: 'Over-Speeding (City)', fine: '₹1,000–₹2,000' },
  { name: 'No Seatbelt', fine: '₹1,000' },
  { name: 'Drunk Driving (DUI)', fine: '₹10,000' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const { isOnline, lastSyncAt } = useOfflineStore();
  const { profile } = useUserStore();

  const factIndex = new Date().getDate() % DYK_FACTS.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {profile.name} 👋</Text>
            <Text style={styles.heroTitle}>What do you need to know?</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: isOnline ? 'rgba(0,200,83,0.2)' : 'rgba(255,152,0,0.2)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#00C853' : '#FF9800' }]} />
            <Text style={[styles.statusText, { color: isOnline ? '#B9F6CA' : '#FFE0B2' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Location Banner */}
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => {/* TODO: open location modal */}}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {currentLocation.city}, {currentLocation.stateName}, India · Change
          </Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel="Search laws, violations, fines"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search laws, violations, fines...</Text>
        </TouchableOpacity>

        {/* Sync Status */}
        {lastSyncAt && (
          <Text style={styles.syncText}>Last synced: {timeAgo(lastSyncAt)}</Text>
        )}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Action Cards */}
        <View style={styles.quickGrid}>
          <QuickCard
            icon="💬"
            iconBg={colors.primaryLight}
            title="Chat with AI"
            desc="Ask any traffic law question"
            onPress={() => router.push('/(tabs)/chat')}
            colors={colors}
          />
          <QuickCard
            icon="🧮"
            iconBg={colors.accentLight}
            title="Fine Calculator"
            desc="Estimate challan amount"
            onPress={() => router.push('/(tabs)/calculator')}
            colors={colors}
          />
          <QuickCard
            icon="📚"
            iconBg={colors.warningLight}
            title="Browse Laws"
            desc="Explore full library"
            onPress={() => router.push('/(tabs)/laws')}
            colors={colors}
          />
          <QuickCard
            icon="🚨"
            iconBg={colors.dangerLight}
            title="SOS / Emergency"
            desc="Quick access helplines"
            onPress={() => router.push('/emergency')}
            colors={colors}
          />
        </View>

        {/* Did You Know */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Today's Fact</Text>
        <View style={[styles.dykCard]}>
          <Text style={styles.dykLabel}>💡 Did You Know?</Text>
          <Text style={styles.dykText}>{DYK_FACTS[factIndex]}</Text>
          <View style={styles.dykLocation}>
            <Text style={styles.dykLocationText}>📍 {currentLocation.city}, {currentLocation.stateName}</Text>
          </View>
        </View>

        {/* Common Violations Ticker */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Common Violations in Your Area</Text>
        <View style={[styles.tickerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.tickerHead, { borderBottomColor: colors.border }]}>
            <Text style={[styles.tickerHeadText, { color: colors.text }]}>Recent fines issued nearby</Text>
            <View style={[styles.liveBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.liveText, { color: '#007b4d' }]}>Live</Text>
            </View>
          </View>
          {TICKER_VIOLATIONS.map((v, i) => (
            <View key={i} style={[styles.tickerItem, i < TICKER_VIOLATIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.tickerName, { color: colors.text }]}>{v.name}</Text>
              <Text style={[styles.tickerFine, { color: colors.danger }]}>{v.fine}</Text>
            </View>
          ))}
        </View>

        {/* Safety Score */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Your Safety Score</Text>
        <View style={[styles.safetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.scoreCircle, { borderColor: colors.accent }]}>
            <Text style={[styles.scoreNumber, { color: colors.text }]}>{profile.safetyScore}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreTitle, { color: colors.text }]}>
              {profile.safetyScore >= 80 ? 'Excellent Driver' : profile.safetyScore >= 60 ? 'Good Driver' : 'Keep Learning'}
            </Text>
            <Text style={[styles.scoreDesc, { color: colors.textSecondary }]}>Complete a quiz to improve your score</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.scoreBadgeText, { color: '#007b4d' }]}>{profile.safetyScore} / 100</Text>
          </View>
        </View>

        {/* Notifications Button */}
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/notifications')}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <Text style={[styles.notifText, { color: colors.text }]}>View Notifications</Text>
          <Text style={{ color: colors.textTertiary }}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function QuickCard({ icon, iconBg, title, desc, onPress, colors }: {
  icon: string; iconBg: string; title: string; desc: string;
  onPress: () => void; colors: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.7}
    >
      <View style={[styles.qcIcon, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={[styles.qcTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.qcDesc, { color: colors.textTertiary }]}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 24 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 4 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '500' },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginBottom: 14, alignSelf: 'flex-start' },
  locationIcon: { fontSize: 14 },
  locationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14 },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: 'rgba(255,255,255,0.7)', fontSize: 14.5 },
  syncText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8, textAlign: 'right' },
  scrollContent: { flex: 1 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingBottom: 0 },
  quickCard: { width: '47%', borderWidth: 1, borderRadius: 14, padding: 16, gap: 8 },
  qcIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qcTitle: { fontSize: 14, fontWeight: '600' },
  qcDesc: { fontSize: 12 },
  sectionHead: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10, fontSize: 16, fontWeight: '600' },
  dykCard: { marginHorizontal: 16, borderRadius: 14, padding: 18, backgroundColor: '#0f3da0', overflow: 'hidden' },
  dykLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  dykText: { fontSize: 15, lineHeight: 24, color: '#FFFFFF' },
  dykLocation: { marginTop: 10 },
  dykLocationText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  tickerCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  tickerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  tickerHeadText: { fontSize: 13, fontWeight: '600' },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  liveText: { fontSize: 11, fontWeight: '600' },
  tickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  tickerName: { fontSize: 14 },
  tickerFine: { fontSize: 13, fontWeight: '600' },
  safetyCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: 16, fontWeight: '700' },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 15, fontWeight: '600' },
  scoreDesc: { fontSize: 13, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scoreBadgeText: { fontSize: 12, fontWeight: '600' },
  notifBtn: { marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifText: { flex: 1, fontSize: 15, fontWeight: '500' },
});
