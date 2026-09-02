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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [isFocusedId, setIsFocusedId] = useState(false);
  const [isFocusedPw, setIsFocusedPw] = useState(false);

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

  const handleLogin = () => {
    // For now, navigate directly to the home screen
    router.replace('/(tabs)');
  };

  const languages = ['EN', 'සිං', 'தமி'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

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
          {/* Language Selector */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.langRow}
          >
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setSelectedLang(lang)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor:
                      selectedLang === lang ? colors.primary : colors.inputBackground,
                    borderColor:
                      selectedLang === lang ? colors.primary : colors.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.langChipText,
                    {
                      color:
                        selectedLang === lang ? '#FFFFFF' : colors.textSecondary,
                    },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
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
              Sign in with your student credentials
            </Text>

            {/* Student ID Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Student ID / Hostel ID
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
                  onChangeText={setStudentId}
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
                  onChangeText={setPassword}
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

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AnimatedPressable
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={styles.loginButtonText}>LOG IN</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </AnimatedPressable>

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
              style={[
                styles.ssoButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name="school-outline"
                size={22}
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
              University Hostel Management System
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
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  langChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
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
    marginBottom: Spacing.xxl,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
    fontWeight: '700',
    letterSpacing: 1.5,
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
    fontWeight: '500',
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  ssoButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 13,
  },
});
