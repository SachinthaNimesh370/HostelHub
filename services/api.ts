/**
 * HostelHub API Client Service
 * Fully typed client interfaces matching the Backend API.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to resolve the best backend host IP automatically
export const getDefaultBaseUrl = (): string => {
  // If running inside Expo Go / Expo dev client, hostUri provides the computer's LAN IP
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api/v1`;
    }
  }

  // Fallback for Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }

  // Fallback for Web / iOS Simulator / Localhost
  return 'http://localhost:5000/api/v1';
};

// Mutable configuration
export const API_CONFIG = {
  BASE_URL: getDefaultBaseUrl(),
  TIMEOUT_MS: 10000,
};

// Global in-memory token store
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const setBackendBaseUrl = (url: string) => {
  API_CONFIG.BASE_URL = url.replace(/\/+$/, '');
};

// Data Models
export interface User {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'SUB_WARDEN' | 'ADMIN';
  phone?: string;
  faculty?: string;
  themePref?: string;
  languagePref?: string;
  hostel?: {
    id: string;
    name: string;
    block: string;
    roomNumber: string;
    subWarden?: {
      name: string;
      phone: string;
    };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
}

export interface LocationQRData {
  qrCodeId: string;
  hostelId: string;
  hostelName: string;
  block: string;
  roomNumber: string;
  floor: number;
  displayLocation: string;
}

export interface CreateComplaintDTO {
  category: 'Electrical' | 'Water Leak' | 'Furniture' | 'Door Lock' | 'Other' | string;
  title: string;
  description: string;
  location: string;
  qrCodeId?: string;
  isEmergency?: boolean;
  isAnonymous?: boolean;
  mediaUrls?: string[];
}

export interface ComplaintDetail {
  id: string;
  ticketNumber: string;
  title: string;
  category: 'Electrical' | 'Water Leak' | 'Furniture' | 'Door Lock' | 'Other' | string;
  description: string;
  location: string;
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved';
  isEmergency: boolean;
  isAnonymous: boolean;
  assignedStaff?: {
    id: string;
    name: string;
    role?: string;
    phone?: string;
  };
  eta?: string;
  timeline: Array<{
    stage: string;
    timestamp: string | null;
    completed: boolean;
  }>;
  mediaUrls?: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole?: 'STUDENT' | 'STAFF' | 'SYSTEM';
  senderName: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface FeedbackDTO {
  staffRating: number;
  speedRating: number;
  comments?: string;
  isSatisfied: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  authorName?: string;
  publishedAt: string;
}

// Helper fetcher with timeout & headers
async function request<T>(endpoint: string, options: RequestInit = {}, overrideToken?: string): Promise<T> {
  const token = overrideToken || authToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const fullUrl = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network or backend server.');
    }
    throw err;
  }
}

// API Service Methods
export const ApiService = {
  // 1. Health / Connection Test
  async testConnection(): Promise<{ status: string; service: string; database: string }> {
    const rootUrl = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(rootUrl || 'http://localhost:5000', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  // 2. Auth
  async login(studentId: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
    if (data?.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  async loginWithSSO(ssoToken: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/sso', {
      method: 'POST',
      body: JSON.stringify({ ssoToken }),
    });
    if (data?.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  async getMe(token?: string): Promise<{ user: User }> {
    return await request<{ user: User }>('/auth/me', { method: 'GET' }, token);
  },

  // 3. Location QR Resolution
  async resolveQRCode(qrCodeId: string): Promise<LocationQRData> {
    return await request<LocationQRData>(`/locations/qr/${encodeURIComponent(qrCodeId)}`, {
      method: 'GET',
    });
  },

  // 4. Complaints
  async getComplaints(filter: 'all' | 'active' | 'resolved' = 'all', token?: string): Promise<ComplaintDetail[]> {
    const res = await request<{ complaints: ComplaintDetail[]; total: number }>(
      `/complaints?status=${filter}`,
      { method: 'GET' },
      token
    );
    return res.complaints || [];
  },

  async getComplaintById(id: string, token?: string): Promise<ComplaintDetail> {
    return await request<ComplaintDetail>(`/complaints/${id}`, { method: 'GET' }, token);
  },

  async submitComplaint(dto: CreateComplaintDTO, token?: string): Promise<ComplaintDetail> {
    return await request<ComplaintDetail>('/complaints', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, token);
  },

  // 5. Chat Messages
  async getMessages(complaintId: string, token?: string): Promise<ChatMessage[]> {
    const res = await request<{ messages: ChatMessage[] }>(
      `/complaints/${complaintId}/messages`,
      { method: 'GET' },
      token
    );
    return res.messages || [];
  },

  async sendMessage(complaintId: string, message: string, token?: string): Promise<ChatMessage> {
    return await request<ChatMessage>(`/complaints/${complaintId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }, token);
  },

  // 6. Post-Repair Feedback
  async submitFeedback(complaintId: string, feedback: FeedbackDTO, token?: string): Promise<void> {
    await request<void>(`/complaints/${complaintId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    }, token);
  },

  // 7. Announcements
  async getAnnouncements(token?: string): Promise<Announcement[]> {
    const res = await request<{ announcements: Announcement[] }>('/announcements', { method: 'GET' }, token);
    return res.announcements || [];
  },
};
