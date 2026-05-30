/**
 * Laws Library Screen
 */
import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../_layout';
import i18n, { t } from '../../src/localization/i18n';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useLocationStore } from '../../src/store/locationStore';
import { useBookmarkStore } from '../../src/store/bookmarkStore';
import { MOCK_LAWS } from '../../src/services/mock/lawsMock';
import { VIOLATION_CATEGORIES } from '../../src/constants/violations';
import type { Law } from '../../src/types/law';
import { INDIAN_STATES, CITIES_BY_STATE, searchStates } from '../../src/constants/states';
import { APP_CONFIG } from '../../src/constants/config';
import LocationSelectorModal from '../../src/components/LocationSelectorModal';

const LOCATION_LEVELS = ['All', 'National', 'State', 'City'] as const;
const SEVERITY_FILTERS = ['All', 'minor', 'moderate', 'major', 'criminal'] as const;
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'fineAmount', label: 'Fine Amount' },
  { value: 'severity', label: 'Severity' },
  { value: 'dateUpdated', label: 'Recently Updated' },
];

export default function LawsScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { settings } = useSettingsStore();

  // Active translation locale sync
  i18n.locale = settings.language;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocationLevel, setSelectedLocationLevel] = useState<typeof LOCATION_LEVELS[number]>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<typeof SEVERITY_FILTERS[number]>('All');
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Dynamic laws state from database
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function fetchLaws() {
      setLoading(true);
      try {
        const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/rules?state=${currentLocation.stateCode}`);
        if (response.ok) {
          const rules = await response.json();
          const mapped = rules.map((rule: any) => {
            let cat = 'safety';
            if (rule.violation_id.includes('speed')) cat = 'speed';
            else if (rule.violation_id.includes('park')) cat = 'parking';
            else if (rule.violation_id.includes('insur')) cat = 'insurance';
            else if (rule.violation_id.includes('licence')) cat = 'licensing';
            else if (rule.violation_id.includes('puc') || rule.violation_id.includes('regist')) cat = 'documents';
            else if (rule.violation_id.includes('dui')) cat = 'dui';
            
            const sev = (rule.base_fine >= 10000) ? 'criminal' : (rule.base_fine >= 5000) ? 'major' : (rule.base_fine >= 1000) ? 'moderate' : 'minor';
            
            return {
              id: rule.violation_id,
              title: rule.title,
              titleHi: rule.title,
              summary: rule.description,
              summaryHi: rule.description,
              officialText: `Section ${rule.section} of the Motor Vehicles Act — Punishable with compounding fee of ₹${rule.compounding_fee}. Notes: ${rule.state_specific_notes}`,
              simplifiedExplanation: rule.description,
              category: cat,
              severity: sev,
              section: rule.section,
              act: 'MVA 2019',
              fineRange: `₹${rule.base_fine.toLocaleString('en-IN')}${rule.max_fine ? ' - ₹' + rule.max_fine.toLocaleString('en-IN') : ''}`,
              applicableVehicles: ['car', '2w', 'auto', 'commercial', 'heavy'],
              applicableStates: [currentLocation.stateCode],
              amendments: [],
              relatedViolationIds: [rule.violation_id],
              lastUpdated: new Date().toISOString().split('T')[0],
            };
          });
          setLaws(mapped);
        } else {
          setLaws(MOCK_LAWS);
        }
      } catch (err) {
        console.warn("Failed to fetch laws from backend, using mock fallback:", err);
        setLaws(MOCK_LAWS);
      } finally {
        setLoading(false);
      }
    }

    fetchLaws();
  }, [currentLocation.stateCode]);

  // Filter popup states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Temporary modal selection states
  const [tempCountry, setTempCountry] = useState('IN');
  const [tempState, setTempState] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [tempCategory, setTempCategory] = useState('all');
  const [tempSeverity, setTempSeverity] = useState<typeof SEVERITY_FILTERS[number]>('All');
  const [stateSearch, setStateSearch] = useState('');

  const filteredLaws = useMemo(() => {
    let results = [...laws];

    // Country/State/City filter logic
    if (selectedCountry === 'IN') {
      // Filter out US/GB laws
      results = results.filter(l => !l.applicableStates.includes('US') && !l.applicableStates.includes('GB'));
      if (selectedState) {
        results = results.filter(l => l.applicableStates.includes('national') || l.applicableStates.includes(selectedState));
      }
    } else {
      // Non-India country selection
      results = results.filter(l => l.applicableStates.includes(selectedCountry));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(l => l.category === selectedCategory);
    }

    // Severity filter
    if (selectedSeverity !== 'All') {
      results = results.filter(l => l.severity === selectedSeverity);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        l => l.title.toLowerCase().includes(q) ||
             l.summary.toLowerCase().includes(q) ||
             l.section.toLowerCase().includes(q)
      );
    }

    return results;
  }, [selectedCategory, selectedSeverity, searchQuery, selectedCountry, selectedState]);

  function handleApplyFilters() {
    setSelectedCountry(tempCountry);
    setSelectedState(tempState);
    setSelectedCity(tempCity);
    setSelectedCategory(tempCategory);
    setSelectedSeverity(tempSeverity);
    setFilterModalVisible(false);
  }

  function handleClearFilters() {
    setTempCountry('IN');
    setTempState('');
    setTempCity('');
    setTempCategory('all');
    setTempSeverity('All');
  }

  function toggleBookmark(law: Law) {
    if (isBookmarked(law.id)) {
      removeBookmark(law.id);
    } else {
      addBookmark({
        id: law.id,
        type: 'law',
        title: law.title,
        summary: `${law.fineRange} — ${law.section}`,
        data: law as unknown as Record<string, unknown>,
        savedAt: Date.now(),
      });
    }
  }

  const severityColors: Record<string, { bg: string; text: string }> = {
    minor: { bg: colors.warningLight, text: '#9a5700' },
    moderate: { bg: colors.warningLight, text: '#9a5700' },
    major: { bg: colors.dangerLight, text: colors.danger },
    criminal: { bg: colors.dangerLight, text: colors.danger },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t('laws.title')}</Text>
        <TouchableOpacity 
          style={[styles.locationChip, { backgroundColor: colors.primaryLight }]}
          onPress={() => setLocationModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Text style={[styles.locationChipText, { color: colors.primary }]}>
            {currentLocation.country === 'IN' ? `National + ${currentLocation.stateCode}` : currentLocation.country} · Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground, color: colors.text }]}
          placeholder={t('laws.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
          onPress={() => {
            setTempCountry(selectedCountry);
            setTempState(selectedState);
            setTempCity(selectedCity);
            setTempCategory(selectedCategory);
            setTempSeverity(selectedSeverity);
            setFilterModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open filters modal"
        >
          <Text style={{ fontSize: 16 }}>🎛️</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catRowContent}>
        <TouchableOpacity
          style={[styles.catChip, { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surface, borderColor: selectedCategory === 'all' ? colors.primary : colors.borderStrong }]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.catChipText, { color: selectedCategory === 'all' ? '#FFF' : colors.textSecondary }]}>All</Text>
        </TouchableOpacity>
        {VIOLATION_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, { backgroundColor: selectedCategory === cat.id ? colors.primary : colors.surface, borderColor: selectedCategory === cat.id ? colors.primary : colors.borderStrong }]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.catChipText, { color: selectedCategory === cat.id ? '#FFF' : colors.textSecondary }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location Level Filters */}
      <View style={styles.levelRow}>
        {LOCATION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.levelChip, { backgroundColor: selectedLocationLevel === level ? colors.primaryLight : colors.surface, borderColor: selectedLocationLevel === level ? colors.primary : colors.border }]}
            onPress={() => setSelectedLocationLevel(level)}
          >
            <Text style={[styles.levelChipText, { color: selectedLocationLevel === level ? colors.primary : colors.textSecondary }]}>
              {level === 'State' ? `State (${currentLocation.stateCode})` : level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters Modal Popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🎛️ Filter Laws</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close filter modal"
              >
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              {/* Country Selection */}
              <Text style={[styles.filterTitle, { color: colors.text }]}>{t('profile.country')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {APP_CONFIG.countries.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.filterChip, { backgroundColor: tempCountry === c.code ? colors.primaryLight : 'transparent', borderColor: tempCountry === c.code ? colors.primary : colors.borderStrong }]}
                    onPress={() => {
                      setTempCountry(c.code);
                      setTempState('');
                      setTempCity('');
                    }}
                  >
                    <Text style={[styles.filterChipText, { color: tempCountry === c.code ? colors.primary : colors.textSecondary }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* India Regional Filters */}
              {tempCountry === 'IN' && (
                <>
                  {/* State Select */}
                  <Text style={[styles.filterTitle, { color: colors.text }]}>{t('onboarding.selectState')}</Text>
                  <TextInput
                    style={[styles.filterSearchInput, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                    placeholder="Search states..."
                    placeholderTextColor={colors.textTertiary}
                    value={stateSearch}
                    onChangeText={setStateSearch}
                  />
                  <View style={styles.stateGrid}>
                    {searchStates(stateSearch).map((s) => (
                      <TouchableOpacity
                        key={s.code}
                        style={[styles.stateChip, { borderColor: tempState === s.code ? colors.primary : colors.borderStrong, backgroundColor: tempState === s.code ? colors.primaryLight : colors.surface }]}
                        onPress={() => {
                          setTempState(s.code);
                          setTempCity('');
                          setStateSearch('');
                        }}
                      >
                        <Text style={[tempState === s.code ? { fontWeight: '700' } : null, styles.stateChipText, { color: tempState === s.code ? colors.primary : colors.text }]}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* City Selection */}
                  {tempState && CITIES_BY_STATE[tempState] && (
                    <>
                      <Text style={[styles.filterTitle, { color: colors.text }]}>{t('onboarding.selectCity')}</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                        {CITIES_BY_STATE[tempState].map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={[styles.filterChip, { backgroundColor: tempCity === city ? colors.primaryLight : 'transparent', borderColor: tempCity === city ? colors.primary : colors.borderStrong }]}
                            onPress={() => setTempCity(city)}
                          >
                            <Text style={[styles.filterChipText, { color: tempCity === city ? colors.primary : colors.textSecondary }]}>
                              {city}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </>
              )}

              {/* Violation Type (Category) Selection */}
              <Text style={[styles.filterTitle, { color: colors.text }]}>{t('calculator.violationType')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.filterChip, { backgroundColor: tempCategory === 'all' ? colors.primaryLight : 'transparent', borderColor: tempCategory === 'all' ? colors.primary : colors.borderStrong }]}
                  onPress={() => setTempCategory('all')}
                >
                  <Text style={[styles.filterChipText, { color: tempCategory === 'all' ? colors.primary : colors.textSecondary }]}>All Types</Text>
                </TouchableOpacity>
                {VIOLATION_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterChip, { backgroundColor: tempCategory === cat.id ? colors.primaryLight : 'transparent', borderColor: tempCategory === cat.id ? colors.primary : colors.borderStrong }]}
                    onPress={() => setTempCategory(cat.id)}
                  >
                    <Text style={[styles.filterChipText, { color: tempCategory === cat.id ? colors.primary : colors.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Severity Filter */}
              <Text style={[styles.filterTitle, { color: colors.text }]}>Severity</Text>
              <View style={[styles.filterChipsRow, { marginBottom: 12 }]}>
                {SEVERITY_FILTERS.map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    style={[styles.filterChip, { backgroundColor: tempSeverity === sev ? colors.primaryLight : 'transparent', borderColor: tempSeverity === sev ? colors.primary : colors.borderStrong }]}
                    onPress={() => setTempSeverity(sev)}
                  >
                    <Text style={[styles.filterChipText, { color: tempSeverity === sev ? colors.primary : colors.textSecondary }]}>
                      {sev === 'All' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: colors.borderStrong }]}
                onPress={handleClearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('notifications.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={handleApplyFilters}
                accessibilityRole="button"
                accessibilityLabel="Apply filters to results"
              >
                <Text style={styles.applyBtnText}>{t('common.apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Laws List */}
      <ScrollView style={styles.lawsList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.lawsListContent}>
        {filteredLaws.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No laws found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredLaws.map((law) => {
            const sev = severityColors[law.severity] || severityColors.minor;
            const bookmarked = isBookmarked(law.id);
            return (
              <TouchableOpacity
                key={law.id}
                style={[styles.lawCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/law-detail/${law.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.lawCardHead}>
                  <Text style={[styles.lawTitle, { color: colors.text }]}>{law.title}</Text>
                  <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                    <Text style={[styles.sevBadgeText, { color: sev.text }]}>
                      {law.severity.charAt(0).toUpperCase() + law.severity.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.lawSummary, { color: colors.textSecondary }]} numberOfLines={2}>
                  {law.summary}
                </Text>
                <View style={styles.lawMeta}>
                  <Text style={[styles.lawFine, { color: colors.danger }]}>{law.fineRange}</Text>
                  <Text style={[styles.lawSection, { color: colors.textTertiary }]}>{law.act} {law.section}</Text>
                  {law.amendments.length > 0 && (
                    <View style={[styles.updatedBadge]}>
                      <Text style={styles.updatedBadgeText}>Updated {law.lastUpdated}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => toggleBookmark(law)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={{ fontSize: 16 }}>{bookmarked ? '🔖' : '🏷️'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
  topBarTitle: { fontSize: 18, fontWeight: '700' },
  locationChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  locationChipText: { fontSize: 12, fontWeight: '500' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14.5 },
  filterBtn: { paddingHorizontal: 12, height: 44, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  catRow: { maxHeight: 48, minHeight: 48 },
  catRowContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  catChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  catChipText: { fontSize: 13, fontWeight: '500' },
  levelRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  levelChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  levelChipText: { fontSize: 12, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyBtn: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  stateChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    paddingHorizontal: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginRight: 6 },
  filterChipText: { fontSize: 12 },
  resultsCount: { fontSize: 12, marginTop: 8 },
  filterSearchInput: { borderWidth: 1, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 6 },
  lawsList: { flex: 1 },
  lawsListContent: { paddingHorizontal: 16, gap: 10 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDesc: { fontSize: 14 },
  lawCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  lawCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  lawTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sevBadgeText: { fontSize: 11, fontWeight: '500' },
  lawSummary: { fontSize: 13.5, lineHeight: 20, marginBottom: 10 },
  lawMeta: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  lawFine: { fontSize: 13, fontWeight: '600' },
  lawSection: { fontSize: 12 },
  updatedBadge: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  updatedBadgeText: { fontSize: 10, color: '#92400e' },
});
