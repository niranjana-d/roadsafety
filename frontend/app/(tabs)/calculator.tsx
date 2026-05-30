/**
 * Challan Calculator Screen
 */
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert, TextInput } from 'react-native';
import { ThemeContext } from '../_layout';
import { useLocationStore } from '../../src/store/locationStore';
import { useCalculatorStore } from '../../src/store/calculatorStore';
import { useBookmarkStore } from '../../src/store/bookmarkStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import i18n, { t } from '../../src/localization/i18n';
import { VIOLATIONS, VIOLATION_BY_ID, getFineData } from '../../src/constants/violations';
import { VEHICLE_TYPES, VEHICLE_BY_ID } from '../../src/constants/vehicles';
import { INDIAN_STATES, STATE_BY_CODE } from '../../src/constants/states';
import { APP_CONFIG } from '../../src/constants/config';
import { formatINR } from '../../src/utils/formatCurrency';
import type { FineCalculation } from '../../src/types/violation';
import LocationSelectorModal from '../../src/components/LocationSelectorModal';

export default function CalculatorScreen() {
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const { addBookmark, isBookmarked } = useBookmarkStore();
  const { settings } = useSettingsStore();
  const store = useCalculatorStore();

  // Sync translation language
  i18n.locale = settings.language;

  const [showComparison, setShowComparison] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [customVehicle, setCustomVehicle] = useState('');

  // Sync store state with currentLocation (supports Indian states and global countries)
  React.useEffect(() => {
    store.setState(currentLocation.stateCode || currentLocation.country);
  }, [currentLocation.stateCode, currentLocation.country]);

  async function handleCalculate() {
    if (!store.selectedViolation) {
      Alert.alert('Required', 'Please select a violation type.');
      return;
    }

    const violation = VIOLATION_BY_ID[store.selectedViolation];
    if (!violation) return;

    const vehicleName = customVehicle.trim() ? customVehicle.trim() : (VEHICLE_BY_ID[store.selectedVehicle]?.name || store.selectedVehicle);

    // Call backend API for calculation first
    try {
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          violation_id: store.selectedViolation,
          vehicle_type_id: store.selectedVehicle,
          state_code: store.selectedState,
          offense_number: store.isRepeatOffence ? 2 : 1,
          city_name: currentLocation.city || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result: FineCalculation = {
          id: data.calculation_id,
          violationId: data.violation_id,
          violationName: data.violation_name,
          vehicleType: vehicleName,
          stateCode: data.state_code,
          stateName: data.state_name,
          isRepeat: data.is_repeat,
          baseFine: data.base_fine,
          surcharge: data.surcharge,
          compoundingFee: data.compounding_fee,
          totalFine: data.total_fine,
          licencePoints: data.licence_points,
          imprisonment: data.imprisonment,
          section: data.section,
          act: data.act,
          calculatedAt: data.calculated_at || Date.now(),
        };
        store.setResult(result);
        setShowComparison(false);
        return;
      }
    } catch (err) {
      console.warn("Failed to calculate fine on backend, using offline fallback:", err);
    }

    // Local offline calculation fallback
    const fineData = getFineData(store.selectedViolation, store.selectedState);
    if (!fineData) return;

    const baseFine = store.isRepeatOffence ? fineData.repeatFine : fineData.baseFine;
    const total = baseFine + fineData.surcharge + fineData.compoundingFee;

    const result: FineCalculation = {
      id: `calc-${Date.now()}`,
      violationId: store.selectedViolation,
      violationName: violation.name,
      vehicleType: vehicleName,
      stateCode: store.selectedState,
      stateName: STATE_BY_CODE[store.selectedState]?.name || store.selectedState,
      isRepeat: store.isRepeatOffence,
      baseFine,
      surcharge: fineData.surcharge,
      compoundingFee: fineData.compoundingFee,
      totalFine: total,
      licencePoints: fineData.licencePoints,
      imprisonment: fineData.imprisonment,
      section: fineData.section,
      act: fineData.act,
      calculatedAt: Date.now(),
    };

    store.setResult(result);
    setShowComparison(false);
  }

  function handleSave() {
    if (!store.lastResult) return;
    addBookmark({
      id: store.lastResult.id,
      type: 'calculation',
      title: `${store.lastResult.violationName} — ${store.lastResult.stateName}`,
      summary: `${formatINR(store.lastResult.totalFine)} (${store.lastResult.isRepeat ? 'Repeat' : 'First'} offence)`,
      data: store.lastResult as unknown as Record<string, unknown>,
      savedAt: Date.now(),
    });
    Alert.alert('Saved', 'Calculation saved to your bookmarks.');
  }

  function handlePayOnline() {
    const url = APP_CONFIG.paymentPortals[store.selectedState] || APP_CONFIG.paymentPortals.national;
    Linking.openURL(url);
  }

  // Comparison data
  function getComparisonData() {
    if (!store.selectedViolation) return [];
    const states = ['MH', 'DL', 'KA', 'TN', 'GJ', 'UP'];
    return states.map(code => {
      const fineData = getFineData(store.selectedViolation, code);
      const baseFine = store.isRepeatOffence ? (fineData?.repeatFine || 0) : (fineData?.baseFine || 0);
      const total = baseFine + (fineData?.surcharge || 0) + (fineData?.compoundingFee || 0);
      return {
        stateCode: code,
        stateName: STATE_BY_CODE[code]?.name || code,
        totalFine: total,
        baseFine,
        section: fineData?.section || '—',
      };
    }).sort((a, b) => a.totalFine - b.totalFine);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t('calculator.title')}</Text>
        <TouchableOpacity 
          style={[styles.locationChip, { backgroundColor: colors.primaryLight }]}
          onPress={() => setLocationModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Text style={[styles.locationChipText, { color: colors.primary }]}>
            📍 {currentLocation.city || currentLocation.country}, {currentLocation.stateCode || currentLocation.country} · Change
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        <View style={styles.formBody}>
          {/* Violation Type */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('calculator.violationType')}</Text>
            <ScrollView 
              style={[styles.violationList, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground }]}
              nestedScrollEnabled={true}
            >
              {VIOLATIONS.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.violationItem,
                    { borderBottomColor: colors.border },
                    store.selectedViolation === v.id && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => store.setViolation(v.id)}
                >
                  <View style={styles.violationInfo}>
                    <Text style={[styles.violationName, { color: store.selectedViolation === v.id ? colors.primary : colors.text }]}>
                      {v.name}
                    </Text>
                    <Text style={[styles.violationDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                      {v.description}
                    </Text>
                  </View>
                  <View style={[styles.sevBadge, { backgroundColor: v.severity === 'criminal' ? colors.dangerLight : v.severity === 'major' ? colors.dangerLight : colors.warningLight }]}>
                    <Text style={[styles.sevBadgeText, { color: v.severity === 'criminal' || v.severity === 'major' ? colors.danger : colors.warning }]}>
                      {v.severity}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Vehicle Type */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('calculator.vehicleType')}</Text>
            <View style={styles.vehicleGrid}>
              {VEHICLE_TYPES.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.vehicleBtn,
                    { borderColor: store.selectedVehicle === v.id ? colors.primary : colors.borderStrong, backgroundColor: store.selectedVehicle === v.id ? colors.primaryLight : colors.surface },
                  ]}
                  onPress={() => store.setVehicle(v.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: store.selectedVehicle === v.id }}
                >
                  <Text style={{ fontSize: 20 }}>{v.icon}</Text>
                  <Text style={[styles.vehicleName, { color: store.selectedVehicle === v.id ? colors.primary : colors.textSecondary }]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Vehicle Textarea */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Custom Vehicle Type (if not listed)</Text>
            <TextInput
              style={[
                styles.textareaInput,
                { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground, color: colors.text }
              ]}
              placeholder="e.g. Heavy Crane, Tractor, Road Roller, E-Scooter..."
              placeholderTextColor={colors.textTertiary}
              value={customVehicle}
              onChangeText={setCustomVehicle}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Offence Toggle */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('calculator.offenceNumber')}</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, {
                  borderColor: !store.isRepeatOffence ? colors.primary : colors.borderStrong,
                  backgroundColor: !store.isRepeatOffence ? colors.primaryLight : colors.surface,
                }]}
                onPress={() => store.setRepeatOffence(false)}
              >
                <Text style={[styles.toggleText, { color: !store.isRepeatOffence ? colors.primary : colors.textSecondary }]}>
                  {t('calculator.firstOffence')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, {
                  borderColor: store.isRepeatOffence ? colors.primary : colors.borderStrong,
                  backgroundColor: store.isRepeatOffence ? colors.primaryLight : colors.surface,
                }]}
                onPress={() => store.setRepeatOffence(true)}
              >
                <Text style={[styles.toggleText, { color: store.isRepeatOffence ? colors.primary : colors.textSecondary }]}>
                  {t('calculator.repeatOffence')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <TouchableOpacity
            style={styles.formGroup}
            onPress={() => setLocationModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Select location manually"
          >
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('calculator.location')}</Text>
            <View style={[styles.stateSelector, { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.stateSelectorText, { color: colors.text }]}>
                📍 {STATE_BY_CODE[store.selectedState]?.name || currentLocation.stateName || 'National'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.calcBtn, { backgroundColor: colors.primary }]}
            onPress={handleCalculate}
            accessibilityRole="button"
            accessibilityLabel="Calculate Fine"
          >
            <Text style={styles.calcBtnText}>{t('calculator.calculateFine')} →</Text>
          </TouchableOpacity>

          {/* Result Card */}
          {store.lastResult && (
            <View style={[styles.resultCard, { borderColor: colors.border }]}>
              <View style={[styles.resultHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.resultTitle}>
                  {store.lastResult.violationName} · {store.lastResult.isRepeat ? t('calculator.repeatOffence') : t('calculator.firstOffence')}
                </Text>
                <Text style={styles.resultTotal}>{formatINR(store.lastResult.totalFine)}</Text>
              </View>
              <View style={styles.resultRows}>
                <ResultRow label={`${t('calculator.baseFine')} (${store.lastResult.act})`} value={formatINR(store.lastResult.baseFine)} colors={colors} />
                <ResultRow label={t('calculator.surcharge')} value={formatINR(store.lastResult.surcharge)} colors={colors} />
                <ResultRow label={t('calculator.compounding')} value={formatINR(store.lastResult.compoundingFee)} colors={colors} />
                <View style={[styles.resultDivider, { borderTopColor: colors.border }]} />
                <ResultRow label={t('calculator.totalPayable')} value={formatINR(store.lastResult.totalFine)} colors={colors} bold danger />
                <ResultRow label={t('calculator.licencePoints')} value={`${store.lastResult.licencePoints} pts`} colors={colors} />
                {store.lastResult.imprisonment && (
                  <ResultRow label="Imprisonment" value={store.lastResult.imprisonment} colors={colors} />
                )}
                <ResultRow label={t('calculator.lawReference')} value={`${store.lastResult.act} ${store.lastResult.section}`} colors={colors} primary />
              </View>
              <View style={[styles.resultActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.borderStrong }]} onPress={handleSave}>
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>💾 {t('common.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.borderStrong }]} onPress={() => setShowComparison(!showComparison)}>
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>🔄 {t('calculator.compare')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={handlePayOnline}>
                  <Text style={[styles.actionBtnText, { color: '#FFF' }]}>🔗 {t('calculator.payOnline')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Comparison View */}
          {showComparison && store.lastResult && (
            <View style={[styles.comparisonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.comparisonTitle, { color: colors.text }]}>
                Same violation in other states
              </Text>
              {getComparisonData().map((item, i) => (
                <View key={item.stateCode} style={[styles.comparisonRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View>
                    <Text style={[styles.compStateName, { color: item.stateCode === store.selectedState ? colors.primary : colors.text }]}>
                      {item.stateName} {item.stateCode === store.selectedState ? '(Current)' : ''}
                    </Text>
                    <Text style={[styles.compSection, { color: colors.textTertiary }]}>{item.section}</Text>
                  </View>
                  <Text style={[styles.compFine, { color: colors.danger }]}>{formatINR(item.totalFine)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </View>
  );
}

function ResultRow({ label, value, colors, bold, danger, primary }: {
  label: string; value: string; colors: any; bold?: boolean; danger?: boolean; primary?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[
        styles.resultValue,
        bold && { fontWeight: '600' },
        danger && { color: colors.danger },
        primary && { color: colors.primary, fontSize: 13 },
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
  topBarTitle: { fontSize: 18, fontWeight: '700' },
  locationChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  locationChipText: { fontSize: 12, fontWeight: '500' },
  scrollContent: { flex: 1 },
  formBody: { padding: 16, gap: 16 },
  formGroup: { gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '500' },
  violationList: { maxHeight: 200, borderWidth: 1, borderRadius: 8 },
  violationItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, gap: 8 },
  violationInfo: { flex: 1 },
  violationName: { fontSize: 14, fontWeight: '500' },
  violationDesc: { fontSize: 12, marginTop: 2 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sevBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  vehicleGrid: { flexDirection: 'row', gap: 8 },
  vehicleBtn: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 10, alignItems: 'center', gap: 4 },
  vehicleName: { fontSize: 9, textAlign: 'center' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: { flex: 1, borderWidth: 1.5, borderRadius: 8, padding: 11, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '500' },
  stateSelector: { borderWidth: 1, borderRadius: 8, padding: 12 },
  stateSelectorText: { fontSize: 15 },
  calcBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  calcBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  resultCard: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  resultHeader: { padding: 20 },
  resultTitle: { color: '#FFF', fontSize: 14, marginBottom: 4 },
  resultTotal: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  resultRows: { padding: 16, gap: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14 },
  resultValue: { fontSize: 14, fontWeight: '500' },
  resultDivider: { borderTopWidth: 1, paddingTop: 10 },
  resultActions: { flexDirection: 'row', gap: 8, padding: 14, borderTopWidth: 1 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '500' },
  comparisonCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  comparisonTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  compStateName: { fontSize: 14, fontWeight: '500' },
  compSection: { fontSize: 12, marginTop: 2 },
  compFine: { fontSize: 15, fontWeight: '600' },
  textareaInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
