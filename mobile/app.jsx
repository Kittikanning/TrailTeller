import React, { useState } from "react";
import { View, Text } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login"); // login | register | home

  const handleLogin = () => {
    console.log("Login successful!");
    setCurrentScreen("home");
  };

  const handleRegister = () => {
    console.log("Register successful!");
    setCurrentScreen("home");
  };

  const handleLogout = () => {
    setCurrentScreen("login");
  };

  if (currentScreen === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentScreen("register")}
      />
    );
  }

  if (currentScreen === "register") {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onNavigateToLogin={() => setCurrentScreen("login")}
      />
    );
  }

  if (currentScreen === "home") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Home / Planner Screen</Text>
        <Text onPress={handleLogout} style={{ marginTop: 20, color: "blue" }}>Logout</Text>
      </View>
    );
  }

  return null;
}
