import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colorScheme, isDark, toggleTheme } = useAppTheme();
  const colors = Colors[colorScheme];
  const { login, loginSSO, isLoading, serverOnline, checkServerHealth } = useAuth();

  const [studentId, setStudentId] = useState('2021E103');
  const [password, setPassword] = useState('123123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [isFocusedId, setIsFocusedId] = useState(false);
  const [isFocusedPw, setIsFocusedPw] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  // Floating animation for decorative orbs
  const orbFloat = useSharedValue(0);
  useEffect(() => {
    orbFloat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orbStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value * -20 }],
    opacity: 0.15 + orbFloat.value * 0.1,
  }));

  const orbStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value * 15 }],
    opacity: 0.1 + orbFloat.value * 0.08,
  }));

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      setErrorMessage('Please enter both your Student ID and Password.');
      return;
    }

    setErrorMessage(null);
    try {
      await login(studentId.trim(), password.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
      Alert.alert('Login Error', msg);
    }
  };

  const handleSSOLogin = async () => {
    setErrorMessage(null);
    try {
      await loginSSO('sample_sso_token_student_2021e103');
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.message || 'SSO Authentication failed.';
      setErrorMessage(msg);
      Alert.alert('SSO Error', msg);
    }
  };

  const quickFill = (id: string, pass: string) => {
    setStudentId(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  const languages = ['EN', 'සිං', 'தமி'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative gradient orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { backgroundColor: colors.primaryGradientStart },
          orbStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { backgroundColor: colors.primaryGradientEnd },
          orbStyle2,
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar: Language Selector + Theme Toggle + Backend Status */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.topControlRow}
          >
            <View style={styles.langRow}>
              {languages.map((lang) => {
                const isSelected = selectedLang === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setSelectedLang(lang)}
                    activeOpacity={0.8}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.inputBackground
                          : '#FFFFFF',
                        borderColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.inputBorder
                          : '#CBD5E1',
                        ...Shadows.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.langChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? colors.textSecondary
                            : '#0F172A',
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.topRightControls}>
              {/* Server Status Pill */}
              <TouchableOpacity
                onPress={() => checkServerHealth()}
                style={[
                  styles.serverStatusPill,
                  {
                    backgroundColor: serverOnline ? '#10B98120' : '#EF444420',
                    borderColor: serverOnline ? '#10B981' : '#EF4444',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: serverOnline ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text
                  style={[
                    styles.serverStatusText,
                    { color: serverOnline ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {serverOnline ? 'Backend Online' : 'Check Server'}
                </Text>
              </TouchableOpacity>

              {/* Theme Toggle Button */}
              <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.8}
                style={[
                  styles.themeToggleBtn,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                    borderColor: isDark ? colors.inputBorder : '#CBD5E1',
                    ...Shadows.sm,
                  },
                ]}
                accessibilityLabel="Toggle Light and Dark Theme"
              >
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={18}
                  color={isDark ? '#FBBF24' : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Logo & Branding */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(700)}
            style={styles.brandContainer}
          >
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="home" size={36} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>
              HostelHub
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Report. Track. Resolve.
            </Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(700)}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Shadows.md,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Sign in with your student or staff credentials
            </Text>

            {/* Error Message */}
            {errorMessage && (
              <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF4444' }]}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            )}

            {/* Student ID Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Student ID / Username
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: isFocusedId
                      ? colors.inputFocusBorder
                      : colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={isFocusedId ? colors.primary : colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. 2021E103"
                  placeholderTextColor={colors.textTertiary}
                  value={studentId}
                  onChangeText={(text) => {
                    setStudentId(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setIsFocusedId(true)}
                  onBlur={() => setIsFocusedId(false)}
                  autoCapitalize="characters"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: isFocusedPw
                      ? colors.inputFocusBorder
                      : colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isFocusedPw ? colors.primary : colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setIsFocusedPw(true)}
                  onBlur={() => setIsFocusedPw(false)}
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Fill Test Accounts */}
            <View style={styles.quickFillContainer}>
              <Text style={[styles.quickFillLabel, { color: colors.textTertiary }]}>
                Demo Login Accounts:
              </Text>
              <View style={styles.quickFillRow}>
                <TouchableOpacity
                  onPress={() => quickFill('2021E103', '123123')}
                  style={[styles.quickFillChip, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
                >
                  <Text style={[styles.quickFillText, { color: colors.primary }]}>🎓 Student (2021E103)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => quickFill('WARDEN01', '123123')}
                  style={[styles.quickFillChip, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
                >
                  <Text style={[styles.quickFillText, { color: colors.primary }]}>🛡️ Sub-Warden</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              style={[
                styles.loginButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                  ...Shadows.md,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>LOG IN</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.divider }]}
              />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
                or
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.divider }]}
              />
            </View>

            {/* SSO Button */}
            <TouchableOpacity
              onPress={handleSSOLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              style={[
                styles.ssoButton,
                {
                  backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                  borderColor: isDark ? colors.inputBorder : '#CBD5E1',
                  ...Shadows.sm,
                },
              ]}
            >
              <Ionicons
                name="school"
                size={20}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.ssoButtonText, { color: colors.text }]}>
                Continue with University SSO
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              HostelHub API Integrated · Node.js + Express + MySQL
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xxxl,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: 250,
    height: 250,
    top: -80,
    right: -60,
    opacity: 0.15,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 40,
    left: -80,
    opacity: 0.1,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  langRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  serverStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  langChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorBoxText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  quickFillContainer: {
    marginBottom: Spacing.xl,
  },
  quickFillLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  quickFillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  quickFillChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loginButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.lg,
    fontSize: 13,
    fontWeight: '600',
  },
  ssoButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  ssoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
