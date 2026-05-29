/**
 * Compare Laws Screen
 */
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';

export default function CompareLawsScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Compare Laws</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}>
          Law comparison feature is coming in the next update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { paddingVertical: 4, marginRight: 16 },
  backText: { fontSize: 15, fontWeight: '500' },
  topBarTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
