# 📱 HostelHub Mobile App (React Native + Expo)

Mobile client application for the **HostelHub** University Hostel Maintenance System.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

- **Web Preview**: Press `w` in terminal
- **Mobile Phone (Expo Go)**: Scan QR code with Expo Go app
- **Android Emulator**: Press `a` in terminal

---

## 🔑 Demo Test Accounts

All accounts use the password: **`123123`**

| Role | Student ID / Username | Password | User Name | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `2021E103` | `123123` | Sachintha Nimesh | Room 204, Mahanama Hall |
| **Sub-Warden** | `WARDEN01` | `123123` | Dr. K. Gunasekara | Sub-Warden |
| **Electrician** | `STAFF_ELEC01` | `123123` | K. Bandara | Maintenance Unit |

*(Quick-login demo buttons are also provided on the Login screen!)*

---

## 📡 Backend API Connection

The app automatically resolves the computer's LAN IP address when running via Expo Go.

To manually configure the backend IP address:
1. Open the app and navigate to the **Profile** tab.
2. Tap **"Configure API Server Host / Port"**.
3. Enter `http://<YOUR_COMPUTER_IP>:5000/api/v1` and tap **Save & Reconnect**.
