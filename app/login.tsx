/**
 * Signup and Login Screen with OTP Verification
 */
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from './_layout';
import { useUserStore } from '../src/store/userStore';
import { spacing, borderRadius, touchTargets } from '../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const { login } = useUserStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  function handleSendOtp() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your user name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    // Mock send OTP
    setStep('otp');
    Alert.alert(
      'OTP Sent',
      `A verification code has been sent to ${email}. (For testing, use code: 123456 for email: user1@gmail.com)`
    );
  }

  function handleVerifyOtp() {
    // Validate mock credentials
    if (email.trim().toLowerCase() === 'user1@gmail.com' && otp.trim() === '123456') {
      login(name, email, phone);
      router.replace('/(tabs)');
      Alert.alert('Success', `Welcome back, ${name}!`);
    } else {
      Alert.alert('Invalid Code', 'The OTP code is incorrect. For testing, use user1@gmail.com and OTP 123456.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBlock}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>⚖️</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>DriveLegal</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Secure Road Law Assistant</Text>
        </View>

        {step === 'input' ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sign Up / Log In</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>User Name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                placeholder="Enter user name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                placeholder="user1@gmail.com (for testing)"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={handleSendOtp}
              accessibilityRole="button"
              accessibilityLabel="Send verification code"
            >
              <Text style={styles.btnText}>Send OTP Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Verify Account</Text>
            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              Please enter the 6-digit verification code sent to <Text style={{ fontWeight: '600' }}>{email}</Text>.
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>One-Time Password (OTP)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.borderStrong, color: colors.text, backgroundColor: colors.inputBackground, textAlign: 'center', letterSpacing: 6, fontSize: 18 }]}
                placeholder="123456"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={handleVerifyOtp}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP and login"
            >
              <Text style={styles.btnText}>Verify & Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep('input')}
              style={styles.backBtn}
            >
              <Text style={{ color: colors.primary, fontSize: 14 }}>← Change email / phone</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: colors.textTertiary }]}>
            Demo Notice: For prototype testing, sign up with email "user1@gmail.com" and use the verification code "123456".
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 80,
    gap: spacing.lg,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  formGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 15,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  btn: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  infoBox: {
    padding: spacing.md,
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
});
