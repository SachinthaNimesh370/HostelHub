import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { ComplaintCard, ComplaintItem } from '@/components/ComplaintCard';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ApiService, ComplaintDetail, Announcement } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme, isDark, toggleTheme } = useAppTheme();
  const colors = Colors[colorScheme];
  const { user, token, serverOnline, checkServerHealth } = useAuth();

  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fetchedComplaints, fetchedAnnouncements] = await Promise.allSettled([
        ApiService.getComplaints('active', token || undefined),
        ApiService.getAnnouncements(token || undefined),
      ]);

      if (fetchedComplaints.status === 'fulfilled' && Array.isArray(fetchedComplaints.value)) {
        const mapped: ComplaintItem[] = fetchedComplaints.value.map((c) => ({
          id: c.ticketNumber || c.id,
          title: c.title,
          category: (c.category as any) || 'Other',
          location: c.location,
          status: c.status,
          eta: c.eta || (c.status === 'Submitted' ? 'Awaiting Assignment' : 'In Progress'),
          assignedStaff: c.assignedStaff ? `${c.assignedStaff.name} (${c.assignedStaff.role || 'Staff'})` : undefined,
          isEmergency: c.isEmergency,
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
        }));
        setComplaints(mapped);
      }

      if (fetchedAnnouncements.status === 'fulfilled' && Array.isArray(fetchedAnnouncements.value)) {
        setAnnouncements(fetchedAnnouncements.value);
      }
    } catch (e) {
      console.warn('Could not fetch home data', e);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), checkServerHealth()]);
    setRefreshing(false);
  };

  const studentDisplayName = user?.fullName || 'Sachintha Nimesh';
  const hostelName = user?.hostel?.name || 'Mahanama Hall';
  const roomName = user?.hostel?.roomNumber ? `Block ${user.hostel.block || 'B'} - Room ${user.hostel.roomNumber}` : 'Block B - Room 204';

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
            {studentDisplayName} 👋
          </Text>
          <View style={styles.roomTag}>
            <Ionicons name="location" size={12} color={colors.primary} />
            <Text style={[styles.roomTagText, { color: colors.primary }]}>
              {hostelName} · {roomName}
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

          {/* Notifications / Live status */}
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
            {complaints.length > 0 && (
              <View
                style={[
                  styles.notifBadge,
                  { backgroundColor: colors.danger },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. Emergency Banner (Priority Shortcut) */}
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

        {/* 2. Primary Report Issue Action */}
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

        {/* 3. Quick Actions Row */}
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

        {/* 4. Active Complaints Section */}
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
                View All ({complaints.length})
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Fetching live status...</Text>
            </View>
          ) : complaints.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {complaints.map((item) => (
                <ComplaintCard
                  key={item.id}
                  item={item}
                  compact={true}
                  onPress={() => router.push('/(tabs)/complaints')}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="checkmark-done-circle" size={36} color={colors.success} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No active complaints reported for your room currently.
              </Text>
            </View>
          )}
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
                {announcements.length > 0 ? announcements[0].title : 'Hostel Announcement'}
              </Text>
            </View>
            <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
              {announcements.length > 0
                ? announcements[0].body
                : 'Scheduled electrical maintenance for Block B on Friday, 2:00 PM – 5:00 PM. Please report any urgent issues prior.'}
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
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
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
    letterSpacing: -0.2,
  },
  emergencySubtitle: {
    color: '#FEE2E2',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  primaryReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
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
    letterSpacing: -0.2,
  },
  reportBtnSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  loaderContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  noticeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
