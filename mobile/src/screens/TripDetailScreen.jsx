import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native"

const activities = [
  {
    day: 1,
    items: [
      { id: 1, time: "9:00 AM", title: "Pearl Harbor Tour", location: "Pearl Harbor", cost: 150, completed: false },
      { id: 2, time: "2:00 PM", title: "Waikiki Beach", location: "Waikiki", cost: 0, completed: false },
      { id: 3, time: "7:00 PM", title: "Dinner at Duke's", location: "Waikiki", cost: 200, completed: false },
    ],
  },
  {
    day: 2,
    items: [
      { id: 4, time: "10:00 AM", title: "Snorkeling Adventure", location: "Hanauma Bay", cost: 250, completed: false },
      { id: 5, time: "3:00 PM", title: "Diamond Head Hike", location: "Diamond Head", cost: 50, completed: false },
    ],
  },
  {
    day: 3,
    items: [
      { id: 6, time: "8:00 AM", title: "Sunrise at Lanikai Beach", location: "Lanikai", cost: 0, completed: false },
      { id: 7, time: "12:00 PM", title: "Lunch at Local Market", location: "Honolulu", cost: 150, completed: false },
    ],
  },
  {
    day: 4,
    items: [],
  },
]

export default function TripDetailsScreen({ onBack }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [showBudget, setShowBudget] = useState(false)
  const [checkedItems, setCheckedItems] = useState([])

  const currentDayActivities = activities.find((a) => a.day === selectedDay)?.items || []
  const totalCost = activities.reduce((sum, day) => sum + day.items.reduce((daySum, item) => daySum + item.cost, 0), 0)

  const handleCheckItem = (id) => {
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

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
            <Text style={styles.headerTitle}>Honolulu Trip</Text>
            <Text style={styles.headerSubtitle}>Jun 11 - 16, 2023</Text>
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
                <Text style={styles.budgetValue}>฿1,200</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Hotels</Text>
                <Text style={styles.budgetValue}>฿1,250</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Activities</Text>
                <Text style={styles.budgetValue}>฿{totalCost}</Text>
              </View>
              <View style={styles.budgetTotal}>
                <Text style={styles.budgetTotalLabel}>Total Cost</Text>
                <Text style={styles.budgetTotalValue}>฿{1200 + 1250 + totalCost}</Text>
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
          {[1, 2, 3, 4].map((day) => (
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
          <TouchableOpacity style={styles.addButton}>
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
                    style={styles.checkbox}
                  >
                    {checkedItems.includes(activity.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.activityDetails}>
                    <View style={styles.activityHeader}>
                      <Text
                        style={[
                          styles.activityTitle,
                          checkedItems.includes(activity.id) && styles.activityTitleCompleted
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
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonIcon}>📅</Text>
          <Text style={styles.nextButtonText}>Next Day</Text>
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