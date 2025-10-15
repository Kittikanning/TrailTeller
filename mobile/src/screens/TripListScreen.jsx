import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native"

const mockTrips = [
  {
    id: 1,
    destination: "Honolulu, Hawaii",
    dates: "Jun 11 - 16, 2023",
    budget: "฿3,000",
    image: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800",
    status: "Upcoming",
  },
  {
    id: 2,
    destination: "Tokyo, Japan",
    dates: "Aug 5 - 12, 2023",
    budget: "฿5,500",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    status: "Planning",
  },
  {
    id: 3,
    destination: "Paris, France",
    dates: "Oct 20 - 27, 2023",
    budget: "฿6,200",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    status: "Planning",
  },
]

export default function TripsListScreen({
  onNavigateToPlanner,
  onNavigateToTripDetails,
  onNavigateToProfile,
}) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Trips</Text>
            <Text style={styles.headerSubtitle}>Plan your next adventure</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onNavigateToProfile}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueAccent}>2</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Trips List */}
        <View style={styles.tripsList}>
          {mockTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={onNavigateToTripDetails}
              activeOpacity={0.7}
            >
              <View style={styles.tripImageContainer}>
                <Image
                  source={{ uri: trip.image }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
              </View>

              <View style={styles.tripInfo}>
                <Text style={styles.tripDestination}>{trip.destination}</Text>

                <View style={styles.tripDetails}>
                  <View style={styles.tripDetailRow}>
                    <Text style={styles.tripDetailIcon}>📅</Text>
                    <Text style={styles.tripDetailText}>{trip.dates}</Text>
                  </View>

                  <View style={styles.tripDetailRow}>
                    <Text style={styles.tripDetailIcon}>💰</Text>
                    <Text style={styles.tripDetailText}>Budget: {trip.budget}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={onNavigateToPlanner}>
          <Text style={styles.fabIcon}>➕</Text>
          <Text style={styles.fabText}>Plan New Trip</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 20,
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
    padding: 16,
    marginTop: -16,
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
  tripsList: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  tripImageContainer: {
    position: "relative",
    height: 160,
  },
  tripImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  tripInfo: {
    padding: 16,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  tripDetails: {
    gap: 8,
  },
  tripDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripDetailIcon: {
    fontSize: 16,
  },
  tripDetailText: {
    fontSize: 14,
    color: "#666",
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  fab: {
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
  },
  fabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})