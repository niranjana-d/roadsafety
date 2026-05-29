/**
 * Notifications Screen
 */
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';
import { useNotificationStore } from '../src/store/notificationStore';
import { timeAgo } from '../src/utils/formatDate';
import type { AppNotification } from '../src/types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  function getIcon(type: AppNotification['type']) {
    switch (type) {
      case 'law_change': return '⚖️';
      case 'challan_reminder': return '💳';
      case 'safety_tip': return '💡';
      case 'app_update': return '📱';
      default: return '🔔';
    }
  }

  function getIconBg(type: AppNotification['type']) {
    switch (type) {
      case 'law_change': return colors.primaryLight;
      case 'challan_reminder': return colors.dangerLight;
      case 'safety_tip': return colors.accentLight;
      case 'app_update': return colors.surfaceElevated;
      default: return colors.surfaceElevated;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Notifications</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>You're all caught up!</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: n.read ? colors.surface : colors.primaryLight, borderBottomColor: colors.border },
                ]}
                onPress={() => markAsRead(n.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: getIconBg(n.type) }]}>
                  <Text style={{ fontSize: 20 }}>{getIcon(n.type)}</Text>
                </View>
                <View style={styles.content}>
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text, fontWeight: n.read ? '500' : '700' }]}>{n.title}</Text>
                    <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo(n.timestamp)}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>{n.body}</Text>
                </View>
                {!n.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
            <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear All Notifications</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: '500' },
  topBarTitle: { fontSize: 18, fontWeight: '700' },
  topBarActions: {},
  actionText: { fontSize: 14, fontWeight: '500' },
  scrollContent: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDesc: { fontSize: 14 },
  list: {},
  notificationItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { fontSize: 15, flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  body: { fontSize: 14, lineHeight: 20 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  clearBtn: { alignItems: 'center', padding: 20 },
  clearBtnText: { fontSize: 15, fontWeight: '500' },
});
