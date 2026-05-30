/**
 * Global Search Screen
 */
import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';
import { MOCK_LAWS } from '../src/services/mock/lawsMock';
import { VIOLATIONS } from '../src/constants/violations';
import { rankByRelevance, highlightMatch } from '../src/utils/searchUtils';
import { useLocationStore } from '../src/store/locationStore';
import { APP_CONFIG } from '../src/constants/config';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const [query, setQuery] = useState('');
  const [laws, setLaws] = useState<any[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto focus search input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
    
    // Fetch rules from database to perform search
    async function loadRulesForSearch() {
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
            
            return {
              id: rule.violation_id,
              title: rule.title,
              summary: rule.description,
              section: rule.section,
              act: 'MVA 2019',
              category: cat,
            };
          });
          setLaws(mapped);
        } else {
          setLaws(MOCK_LAWS);
        }
      } catch (err) {
        setLaws(MOCK_LAWS);
      }
    }
    loadRulesForSearch();
  }, [currentLocation.stateCode]);

  const results = useMemo(() => {
    if (!query.trim()) return { laws: [], violations: [] };
    
    const lawsList = laws.length > 0 ? laws : MOCK_LAWS;
    const matchedLaws = rankByRelevance(lawsList, query, l => `${l.title} ${l.summary} ${l.section} ${l.act}`);
    const matchedViolations = rankByRelevance(VIOLATIONS, query, v => `${v.name} ${v.description} ${v.nameHi}`);
    
    return { laws: matchedLaws.slice(0, 5), violations: matchedViolations.slice(0, 5) };
  }, [query, laws]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.borderStrong }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search DriveLegal..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={[styles.clearIcon, { color: colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!query.trim() ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Search for traffic laws, violations, fines, or legal sections.</Text>
            <View style={styles.suggestions}>
              {['Speed limit', 'Drunk driving', 'Section 184', 'Without helmet'].map(s => (
                <TouchableOpacity key={s} style={[styles.suggChip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setQuery(s)}>
                  <Text style={[styles.suggText, { color: colors.primary }]}>🔍 {s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Violations Results */}
            {results.violations.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Violations ({results.violations.length})</Text>
                {results.violations.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.resultItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      // Could navigate to calculator pre-filled
                      router.push('/(tabs)/calculator');
                    }}
                  >
                    <Text style={[styles.resultTitle, { color: colors.text }]}>{v.name}</Text>
                    <Text style={[styles.resultDesc, { color: colors.textTertiary }]} numberOfLines={1}>{v.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Laws Results */}
            {results.laws.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Laws & Acts ({results.laws.length})</Text>
                {results.laws.map(l => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.resultItem, { borderBottomColor: colors.border }]}
                    onPress={() => router.push(`/law-detail/${l.id}`)}
                  >
                    <Text style={[styles.resultTitle, { color: colors.text }]}>{l.title}</Text>
                    <Text style={[styles.resultDesc, { color: colors.textTertiary }]} numberOfLines={1}>{l.act} {l.section}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {results.laws.length === 0 && results.violations.length === 0 && (
              <View style={styles.noMatch}>
                <Text style={[styles.noMatchTitle, { color: colors.text }]}>No results found</Text>
                <Text style={[styles.noMatchDesc, { color: colors.textSecondary }]}>Try using different keywords or check spelling.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, height: 40 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  clearIcon: { fontSize: 16, padding: 4 },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { fontSize: 15, fontWeight: '500' },
  scrollContent: { flex: 1 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  suggChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  suggText: { fontSize: 14, fontWeight: '500' },
  resultsContainer: { paddingVertical: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  resultItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  resultTitle: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  resultDesc: { fontSize: 13 },
  noMatch: { padding: 40, alignItems: 'center' },
  noMatchTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  noMatchDesc: { fontSize: 14, textAlign: 'center' },
});
