/**
 * Profile & Settings Screen
 */
import React, { useContext, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Switch, Alert, Modal, TextInput, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../_layout';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useBookmarkStore } from '../../src/store/bookmarkStore';
import { useLocationStore } from '../../src/store/locationStore';
import { useOfflineStore } from '../../src/store/offlineStore';
import i18n, { t } from '../../src/localization/i18n';
import { VEHICLE_TYPES, VEHICLE_BY_ID } from '../../src/constants/vehicles';
import { INDIAN_STATES } from '../../src/constants/states';
import { APP_CONFIG } from '../../src/constants/config';
import { timeAgo } from '../../src/utils/formatDate';
import { spacing, borderRadius, touchTargets } from '../../src/constants/theme';
import LocationSelectorModal from '../../src/components/LocationSelectorModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { profile, updateProfile, addVehicle, removeVehicle } = useUserStore();
  const { settings, setTheme, setLanguage, toggleHighContrast, toggleReducedMotion, updateNotifications } = useSettingsStore();
  const { bookmarks, removeBookmark } = useBookmarkStore();
  const { currentLocation } = useLocationStore();
  const { downloadedPacks, lastSyncAt } = useOfflineStore();

  // Sync translation locale
  i18n.locale = settings.language;

  const savedLawsList = bookmarks.filter(b => b.type === 'law');
  const savedCalcsList = bookmarks.filter(b => b.type === 'calculation');

  const themeLabel = settings.theme === 'dark' ? 'Dark' : settings.theme === 'light' ? 'Light' : 'System';
  const langLabel = APP_CONFIG.languages.find(l => l.code === settings.language)?.name || 'English';
  const countryLabel = APP_CONFIG.countries.find(c => c.code === settings.country)?.name || 'India';

  // Modal visibility states
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [addVehicleVisible, setAddVehicleVisible] = useState(false);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [bookmarkType, setBookmarkType] = useState<'law' | 'calculation'>('law');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Form states
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email || '');
  const [editPhone, setEditPhone] = useState(profile.phone || '');

  const [vehName, setVehName] = useState('');
  const [vehType, setVehType] = useState('car');
  const [vehRegState, setVehRegState] = useState('MH');
  const [vehRegNum, setVehRegNum] = useState('');

  function cycleTheme() {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = themes.indexOf(settings.theme);
    setTheme(themes[(idx + 1) % themes.length]);
  }

  function handleSaveProfile() {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    updateProfile({ name: editName, email: editEmail, phone: editPhone });
    setEditProfileVisible(false);
    Alert.alert('Success', 'Profile updated successfully.');
  }

  function handleAddVehicle() {
    if (!vehName.trim()) {
      Alert.alert('Error', 'Please enter a vehicle name (e.g. Honda City).');
      return;
    }
    addVehicle({
      id: `veh-${Date.now()}`,
      name: vehName,
      type: vehType,
      registrationState: vehRegState,
      registrationNumber: vehRegNum.toUpperCase().trim(),
    });
    setVehName('');
    setVehRegNum('');
    setAddVehicleVisible(false);
    Alert.alert('Success', 'Vehicle added to your profile.');
  }

  function handleLanguageSelect(code: string) {
    setLanguage(code);
    setLangModalVisible(false);
  }

  function handleCountrySelect(code: string) {
    updateNotifications({ appUpdates: true });
    // Update setting country
    useSettingsStore.getState().updateSettings({ country: code });
    setCountryModalVisible(false);
  }

  function openSavedItems(type: 'law' | 'calculation') {
    setBookmarkType(type);
    setBookmarksVisible(true);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR'}
          </Text>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <TouchableOpacity onPress={() => setLocationModalVisible(true)} style={{ alignItems: 'center' }} activeOpacity={0.7}>
          <Text style={styles.heroSub}>
            📍 {currentLocation.city || 'Select Location'}, {currentLocation.stateName || currentLocation.country} · {profile.vehicles.map(v => VEHICLE_BY_ID[v.type]?.icon || '🚗').join(' ')} (Change)
          </Text>
        </TouchableOpacity>
        
        {/* Named Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => {
            setEditName(profile.name);
            setEditEmail(profile.email || '');
            setEditPhone(profile.phone || '');
            setEditProfileVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
        >
          <Text style={{ fontSize: 13, color: '#FFF', fontWeight: '600' }}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Info Display */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONTACT DETAILS</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProfileRow icon="✉️" iconBg={colors.surfaceElevated} label="Email" value={profile.email || 'Not configured'} colors={colors} />
            <ProfileRow icon="📞" iconBg={colors.surfaceElevated} label="Phone" value={profile.phone || 'Not configured'} colors={colors} isLast />
          </View>
        </View>

        {/* My Vehicles */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('profile.myVehicles').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {profile.vehicles.map((v, i) => (
              <View key={v.id} style={[styles.vehicleRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 16 }}>{VEHICLE_BY_ID[v.type]?.icon || '🚗'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{v.name}</Text>
                  {v.registrationNumber && (
                    <Text style={{ fontSize: 11, color: colors.textTertiary }}>{v.registrationNumber} ({v.registrationState})</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeVehicle(v.id)} style={styles.deleteVehBtn} accessibilityRole="button" accessibilityLabel={`Delete ${v.name}`}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <ProfileRow
              icon="➕"
              iconBg={colors.surfaceElevated}
              label={t('profile.addVehicle')}
              colors={colors}
              onPress={() => setAddVehicleVisible(true)}
              isLast
              muted
            />
          </View>
        </View>

        {/* Saved & History */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('profile.savedHistory').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProfileRow
              icon="🔖"
              iconBg={colors.warningLight}
              label={t('profile.savedLaws')}
              value={`${savedLawsList.length} laws`}
              colors={colors}
              onPress={() => openSavedItems('law')}
            />
            <ProfileRow
              icon="🧮"
              iconBg={colors.primaryLight}
              label={t('profile.savedCalculations')}
              value={`${savedCalcsList.length} items`}
              colors={colors}
              onPress={() => openSavedItems('calculation')}
              isLast
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('profile.preferences').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProfileRow
              icon="📍"
              iconBg={colors.primaryLight}
              label="App Location"
              value={currentLocation.city ? `${currentLocation.city}, ${currentLocation.stateCode}` : countryLabel}
              colors={colors}
              onPress={() => setLocationModalVisible(true)}
            />
            <ProfileRow
              icon="🌍"
              iconBg={colors.accentLight}
              label={t('profile.country')}
              value={countryLabel}
              colors={colors}
              onPress={() => setCountryModalVisible(true)}
            />
            <ProfileRow
              icon="🌙"
              iconBg={colors.surfaceElevated}
              label={t('profile.theme')}
              value={themeLabel}
              colors={colors}
              onPress={cycleTheme}
            />
            <ProfileRow
              icon="💬"
              iconBg={colors.surfaceElevated}
              label={t('profile.language')}
              value={langLabel}
              colors={colors}
              onPress={() => setLangModalVisible(true)}
              isLast
            />
          </View>
        </View>

        {/* Accessibility & Offline Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('profile.accessibility').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
                <Text>🔤</Text>
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t('profile.fontSize')}</Text>
              <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{settings.fontSize}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.warningLight }]}>
                <Text>🎯</Text>
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t('profile.highContrast')}</Text>
              <Switch
                value={settings.highContrast}
                onValueChange={toggleHighContrast}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.highContrast ? colors.primary : colors.textTertiary}
              />
            </View>
            <View style={[styles.row]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Text>✨</Text>
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t('profile.reducedMotion')}</Text>
              <Switch
                value={settings.reducedMotion}
                onValueChange={toggleReducedMotion}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.reducedMotion ? colors.primary : colors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Offline Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{t('profile.offlineData').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProfileRow
              icon="📥"
              iconBg={colors.primaryLight}
              label="Downloaded Packs"
              value={`${downloadedPacks.length} states`}
              colors={colors}
            />
            <ProfileRow
              icon="🔄"
              iconBg={colors.accentLight}
              label="Last Synced"
              value={lastSyncAt ? timeAgo(lastSyncAt) : 'Never'}
              colors={colors}
              isLast
            />
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* 1. EDIT PROFILE MODAL */}
      <Modal animationType="slide" transparent={true} visible={editProfileVisible} onRequestClose={() => setEditProfileVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.borderStrong }]} onPress={() => setEditProfileVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. ADD VEHICLE MODAL */}
      <Modal animationType="slide" transparent={true} visible={addVehicleVisible} onRequestClose={() => setAddVehicleVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Vehicle</Text>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Vehicle Nickname (e.g. My Honda City)</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                  value={vehName}
                  onChangeText={setVehName}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Vehicle Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                  {VEHICLE_TYPES.map((vt) => (
                    <TouchableOpacity
                      key={vt.id}
                      style={[
                        styles.typeChip,
                        { borderColor: vehType === vt.id ? colors.primary : colors.borderStrong, backgroundColor: vehType === vt.id ? colors.primaryLight : colors.surface },
                      ]}
                      onPress={() => setVehType(vt.id)}
                    >
                      <Text style={{ fontSize: 13, color: vehType === vt.id ? colors.primary : colors.text }}>{vt.icon} {vt.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Registration Number (Plate No.)</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                  placeholder="e.g. MH01AB1234"
                  placeholderTextColor={colors.textTertiary}
                  value={vehRegNum}
                  onChangeText={setVehRegNum}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Registered State</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                  {INDIAN_STATES.map((s) => (
                    <TouchableOpacity
                      key={s.code}
                      style={[
                        styles.typeChip,
                        { borderColor: vehRegState === s.code ? colors.primary : colors.borderStrong, backgroundColor: vehRegState === s.code ? colors.primaryLight : colors.surface },
                      ]}
                      onPress={() => setVehRegState(s.code)}
                    >
                      <Text style={{ fontSize: 13, color: vehRegState === s.code ? colors.primary : colors.text }}>{s.code} - {s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.borderStrong }]} onPress={() => setAddVehicleVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddVehicle}>
                <Text style={styles.saveBtnText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. VIEW SAVED ITEMS (LAWS / CALCULATIONS) MODAL */}
      <Modal animationType="slide" transparent={true} visible={bookmarksVisible} onRequestClose={() => setBookmarksVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {bookmarkType === 'law' ? '🔖 Saved Traffic Laws' : '🧮 Saved Calculations'}
              </Text>
              <TouchableOpacity onPress={() => setBookmarksVisible(false)} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close saved items">
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.modalBody, { maxHeight: Dimensions.get('window').height * 0.5 }]}>
              {bookmarkType === 'law' ? (
                savedLawsList.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved laws yet. Bookmark laws in the Laws Library tab.</Text>
                ) : (
                  savedLawsList.map((item) => (
                    <View key={item.id} style={[styles.bookmarkItemRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.bookmarkItemTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{item.summary}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeBookmark(item.id)} style={{ padding: spacing.sm }}>
                        <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )
              ) : (
                savedCalcsList.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved calculations yet. Save calculations from the Calculator tab.</Text>
                ) : (
                  savedCalcsList.map((item) => (
                    <View key={item.id} style={[styles.bookmarkItemRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.bookmarkItemTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total fine: {item.summary}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeBookmark(item.id)} style={{ padding: spacing.sm }}>
                        <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. LANGUAGE SELECTOR MODAL */}
      <Modal animationType="slide" transparent={true} visible={langModalVisible} onRequestClose={() => setLangModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Select Language</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close language selector">
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {APP_CONFIG.languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.selectRow, { borderBottomColor: colors.border }, settings.language === lang.code && { backgroundColor: colors.primaryLight }]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: settings.language === lang.code ? colors.primary : colors.text }}>{lang.nameLocal}</Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary }}>{lang.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. COUNTRY SELECTOR MODAL */}
      <Modal animationType="slide" transparent={true} visible={countryModalVisible} onRequestClose={() => setCountryModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close country selector">
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={[styles.modalBody, { maxHeight: Dimensions.get('window').height * 0.4 }]}>
              {APP_CONFIG.countries.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.selectRow, { borderBottomColor: colors.border }, settings.country === c.code && { backgroundColor: colors.primaryLight }]}
                  onPress={() => handleCountrySelect(c.code)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: settings.country === c.code ? colors.primary : colors.text }}>{c.nameLocal} ({c.name})</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>{c.currencyCode} ({c.currency})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </View>
  );
}

function ProfileRow({ icon, iconBg, label, value, colors, isLast, muted, onPress }: {
  icon: string; iconBg: string; label: string; value?: string; colors: any; isLast?: boolean; muted?: boolean; onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <Text style={[styles.rowLabel, { color: muted ? colors.textSecondary : colors.text }]}>{label}</Text>
        {value && <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{value}</Text>}
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: muted ? colors.textSecondary : colors.text }]}>{label}</Text>
      {value && <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 52, paddingBottom: 24, alignItems: 'center', position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '600', color: '#FFF' },
  heroName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  editProfileBtn: { position: 'absolute', top: 52, right: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', paddingVertical: 10 },
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 13, marginRight: 8 },
  chevron: { fontSize: 20 },
  
  // Custom vehicle row
  vehicleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  deleteVehBtn: { padding: spacing.sm },
  
  // Modals Styling
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, borderTopWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md },
  modalBody: { gap: spacing.md, marginVertical: spacing.sm },
  formGroup: { gap: spacing.xs, marginBottom: spacing.sm },
  formLabel: { fontSize: 13, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.md, fontSize: 14 },
  typeChip: { borderWidth: 1.5, borderRadius: borderRadius.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginRight: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: borderRadius.sm, paddingVertical: spacing.lg, alignItems: 'center' },
  saveBtn: { flex: 2, borderRadius: borderRadius.sm, paddingVertical: spacing.lg, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  
  // Bookmarks details
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  closeBtn: { paddingHorizontal: 12, height: touchTargets.minimum, alignItems: 'center', justifyContent: 'center' },
  bookmarkItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  bookmarkItemTitle: { fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  
  // Select picker rows
  selectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderBottomWidth: 1 },
});
