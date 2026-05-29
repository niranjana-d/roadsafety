/**
 * Emergency & Quick Reference Screen (Modal)
 */
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';
import { useLocationStore } from '../src/store/locationStore';
import {
  NATIONAL_EMERGENCY_CONTACTS, STATE_HELPLINES,
  ACCIDENT_CHECKLIST, REQUIRED_DOCUMENTS, TRAFFIC_STOP_RIGHTS,
} from '../src/constants/emergencyNumbers';

type Tab = 'contacts' | 'checklist' | 'rights' | 'documents';

export default function EmergencyScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const [tab, setTab] = useState<Tab>('contacts');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  function handleCall(number: string) {
    Linking.openURL(`tel:${number}`);
  }

  function toggleCheck(id: string) {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const stateHelplines = STATE_HELPLINES[currentLocation.stateCode] || [];

  const priorityColors: Record<string, { bg: string; text: string }> = {
    critical: { bg: colors.dangerLight, text: colors.danger },
    important: { bg: colors.warningLight, text: '#9a5700' },
    recommended: { bg: colors.primaryLight, text: colors.primary },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.danger }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.topBarTitle}>🚨 Emergency & Quick Reference</Text>
          <Text style={styles.topBarSub}>
            📍 {currentLocation.city}, {currentLocation.stateName}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabRowContent}>
        {[
          { key: 'contacts', label: '📞 Contacts' },
          { key: 'checklist', label: '📋 Accident Checklist' },
          { key: 'rights', label: '⚖️ Your Rights' },
          { key: 'documents', label: '📄 Documents' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabChip, { backgroundColor: tab === t.key ? colors.primary : colors.surface, borderColor: tab === t.key ? colors.primary : colors.borderStrong }]}
            onPress={() => setTab(t.key as Tab)}
          >
            <Text style={[styles.tabChipText, { color: tab === t.key ? '#FFF' : colors.textSecondary }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
        {/* Emergency Contacts */}
        {tab === 'contacts' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>National Emergency Numbers</Text>
            {NATIONAL_EMERGENCY_CONTACTS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleCall(c.number)}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIcon, { backgroundColor: c.color + '20' }]}>
                  <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>{c.description}</Text>
                </View>
                <View style={[styles.callBtn, { backgroundColor: c.color }]}>
                  <Text style={styles.callBtnText}>{c.number}</Text>
                  <Text style={styles.callBtnIcon}>📞</Text>
                </View>
              </TouchableOpacity>
            ))}

            {stateHelplines.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                  📍 {currentLocation.stateName} Traffic Helplines
                </Text>
                {stateHelplines.map((h, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.stateHelplineRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleCall(h.number)}
                  >
                    <View style={[styles.shIcon, { backgroundColor: colors.primaryLight }]}>
                      <Text>📞</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.shName, { color: colors.text }]}>{h.name}</Text>
                      <Text style={[styles.shNumber, { color: colors.primary }]}>{h.number}</Text>
                    </View>
                    <Text style={{ color: colors.primary }}>Call →</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {/* Accident Checklist */}
        {tab === 'checklist' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🚑 Accident Checklist</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Step-by-step guide: what to do after an accident
            </Text>
            {ACCIDENT_CHECKLIST.map((item) => {
              const pc = priorityColors[item.priority];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkItem, { backgroundColor: colors.surface, borderColor: checkedItems.has(item.id) ? colors.accent : colors.border }]}
                  onPress={() => toggleCheck(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, { borderColor: checkedItems.has(item.id) ? colors.accent : colors.borderStrong, backgroundColor: checkedItems.has(item.id) ? colors.accentLight : 'transparent' }]}>
                    {checkedItems.has(item.id) && <Text style={{ color: colors.accent }}>✓</Text>}
                  </View>
                  <View style={styles.checkContent}>
                    <View style={styles.checkHead}>
                      <Text style={[styles.checkTitle, { color: colors.text, textDecorationLine: checkedItems.has(item.id) ? 'line-through' : 'none' }]}>
                        {item.title}
                      </Text>
                      <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
                        <Text style={[styles.priorityText, { color: pc.text }]}>{item.priority}</Text>
                      </View>
                    </View>
                    <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Rights */}
        {tab === 'rights' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>⚖️ Your Rights During a Traffic Stop</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Know your rights when stopped by traffic police
            </Text>
            {TRAFFIC_STOP_RIGHTS.map((right, i) => (
              <View key={i} style={[styles.rightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.rightNum, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.rightNumText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>{right.title}</Text>
                  <Text style={[styles.rightDesc, { color: colors.textSecondary }]}>{right.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Documents */}
        {tab === 'documents' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📄 Required Documents</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Documents you must carry while driving
            </Text>
            {REQUIRED_DOCUMENTS.map((doc) => {
              const pc = priorityColors[doc.priority];
              return (
                <View key={doc.id} style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.docPriority, { backgroundColor: pc.bg }]}>
                    <Text style={[styles.docPriorityText, { color: pc.text }]}>{doc.priority}</Text>
                  </View>
                  <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
                  <Text style={[styles.docDesc, { color: colors.textSecondary }]}>{doc.description}</Text>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  closeBtn: { color: '#FFF', fontSize: 18, fontWeight: '600', width: 32, textAlign: 'center' },
  topBarTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  topBarSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  tabRow: { maxHeight: 48, minHeight: 48, borderBottomWidth: 0 },
  tabRowContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tabChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tabChipText: { fontSize: 13, fontWeight: '500' },
  scrollContent: { flex: 1 },
  scrollInner: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 14, marginBottom: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  contactIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600' },
  contactDesc: { fontSize: 12, marginTop: 2 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  callBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  callBtnIcon: { fontSize: 14 },
  stateHelplineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  shIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shName: { fontSize: 14, fontWeight: '500' },
  shNumber: { fontSize: 13, marginTop: 2 },
  checkItem: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  checkbox: { width: 28, height: 28, borderWidth: 2, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkContent: { flex: 1 },
  checkHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  checkTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  priorityText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  checkDesc: { fontSize: 13, lineHeight: 20 },
  rightCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  rightNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rightNumText: { fontSize: 14, fontWeight: '600' },
  rightContent: { flex: 1 },
  rightTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rightDesc: { fontSize: 13, lineHeight: 20 },
  docCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  docPriority: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginBottom: 8 },
  docPriorityText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  docTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  docDesc: { fontSize: 13, lineHeight: 20 },
});
