/**
 * Reusable Location Selector Modal
 */
import React, { useState, useContext, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Dimensions,
} from 'react-native';
import { ThemeContext } from '../../app/_layout';
import { useLocationStore } from '../store/locationStore';
import { INDIAN_STATES, CITIES_BY_STATE, searchStates } from '../constants/states';
import { APP_CONFIG } from '../constants/config';
import { spacing, borderRadius, touchTargets } from '../constants/theme';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationSelectorModal({ visible, onClose }: LocationSelectorModalProps) {
  const { colors } = useContext(ThemeContext);
  const { currentLocation, setCurrentLocation } = useLocationStore();

  const [country, setCountry] = useState(currentLocation.country);
  const [stateCode, setStateCode] = useState(currentLocation.stateCode);
  const [city, setCity] = useState(currentLocation.city);
  const [stateSearch, setStateSearch] = useState('');

  // Sync state with current location when modal opens
  useEffect(() => {
    if (visible) {
      setCountry(currentLocation.country);
      setStateCode(currentLocation.stateCode);
      setCity(currentLocation.city);
      setStateSearch('');
    }
  }, [visible, currentLocation]);

  const filteredStates = stateSearch ? searchStates(stateSearch) : INDIAN_STATES;
  const cities = country === 'IN' && stateCode ? (CITIES_BY_STATE[stateCode] || []) : [];

  function handleSave() {
    const selectedState = country === 'IN' ? INDIAN_STATES.find(s => s.code === stateCode) : null;
    
    setCurrentLocation({
      country,
      stateCode: country === 'IN' ? stateCode : '',
      stateName: country === 'IN' ? (selectedState?.name || '') : '',
      city: country === 'IN' ? (city || selectedState?.capital || '') : '',
      isAutoDetected: false,
      lastUpdated: Date.now(),
    });
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>📍 Set Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close location selector">
              <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
            {/* Country Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
              {APP_CONFIG.countries.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryChip,
                    {
                      borderColor: country === c.code ? colors.primary : colors.borderStrong,
                      backgroundColor: country === c.code ? colors.primaryLight : colors.surface,
                    },
                  ]}
                  onPress={() => {
                    setCountry(c.code);
                    if (c.code !== 'IN') {
                      setStateCode('');
                      setCity('');
                    } else {
                      setStateCode('MH');
                      setCity('Mumbai');
                    }
                  }}
                >
                  <Text style={[styles.countryText, { color: country === c.code ? colors.primary : colors.text }]}>
                    {c.nameLocal}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* India specific selectors */}
            {country === 'IN' && (
              <>
                {/* State Selection */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>State / Union Territory</Text>
                <TextInput
                  style={[
                    styles.searchInput,
                    { borderColor: colors.borderStrong, backgroundColor: colors.inputBackground, color: colors.text },
                  ]}
                  placeholder="Search states..."
                  placeholderTextColor={colors.textTertiary}
                  value={stateSearch}
                  onChangeText={setStateSearch}
                />
                
                <View style={styles.stateGrid}>
                  {filteredStates.map((s) => (
                    <TouchableOpacity
                      key={s.code}
                      style={[
                        styles.stateChip,
                        {
                          borderColor: stateCode === s.code ? colors.primary : colors.borderStrong,
                          backgroundColor: stateCode === s.code ? colors.primaryLight : colors.surface,
                        },
                      ]}
                      onPress={() => {
                        setStateCode(s.code);
                        setCity(CITIES_BY_STATE[s.code]?.[0] || s.capital || '');
                        setStateSearch('');
                      }}
                    >
                      <Text style={[styles.stateChipText, { color: stateCode === s.code ? colors.primary : colors.text }]}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* City Selection */}
                {cities.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>City</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                      {cities.map((ct) => (
                        <TouchableOpacity
                          key={ct}
                          style={[
                            styles.cityChip,
                            {
                              borderColor: city === ct ? colors.primary : colors.borderStrong,
                              backgroundColor: city === ct ? colors.primaryLight : colors.surface,
                            },
                          ]}
                          onPress={() => setCity(ct)}
                        >
                          <Text style={[styles.cityText, { color: city === ct ? colors.primary : colors.textSecondary }]}>
                            {ct}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </>
            )}

            {country !== 'IN' && (
              <View style={styles.nonIndiaContainer}>
                <Text style={[styles.nonIndiaText, { color: colors.textSecondary }]}>
                  Laws for this country will be served dynamically under international policy context when online.
                </Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Apply location changes"
          >
            <Text style={styles.saveBtnText}>Apply Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    height: Dimensions.get('window').height * 0.8,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    paddingHorizontal: spacing.sm,
    height: touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countryScroll: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  countryChip: {
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },
  stateChip: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stateChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  stateName: {
    fontSize: 14,
    fontWeight: '500',
  },
  stateCodeText: {
    fontSize: 12,
  },
  cityScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  cityChip: {
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nonIndiaContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  nonIndiaText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  saveBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
