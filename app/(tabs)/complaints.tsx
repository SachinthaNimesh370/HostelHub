import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComplaintCard, ComplaintItem } from '@/components/ComplaintCard';
import { StatusBadge, ComplaintStatus } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { ApiService, ComplaintDetail, ChatMessage } from '@/services/api';

export default function ComplaintsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [rawComplaints, setRawComplaints] = useState<ComplaintDetail[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ComplaintDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      const filterKey = activeTab === 'All' ? 'all' : activeTab === 'Active' ? 'active' : 'resolved';
      const list = await ApiService.getComplaints(filterKey, token || undefined);
      setRawComplaints(list);

      const mapped: ComplaintItem[] = list.map((c) => ({
        id: c.ticketNumber || c.id,
        rawId: c.id,
        title: c.title,
        category: (c.category as any) || 'Other',
        location: c.location,
        status: c.status,
        eta: c.eta || (c.status === 'Submitted' ? 'Awaiting Assignment' : c.status === 'Resolved' ? 'Completed' : 'In Progress'),
        assignedStaff: c.assignedStaff ? `${c.assignedStaff.name} (${c.assignedStaff.role || 'Staff'})` : undefined,
        isEmergency: c.isEmergency,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      } as ComplaintItem & { rawId: string }));

      setComplaints(mapped);
    } catch (err) {
      console.warn('Could not fetch complaints', err);
    }
  }, [activeTab, token]);

  useEffect(() => {
    setLoading(true);
    loadComplaints().finally(() => setLoading(false));
  }, [loadComplaints]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
    setRefreshing(false);
  };

  // Load modal details & messages when a complaint is selected
  const handleOpenComplaint = async (item: ComplaintItem) => {
    setSelectedComplaint(item);
    setFeedbackSubmitted(false);
    
    // Find matching raw complaint or fetch from backend
    const raw = rawComplaints.find((c) => c.ticketNumber === item.id || c.id === item.id);
    const targetId = raw?.id || (item as any).rawId || item.id;

    try {
      const detail = await ApiService.getComplaintById(targetId, token || undefined);
      setSelectedDetail(detail);

      const msgs = await ApiService.getMessages(targetId, token || undefined);
      setMessages(msgs);
    } catch (e) {
      if (raw) setSelectedDetail(raw);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedComplaint) return;
    const raw = rawComplaints.find((c) => c.ticketNumber === selectedComplaint.id || c.id === selectedComplaint.id);
    const targetId = raw?.id || (selectedComplaint as any).rawId || selectedComplaint.id;
    const textToSend = chatMessage.trim();
    setChatMessage('');
    setIsSendingChat(true);

    try {
      const newMsg = await ApiService.sendMessage(targetId, textToSend, token || undefined);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      Alert.alert('Chat Error', err?.message || 'Failed to send message.');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedComplaint) return;
    const raw = rawComplaints.find((c) => c.ticketNumber === selectedComplaint.id || c.id === selectedComplaint.id);
    const targetId = raw?.id || (selectedComplaint as any).rawId || selectedComplaint.id;

    try {
      await ApiService.submitFeedback(
        targetId,
        {
          staffRating: rating,
          speedRating: rating,
          comments: 'Service completed satisfactorily.',
          isSatisfied: rating >= 3,
        },
        token || undefined
      );
      setFeedbackSubmitted(true);
      Alert.alert('Thank you!', 'Your feedback helps improve hostel maintenance services.');
    } catch (err: any) {
      Alert.alert('Feedback Error', err?.message || 'Could not record rating.');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
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
          Real-time status tracking & live repair updates
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              Loading tickets from server...
            </Text>
          </View>
        ) : filteredComplaints.length === 0 ? (
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
              onPress={() => handleOpenComplaint(item)}
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
              <View style={{ flex: 1, paddingRight: Spacing.md }}>
                <Text style={[styles.modalTicketId, { color: colors.primary }]}>
                  Ticket #{selectedComplaint.id}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={2}>
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
              {/* Four-stage horizontal progress tracker */}
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

              {/* Assignment & Timing Card */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                  Assignment & Details
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Staff:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedDetail?.assignedStaff?.name || selectedComplaint.assignedStaff || 'Pending assignment'}
                  </Text>
                </View>
                {selectedDetail?.assignedStaff?.phone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color={colors.success} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact:</Text>
                    <Text style={[styles.infoValue, { color: colors.success, fontWeight: '700' }]}>
                      {selectedDetail.assignedStaff.phone}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={18} color={colors.warning} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Estimated ETA:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedDetail?.eta || selectedComplaint.eta || 'Within 24 hours'}
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

              {/* Post-Repair Satisfaction Rating (If Resolved) */}
              {selectedComplaint.status === 'Resolved' && (
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                    Repair Satisfaction Feedback
                  </Text>
                  {feedbackSubmitted ? (
                    <View style={styles.feedbackSuccess}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                      <Text style={[styles.feedbackSuccessText, { color: colors.success }]}>
                        Feedback submitted. Thank you!
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.ratingBox}>
                      <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
                        How would you rate the repair quality?
                      </Text>
                      <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <TouchableOpacity key={s} onPress={() => setRating(s)}>
                            <Ionicons
                              name={s <= rating ? 'star' : 'star-outline'}
                              size={28}
                              color="#FBBF24"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={handleFeedbackSubmit}
                        style={[styles.feedbackBtn, { backgroundColor: colors.primary }]}
                      >
                        <Text style={styles.feedbackBtnText}>Submit Rating</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* In-app Chat with Staff */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...Shadows.sm }]}>
                <View style={styles.chatHeader}>
                  <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    Chat with Assigned Staff
                  </Text>
                </View>

                <View style={styles.chatBox}>
                  {messages.length === 0 ? (
                    <Text style={[styles.noChatText, { color: colors.textTertiary }]}>
                      No messages yet. Send a note to the assigned staff member below.
                    </Text>
                  ) : (
                    messages.map((msg) => {
                      const isStudent = msg.senderRole === 'STUDENT' || msg.senderId === user?.id;
                      return (
                        <View
                          key={msg.id}
                          style={[
                            isStudent ? styles.chatBubbleStudent : styles.chatBubbleStaff,
                            {
                              backgroundColor: isStudent ? colors.primary : colors.inputBackground,
                            },
                          ]}
                        >
                          {!isStudent && (
                            <Text style={[styles.chatAuthor, { color: colors.primary }]}>
                              {msg.senderName || 'Staff'}
                            </Text>
                          )}
                          <Text
                            style={[
                              isStudent ? styles.chatMessageTextStudent : styles.chatMessageText,
                              !isStudent && { color: colors.text },
                            ]}
                          >
                            {msg.message}
                          </Text>
                          <Text
                            style={[
                              isStudent ? styles.chatTimeStudent : styles.chatTime,
                              !isStudent && { color: colors.textTertiary },
                            ]}
                          >
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Chat Composer */}
                <View style={[styles.chatComposer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                  <TextInput
                    style={[styles.chatInput, { color: colors.text }]}
                    placeholder="Type message to staff..."
                    placeholderTextColor={colors.textTertiary}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    disabled={isSendingChat}
                    style={[styles.chatSendBtn, { backgroundColor: colors.primary }]}
                  >
                    {isSendingChat ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    )}
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
    paddingBottom: 110,
    gap: Spacing.md,
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
  ratingBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  ratingLabel: {
    fontSize: 13,
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  feedbackBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  feedbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  feedbackSuccessText: {
    fontSize: 13,
    fontWeight: '700',
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
  noChatText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: Spacing.md,
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
