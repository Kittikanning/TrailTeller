import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function TripDetailsScreen({ onBack }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [showBudget, setShowBudget] = useState(false)
  const [checkedItems, setCheckedItems] = useState([])
  const [tripData, setTripData] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Fetch trip details
  useEffect(() => {
    fetchTripDetails()
  }, [])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("authToken")
      const currentTrip = await AsyncStorage.getItem("currentTrip")

      if (!token || !currentTrip) {
        Alert.alert("Error", "Trip data not found")
        return
      }

      const trip = JSON.parse(currentTrip)
      const response = await fetch(`https://your-api.com/api/trips/${trip.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch trip details")
      }

      setTripData(data.trip)
      setActivities(data.trip.activities || [])
      
      // Set checked items from API
      const checkedIds = data.trip.activities
        ?.filter(activity => activity.completed)
        .map(activity => activity.id) || []
      setCheckedItems(checkedIds)
    } catch (error) {
      console.error("Fetch trip details error:", error)
      Alert.alert("Error", error.message || "Failed to load trip details")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckItem = async (id) => {
    try {
      setUpdating(true)
      const token = await AsyncStorage.getItem("authToken")
      const currentTrip = await AsyncStorage.getItem("currentTrip")

      if (!token || !currentTrip) {
        Alert.alert("Error", "Session expired")
        return
      }

      const trip = JSON.parse(currentTrip)
      const isCompleting = !checkedItems.includes(id)

      const response = await fetch(`https://your-api.com/api/trips/${trip.id}/activities/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: isCompleting,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update activity")
      }

      // Update local state
      setCheckedItems((prev) => 
        isCompleting 
          ? [...prev, id] 
          : prev.filter((i) => i !== id)
      )

      // Update activities with new completed status
      setActivities((prev) =>
        prev.map((day) => ({
          ...day,
          items: day.items.map((item) =>
            item.id === id ? { ...item, completed: isCompleting } : item
          ),
        }))
      )
    } catch (error) {
      console.error("Toggle activity error:", error)
      Alert.alert("Error", error.message || "Failed to update activity")
    } finally {
      setUpdating(false)
    }
  }

  const handleAddActivity = () => {
    Alert.prompt("Add Activity", "Enter activity name:", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Add",
        onPress: (title) => addActivity(title),
      },
    ])
  }

  const addActivity = async (title) => {
    if (!title.trim()) return

    try {
      setUpdating(true)
      const token = await AsyncStorage.getItem("authToken")
      const currentTrip = await AsyncStorage.getItem("currentTrip")

      if (!token || !currentTrip) {
        Alert.alert("Error", "Session expired")
        return
      }

      const trip = JSON.parse(currentTrip)
      const response = await fetch(`https://your-api.com/api/trips/${trip.id}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          day: selectedDay,
          time: "9:00 AM",
          location: "",
          cost: 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add activity")
      }

      // Refresh activities
      setActivities((prev) => [
        ...prev,
        {
          day: selectedDay,
          items: [data.activity],
        },
      ])

      Alert.alert("Success", "Activity added successfully")
    } catch (error) {
      console.error("Add activity error:", error)
      Alert.alert("Error", error.message || "Failed to add activity")
    } finally {
      setUpdating(false)
    }
  }

  const currentDayActivities = activities.find((a) => a.day === selectedDay)?.items || []
  
  const totalCost = activities.reduce((sum, day) => 
    sum + day.items.reduce((daySum, item) => daySum + item.cost, 0), 0
  )

  const getTotalBudget = () => {
    if (!tripData) return 0
    return (tripData.flights?.price || 0) + (tripData.accommodation?.price || 0) + totalCost
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
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </View>
    )
  }

  const tripTitle = tripData?.destination || "Trip"
  const tripDates = tripData?.dateRange || "Dates"
  const totalDays = tripData?.totalDays || 4

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{tripTitle} Trip</Text>
            <Text style={styles.headerSubtitle}>{tripDates}</Text>
          </View>
          <TouchableOpacity style={styles.budgetButton} onPress={() => setShowBudget(true)}>
            <Text style={styles.budgetIcon}>💰</Text>
            <Text style={styles.budgetText}>Budget</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Budget Modal */}
      <Modal
        visible={showBudget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBudget(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Budget Summary</Text>
              <TouchableOpacity onPress={() => setShowBudget(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.budgetList}>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Flights</Text>
                <Text style={styles.budgetValue}>฿{tripData?.flights?.price || 0}</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Hotels</Text>
                <Text style={styles.budgetValue}>฿{tripData?.accommodation?.price || 0}</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Activities</Text>
                <Text style={styles.budgetValue}>฿{totalCost}</Text>
              </View>
              <View style={styles.budgetTotal}>
                <Text style={styles.budgetTotalLabel}>Total Cost</Text>
                <Text style={styles.budgetTotalValue}>฿{getTotalBudget()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowBudget(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Day Selector */}
      <View style={styles.daySelectorContainer}>
        <View style={styles.daySelector}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                selectedDay === day ? styles.dayButtonActive : styles.dayButtonInactive
              ]}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === day ? styles.dayButtonTextActive : styles.dayButtonTextInactive
                ]}
              >
                Day {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activities List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>Plan Activities</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddActivity}
            disabled={updating}
          >
            <Text style={styles.addIcon}>➕</Text>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesList}>
          {currentDayActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No activities planned for this day</Text>
            </View>
          ) : (
            currentDayActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <TouchableOpacity
                    onPress={() => handleCheckItem(activity.id)}
                    disabled={updating}
                    style={styles.checkbox}
                  >
                    {(checkedItems.includes(activity.id) || activity.completed) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.activityDetails}>
                    <View style={styles.activityHeader}>
                      <Text
                        style={[
                          styles.activityTitle,
                          (checkedItems.includes(activity.id) || activity.completed) && styles.activityTitleCompleted
                        ]}
                      >
                        {activity.title}
                      </Text>
                      {activity.cost > 0 && (
                        <Text style={styles.activityCost}>฿{activity.cost}</Text>
                      )}
                    </View>

                    <View style={styles.activityMeta}>
                      <View style={styles.activityMetaItem}>
                        <Text style={styles.activityMetaIcon}>🕐</Text>
                        <Text style={styles.activityMetaText}>{activity.time}</Text>
                      </View>
                      <View style={styles.activityMetaItem}>
                        <Text style={styles.activityMetaIcon}>📍</Text>
                        <Text style={styles.activityMetaText}>{activity.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity 
          style={styles.nextButton}
          disabled={selectedDay >= totalDays}
          onPress={() => setSelectedDay(selectedDay + 1)}
        >
          <Text style={styles.nextButtonIcon}>📅</Text>
          <Text style={styles.nextButtonText}>
            {selectedDay >= totalDays ? "Trip Complete" : "Next Day"}
          </Text>
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
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  budgetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  budgetIcon: {
    fontSize: 16,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  modalClose: {
    fontSize: 24,
    color: "#666",
  },
  budgetList: {
    marginBottom: 24,
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  budgetLabel: {
    fontSize: 16,
    color: "#666",
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  budgetTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  budgetTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  budgetTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  closeButton: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  daySelectorContainer: {
    paddingHorizontal: 24,
    marginTop: -16,
    marginBottom: 24,
  },
  daySelector: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayButtonInactive: {
    backgroundColor: "transparent",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  dayButtonTextInactive: {
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  addIcon: {
    fontSize: 14,
  },
  addText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  activitiesList: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flexDirection: "row",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  activityDetails: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  activityTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  activityCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  activityMeta: {
    flexDirection: "row",
    gap: 16,
  },
  activityMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityMetaIcon: {
    fontSize: 14,
  },
  activityMetaText: {
    fontSize: 14,
    color: "#666",
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  nextButton: {
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonIcon: {
    fontSize: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})