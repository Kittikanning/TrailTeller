"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface DailyActivity {
  day: number
  date: string
  activities: string[]
}

export interface Booking {
  id: string
  userId: string
  destination: string
  hotel: {
    name: string
    checkIn: string
    checkOut: string
    price: number
  }
  flight: {
    departure: string
    arrival: string
    departureTime: string
    arrivalTime: string
    price: number
  }
  totalAmount: number
  paidAt: string
  todoList: string[]
  dailyActivities: DailyActivity[]
}

export const authService = {
  register: async (email: string, password: string, name: string): Promise<User> => {
    const usersStr = await AsyncStorage.getItem('users')
    const users: User[] = usersStr ? JSON.parse(usersStr) : []

    if (users.find(u => u.email === email)) {
      throw new Error("อีเมลนี้ถูกใช้งานแล้ว")
    }

    const newUser: User = { id: Date.now().toString(), email, name, createdAt: new Date().toISOString() }
    users.push(newUser)

    await AsyncStorage.setItem('users', JSON.stringify(users))

    const passwordsStr = await AsyncStorage.getItem('passwords')
    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {}
    passwords[email] = password
    await AsyncStorage.setItem('passwords', JSON.stringify(passwords))

    return newUser
  },

  login: async (email: string, password: string): Promise<User> => {
    const usersStr = await AsyncStorage.getItem('users')
    const users: User[] = usersStr ? JSON.parse(usersStr) : []

    const passwordsStr = await AsyncStorage.getItem('passwords')
    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {}

    const user = users.find(u => u.email === email)
    if (!user || passwords[email] !== password) {
      throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    }

    await AsyncStorage.setItem('currentUser', JSON.stringify(user))
    return user
  },

  logout: async () => {
    await AsyncStorage.removeItem('currentUser')
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  },

  setCurrentUser: async (user: User) => {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user))
  },

  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const bookingsStr = await AsyncStorage.getItem('bookings')
    const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : []
    return bookings.filter(b => b.userId === userId)
  },

  addBooking: async (booking: Booking) => {
    const bookingsStr = await AsyncStorage.getItem('bookings')
    const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : []
    bookings.push(booking)
    await AsyncStorage.setItem('bookings', JSON.stringify(bookings))
  },

  deleteBooking: async (bookingId: string) => {
    const bookingsStr = await AsyncStorage.getItem('bookings')
    const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : []
    const updated = bookings.filter(b => b.id !== bookingId)
    await AsyncStorage.setItem('bookings', JSON.stringify(updated))
  },
}
