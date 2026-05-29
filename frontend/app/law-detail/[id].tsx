/**
 * Law Detail Screen
 */
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeContext } from '../_layout';
import { useBookmarkStore } from '../../src/store/bookmarkStore';
import { getMockLawById } from '../../src/services/mock/lawsMock';
import { VIOLATION_BY_ID, getFineData } from '../../src/constants/violations';
import { formatINR } from '../../src/utils/formatCurrency';
import { formatDate } from '../../src/utils/formatDate';
import type { Law } from '../../src/types/law';

type DetailTab = 'simplified' | 'official' | 'fines' | 'amendments';

export default function LawDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useContext(ThemeContext);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();

  const [law, setLaw] = useState<Law | null>(null);
  const [tab, setTab] = useState<DetailTab>('simplified');

  useEffect(() => {
    if (id) {
      getMockLawById(id).then(l => l && setLaw(l));
    }
  }, [id]);

  if (!law) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const bookmarked = isBookmarked(law.id);
  const severity = law.severity;
  const sevColors: Record<string, { bg: string; text: string }> = {
    minor: { bg: colors.warningLight, text: '#9a5700' },
    moderate: { bg: colors.warningLight, text: '#9a5700' },
    major: { bg: colors.dangerLight, text: colors.danger },
    criminal: { bg: colors.dangerLight, text: colors.danger },
  };
  const sc = sevColors[severity] || sevColors.minor;

  function toggleBookmark() {
    if (bookmarked) {
      removeBookmark(law!.id);
    } else {
      addBookmark({
        id: law!.id,
        type: 'law',
        title: law!.title,
        summary: `${law!.fineRange} — ${law!.section}`,
        data: law as unknown as Record<string, unknown>,
        savedAt: Date.now(),
      });
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `DriveLegal: ${law!.title}\n${law!.summary}\nFine: ${law!.fineRange}\nRef: ${law!.act} ${law!.section}`,
      });
    } catch {}
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={toggleBookmark}>
            <Text style={{ fontSize: 20 }}>{bookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Text style={{ fontSize: 20 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Law Header */}
        <View style={styles.lawHeader}>
          <View style={[styles.sevBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.sevBadgeText, { color: sc.text }]}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</Text>
          </View>
          <Text style={[styles.lawTitle, { color: colors.text }]}>{law.title}</Text>
          <Text style={[styles.lawTitleHi, { color: colors.textTertiary }]}>{law.titleHi}</Text>
          <Text style={[styles.lawSummary, { color: colors.textSecondary }]}>{law.summary}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.metaText, { color: colors.danger }]}>💰 {law.fineRange}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.metaText, { color: colors.primary }]}>📜 {law.act} {law.section}</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabRowContent}>
          {[
            { key: 'simplified', label: 'Simplified' },
            { key: 'official', label: 'Official Text' },
            { key: 'fines', label: 'Fine Schedule' },
            { key: 'amendments', label: `Amendments (${law.amendments.length})` },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabChip, { backgroundColor: tab === t.key ? colors.primary : colors.surface, borderColor: tab === t.key ? colors.primary : colors.borderStrong }]}
              onPress={() => setTab(t.key as DetailTab)}
            >
              <Text style={[styles.tabChipText, { color: tab === t.key ? '#FFF' : colors.textSecondary }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {tab === 'simplified' && (
            <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>📖 Simplified Explanation</Text>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>{law.simplifiedExplanation}</Text>
            </View>
          )}

          {tab === 'official' && (
            <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>📜 Official Legal Text</Text>
              <View style={[styles.legalBlock, { borderLeftColor: colors.primary }]}>
                <Text style={[styles.legalText, { color: colors.text }]}>{law.officialText}</Text>
              </View>
              <Text style={[styles.reference, { color: colors.textTertiary }]}>
                Source: {law.act}, {law.section}
              </Text>
            </View>
          )}

          {tab === 'fines' && (
            <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>💰 Fine Schedule</Text>
              {law.relatedViolationIds.map(vId => {
                const violation = VIOLATION_BY_ID[vId];
                if (!violation) return null;
                const fineData = getFineData(vId, 'national');
                if (!fineData) return null;
                return (
                  <View key={vId} style={[styles.fineRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.fineName, { color: colors.text }]}>{violation.name}</Text>
                    <View style={styles.fineValues}>
                      <Text style={[styles.fineLabel, { color: colors.textTertiary }]}>
                        First: <Text style={{ color: colors.danger, fontWeight: '600' }}>{formatINR(fineData.baseFine)}</Text>
                      </Text>
                      <Text style={[styles.fineLabel, { color: colors.textTertiary }]}>
                        Repeat: <Text style={{ color: colors.danger, fontWeight: '600' }}>{formatINR(fineData.repeatFine)}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {tab === 'amendments' && (
            <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>📝 Amendments Timeline</Text>
              {law.amendments.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No amendments recorded yet.</Text>
              ) : (
                law.amendments.map((a, i) => (
                  <View key={i} style={[styles.amendCard, { borderLeftColor: colors.primary }]}>
                    <Text style={[styles.amendDate, { color: colors.primary }]}>{formatDate(a.date)}</Text>
                    <Text style={[styles.amendTitle, { color: colors.text }]}>{a.title}</Text>
                    <Text style={[styles.amendDesc, { color: colors.textSecondary }]}>{a.description}</Text>
                    <View style={styles.amendDiff}>
                      <Text style={[styles.diffLabel, { color: colors.danger }]}>- {a.previousValue}</Text>
                      <Text style={[styles.diffLabel, { color: colors.accent }]}>+ {a.newValue}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Related Violations */}
          {law.relatedViolationIds.length > 0 && (
            <View style={[styles.relatedSection]}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>🔗 Related Violations</Text>
              <View style={styles.relatedGrid}>
                {law.relatedViolationIds.map(vId => {
                  const v = VIOLATION_BY_ID[vId];
                  if (!v) return null;
                  return (
                    <View key={vId} style={[styles.relatedChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.relatedName, { color: colors.text }]}>{v.name}</Text>
                      <Text style={[styles.relatedSev, { color: colors.textTertiary }]}>{v.severity}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Last Updated */}
          <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>
            Last updated: {formatDate(law.lastUpdated)}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: '500' },
  topBarActions: { flexDirection: 'row', gap: 16 },
  scrollContent: { flex: 1 },
  lawHeader: { padding: 20 },
  sevBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  sevBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  lawTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  lawTitleHi: { fontSize: 16, marginBottom: 8 },
  lawSummary: { fontSize: 14.5, lineHeight: 22, marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  metaText: { fontSize: 13, fontWeight: '500' },
  tabRow: { maxHeight: 48, minHeight: 48 },
  tabRowContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tabChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tabChipText: { fontSize: 13, fontWeight: '500' },
  tabContent: { paddingHorizontal: 16, gap: 16 },
  contentCard: { borderWidth: 1, borderRadius: 14, padding: 18 },
  contentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  contentText: { fontSize: 14.5, lineHeight: 24 },
  legalBlock: { borderLeftWidth: 3, paddingLeft: 14, paddingVertical: 8, marginBottom: 12 },
  legalText: { fontSize: 13.5, lineHeight: 22, fontStyle: 'italic' },
  reference: { fontSize: 12, marginTop: 8 },
  fineRow: { paddingVertical: 12, borderBottomWidth: 1, gap: 4 },
  fineName: { fontSize: 14, fontWeight: '500' },
  fineValues: { flexDirection: 'row', gap: 20 },
  fineLabel: { fontSize: 13 },
  emptyText: { fontSize: 14 },
  amendCard: { borderLeftWidth: 3, paddingLeft: 14, paddingVertical: 10, marginBottom: 8 },
  amendDate: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  amendTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  amendDesc: { fontSize: 13, lineHeight: 20 },
  amendDiff: { marginTop: 8 },
  diffLabel: { fontSize: 13, fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace' },
  relatedSection: { marginTop: 8 },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: { borderWidth: 1, borderRadius: 10, padding: 10, minWidth: 120 },
  relatedName: { fontSize: 13, fontWeight: '500' },
  relatedSev: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  lastUpdated: { fontSize: 12, textAlign: 'center', marginTop: 16 },
});
