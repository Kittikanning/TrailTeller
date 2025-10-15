import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native"

export default function ProfileScreen({ onBack, onLogout }) {
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
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@example.com</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueAccent}>8</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Edit Profile</Text>
                <Text style={styles.menuSubtitle}>Update your information</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>📍</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Travel Preferences</Text>
                <Text style={styles.menuSubtitle}>Set your travel style</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>🔔</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Manage alerts</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>💳</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Payment Methods</Text>
                <Text style={styles.menuSubtitle}>Manage cards</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                <Text style={styles.iconText}>⚙️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>App Settings</Text>
                <Text style={styles.menuSubtitle}>Customize your experience</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconAccent]}>
                <Text style={styles.iconText}>❓</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help Center</Text>
                <Text style={styles.menuSubtitle}>FAQs and support</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
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