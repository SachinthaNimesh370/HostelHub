import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComplaintCard, ComplaintItem } from '@/components/ComplaintCard';

import { useAppTheme } from '@/context/ThemeContext';

const ACTIVE_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'C-1024',
    title: 'Ceiling Fan Not Rotating',
    category: 'Electrical',
    location: 'Room 204',
    status: 'In Progress',
    eta: 'Today, 4:30 PM',
    assignedStaff: 'K. Bandara (Electrician)',
    createdAt: 'Sep 2, 09:15 AM',
  },
  {
    id: 'C-1023',
    title: 'Water Leak under Sink',
    category: 'Water Leak',
    location: '2F Washroom',
    status: 'Assigned',
    eta: 'Tomorrow, 10:00 AM',
    assignedStaff: 'S. Perera (Plumber)',
    isEmergency: true,
    createdAt: 'Sep 2, 08:30 AM',
  },
  {
    id: 'C-1021',
    title: 'Door Handle Broken',
    category: 'Door Lock',
    location: 'Room 204',
    status: 'Submitted',
    eta: 'Awaiting Assignment',
    createdAt: 'Sep 1, 04:20 PM',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme, isDark, toggleTheme } = useAppTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.studentName, { color: colors.text }]}>
            Sachintha Nimesh 👋
          </Text>
          <View style={styles.roomTag}>
            <Ionicons name="location" size={12} color={colors.primary} />
            <Text style={[styles.roomTagText, { color: colors.primary }]}>
              Mahanama Hall · Block B - Room 204
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Quick Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.headerIconButton,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
            accessibilityLabel="Toggle Light / Dark Mode"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={isDark ? '#FBBF24' : colors.primary}
            />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/complaints')}
            style={[
              styles.headerIconButton,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text}
            />
            <View
              style={[
                styles.notifBadge,
                { backgroundColor: colors.danger },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Emergency Banner (Priority Shortcut - PDF Section 5.2) */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Pressable
            onPress={() => router.push('/(tabs)/report')}
            style={({ pressed }) => [
              styles.emergencyCard,
              {
                backgroundColor: colors.danger,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...Shadows.md,
              },
            ]}
          >
            <View style={styles.emergencyLeft}>
              <View style={styles.emergencyIconWrap}>
                <Ionicons name="warning" size={26} color="#EF4444" />
              </View>
              <View style={styles.emergencyTextWrap}>
                <Text style={styles.emergencyTitle}>
                  Report Emergency Issue
                </Text>
                <Text style={styles.emergencySubtitle}>
                  Sparking, flood, lockouts · Instant Warden Alert
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* 2. Primary Report Issue Action (PDF Section 5.2) */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Pressable
            onPress={() => router.push('/(tabs)/report')}
            style={({ pressed }) => [
              styles.primaryReportBtn,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...Shadows.md,
              },
            ]}
          >
            <View style={styles.reportBtnContent}>
              <View style={styles.reportIconCircle}>
                <Ionicons name="add" size={28} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.reportBtnTitle}>Report a Maintenance Issue</Text>
                <Text style={styles.reportBtnSubtitle}>
                  Takes only 1–2 steps with QR auto-fill
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* 3. Quick Actions Row (PDF Section 5.2) */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/report')}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  ...Shadows.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Scan QR
              </Text>
              <Text style={[styles.quickActionDesc, { color: colors.textTertiary }]}>
                Auto-fill room
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/report')}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  ...Shadows.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: `${colors.info}15` },
                ]}
              >
                <Ionicons name="camera-outline" size={22} color={colors.info} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Upload Photo
              </Text>
              <Text style={[styles.quickActionDesc, { color: colors.textTertiary }]}>
                Attach proof
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/complaints')}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  ...Shadows.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: `${colors.success}15` },
                ]}
              >
                <Ionicons name="chatbubbles-outline" size={22} color={colors.success} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Staff Chat
              </Text>
              <Text style={[styles.quickActionDesc, { color: colors.textTertiary }]}>
                Live updates
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 4. Active Complaints Section (PDF Section 5.2) */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
                Active Complaints
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Real-time progress on your reported issues
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/complaints')}
              style={styles.viewAllBtn}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Horizontal scrollable cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {ACTIVE_COMPLAINTS.map((item) => (
              <ComplaintCard
                key={item.id}
                item={item}
                compact={true}
                onPress={() => router.push('/(tabs)/complaints')}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* 5. Hostel Notice Banner */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Shadows.sm,
              },
            ]}
          >
            <View style={styles.noticeHeader}>
              <Ionicons name="megaphone-outline" size={18} color={colors.warning} />
              <Text style={[styles.noticeTitle, { color: colors.text }]}>
                Sub-Warden Announcement
              </Text>
            </View>
            <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
              Scheduled electrical maintenance for Block B on Friday, 2:00 PM – 5:00 PM. Please report any urgent issues prior.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  roomTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.xl,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  emergencyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emergencySubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  primaryReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  reportBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  reportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  reportBtnSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: -Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickActionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  horizontalScroll: {
    paddingRight: Spacing.md,
  },
  noticeCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  noticeBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
