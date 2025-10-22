import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_ENDPOINTS } from "../config/api"

export default function ProfileScreen({ onBack, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    trips: 0,
    countries: 0,
    days: 0,
  })

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      
      if (!token) {
        Alert.alert("Error", "No authentication token found")
        return
      }

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile")
      }

      // Set user data
      if (data.user) {
        setUserData(data.user)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))
      }

      // Set stats
      if (data.stats) {
        setStats({
          trips: data.stats.trips || 0,
          countries: data.stats.countries || 0,
          days: data.stats.days || 0,
        })
      }
    } catch (error) {
      console.error("Fetch profile error:", error)
      Alert.alert("Error", error.message || "Failed to load profile")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load local data on mount
  const loadLocalData = async () => {
    try {
      const localUserData = await AsyncStorage.getItem("userData")
      if (localUserData) {
        setUserData(JSON.parse(localUserData))
      }
    } catch (error) {
      console.error("Error loading local data:", error)
    }
  }

  useEffect(() => {
    loadLocalData()
    fetchUserProfile()
  }, [])

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true)
    fetchUserProfile()
  }

  // Handle logout
  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken")

            // Call logout API
            if (token) {
              await fetch("https://your-api.com/api/logout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }).catch(err => console.error("Logout API error:", err))
            }

            // Clear local storage
            await AsyncStorage.removeItem("authToken")
            await AsyncStorage.removeItem("userData")
            await AsyncStorage.removeItem("userEmail")

            onLogout()
          } catch (error) {
            Alert.alert("Error", "Failed to sign out")
            console.error("Logout error:", error)
          }
        },
        style: "destructive",
      },
    ])
  }

  // Handle edit profile navigation
  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Navigate to edit profile screen")
  }

  // Handle travel preferences navigation
  const handleTravelPreferences = () => {
    Alert.alert("Travel Preferences", "Navigate to travel preferences screen")
  }

  // Handle notifications navigation
  const handleNotifications = () => {
    Alert.alert("Notifications", "Navigate to notifications settings")
  }

  // Handle payment methods navigation
  const handlePaymentMethods = () => {
    Alert.alert("Payment Methods", "Navigate to payment methods screen")
  }

  // Handle app settings navigation
  const handleAppSettings = () => {
    Alert.alert("App Settings", "Navigate to app settings")
  }

  // Handle help center navigation
  const handleHelpCenter = () => {
    Alert.alert("Help Center", "Navigate to help center")
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    )
  }

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(n => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name || "User"}</Text>
            <Text style={styles.userEmail}>{userData?.email || "email@example.com"}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.trips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueAccent}>{stats.countries}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.days}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Edit Profile</Text>
                <Text style={styles.menuSubtitle}>Update your information</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleTravelPreferences}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>📍</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Travel Preferences</Text>
                <Text style={styles.menuSubtitle}>Set your travel style</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>🔔</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Manage alerts</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handlePaymentMethods}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>💳</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Payment Methods</Text>
                <Text style={styles.menuSubtitle}>Manage cards</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleAppSettings}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>⚙️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>App Settings</Text>
                <Text style={styles.menuSubtitle}>Customize your experience</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={handleHelpCenter}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>❓</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help Center</Text>
                <Text style={styles.menuSubtitle}>FAQs and support</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 64,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  backArrow: {
    fontSize: 20,
    color: "#fff",
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: -32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statValueAccent: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconPrimary: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  menuIconAccent: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  iconText: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#ccc",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
  },
})