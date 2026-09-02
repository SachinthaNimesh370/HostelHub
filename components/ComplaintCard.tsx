import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBadge, ComplaintStatus } from './StatusBadge';

export interface ComplaintItem {
  id: string;
  title: string;
  category: 'Electrical' | 'Water Leak' | 'Furniture' | 'Door Lock' | 'Other';
  location: string;
  status: ComplaintStatus;
  eta?: string;
  isEmergency?: boolean;
  assignedStaff?: string;
  createdAt: string;
}

interface ComplaintCardProps {
  item: ComplaintItem;
  onPress?: () => void;
  compact?: boolean;
}

export function ComplaintCard({ item, onPress, compact = false }: ComplaintCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (item.category) {
      case 'Electrical':
        return 'flash';
      case 'Water Leak':
        return 'water';
      case 'Furniture':
        return 'bed';
      case 'Door Lock':
        return 'key';
      default:
        return 'construct';
    }
  };

  const getCategoryColor = () => {
    switch (item.category) {
      case 'Electrical':
        return '#F59E0B';
      case 'Water Leak':
        return '#3B82F6';
      case 'Furniture':
        return '#8B5CF6';
      case 'Door Lock':
        return '#EC4899';
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.cardCompact : styles.cardFull,
        {
          backgroundColor: colors.card,
          borderColor: item.isEmergency ? colors.danger : colors.cardBorder,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...Shadows.sm,
        },
      ]}
    >
      {/* Header row: Category Icon + Title + Emergency Flag */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.categoryIconWrap,
              { backgroundColor: `${categoryColor}18` },
            ]}
          >
            <Ionicons name={getCategoryIcon()} size={16} color={categoryColor} />
          </View>
          <View style={styles.titleArea}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              <Ionicons name="location-outline" size={12} color={colors.textTertiary} /> {item.location}
            </Text>
          </View>
        </View>

        {item.isEmergency && (
          <View style={[styles.emergencyTag, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="alert-circle" size={12} color={colors.danger} />
            <Text style={[styles.emergencyTagText, { color: colors.danger }]}>URGENT</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Footer row: Status badge + ETA / Staff info */}
      <View style={styles.bottomRow}>
        <StatusBadge status={item.status} size="sm" />

        {item.eta ? (
          <View style={styles.etaContainer}>
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.etaText, { color: colors.textSecondary }]}>
              {item.eta}
            </Text>
          </View>
        ) : item.assignedStaff ? (
          <View style={styles.etaContainer}>
            <Ionicons name="person-circle-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.etaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.assignedStaff}
            </Text>
          </View>
        ) : (
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {item.createdAt}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardCompact: {
    width: 280,
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
  },
  cardFull: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  location: {
    fontSize: 12,
    marginTop: 2,
  },
  emergencyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  emergencyTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
  },
});
