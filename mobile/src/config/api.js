import { Platform } from 'react-native';

// เปลี่ยน IP นี้เป็น IP ของเครื่อง Mac ของคุณ
const LOCAL_IP = 'http://192.168.1.105:5001'; // ← หาจากคำสั่ง: ipconfig getifaddr en0

const getApiUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'ios') {
      // iOS Simulator ใช้ localhost
      return `${LOCAL_IP}/api`;
    } else {
      // Android Emulator ใช้ 10.0.2.2
      return `${LOCAL_IP}/api`;
    }
  }
  
  // Production mode
  return 'https://your-production-api.com/api';
};

// สำหรับทดสอบบนเครื่องจริง (Real Device) ใช้บรรทัดนี้แทน
// export const API_URL = `http://${LOCAL_IP}:5001/api`;

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  PROFILE: `${API_URL}/auth/profile`,
  
  // Trips
  TRIPS: `${API_URL}/trips`,
  TRIP_BY_ID: (id) => `${API_URL}/trips/${id}`,
  CREATE_TRIP: `${API_URL}/trips`,
  
  // Bookings
  BOOKINGS: `${API_URL}/bookings`,
  BOOKING_BY_ID: (id) => `${API_URL}/bookings/${id}`,
  
  // Recommendations
  RECOMMENDATIONS: `${API_URL}/recommendations`,
  
  // AI (ถ้ามี)
  AI_CHAT: `${API_URL}/ai/chat`,
  AI_GENERATE: `${API_URL}/ai/generate-trip`,
};

// Log เพื่อ debug
console.log('📡 API Configuration:');
console.log('   URL:', API_URL);
console.log('   Platform:', Platform.OS);
console.log('   Dev Mode:', __DEV__);