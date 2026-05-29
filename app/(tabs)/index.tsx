/**
 * Home Dashboard Screen
 */
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert, Linking } from 'react-native';
import LocationSelectorModal from '../../src/components/LocationSelectorModal';
import { APP_CONFIG } from '../../src/constants/config';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../_layout';
import { useLocationStore } from '../../src/store/locationStore';
import { useOfflineStore } from '../../src/store/offlineStore';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import i18n, { t } from '../../src/localization/i18n';
import { checkPendingChallans, Challan } from '../../src/services/challanService';
import { formatINR } from '../../src/utils/formatCurrency';
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
  const { settings } = useSettingsStore();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Sync translation locale
  i18n.locale = settings.language;

  // E-Challan Checking States
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [challans, setChallans] = useState<Challan[]>([]);
  const [challanLoading, setChallanLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const countryName = APP_CONFIG.countries.find(c => c.code === currentLocation.country)?.name || currentLocation.country;

  const factIndex = new Date().getDate() % DYK_FACTS.length;

  async function handleCheckChallans() {
    if (!vehicleNumber.trim()) {
      Alert.alert('Vehicle Number Required', 'Please enter your vehicle number.');
      return;
    }
    setChallanLoading(true);
    try {
      const results = await checkPendingChallans(vehicleNumber);
      setChallans(results);
      setSearched(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch challan details. Please try again.');
    } finally {
      setChallanLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {profile.name} 👋</Text>
            <Text style={styles.heroTitle}>{t('home.greeting')}</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: isOnline ? 'rgba(0,200,83,0.2)' : 'rgba(255,152,0,0.2)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#00C853' : '#FF9800' }]} />
            <Text style={[styles.statusText, { color: isOnline ? '#B9F6CA' : '#FFE0B2' }]}>
              {isOnline ? t('common.online') : t('common.offline')}
            </Text>
          </View>
        </View>

        {/* Location Banner */}
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => setLocationModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {currentLocation.city ? `${currentLocation.city}, ` : ''}{currentLocation.stateName ? `${currentLocation.stateName}, ` : ''}{countryName} · Change Location
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
          <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
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
            title={t('home.chatWithAI')}
            desc={t('home.chatDesc')}
            onPress={() => router.push('/(tabs)/chat')}
            colors={colors}
          />
          <QuickCard
            icon="🧮"
            iconBg={colors.accentLight}
            title={t('home.fineCalculator')}
            desc={t('home.calcDesc')}
            onPress={() => router.push('/(tabs)/calculator')}
            colors={colors}
          />
          <QuickCard
            icon="📚"
            iconBg={colors.warningLight}
            title={t('home.browseLaws')}
            desc={t('home.lawsDesc')}
            onPress={() => router.push('/(tabs)/laws')}
            colors={colors}
          />
          <QuickCard
            icon="🚨"
            iconBg={colors.dangerLight}
            title={t('home.emergency')}
            desc={t('home.emergencyDesc')}
            onPress={() => router.push('/emergency')}
            colors={colors}
          />
        </View>

        {/* E-Challan check section */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>🔍 Real-time E-Challan Checker</Text>
        <View style={[styles.challanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.challanTitle, { color: colors.text }]}>Check Pending Fines & Violations</Text>
          <Text style={[styles.challanDescText, { color: colors.textSecondary }]}>
            Enter your vehicle registration number to query the official Parivahan/State database (e.g. TN01AB1234).
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.challanInput, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="e.g. TN01AB1234"
              placeholderTextColor={colors.textTertiary}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
              accessibilityRole="text"
              accessibilityLabel="Enter Vehicle Number"
            />
            <TouchableOpacity
              style={[styles.challanBtn, { backgroundColor: colors.primary }]}
              onPress={handleCheckChallans}
              disabled={challanLoading}
              accessibilityRole="button"
              accessibilityLabel="Search challan details"
            >
              <Text style={styles.challanBtnText}>
                {challanLoading ? t('common.loading') : t('common.search')}
              </Text>
            </TouchableOpacity>
          </View>

          {searched && (
            <View style={styles.resultsContainer}>
              {challanLoading ? (
                <Text style={[styles.statusInfoText, { color: colors.textSecondary }]}>Querying database...</Text>
              ) : challans.length === 0 ? (
                <View style={styles.noChallansBox}>
                  <Text style={styles.successEmoji}>✅</Text>
                  <Text style={[styles.successText, { color: colors.text }]}>No pending challans found for "{vehicleNumber.toUpperCase()}"</Text>
                  <Text style={[styles.successDesc, { color: colors.textSecondary }]}>Great job driving safely!</Text>
                </View>
              ) : (
                <View style={styles.challanList}>
                  <Text style={[styles.listHeader, { color: colors.text }]}>Pending Challans ({challans.length})</Text>
                  {challans.map((ch) => (
                    <View key={ch.id} style={[styles.challanItemBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                      <View style={styles.itemHeader}>
                        <Text style={[styles.challanNum, { color: colors.text }]}>{ch.challanNumber}</Text>
                        <Text style={[styles.challanAmt, { color: colors.danger }]}>{formatINR(ch.amount)}</Text>
                      </View>
                      <Text style={[styles.challanViolation, { color: colors.text }]}>{ch.violationName}</Text>
                      <Text style={[styles.challanDetailText, { color: colors.textSecondary }]}>📍 {ch.location}</Text>
                      <Text style={[styles.challanDetailText, { color: colors.textSecondary }]}>📜 Section: {ch.section} ({ch.act})</Text>
                      <Text style={[styles.challanDetailText, { color: colors.textSecondary }]}>⏰ Deadline: {new Date(ch.deadlineAt).toLocaleDateString()}</Text>
                      <TouchableOpacity 
                        style={[styles.payBtnInline, { backgroundColor: colors.primaryLight }]}
                        onPress={() => Linking.openURL(APP_CONFIG.paymentPortals[currentLocation.stateCode] || APP_CONFIG.paymentPortals.national)}
                        accessibilityRole="button"
                        accessibilityLabel="Pay fine online"
                      >
                        <Text style={[styles.payBtnInlineText, { color: colors.primary }]}>{t('calculator.payOnline')} 🔗</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Did You Know */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>{t('home.todaysFact')}</Text>
        <View style={[styles.dykCard]}>
          <Text style={styles.dykLabel}>{t('home.didYouKnow')}</Text>
          <Text style={styles.dykText}>{DYK_FACTS[factIndex]}</Text>
          <View style={styles.dykLocation}>
            <Text style={styles.dykLocationText}>📍 {currentLocation.city}, {currentLocation.stateName}</Text>
          </View>
        </View>

        {/* Common Violations Ticker */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>{t('home.commonViolations')}</Text>
        <View style={[styles.tickerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.tickerHead, { borderBottomColor: colors.border }]}>
            <Text style={[styles.tickerHeadText, { color: colors.text }]}>{t('home.recentFines')}</Text>
            <View style={[styles.liveBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.liveText, { color: '#007b4d' }]}>{t('home.live')}</Text>
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
        <Text style={[styles.sectionHead, { color: colors.text }]}>{t('home.safetyScore')}</Text>
        <View style={[styles.safetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.scoreCircle, { borderColor: colors.accent }]}>
            <Text style={[styles.scoreNumber, { color: colors.text }]}>{profile.safetyScore}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreTitle, { color: colors.text }]}>
              {profile.safetyScore >= 80 ? 'Excellent Driver' : profile.safetyScore >= 60 ? t('home.goodDriver') : 'Keep Learning'}
            </Text>
            <Text style={[styles.scoreDesc, { color: colors.textSecondary }]}>{t('home.improveScore')}</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.scoreBadgeText, { color: '#007b4d' }]}>{profile.safetyScore} / 100</Text>
          </View>
        </View>

        {/* Notifications Button */}
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel="Open Notifications panel"
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <Text style={[styles.notifText, { color: colors.text }]}>{t('notifications.title')}</Text>
          <Text style={{ color: colors.textTertiary }}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
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
  challanCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginTop: 8 },
  challanTitle: { fontSize: 15, fontWeight: '600' },
  challanDescText: { fontSize: 13, lineHeight: 18 },
  inputContainer: { flexDirection: 'row', gap: 8, marginTop: 6 },
  challanInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15 },
  challanBtn: { borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  challanBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  resultsContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  statusInfoText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  noChallansBox: { alignItems: 'center', paddingVertical: 12, gap: 4 },
  successEmoji: { fontSize: 24, marginBottom: 4 },
  successText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  successDesc: { fontSize: 12, textAlign: 'center' },
  challanList: { gap: 10 },
  listHeader: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  challanItemBox: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6, borderStyle: 'solid' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challanNum: { fontSize: 13, fontWeight: '600' },
  challanAmt: { fontSize: 15, fontWeight: '700' },
  challanViolation: { fontSize: 14, fontWeight: '500' },
  challanDetailText: { fontSize: 12 },
  payBtnInline: { borderRadius: 6, paddingVertical: 8, alignItems: 'center', marginTop: 6 },
  payBtnInlineText: { fontSize: 12, fontWeight: '600' },
});
