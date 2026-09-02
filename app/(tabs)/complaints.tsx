import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComplaintCard, ComplaintItem } from '@/components/ComplaintCard';
import { StatusBadge, ComplaintStatus } from '@/components/StatusBadge';

const SAMPLE_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'C-1024',
    title: 'Ceiling Fan Not Rotating',
    category: 'Electrical',
    location: 'Block B - Room 204',
    status: 'In Progress',
    eta: 'Today, 4:30 PM',
    assignedStaff: 'K. Bandara (Electrician)',
    createdAt: 'Sep 2, 09:15 AM',
  },
  {
    id: 'C-1023',
    title: 'Water Pipe Leaking under Sink',
    category: 'Water Leak',
    location: '2nd Floor Washroom B',
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
    location: 'Block B - Room 204',
    status: 'Submitted',
    eta: 'Awaiting Staff Assignment',
    createdAt: 'Sep 1, 04:20 PM',
  },
  {
    id: 'C-0998',
    title: 'Study Desk Drawer Stuck',
    category: 'Furniture',
    location: 'Block B - Room 204',
    status: 'Resolved',
    assignedStaff: 'M. Fernando (Carpenter)',
    createdAt: 'Aug 28, 02:00 PM',
  },
  {
    id: 'C-0985',
    title: 'Tube Light Flickering',
    category: 'Electrical',
    location: 'Block B - Room 204',
    status: 'Resolved',
    assignedStaff: 'K. Bandara (Electrician)',
    createdAt: 'Aug 24, 11:30 AM',
  },
];

export default function ComplaintsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const filteredComplaints = SAMPLE_COMPLAINTS.filter((c) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Active'
        ? c.status !== 'Resolved'
        : c.status === 'Resolved';

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const stages: ComplaintStatus[] = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

  const getStageIndex = (status: ComplaintStatus) => stages.indexOf(status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Complaints</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Real-time status tracking & repair progress
        </Text>

        {/* Tab Control */}
        <View style={[styles.tabBar, { backgroundColor: colors.inputBackground }]}>
          {(['All', 'Active', 'Resolved'] as const).map((tab) => {
            const isCurrent = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabItem,
                  isCurrent && [styles.tabItemActive, { backgroundColor: colors.card, ...Shadows.sm }],
                ]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    {
                      color: isCurrent ? colors.primary : colors.textSecondary,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                >
                  {tab}
                  {tab === 'Active' && ' (3)'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by ticket ID, title, or room..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Complaints Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              There are no {activeTab.toLowerCase()} complaints matching your criteria.
            </Text>
          </View>
        ) : (
          filteredComplaints.map((item) => (
            <ComplaintCard
              key={item.id}
              item={item}
              onPress={() => setSelectedComplaint(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Complaint Detail & Tracking Modal */}
      {selectedComplaint && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedComplaint(null)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.modalTicketId, { color: colors.primary }]}>
                  Ticket #{selectedComplaint.id}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedComplaint.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedComplaint(null)}
                style={[styles.closeBtn, { backgroundColor: colors.inputBackground }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Four-stage horizontal progress tracker (PDF Section 5.5) */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                  Status Tracker
                </Text>
                <View style={styles.trackerRow}>
                  {stages.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedComplaint.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <React.Fragment key={stage}>
                        <View style={styles.stageStep}>
                          <View
                            style={[
                              styles.stageDot,
                              {
                                backgroundColor: isDone ? colors.primary : colors.inputBackground,
                                borderColor: isDone ? colors.primary : colors.inputBorder,
                              },
                            ]}
                          >
                            {isDone ? (
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            ) : (
                              <Text style={[styles.stageDotNumber, { color: colors.textTertiary }]}>
                                {idx + 1}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stageName,
                              {
                                color: isCurrent ? colors.primary : isDone ? colors.text : colors.textTertiary,
                                fontWeight: isCurrent ? '700' : '500',
                              },
                            ]}
                          >
                            {stage}
                          </Text>
                        </View>
                        {idx < stages.length - 1 && (
                          <View
                            style={[
                              styles.trackerLine,
                              {
                                backgroundColor: idx < currentIdx ? colors.primary : colors.divider,
                              },
                            ]}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>

              {/* Staff & ETA Card */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                  Assignment & Timing
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Staff:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedComplaint.assignedStaff || 'Pending assignment'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={18} color={colors.warning} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Estimated ETA:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedComplaint.eta || 'Within 24 hours'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedComplaint.location}
                  </Text>
                </View>
              </View>

              {/* In-app Chat with Staff (PDF Section 5.5 - 33.6% top requested) */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                <View style={styles.chatHeader}>
                  <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    Chat with Assigned Staff
                  </Text>
                </View>

                <View style={styles.chatBox}>
                  <View style={[styles.chatBubbleStaff, { backgroundColor: colors.inputBackground }]}>
                    <Text style={[styles.chatAuthor, { color: colors.primary }]}>
                      {selectedComplaint.assignedStaff || 'Maintenance Helpdesk'}
                    </Text>
                    <Text style={[styles.chatMessageText, { color: colors.text }]}>
                      Hello! I have been assigned to your issue. I will inspect the fan during the afternoon maintenance round.
                    </Text>
                    <Text style={[styles.chatTime, { color: colors.textTertiary }]}>10:15 AM</Text>
                  </View>

                  <View style={[styles.chatBubbleStudent, { backgroundColor: colors.primary }]}>
                    <Text style={styles.chatMessageTextStudent}>
                      Thank you! Please knock before entering room 204.
                    </Text>
                    <Text style={styles.chatTimeStudent}>10:18 AM</Text>
                  </View>
                </View>

                {/* Chat Composer */}
                <View style={[styles.chatComposer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                  <TextInput
                    style={[styles.chatInput, { color: colors.text }]}
                    placeholder="Type message to staff..."
                    placeholderTextColor={colors.textTertiary}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                  />
                  <TouchableOpacity
                    onPress={() => setChatMessage('')}
                    style={[styles.chatSendBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
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
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: -Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabItemActive: {},
  tabItemText: {
    fontSize: 13,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 20,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTicketId: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  stageStep: {
    alignItems: 'center',
    width: 65,
  },
  stageDot: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stageDotNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  stageName: {
    fontSize: 10,
    textAlign: 'center',
  },
  trackerLine: {
    flex: 1,
    height: 2,
    marginTop: -16,
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
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chatBox: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chatBubbleStaff: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderTopLeftRadius: 2,
  },
  chatAuthor: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatBubbleStudent: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderTopRightRadius: 2,
  },
  chatMessageTextStudent: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  chatTimeStudent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  chatInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  chatSendBtn: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
