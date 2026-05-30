/**
 * Reusable Location Selector Modal
 */
import React, { useState, useContext, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Dimensions, Alert,
} from 'react-native';
import * as Location from 'expo-location';
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
  const [gpsLoading, setGpsLoading] = useState(false);

  // Sync state with current location when modal opens
  useEffect(() => {
    if (visible) {
      setCountry(currentLocation.country);
      setStateCode(currentLocation.stateCode);
      setCity(currentLocation.city);
      setStateSearch('');
    }
  }, [visible, currentLocation]);

  async function handleAutoDetect() {
    setGpsLoading(true);
    try {
      // 1. Check if location services are enabled on the device/emulator
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services (GPS) in your device settings and try again.'
        );
        setGpsLoading(false);
        return;
      }

      // 2. Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permissions to use GPS auto-detection.');
        setGpsLoading(false);
        return;
      }

      // 3. Get position with fallback to last known position for speed and emulator compatibility
      let location = await Location.getLastKnownPositionAsync();
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!location) {
        throw new Error('Location coordinates are currently unavailable.');
      }

      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const detectedCountry = address.isoCountryCode || 'IN';
        const detectedRegion = address.region || address.subregion || '';
        const detectedCity = address.city || address.district || address.subregion || '';

        setCountry(detectedCountry);

        if (detectedCountry === 'IN') {
          const normalizedRegion = detectedRegion.toLowerCase().trim();
          let matchedState = INDIAN_STATES.find(s => s.name.toLowerCase() === normalizedRegion);
          if (!matchedState) {
            matchedState = INDIAN_STATES.find(s => 
              normalizedRegion.includes(s.name.toLowerCase()) || 
              s.name.toLowerCase().includes(normalizedRegion)
            );
          }
          if (!matchedState) {
            const normalizedCity = detectedCity.toLowerCase().trim();
            for (const [code, cities] of Object.entries(CITIES_BY_STATE)) {
              if (cities.some(c => c.toLowerCase() === normalizedCity)) {
                matchedState = INDIAN_STATES.find(s => s.code === code);
                break;
              }
            }
          }

          if (matchedState) {
            setStateCode(matchedState.code);
            const allowedCities = CITIES_BY_STATE[matchedState.code] || [];
            const matchedCity = allowedCities.find(c => c.toLowerCase() === detectedCity.toLowerCase()) || allowedCities[0] || matchedState.capital;
            setCity(matchedCity);
            
            setCurrentLocation({
              country: 'IN',
              stateCode: matchedState.code,
              stateName: matchedState.name,
              city: matchedCity,
              isAutoDetected: true,
              lastUpdated: Date.now(),
            });
            
            Alert.alert('Location Detected', `Successfully set location to ${matchedCity}, ${matchedState.name}.`);
            onClose();
          } else {
            Alert.alert('Location Match Failure', `Detected "${detectedRegion}" but could not map it to a supported Indian state. Please select manually.`);
          }
        } else {
          setCurrentLocation({
            country: detectedCountry,
            stateCode: '',
            stateName: detectedRegion || detectedCountry,
            city: detectedCity || '',
            isAutoDetected: true,
            lastUpdated: Date.now(),
          });
          Alert.alert('Location Detected', `Detected location context: ${detectedCity ? detectedCity + ', ' : ''}${detectedRegion || detectedCountry}.`);
          onClose();
        }
      } else {
        Alert.alert('Error', 'Could not retrieve address details for your coordinates.');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to detect location: ' + e.message);
    } finally {
      setGpsLoading(false);
    }
  }

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
            {/* Auto Detect Button */}
            <TouchableOpacity
              style={[styles.gpsBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={handleAutoDetect}
              disabled={gpsLoading}
              accessibilityRole="button"
              accessibilityLabel="Auto-detect location using GPS"
            >
              <Text style={[styles.gpsBtnText, { color: colors.primary }]}>
                {gpsLoading ? '📡 Detecting...' : '📡 Auto-Detect Location (GPS)'}
              </Text>
            </TouchableOpacity>

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
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  gpsBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
