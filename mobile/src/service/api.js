// src/services/api.js
export const api = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@test.com' && password === '1234') {
          resolve({ user: { email, name: 'Test User' } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  register: async (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (!name || !email || !password) {
          reject(new Error('All fields are required'));
          return;
        }
        
        if (email.includes('@')) {
          resolve({ 
            user: { 
              name, 
              email 
            } 
          });
        } else {
          reject(new Error('Invalid email format'));
        }
      }, 1000);
    });
  },
};
