import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import TripsListScreen from '../src/screens/TripListScreen';
import PlannerScreen from '../src/screens/PlannerScreen';
import TripDetailsScreen from '../src/screens/TripDetailScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('login');

  const handleLogin = (userData?: any) => {
    // ถ้ามี userData ใช้ userData ถ้าไม่มีใช้ dummy
    const newUser = userData || { email: 'user@example.com', name: 'Guest User' };
    setUser(newUser);
    setCurrentScreen('tripsList');
    console.log('Login successful:', newUser);
  };

  const handleRegister = (userData?: any) => {
    // ถ้ามี userData ใช้ userData ถ้าไม่มีใช้ dummy
    const newUser = userData || { email: 'user@example.com', name: 'New User' };
    setUser(newUser);
    setCurrentScreen('tripsList');
    Alert.alert('Success', 'Account created successfully!');
    console.log('Registration successful:', newUser);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            setUser(null);
            setCurrentScreen('login');
            console.log('User logged out');
          },
          style: 'destructive'
        }
      ]
    );
  };

  // ========== Authentication Screens ==========
  
  // หน้า Register
  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentScreen('login')} loading={undefined}      />
    );
  }

  // หน้า Login
  if (!user || currentScreen === 'login') {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  // ========== Main App Screens (หลัง login) ==========

  // หน้า Profile
  if (currentScreen === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setCurrentScreen('tripsList')}
        onLogout={handleLogout}
      />
    );
  }

  // หน้า Trip Details
  if (currentScreen === 'tripDetails') {
    return (
      <TripDetailsScreen
        onBack={() => setCurrentScreen('tripsList')}
      />
    );
  }

  // หน้า Planner
  if (currentScreen === 'planner') {
    return (
      <PlannerScreen
        onBack={() => setCurrentScreen('tripsList')}
        onNavigateToTripDetails={() => setCurrentScreen('tripDetails')}
      />
    );
  }

  // หน้า Trips List (หน้าหลัก)
  return (
    <TripsListScreen
      onNavigateToPlanner={() => setCurrentScreen('planner')}
      onNavigateToTripDetails={() => setCurrentScreen('tripDetails')}
      onNavigateToProfile={() => setCurrentScreen('profile')}
    />
  );
}