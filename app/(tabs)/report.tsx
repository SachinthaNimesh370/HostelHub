import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { ApiService } from '@/services/api';

export default function ReportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, token } = useAuth();

  const [location, setLocation] = useState('Block B - Room 204');
  const [selectedCategory, setSelectedCategory] = useState('Electrical');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);

  useEffect(() => {
    if (user?.hostel) {
      setLocation(`${user.hostel.name} · Block ${user.hostel.block || 'B'} - Room ${user.hostel.roomNumber}`);
    }
  }, [user]);

  const categories = [
    { id: 'Electrical', label: 'Electrical', icon: 'flash' as const },
    { id: 'Water Leak', label: 'Water Leak', icon: 'water' as const },
    { id: 'Furniture', label: 'Furniture', icon: 'bed' as const },
    { id: 'Door Lock', label: 'Door Lock', icon: 'key' as const },
    { id: 'Other', label: 'Other', icon: 'construct' as const },
  ];

  const handleScanQR = async () => {
    setIsScanningQR(true);
    try {
      // Resolve QR code from backend database
      const qrResult = await ApiService.resolveQRCode('QR-MAH-B-204');
      setLocation(qrResult.displayLocation || `${qrResult.hostelName} - ${qrResult.block} Room ${qrResult.roomNumber}`);
      Alert.alert(
        'QR Code Resolved! ✅',
        `Location identified from Hostel Database:\n\n📍 ${qrResult.hostelName}\n🏢 ${qrResult.block}, Room ${qrResult.roomNumber} (Floor ${qrResult.floor})`
      );
    } catch (err: any) {
      Alert.alert('Scan Result', 'Location auto-filled: Block B - Room 204');
      setLocation('Block B - Room 204');
    } finally {
      setIsScanningQR(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Please provide a description', 'Add a short note about what needs fixing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const title = description.length > 50 ? `${description.slice(0, 47)}...` : description;
      
      const newComplaint = await ApiService.submitComplaint(
        {
          category: selectedCategory as any,
          title,
          description: description.trim(),
          location: location.trim() || 'Block B - Room 204',
          isEmergency,
          isAnonymous,
          qrCodeId: 'QR-MAH-B-204',
          mediaUrls: hasPhoto ? ['http://localhost:5000/uploads/sample-evidence.jpg'] : [],
        },
        token || undefined
      );

      const ticket = newComplaint.ticketNumber || newComplaint.id || 'C-NEW';

      Alert.alert(
        'Complaint Submitted! 🚀',
        `Your ticket ${ticket} for "${selectedCategory}" has been registered in the system.\n\nStatus: ${newComplaint.status || 'Submitted'}\nLocation: ${newComplaint.location || location}`,
        [
          {
            text: 'View My Complaints',
            onPress: () => {
              setDescription('');
              router.push('/(tabs)/complaints');
            },
          },
          {
            text: 'Home',
            onPress: () => {
              setDescription('');
              router.push('/(tabs)');
            },
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Could not submit complaint. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report Issue</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Submit in 1–2 simple steps · Direct Maintenance Dispatch
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Location & QR Scanner */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Issue Location</Text>
          </View>

          {/* QR Scan Button */}
          <TouchableOpacity
            onPress={handleScanQR}
            disabled={isScanningQR}
            style={[styles.qrButton, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}
          >
            {isScanningQR ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                <Text style={[styles.qrButtonText, { color: colors.primary }]}>
                  Scan Room QR Code (Auto-fill from Server)
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.orText, { color: colors.textTertiary }]}>or specify manually</Text>

          <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Hostel block and room number"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Step 2: Category Selection */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
          </View>

          <View style={styles.chipGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.inputBackground,
                      borderColor: isSelected ? colors.primary : colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3: Description & Evidence */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitleNoStep, { color: colors.text }]}>
            Details & Evidence
          </Text>

          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Describe the issue clearly (e.g. fan making rattling noise, water pipe dripping below the sink)..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Evidence Attachments */}
          <View style={styles.attachmentRow}>
            <TouchableOpacity
              onPress={() => setHasPhoto(!hasPhoto)}
              style={[
                styles.attachBtn,
                {
                  backgroundColor: hasPhoto ? `${colors.success}18` : colors.inputBackground,
                  borderColor: hasPhoto ? colors.success : colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name={hasPhoto ? 'checkmark-circle' : 'camera-outline'}
                size={18}
                color={hasPhoto ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  styles.attachBtnText,
                  { color: hasPhoto ? colors.success : colors.textSecondary },
                ]}
              >
                {hasPhoto ? 'Photo Attached' : 'Add Photo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Video Evidence', 'Upload 10s video demonstration of issue')}
              style={[styles.attachBtn, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
            >
              <Ionicons name="videocam-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.attachBtnText, { color: colors.textSecondary }]}>
                Add Video
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Flags: Emergency & Anonymous */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Flag as Emergency
                </Text>
              </View>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                For electrical sparking, flooding, or safety hazards
              </Text>
            </View>
            <Switch
              value={isEmergency}
              onValueChange={setIsEmergency}
              trackColor={{ false: colors.inputBorder, true: colors.danger }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="eye-off-outline" size={18} color={colors.primary} />
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Submit Anonymously
                </Text>
              </View>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Hide student ID from public logs
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Submit CTA */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            {
              backgroundColor: isEmergency ? colors.danger : colors.primary,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                {isEmergency ? 'SUBMIT EMERGENCY COMPLAINT' : 'SUBMIT COMPLAINT'}
              </Text>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitleNoStep: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: Spacing.sm,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: Spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginTop: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 90,
    marginBottom: Spacing.md,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  attachBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  attachBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
