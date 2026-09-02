# HostelHub – Backend Developer & API Specification Guide

This guide defines the complete RESTful API and WebSocket architecture for the **HostelHub** backend system. It covers data models, authentication flows, endpoint specifications, request/payload contracts, and database schema recommendations aligned with the project requirements and Hierarchical Task Analysis (HTA).

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATIONS                  │
│   • Student Mobile App (React Native / Expo)           │
│   • Maintenance Staff Mobile Portal                    │
│   • Admin & Sub-Warden Web Dashboard                   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌────────────────────────────────────────────────────────┐
│                    API GATEWAY                         │
│   • Authentication & Authorization (JWT verification)  │
│   • Rate Limiting & Request Validation                 │
│   • Routing & Load Balancing                           │
└────────────┬──────────────┬──────────────┬─────────────┘
             │              │              │
    ┌────────▼───────┐ ┌────▼────────┐ ┌───▼───────────┐
    │  Auth Service  │ │ Complaint   │ │ Realtime Chat │
    │   & User Data  │ │  Service    │ │ (WebSocket)   │
    └────────────────┘ └─────────────┘ └───────────────┘
    ┌────────────────┐ ┌─────────────┐ ┌───────────────┐
    │ Notification   │ │ Media Cloud │ │ Feedback &    │
    │  (FCM / Expo)  │ │   Storage   │ │   Analytics   │
    └────────────────┘ └─────────────┘ └───────────────┘
```

### Base URL Conventions
- **Development**: `http://localhost:5000/api/v1`
- **Staging / Production**: `https://api.hostelhub.university.lk/api/v1`
- **WebSocket Gateway**: `wss://api.hostelhub.university.lk/ws`

### Common Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-App-Version: 1.0.0
X-Language: en | si | ta
```

---

## 2. Authentication & Authorization

All authenticated endpoints expect an `Authorization: Bearer <token>` header.

### User Roles
- `STUDENT`: Normal student lodging complaint, tracking status, in-app chat with assigned staff, post-repair feedback.
- `STAFF`: Maintenance electrician, plumber, carpenter, locksmith (updates status, chats, sets ETA).
- `SUB_WARDEN`: Approves tickets, broadcasts notices, manages room assignments.
- `ADMIN`: Full system control.

---

## 3. Endpoints Specification

### 3.1 Authentication & User Module

#### `POST /auth/login`
Student credential login (Student ID / Hostel ID & Password).

**Request Body:**
```json
{
  "studentId": "2021E103",
  "password": "mySecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 86400,
    "user": {
      "id": "usr_99812",
      "studentId": "2021E103",
      "fullName": "Sachintha Nimesh",
      "email": "sachintha@eng.university.lk",
      "role": "STUDENT",
      "faculty": "Faculty of Engineering",
      "hostel": {
        "id": "hst_02",
        "name": "Mahanama Hall",
        "block": "Block B",
        "roomNumber": "204",
        "subWarden": {
          "name": "Dr. K. Gunasekara",
          "phone": "+94 77 123 4567"
        }
      }
    }
  }
}
```

---

#### `POST /auth/sso`
University Single Sign-On (OAuth2 / SAML callback).

**Request Body:**
```json
{
  "ssoToken": "sso_auth_code_xyz123",
  "provider": "UNIVERSITY_ENTRA_ID"
}
```

---

#### `GET /users/me`
Retrieve currently logged-in student profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_99812",
    "studentId": "2021E103",
    "fullName": "Sachintha Nimesh",
    "email": "sachintha@eng.university.lk",
    "hostel": "Mahanama Hall",
    "block": "Block B",
    "room": "Room 204",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "pushNotifications": true
    }
  }
}
```

---

### 3.2 Location & Room QR Code Module

#### `GET /locations/qr/:qrCodeId`
Resolves a physical room QR code tag (auto-fills location in 1 step).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "qrCodeId": "QR-MAH-B-204",
    "hostelId": "hst_02",
    "hostelName": "Mahanama Hall",
    "block": "Block B",
    "roomNumber": "204",
    "floor": 2,
    "displayLocation": "Mahanama Hall · Block B - Room 204"
  }
}
```

---

### 3.3 Maintenance Complaints Module

#### `POST /complaints`
Submit a new maintenance complaint (HTA Sub-task 2).

**Request Body:**
```json
{
  "category": "Electrical",
  "title": "Ceiling Fan Not Rotating",
  "description": "Fan makes a loud humming sound but blades do not spin.",
  "location": "Mahanama Hall · Block B - Room 204",
  "qrCodeId": "QR-MAH-B-204",
  "isEmergency": false,
  "isAnonymous": false,
  "mediaUrls": [
    "https://storage.hostelhub.lk/media/complaints/evidence_01.jpg"
  ]
}
```

> **Supported Categories:** `Electrical` | `Water Leak` | `Furniture` | `Door Lock` | `Other`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint registered successfully",
  "data": {
    "id": "C-1024",
    "ticketNumber": "TKT-2026-001024",
    "category": "Electrical",
    "title": "Ceiling Fan Not Rotating",
    "description": "Fan makes a loud humming sound but blades do not spin.",
    "location": "Mahanama Hall · Block B - Room 204",
    "status": "Submitted",
    "isEmergency": false,
    "isAnonymous": false,
    "assignedStaff": null,
    "eta": null,
    "media": [
      {
        "type": "IMAGE",
        "url": "https://storage.hostelhub.lk/media/complaints/evidence_01.jpg"
      }
    ],
    "timeline": [
      {
        "status": "Submitted",
        "timestamp": "2026-09-02T09:15:00.000Z",
        "note": "Complaint lodged by student"
      }
    ],
    "createdAt": "2026-09-02T09:15:00.000Z"
  }
}
```

---

#### `GET /complaints`
Fetch user's complaint list (HTA Sub-task 3). Supports filtering by tab: `All` | `Active` | `Resolved`.

**Query Parameters:**
- `status`: `all` | `active` | `resolved`
- `search`: string search across ticket title, ID, or room
- `page`: integer (default: 1)
- `limit`: integer (default: 20)

**Request Example:**
`GET /complaints?status=active&search=fan`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "C-1024",
        "ticketNumber": "TKT-2026-001024",
        "title": "Ceiling Fan Not Rotating",
        "category": "Electrical",
        "location": "Block B - Room 204",
        "status": "In Progress",
        "isEmergency": false,
        "assignedStaff": {
          "id": "stf_44",
          "name": "K. Bandara",
          "trade": "Electrician",
          "phone": "+94 71 555 1234"
        },
        "eta": "Today, 4:30 PM",
        "createdAt": "2026-09-02T09:15:00.000Z"
      },
      {
        "id": "C-1023",
        "ticketNumber": "TKT-2026-001023",
        "title": "Water Leak under Sink",
        "category": "Water Leak",
        "location": "2F Washroom",
        "status": "Assigned",
        "isEmergency": true,
        "assignedStaff": {
          "id": "stf_12",
          "name": "S. Perera",
          "trade": "Plumber",
          "phone": "+94 77 888 4321"
        },
        "eta": "Tomorrow, 10:00 AM",
        "createdAt": "2026-09-02T08:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

---

#### `GET /complaints/:id`
Retrieve comprehensive details of a single complaint, including the 4-stage tracking status, media, assigned staff contact, and chat thread.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "C-1024",
    "title": "Ceiling Fan Not Rotating",
    "category": "Electrical",
    "location": "Block B - Room 204",
    "status": "In Progress",
    "currentStageIndex": 2,
    "stages": ["Submitted", "Assigned", "In Progress", "Resolved"],
    "isEmergency": false,
    "isAnonymous": false,
    "assignedStaff": {
      "id": "stf_44",
      "name": "K. Bandara",
      "role": "Electrician",
      "phone": "+94 71 555 1234"
    },
    "eta": "Today, 4:30 PM",
    "timeline": [
      { "stage": "Submitted", "timestamp": "2026-09-02T09:15:00Z", "completed": true },
      { "stage": "Assigned", "timestamp": "2026-09-02T10:00:00Z", "completed": true },
      { "stage": "In Progress", "timestamp": "2026-09-02T13:30:00Z", "completed": true },
      { "stage": "Resolved", "timestamp": null, "completed": false }
    ],
    "createdAt": "2026-09-02T09:15:00Z"
  }
}
```

---

### 3.4 In-App Chat with Assigned Staff Module

Enables direct 2-way communication between student and maintenance personnel (PDF Section 5.5).

#### `GET /complaints/:id/messages`
Get message history for a ticket.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "complaintId": "C-1024",
    "messages": [
      {
        "id": "msg_01",
        "senderId": "stf_44",
        "senderRole": "STAFF",
        "senderName": "K. Bandara (Electrician)",
        "message": "Hello! I have been assigned to your issue. I will inspect the fan during the afternoon maintenance round.",
        "timestamp": "2026-09-02T10:15:00Z",
        "isRead": true
      },
      {
        "id": "msg_02",
        "senderId": "usr_99812",
        "senderRole": "STUDENT",
        "senderName": "Sachintha Nimesh",
        "message": "Thank you! Please knock before entering room 204.",
        "timestamp": "2026-09-02T10:18:00Z",
        "isRead": true
      }
    ]
  }
}
```

#### `POST /complaints/:id/messages`
Send a new message to the assigned staff member.

**Request Body:**
```json
{
  "message": "I will be in the room after 3:00 PM."
}
```

#### WebSocket Event Specification (`wss://.../ws/chat`)
- **Client Connect**: `ws://api.hostelhub.lk/ws/chat?ticketId=C-1024&token=JWT`
- **Incoming Message Event**:
  ```json
  {
    "event": "NEW_MESSAGE",
    "data": {
      "ticketId": "C-1024",
      "senderId": "stf_44",
      "senderName": "K. Bandara",
      "message": "I am heading to Block B room 204 now.",
      "timestamp": "2026-09-02T16:00:00Z"
    }
  }
  ```

---

### 3.5 Media Evidence Upload Module

#### `POST /media/upload`
Upload photo or short video clip evidence (Multipart Form Data).

**Headers:**
```http
Content-Type: multipart/form-data
```

**Payload:**
- `file`: Binary file data (JPG, PNG, MP4 up to 15MB)
- `complaintId`: (Optional ticket ID string)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "mediaId": "med_5521",
    "url": "https://storage.hostelhub.lk/media/complaints/evidence_20260902.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 2048500
  }
}
```

---

### 3.6 Post-Repair Feedback Module (HTA Sub-task 4)

Triggered once a complaint reaches `Resolved` status.

#### `POST /complaints/:id/feedback`

**Request Body:**
```json
{
  "staffRating": 5,
  "speedRating": 4,
  "comments": "The fan capacitor was replaced quickly. Good service!",
  "isSatisfied": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully. Ticket archived."
}
```

---

### 3.7 Announcements & Hostel Notices

#### `GET /announcements`
Fetch announcements made by Sub-Warden or Hostel Office.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ann_01",
      "title": "Sub-Warden Announcement",
      "body": "Scheduled electrical maintenance for Block B on Friday, 2:00 PM – 5:00 PM. Please report any urgent issues prior.",
      "priority": "HIGH",
      "author": "Dr. K. Gunasekara",
      "hostel": "Mahanama Hall",
      "publishedAt": "2026-09-01T08:00:00Z"
    }
  ]
}
```

---

## 4. Recommended Database Schema (PostgreSQL / Relational)

```sql
-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(30) DEFAULT 'STUDENT', -- STUDENT, STAFF, SUB_WARDEN, ADMIN
    phone VARCHAR(20),
    language_pref VARCHAR(10) DEFAULT 'en',
    theme_pref VARCHAR(10) DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Hostels & Room Allocations
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sub_warden_id UUID REFERENCES users(id)
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID REFERENCES hostels(id),
    block VARCHAR(20) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    qr_code_id VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE room_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    room_id UUID REFERENCES rooms(id),
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Maintenance Complaints
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID REFERENCES users(id),
    room_id UUID REFERENCES rooms(id),
    category VARCHAR(50) NOT NULL, -- Electrical, Water Leak, Furniture, Door Lock, Other
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted', -- Submitted, Assigned, In Progress, Resolved, Closed
    is_emergency BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    assigned_staff_id UUID REFERENCES users(id),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Complaint Media Evidence
CREATE TABLE complaint_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(20) NOT NULL, -- IMAGE, VIDEO
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Chat Messages (Staff <-> Student)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Post-Repair Feedback
CREATE TABLE complaint_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE REFERENCES complaints(id),
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID REFERENCES hostels(id),
    author_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Standard Error Response Contract

All errors must return a consistent JSON schema:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Complaint ticket with ID C-9999 was not found.",
    "details": []
  }
}
```

### Standard HTTP Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource (complaint, feedback, message) created.
- `400 Bad Request`: Validation failure (missing category or description).
- `401 Unauthorized`: Missing or expired JWT token.
- `403 Forbidden`: Insufficient role permissions.
- `404 Not Found`: Ticket, room, or user ID does not exist.
- `500 Internal Server Error`: Unhandled server exception.
