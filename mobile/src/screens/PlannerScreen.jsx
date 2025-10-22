import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform, Alert } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function PlannerScreen({ onBack, onNavigateToTripDetails }) {
  const [step, setStep] = useState("setup")
  const [budget, setBudget] = useState("3000")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [travelers, setTravelers] = useState("2")
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [tripData, setTripData] = useState(null)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!destination.trim()) {
      newErrors.destination = "Destination is required"
    }
    
    if (!budget || parseInt(budget) <= 0) {
      newErrors.budget = "Budget must be greater than 0"
    }
    
    if (endDate < startDate) {
      newErrors.dates = "End date must be after start date"
    }
    
    if (parseInt(travelers) < 1) {
      newErrors.travelers = "At least 1 traveler is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validateForm()) {
      return
    }
    
    setStep("generating")
    
    try {
      const token = await AsyncStorage.getItem("authToken")
      
      if (!token) {
        Alert.alert("Error", "Please login first")
        setStep("setup")
        return
      }

      const payload = {
        destination: destination.trim(),
        budget: parseInt(budget),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        travelers: parseInt(travelers),
      }

      const response = await fetch("https://your-api.com/api/trips/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate trip")
      }

      // Save trip data
      if (data.trip) {
        setTripData(data.trip)
        await AsyncStorage.setItem("currentTrip", JSON.stringify(data.trip))
      }

      // Simulate AI generation time
      setTimeout(() => {
        setStep("preview")
      }, 2000)
    } catch (error) {
      console.error("Generate trip error:", error)
      Alert.alert("Error", error.message || "Failed to generate trip")
      setStep("setup")
    }
  }

  const handleConfirm = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      
      if (!token || !tripData) {
        Alert.alert("Error", "Trip data missing")
        return
      }

      const response = await fetch("https://your-api.com/api/trips/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: tripData.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm trip")
      }

      // Save confirmed trip
      await AsyncStorage.setItem("currentTrip", JSON.stringify(data.trip))
      
      onNavigateToTripDetails()
    } catch (error) {
      console.error("Confirm trip error:", error)
      Alert.alert("Error", error.message || "Failed to confirm trip")
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setStartDate(selectedDate)
      if (selectedDate > endDate) {
        setEndDate(selectedDate)
      }
      if (errors.dates) {
        setErrors({ ...errors, dates: "" })
      }
    }
  }

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setEndDate(selectedDate)
      if (errors.dates) {
        setErrors({ ...errors, dates: "" })
      }
    }
  }

  const calculateDuration = () => {
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalCost = () => {
    if (!tripData) return budget
    return tripData.totalCost || budget
  }

  // Generating Screen
  if (step === "generating") {
    return (
      <View style={styles.generatingContainer}>
        <View style={styles.generatingContent}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingIcon}>✨</Text>
          </View>
          <View style={styles.generatingTextContainer}>
            <Text style={styles.generatingTitle}>Creating Your Perfect Trip</Text>
            <Text style={styles.generatingSubtitle}>
              AI is analyzing destinations, flights, and activities...
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Preview Screen
  if (step === "preview") {
    const flights = tripData?.flights || [{
      route: `Bangkok → ${destination}`,
      airline: "Thai Airways",
      duration: "11h 30m",
      price: 1200
    }]

    const accommodation = tripData?.accommodation || {
      name: "Beachfront Hotel",
      rating: 4,
      nights: calculateDuration(),
      price: 1250
    }

    const activities = tripData?.activities || [
      { name: "City Tour", day: 1, time: "9:00 AM", price: 150 },
      { name: "Beach Adventure", day: 2, time: "10:00 AM", price: 250 }
    ]

    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backTextWhite}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Your Trip Preview</Text>
          <Text style={styles.previewSubtitle}>{destination}</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.previewContent}>
          <View style={styles.card}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{calculateDuration()} Days</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Travelers</Text>
                <Text style={styles.summaryValue}>{travelers} People</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Budget</Text>
                <Text style={styles.summaryValueAccent}>฿{budget}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Cost</Text>
                <Text style={styles.summaryValuePrimary}>฿{calculateTotalCost()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>✈️</Text>
              <Text style={styles.cardTitle}>Flights</Text>
            </View>
            {flights.map((flight, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemTitle}>{flight.route}</Text>
                  <Text style={styles.itemSubtitle}>{flight.airline} • {flight.duration}</Text>
                </View>
                <Text style={styles.itemPrice}>฿{flight.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏨</Text>
              <Text style={styles.cardTitle}>Accommodation</Text>
            </View>
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{accommodation.name}</Text>
                <Text style={styles.itemSubtitle}>{'⭐'.repeat(accommodation.rating)} • {accommodation.nights} nights</Text>
              </View>
              <Text style={styles.itemPrice}>฿{accommodation.price}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🎯</Text>
              <Text style={styles.cardTitle}>Activities</Text>
            </View>
            <View style={styles.activitiesList}>
              {activities.map((activity, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemTitle}>{activity.name}</Text>
                    <Text style={styles.itemSubtitle}>Day {activity.day} • {activity.time}</Text>
                  </View>
                  <Text style={styles.itemPrice}>฿{activity.price}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.fixedBottom}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm & View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Setup Screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backTextWhite}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Your Trip</Text>
        <Text style={styles.headerSubtitle}>Let AI create your perfect itinerary</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Destination */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>🌍</Text>
              <Text style={styles.label}>Where do you want to go?</Text>
            </View>
            <TextInput
              style={[styles.input, errors.destination && styles.inputError]}
              placeholder="e.g., Tokyo, Paris, New York"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={(text) => {
                setDestination(text)
                if (errors.destination) setErrors({ ...errors, destination: "" })
              }}
            />
            {errors.destination && <Text style={styles.errorText}>{errors.destination}</Text>}
          </View>

          {/* Dates */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>📅</Text>
              <Text style={styles.label}>When are you traveling?</Text>
            </View>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
                  <Text style={styles.calendarIcon}>📆</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
                  <Text style={styles.calendarIcon}>📆</Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
          </View>

          {/* Budget */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>💰</Text>
              <Text style={styles.label}>What s your budget?</Text>
            </View>
            <View style={[styles.budgetInputContainer, errors.budget && styles.inputError]}>
              <Text style={styles.currencySymbol}>฿</Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="3000"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={budget}
                onChangeText={(text) => {
                  setBudget(text)
                  if (errors.budget) setErrors({ ...errors, budget: "" })
                }}
              />
            </View>
            {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
            <View style={styles.budgetSuggestions}>
              {['2000', '3000', '5000', '10000'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.budgetChip,
                    budget === amount && styles.budgetChipActive
                  ]}
                  onPress={() => {
                    setBudget(amount)
                    if (errors.budget) setErrors({ ...errors, budget: "" })
                  }}
                >
                  <Text style={[
                    styles.budgetChipText,
                    budget === amount && styles.budgetChipTextActive
                  ]}>
                    ฿{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Travelers */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>👥</Text>
              <Text style={styles.label}>How many travelers?</Text>
            </View>
            <View style={styles.travelerCounter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => {
                  const newVal = Math.max(1, parseInt(travelers || "1") - 1).toString()
                  setTravelers(newVal)
                  if (errors.travelers) setErrors({ ...errors, travelers: "" })
                }}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.counterDisplay}>
                <Text style={styles.counterValue}>{travelers}</Text>
                <Text style={styles.counterLabel}>Travelers</Text>
              </View>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => {
                  const newVal = (parseInt(travelers || "1") + 1).toString()
                  setTravelers(newVal)
                  if (errors.travelers) setErrors({ ...errors, travelers: "" })
                }}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            {errors.travelers && <Text style={styles.errorText}>{errors.travelers}</Text>}
          </View>
        </View>

        {/* AI Info Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconContainer}>
              <Text style={styles.aiIcon}>✨</Text>
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI-Powered Planning</Text>
              <Text style={styles.aiSubtitle}>
                Our AI will find the best flights, hotels, and activities within your budget
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}

      {/* Fixed Bottom Button */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!destination || !budget) && styles.generateButtonDisabled
          ]}
          onPress={handleGenerate}
          disabled={!destination || !budget}
        >
          <Text style={styles.generateButtonIcon}>✨</Text>
          <Text style={styles.generateButtonText}>Generate My Trip</Text>
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
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  previewHeader: {
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
  backTextWhite: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  previewContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  labelIcon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  input: {
    height: 52,
    backgroundColor: "#f8f9fa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  dateButton: {
    height: 52,
    backgroundColor: "#f8f9fa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  calendarIcon: {
    fontSize: 18,
  },
  budgetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#f8f9fa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  budgetSuggestions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  budgetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  budgetChipActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  budgetChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  budgetChipTextActive: {
    color: "#fff",
  },
  travelerCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
  },
  counterButton: {
    width: 44,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  counterDisplay: {
    alignItems: "center",
  },
  counterValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  counterLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: "#f0f7ff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#d0e7ff",
  },
  aiCardContent: {
    flexDirection: "row",
    gap: 14,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiIcon: {
    fontSize: 22,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  aiSubtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryItem: {
    width: "50%",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  summaryValueAccent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  summaryValuePrimary: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  activitiesList: {
    gap: 12,
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButton: {
    height: 56,
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  generateButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  confirmButton: {
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  generatingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  generatingContent: {
    alignItems: "center",
  },
  loadingIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingIcon: {
    fontSize: 48,
    position: "absolute",
  },
  generatingTextContainer: {
    alignItems: "center",
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})