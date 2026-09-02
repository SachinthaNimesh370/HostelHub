import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getStatusColor = () => {
    switch (status) {
      case 'Submitted':
        return colors.statusSubmitted;
      case 'Assigned':
        return colors.statusAssigned;
      case 'In Progress':
        return colors.statusInProgress;
      case 'Resolved':
        return colors.statusResolved;
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSmall ? styles.containerSm : styles.containerMd,
        {
          backgroundColor: `${statusColor}18`, // 10% opacity tint
          borderColor: `${statusColor}40`,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          isSmall ? styles.dotSm : styles.dotMd,
          { backgroundColor: statusColor },
        ]}
      />
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSm : styles.textMd,
          { color: statusColor },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  containerMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    gap: 6,
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
  dotSm: {
    width: 6,
    height: 6,
  },
  dotMd: {
    width: 8,
    height: 8,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
});
