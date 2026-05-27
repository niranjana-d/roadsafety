/**
 * Onboarding Screen — Carousel + Location Setup + Language Selection
 */
import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StyleSheet, Dimensions, FlatList, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';
import { useSettingsStore } from '../src/store/settingsStore';
import { useLocationStore } from '../src/store/locationStore';
import { INDIAN_STATES, CITIES_BY_STATE, searchStates } from '../src/constants/states';
import { APP_CONFIG } from '../src/constants/config';
import { spacing, borderRadius, typography } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: 'ℹ️',
    bg: '#E8F0FE',
    title: 'Get Local Traffic Laws Instantly',
    desc: 'Access state-specific traffic regulations, fines, and rules for your exact location — simplified for everyday drivers.',
  },
  {
    emoji: '🧮',
    bg: '#E0F8EF',
    title: 'Calculate Fines Before They Happen',
    desc: "Know the exact penalty for any violation, in any state, before it costs you — so you're never caught off guard.",
  },
  {
    emoji: '📥',
    bg: '#FFF3E0',
    title: 'Works Offline, Anywhere',
    desc: "Download your state's laws for offline access. Whether you have signal or not, DriveLegal has you covered.",
  },
];

type Step = 'carousel' | 'language' | 'location';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { completeOnboarding, setLanguage } = useSettingsStore();
  const { setCurrentLocation } = useLocationStore();

  const [step, setStep] = useState<Step>('carousel');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  const flatListRef = useRef<FlatList>(null);

  const filteredStates = stateSearch ? searchStates(stateSearch) : INDIAN_STATES;
  const cities = selectedState ? (CITIES_BY_STATE[selectedState] || []) : [];

  function handleNextSlide() {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      setStep('language');
    }
  }

  function handleLanguageSelect() {
    setLanguage(selectedLang);
    setStep('location');
  }

  function handleFinish() {
    if (selectedState) {
      const state = INDIAN_STATES.find(s => s.code === selectedState);
      setCurrentLocation({
        country: selectedCountry,
        stateCode: selectedState,
        stateName: state?.name || '',
        city: selectedCity || state?.capital || '',
        isAutoDetected: false,
        lastUpdated: Date.now(),
      });
    }
    completeOnboarding();
    router.replace('/(tabs)');
  }

  function handleSkip() {
    completeOnboarding();
    router.replace('/(tabs)');
  }

  // ─── Carousel Step ─────────────────────────────────────────
  if (step === 'carousel') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.logoBlock}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoEmoji}>⚖️</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>DriveLegal</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>Know the Law. Drive Safe.</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentSlide(idx);
          }}
          keyExtractor={(_, i) => `slide-${i}`}
          renderItem={({ item }) => (
            <View style={[styles.slideContainer, { width }]}>
              <View style={[styles.slideIcon, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 44 }}>{item.emoji}</Text>
              </View>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
          )}
        />

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentSlide ? colors.primary : colors.border },
                i === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleNextSlide}
          accessibilityRole="button"
          accessibilityLabel={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        >
          <Text style={styles.primaryBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started →' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, { color: colors.textSecondary }]}>Skip for now →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Language Step ─────────────────────────────────────────
  if (step === 'language') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>🌐 Select Language</Text>
        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
          Choose your preferred app language
        </Text>

        <View style={styles.optionsGrid}>
          {APP_CONFIG.languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.optionCard,
                { borderColor: selectedLang === lang.code ? colors.primary : colors.border, backgroundColor: selectedLang === lang.code ? colors.primaryLight : colors.surface },
              ]}
              onPress={() => setSelectedLang(lang.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedLang === lang.code }}
            >
              <Text style={[styles.optionLabel, { color: selectedLang === lang.code ? colors.primary : colors.text }]}>
                {lang.nameLocal}
              </Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleLanguageSelect}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Location Step ─────────────────────────────────────────
  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>📍 Set Your Location</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
        We'll show you traffic laws for your area
      </Text>

      <TouchableOpacity style={[styles.gpsBtn, { backgroundColor: colors.primary }]}>
        <Text style={styles.gpsBtnText}>📍 Use Current Location (GPS)</Text>
      </TouchableOpacity>

      <Text style={[styles.orDivider, { color: colors.textTertiary }]}>— or select manually —</Text>

      {/* Country */}
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Country</Text>
        <View style={[styles.selectBox, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground }]}>
          <Text style={[styles.selectText, { color: colors.text }]}>🇮🇳 India</Text>
        </View>
      </View>

      {/* State Search */}
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.textSecondary }]}>State / Union Territory</Text>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground, color: colors.text }]}
          placeholder="Search states..."
          placeholderTextColor={colors.textTertiary}
          value={stateSearch}
          onChangeText={setStateSearch}
        />
        <ScrollView style={styles.stateList} nestedScrollEnabled>
          {filteredStates.map((s) => (
            <TouchableOpacity
              key={s.code}
              style={[
                styles.stateItem,
                { borderColor: selectedState === s.code ? colors.primary : colors.border, backgroundColor: selectedState === s.code ? colors.primaryLight : 'transparent' },
              ]}
              onPress={() => { setSelectedState(s.code); setSelectedCity(''); setStateSearch(''); }}
            >
              <Text style={[styles.stateName, { color: selectedState === s.code ? colors.primary : colors.text }]}>
                {s.name}
              </Text>
              <Text style={[styles.stateCode, { color: colors.textTertiary }]}>{s.code}</Text>
              {s.isUT && (
                <View style={[styles.utBadge, { backgroundColor: colors.warningLight }]}>
                  <Text style={[styles.utBadgeText, { color: colors.warning }]}>UT</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* City */}
      {selectedState && cities.length > 0 && (
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityChip,
                  { borderColor: selectedCity === city ? colors.primary : colors.borderStrong, backgroundColor: selectedCity === city ? colors.primaryLight : colors.surface },
                ]}
                onPress={() => setSelectedCity(city)}
              >
                <Text style={[styles.cityText, { color: selectedCity === city ? colors.primary : colors.textSecondary }]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: selectedState ? 1 : 0.5 }]}
        onPress={handleFinish}
        disabled={!selectedState}
      >
        <Text style={styles.primaryBtnText}>Continue to DriveLegal →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={styles.ghostBtn}>
        <Text style={[styles.ghostBtnText, { color: colors.textSecondary }]}>Skip for now →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 28, paddingBottom: 60 },
  logoBlock: { alignItems: 'center', marginBottom: 36 },
  logoMark: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  appTagline: { fontSize: 16, marginTop: 6 },
  slideContainer: { alignItems: 'center', paddingHorizontal: 28 },
  slideIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  slideTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  slideDesc: { fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 300 },
  dotsRow: { flexDirection: 'row', gap: 6, marginVertical: 24, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22, borderRadius: 4 },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, width: '100%', maxWidth: 340, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  ghostBtn: { marginTop: 14, padding: 8 },
  ghostBtnText: { fontSize: 14 },
  stepTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  stepDesc: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  optionsGrid: { gap: 12, width: '100%', maxWidth: 340, marginBottom: 24 },
  optionCard: { borderWidth: 1.5, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionLabel: { fontSize: 18, fontWeight: '600' },
  optionSub: { fontSize: 14 },
  gpsBtn: { borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  gpsBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  orDivider: { textAlign: 'center', fontSize: 13, marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  selectBox: { borderWidth: 1, borderRadius: 8, padding: 12 },
  selectText: { fontSize: 15 },
  searchInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 8 },
  stateList: { maxHeight: 200 },
  stateItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 4, gap: 8 },
  stateName: { flex: 1, fontSize: 14, fontWeight: '500' },
  stateCode: { fontSize: 12 },
  utBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  utBadgeText: { fontSize: 10, fontWeight: '600' },
  cityScroll: { maxHeight: 44 },
  cityChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  cityText: { fontSize: 13 },
});
