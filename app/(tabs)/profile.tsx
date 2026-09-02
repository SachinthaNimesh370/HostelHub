import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme, isDark, toggleTheme, setTheme } = useAppTheme();
  const colors = Colors[colorScheme];
  const { user, logout, serverOnline, checkServerHealth, backendUrl, updateBackendUrl } = useAuth();

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(backendUrl);
  const [isChecking, setIsChecking] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of HostelHub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    const online = await checkServerHealth();
    setIsChecking(false);
    if (online) {
      Alert.alert('Backend Status', '🟢 Successfully connected to HostelHub Backend Server!');
    } else {
      Alert.alert('Backend Status', '🔴 Could not reach backend server at ' + backendUrl);
    }
  };

  const handleSaveBackendUrl = () => {
    if (!customUrl.trim()) return;
    updateBackendUrl(customUrl.trim());
    setIsUrlModalOpen(false);
    Alert.alert('Backend URL Updated', `API endpoint set to:\n${customUrl.trim()}`);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SN';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>User Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.studentName, { color: colors.text }]}>
            {user?.fullName || 'Sachintha Nimesh'}
          </Text>
          <Text style={[styles.studentId, { color: colors.primary }]}>
            {user?.studentId || '2021E103'} ({user?.role || 'STUDENT'})
          </Text>
          <View style={[styles.badgePill, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.badgePillText, { color: colors.primary }]}>
              {user?.faculty || 'Faculty of Engineering'}
            </Text>
          </View>
        </View>

        {/* Accommodation Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Accommodation</Text>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Hostel:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.hostel?.name || 'Mahanama Hall'} (Block {user?.hostel?.block || 'B'})
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <Ionicons name="key-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Room Number:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              Room {user?.hostel?.roomNumber || '204'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sub-Warden:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.hostel?.subWarden?.name || 'Dr. K. Gunasekara'}
            </Text>
          </View>
        </View>

        {/* Backend Connectivity Status */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Backend API Connection</Text>

          <View style={styles.serverRow}>
            <View style={styles.serverLeft}>
              <View style={[styles.serverDot, { backgroundColor: serverOnline ? '#10B981' : '#EF4444' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.serverStatusTitle, { color: colors.text }]}>
                  {serverOnline ? 'Backend Server Online' : 'Backend Server Offline'}
                </Text>
                <Text style={[styles.serverEndpoint, { color: colors.textTertiary }]} numberOfLines={1}>
                  {backendUrl}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleTestConnection}
              disabled={isChecking}
              style={[styles.testBtn, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.testBtnText, { color: colors.primary }]}>Ping</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setCustomUrl(backendUrl);
              setIsUrlModalOpen(true);
            }}
            style={[styles.changeUrlBtn, { borderColor: colors.inputBorder }]}
          >
            <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.changeUrlText, { color: colors.textSecondary }]}>
              Configure API Server Host / Port
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences & Appearance</Text>

          {/* Theme Selector Toggle */}
          <View style={styles.themeRow}>
            <View style={styles.menuLeft}>
              <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.primary} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>App Theme</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark Mode' : 'Light Color Theme'}
                </Text>
              </View>
            </View>

            <View style={[styles.themePills, { backgroundColor: colors.inputBackground }]}>
              <TouchableOpacity
                onPress={() => setTheme('light')}
                style={[
                  styles.themePill,
                  !isDark && [styles.themePillActive, { backgroundColor: colors.card, ...Shadows.sm }],
                ]}
              >
                <Ionicons name="sunny" size={14} color={!isDark ? colors.primary : colors.textTertiary} />
                <Text
                  style={[
                    styles.themePillText,
                    { color: !isDark ? colors.primary : colors.textSecondary, fontWeight: !isDark ? '700' : '500' },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTheme('dark')}
                style={[
                  styles.themePill,
                  isDark && [styles.themePillActive, { backgroundColor: colors.card, ...Shadows.sm }],
                ]}
              >
                <Ionicons name="moon" size={14} color={isDark ? '#FBBF24' : colors.textTertiary} />
                <Text
                  style={[
                    styles.themePillText,
                    { color: isDark ? '#FBBF24' : colors.textSecondary, fontWeight: isDark ? '700' : '500' },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuTitle, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: colors.success }]}>Enabled</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Backend URL Config Modal */}
      <Modal
        visible={isUrlModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUrlModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalHeading, { color: colors.text }]}>Configure Backend API</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Enter the Express.js server address (e.g. your computer's IP address on Wi-Fi):
            </Text>

            <TextInput
              style={[styles.urlInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="http://192.168.1.100:5000/api/v1"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setIsUrlModalOpen(false)}
                style={[styles.modalCancelBtn, { backgroundColor: colors.inputBackground }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveBackendUrl}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.modalSaveText}>Save & Reconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 54,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  profileCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  badgePill: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    width: 100,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  serverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  serverDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serverStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  serverEndpoint: {
    fontSize: 11,
    marginTop: 1,
  },
  testBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  changeUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  changeUrlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  themePills: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: BorderRadius.full,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  themePillActive: {},
  themePillText: {
    fontSize: 11,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalCancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
