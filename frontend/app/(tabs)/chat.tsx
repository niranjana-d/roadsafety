import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import { ThemeContext } from '../_layout';
import { useChatStore } from '../../src/store/chatStore';
import { useLocationStore } from '../../src/store/locationStore';
import { useOfflineStore } from '../../src/store/offlineStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import i18n, { t } from '../../src/localization/i18n';
import { checkPendingChallans } from '../../src/services/challanService';
import { getMockChatResponse, SUGGESTED_QUESTIONS } from '../../src/services/mock/chatMock';
import type { ChatMessage } from '../../src/types/chat';
import { spacing, borderRadius } from '../../src/constants/theme';
import LocationSelectorModal from '../../src/components/LocationSelectorModal';

export default function ChatScreen() {
  const { colors } = useContext(ThemeContext);
  const { currentLocation } = useLocationStore();
  const { isOnline } = useOfflineStore();
  const { settings } = useSettingsStore();
  const {
    currentSession, addMessage, setTyping, isTyping,
    startNewSession, updateMessageFeedback, queueOfflineMessage,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Sync translation locale
  i18n.locale = settings.language;

  // Start new session when location changes
  useEffect(() => {
    startNewSession(
      { stateCode: currentLocation.stateCode, stateName: currentLocation.stateName, city: currentLocation.city },
      settings.language
    );
    // Add welcome message
    addMessage({
      id: `msg-welcome-${Date.now()}`,
      role: 'assistant',
      content: `${t('chat.welcome')}\n\n${t('chat.whatToKnow')}`,
      timestamp: Date.now(),
      citations: [],
    });
  }, [currentLocation.stateCode, currentLocation.city]);

  async function handleSend(text?: string) {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    setInputText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    // Scroll to bottom
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    if (!isOnline) {
      // Queue for later
      queueOfflineMessage(userMsg);
      addMessage({
        id: `msg-offline-${Date.now()}`,
        role: 'assistant',
        content: "You're currently offline. Your question has been queued and will be answered when you're back online.\n\nIn the meantime, you can browse downloaded laws and use the calculator offline.",
        timestamp: Date.now(),
        isOfflineQueued: true,
      });
      return;
    }

    // Show typing
    setTyping(true);

    try {
      // Regex pattern to extract vehicle plate number (e.g. TN-01-AB-1234 or TN01AB1234)
      const plateRegex = /\b([A-Z]{2}[-]? [0-9]{2}[-]? [A-Z]{1,2}[-]? [0-9]{4}|[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4})\b/i;
      const cleanPlateRegex = /[ -]/g;
      const match = messageText.match(plateRegex);

      if (match) {
        const detectedPlate = match[1].toUpperCase().replace(cleanPlateRegex, '').trim();
        const pendingChallans = await checkPendingChallans(detectedPlate);
        
        setTyping(false);
        if (pendingChallans.length === 0) {
          addMessage({
            id: `msg-ai-${Date.now()}`,
            role: 'assistant',
            content: `I have queried the Parivahan E-Challan database in real-time for vehicle number **${detectedPlate}**.\n\n✅ **No pending challans found.** You have a clean driving record for this vehicle! Keep up the safe driving.`,
            timestamp: Date.now(),
            citations: [],
          });
        } else {
          // Format detailed explanations of the challans
          let explanation = `I queried the Parivahan E-Challan database in real-time and found **${pendingChallans.length} pending challan(s)** for vehicle number **${detectedPlate}**:\n\n`;
          
          pendingChallans.forEach((ch, idx) => {
            explanation += `### Challan #${idx + 1}: ${ch.challanNumber}\n`;
            explanation += `- **Why issued**: ${ch.violationName} at ${ch.location}.\n`;
            explanation += `- **Applicable Law**: ${ch.act} Section ${ch.section}.\n`;
            explanation += `- **Fine Amount**: ₹${ch.amount.toLocaleString('en-IN')}.\n`;
            explanation += `- **Payment Deadline**: ${new Date(ch.deadlineAt).toLocaleDateString()} (deadline to avoid court summoning).\n`;
            explanation += `- **Consequences**: ${ch.consequences}\n\n`;
          });
          
          explanation += `You can clear these fines directly via the official online portal for your state. Let me know if you need links to pay them!`;

          addMessage({
            id: `msg-ai-${Date.now()}`,
            role: 'assistant',
            content: explanation,
            timestamp: Date.now(),
            citations: pendingChallans.map(ch => ({
              id: ch.id,
              act: ch.act,
              section: ch.section,
              title: ch.violationName,
            })),
          });
        }
      } else {
        const response = await getMockChatResponse(messageText, currentLocation.stateCode);

        setTyping(false);
        addMessage({
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: Date.now(),
          citations: response.citations,
        });
      }
    } catch (e) {
      setTyping(false);
      addMessage({
        id: `msg-error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I couldn't process your question right now. Please try again.",
        timestamp: Date.now(),
      });
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  }

  async function handleShare(content: string) {
    try {
      await Share.share({ message: `DriveLegal:\n${content}` });
    } catch {}
  }

  const messages = currentSession?.messages || [];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={[styles.topBarTitle, { color: colors.text }]}>{t('chat.title')}</Text>
            <Text style={[styles.topBarStatus, { color: isOnline ? colors.accent : colors.warning }]}>
              {isOnline ? `● ${t('common.online')}` : `● ${t('common.offline')}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.locationChip, { backgroundColor: colors.primaryLight }]}
          onPress={() => setLocationModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Text style={[styles.locationChipText, { color: colors.primary }]}>
            📍 {currentLocation.city || 'Select'}, {currentLocation.stateCode || currentLocation.country || 'IN'} · Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Context Banner */}
      <View style={[styles.contextBanner, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.contextText, { color: colors.primary }]}>
          📍 {t('chat.contextLabel')} {currentLocation.city}, {currentLocation.stateName} — Motor Vehicles Act 2019
        </Text>
      </View>

      {/* Offline Banner */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warningLight }]}>
          <Text style={[styles.offlineText, { color: colors.warning }]}>
            ⚡ {t('chat.offlineMode')}
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageRow, msg.role === 'user' && styles.messageRowUser]}
          >
            {msg.role === 'assistant' && (
              <View style={[styles.msgAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
            )}
            <View style={styles.msgContent}>
              <View style={[
                styles.msgBubble,
                msg.role === 'user'
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
              ]}>
                <Text style={[
                  styles.msgText,
                  { color: msg.role === 'user' ? '#FFFFFF' : colors.text },
                ]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === 'assistant' && (
                <View style={styles.msgMeta}>
                  {msg.citations?.map((cite) => (
                    <TouchableOpacity
                      key={cite.id}
                      style={[styles.citationChip, { backgroundColor: colors.primaryLight }]}
                    >
                      <Text style={[styles.citationText, { color: colors.primary }]}>
                        📎 {cite.act} {cite.section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.feedbackBtn, { borderColor: colors.border }]}
                    onPress={() => updateMessageFeedback(msg.id, 'up')}
                  >
                    <Text style={styles.feedbackText}>
                      {msg.feedback === 'up' ? '👍' : '👍'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.feedbackBtn, { borderColor: colors.border }]}
                    onPress={() => updateMessageFeedback(msg.id, 'down')}
                  >
                    <Text style={styles.feedbackText}>👎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.feedbackBtn, { borderColor: colors.border }]}
                    onPress={() => handleShare(msg.content)}
                  >
                    <Text style={styles.feedbackText}>📤</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {msg.role === 'user' && (
              <View style={[styles.msgAvatar, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.avatarText, { color: colors.textSecondary }]}>RK</Text>
              </View>
            )}
          </View>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageRow]}>
            <View style={[styles.msgAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View style={[styles.msgBubble, styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.msgText, { color: colors.textTertiary }]}>Typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionsRow}
        contentContainerStyle={styles.suggestionsContent}
      >
        {SUGGESTED_QUESTIONS.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={[styles.suggChip, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
            onPress={() => handleSend(q.text)}
          >
            <Text style={[styles.suggText, { color: colors.text }]}>{q.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Row */}
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.micBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={{ fontSize: 18 }}>🎤</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.textInput, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.surface }]}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleSend()}
          accessibilityLabel="Send message"
        >
          <Text style={{ fontSize: 16, color: '#FFF' }}>➤</Text>
        </TouchableOpacity>
      </View>

      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  aiAvatarText: { fontSize: 18 },
  topBarTitle: { fontSize: 15, fontWeight: '600' },
  topBarStatus: { fontSize: 12 },
  locationChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  locationChipText: { fontSize: 12, fontWeight: '500' },
  contextBanner: { paddingHorizontal: 16, paddingVertical: 8 },
  contextText: { fontSize: 12 },
  offlineBanner: { paddingHorizontal: 16, paddingVertical: 8 },
  offlineText: { fontSize: 12, fontWeight: '500' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, gap: 16 },
  messageRow: { flexDirection: 'row', gap: 10, maxWidth: '92%' },
  messageRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  msgContent: { flex: 1 },
  msgBubble: { padding: 12, borderRadius: 14 },
  aiBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4 },
  msgText: { fontSize: 14.5, lineHeight: 22 },
  msgMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  citationChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  citationText: { fontSize: 11 },
  feedbackBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  feedbackText: { fontSize: 12 },
  suggestionsRow: { maxHeight: 44, minHeight: 44 },
  suggestionsContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  suggChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  suggText: { fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  micBtn: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14.5, minHeight: 42, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
