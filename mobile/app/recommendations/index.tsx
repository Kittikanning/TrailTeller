"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, Link } from "expo-router"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native"
import { MapPin, HotelIcon, Plane, CheckCircle2, Star, Clock, ArrowRight, Wallet } from "lucide-react-native"
import { generateRecommendations } from "@/lib/mock-ai"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

const BACKEND_URL = "http://192.168.1.7:3000"

interface Hotel {
  id: string
  name: string
  location: string
  rating: number
  image?: string
  amenities: string[]
  pricePerNight: number
}

interface Flight {
  id: string
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
}

interface Recommendation {
  hotels: Hotel[]
  outboundFlights: Flight[]
  returnFlights: Flight[]
  dailyActivities: any[]
  todoList: string[]
}

interface TravelPlan {
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: string
  budget: string
  preferences: string
  booking_id?: number
}

interface RecommendationPayload {
  user_id: number
  destination_id?: number
  trip_id: number
  budget: number
  recommend_type: "flight" | "hotel" | "activity" | "restaurant"
  item_id?: string | number
  item_name: string
  item_price: number
}

interface RecommendationResponse {
  success?: boolean
  message?: string
  data?: {
    recommendation_id: number
    trip_id: number
  }[]
  error?: string
}

export default function RecommendationsPage(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null)
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const planStr = await AsyncStorage.getItem("travelPlan")
        if (!planStr) {
          router.push("./plan")
          return
        }

        const plan = JSON.parse(planStr)
        setTravelPlan(plan)

        const recs = generateRecommendations(
          plan.origin,
          plan.destination,
          plan.startDate,
          plan.endDate,
          Number.parseInt(plan.travelers),
          Number.parseInt(plan.budget),
          plan.preferences
        )
        setRecommendations(recs)

        setSelectedHotel(recs.hotels[0])
        setSelectedOutboundFlight(recs.outboundFlights[0])
        setSelectedReturnFlight(recs.returnFlights[0])
      } catch (error) {
        console.error("Error loading data:", error)
        router.push("./plan")
      }
    }

    loadData()
  }, [router])

  if (isLoading || !recommendations || !travelPlan) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 16 }}>กำลังสร้างแผนการเดินทางด้วย AI...</Text>
      </View>
    )
  }

  if (!user) {
    router.push("./login")
    return null
  }

  const handleConfirm = async (): Promise<void> => {
    setIsConfirming(true)

    try {
      const nights = Math.ceil(
        (new Date(travelPlan.endDate).getTime() - new Date(travelPlan.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )

      console.log("📤 Preparing booking data...")

      // 1. เตรียมข้อมูล recommendations (เก็บไว้ส่วนท้ายทั้งหมด)
      const recommendationsData: RecommendationPayload[] = [
        {
          user_id: Number(user.id),
          trip_id: travelPlan.booking_id || Date.now(),
          budget: Number.parseInt(travelPlan.budget),
          recommend_type: "hotel",
          item_id: selectedHotel?.id,
          item_name: selectedHotel?.name || "Unknown Hotel",
          item_price: (selectedHotel?.pricePerNight || 0) * nights,
        },
        {
          user_id: Number(user.id),
          trip_id: travelPlan.booking_id || Date.now(),
          budget: Number.parseInt(travelPlan.budget),
          recommend_type: "flight",
          item_id: selectedOutboundFlight?.id,
          item_name: `${selectedOutboundFlight?.airline || "Unknown"} (Outbound)`,
          item_price: selectedOutboundFlight?.price || 0,
        },
        {
          user_id: Number(user.id),
          trip_id: travelPlan.booking_id || Date.now(),
          budget: Number.parseInt(travelPlan.budget),
          recommend_type: "flight",
          item_id: selectedReturnFlight?.id,
          item_name: `${selectedReturnFlight?.airline || "Unknown"} (Return)`,
          item_price: selectedReturnFlight?.price || 0,
        },
      ]

      // 2. บันทึกข้อมูลการจองลง AsyncStorage ก่อน (สำคัญที่สุด)
      const bookingData = {
        travelPlan,
        selectedHotel,
        selectedOutboundFlight,
        selectedReturnFlight,
        todoList: recommendations.todoList,
        dailyActivities: recommendations.dailyActivities,
        recommendationsData,
        totalAmount:
          (selectedHotel?.pricePerNight || 0) * nights +
          (selectedOutboundFlight?.price || 0) +
          (selectedReturnFlight?.price || 0),
      }

      await AsyncStorage.setItem("bookingData", JSON.stringify(bookingData))
      console.log("💾 Booking data saved to AsyncStorage")

      // 3. ลองส่ง recommendations ไป backend (ถ้ามี token)
      // แต่ไม่ต้องรอสำเร็จ
      const authToken = await AsyncStorage.getItem("authToken")
      if (authToken) {
        console.log("📮 Sending recommendations to backend...")
        fetch(`${BACKEND_URL}/recommends`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(recommendationsData),
        })
          .then((res) => {
            console.log("✅ Recommendations sent:", res.status)
          })
          .catch((err) => {
            console.warn("⚠️ Could not send recommendations:", err)
          })
      } else {
        console.log("⚠️ No token found - skipping recommendations API")
      }

      // 4. ไปหน้า payment ทันที (ไม่รอ backend)
      console.log("🚀 Navigating to payment...")
      setIsConfirming(false)
      router.push("./payment")
    } catch (error) {
      setIsConfirming(false)
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
      console.error("❌ Confirmation error:", error)
      Alert.alert("ข้อผิดพลาด", errorMessage, [
        {
          text: "ตกลง",
          onPress: () => {
            setIsConfirming(false)
          },
        },
      ])
    }
  }

  const nights = Math.ceil(
    (new Date(travelPlan.endDate).getTime() - new Date(travelPlan.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  const hotelTotal = (selectedHotel?.pricePerNight || 0) * nights
  const flightTotal = (selectedOutboundFlight?.price || 0) + (selectedReturnFlight?.price || 0)
  const totalAmount = hotelTotal + flightTotal
  const remainingBudget = Number.parseInt(travelPlan.budget) - totalAmount

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" asChild>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MapPin size={24} color="#3b82f6" />
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>TrailTeller</Text>
            </TouchableOpacity>
          </Link>

          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Link href="./profile" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: "#3b82f6" }}>โปรไฟล์</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={logout}
              style={{ paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 4 }}
            >
              <Text style={{ fontSize: 12 }}>ออก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        {/* Page Header */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>แผนการเดินทางของคุณ</Text>
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center" }}>
            {travelPlan.destination} • {new Date(travelPlan.startDate).toLocaleDateString("th-TH")} -{" "}
            {new Date(travelPlan.endDate).toLocaleDateString("th-TH")}
          </Text>
        </View>

        {/* Budget Overview Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#bfdbfe",
            paddingHorizontal: 14,
            paddingVertical: 14,
            marginBottom: 20,
            gap: 12,
          }}
        >
          <View style={{ gap: 10 }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <Wallet size={14} color="#6b7280" />
                <Text style={{ fontSize: 11, color: "#6b7280" }}>งบประมาณทั้งหมด</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>฿{Number.parseInt(travelPlan.budget).toLocaleString()}</Text>
            </View>

            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <HotelIcon size={14} color="#6b7280" />
                <Text style={{ fontSize: 11, color: "#6b7280" }}>โรงแรม ({nights} คืน)</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#3b82f6" }}>฿{hotelTotal.toLocaleString()}</Text>
            </View>

            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <Plane size={14} color="#6b7280" />
                <Text style={{ fontSize: 11, color: "#6b7280" }}>เที่ยวบิน</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#3b82f6" }}>฿{flightTotal.toLocaleString()}</Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

            <View>
              <Text style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>งบประมาณคงเหลือ</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: remainingBudget >= 0 ? "#16a34a" : "#dc2626" }}>
                ฿{remainingBudget.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Hotels Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <HotelIcon size={20} color="#3b82f6" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>โรงแรมแนะนำ</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {recommendations.hotels.map((hotel) => (
                <TouchableOpacity
                  key={hotel.id}
                  onPress={() => setSelectedHotel(hotel)}
                  style={{
                    width: 260,
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderWidth: selectedHotel?.id === hotel.id ? 2 : 1,
                    borderColor: selectedHotel?.id === hotel.id ? "#3b82f6" : "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: hotel.image || "https://via.placeholder.com/260x110" }}
                    style={{ width: "100%", height: 110 }}
                  />
                  <View style={{ paddingHorizontal: 10, paddingVertical: 10, gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: "bold" }}>{hotel.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <MapPin size={12} color="#6b7280" />
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{hotel.location}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <Text style={{ fontSize: 11, fontWeight: "600" }}>{hotel.rating}</Text>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                      {hotel.amenities.slice(0, 2).map((amenity) => (
                        <View key={amenity} style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 }}>
                          <Text style={{ fontSize: 9, color: "#6b7280" }}>{amenity}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#3b82f6" }}>
                      ฿{hotel.pricePerNight.toLocaleString()}
                      <Text style={{ fontSize: 9, fontWeight: "normal", color: "#6b7280" }}>/คืน</Text>
                    </Text>
                    {selectedHotel?.id === hotel.id && (
                      <View
                        style={{
                          backgroundColor: "#3b82f6",
                          paddingVertical: 5,
                          borderRadius: 4,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={12} color="white" />
                        <Text style={{ fontSize: 11, color: "white", fontWeight: "600" }}>เลือกแล้ว</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Outbound Flights Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Plane size={20} color="#3b82f6" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>เที่ยวบินขาไป</Text>
          </View>
          <View style={{ gap: 10 }}>
            {recommendations.outboundFlights.map((flight) => (
              <TouchableOpacity
                key={flight.id}
                onPress={() => setSelectedOutboundFlight(flight)}
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                  borderWidth: selectedOutboundFlight?.id === flight.id ? 2 : 1,
                  borderColor: selectedOutboundFlight?.id === flight.id ? "#3b82f6" : "#e5e7eb",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              >
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: "bold" }}>{flight.airline}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.flightNumber}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#3b82f6" }}>฿{flight.price.toLocaleString()}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>{flight.departureTime}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.departure}</Text>
                    </View>

                    <View style={{ alignItems: "center", gap: 3 }}>
                      <Clock size={12} color="#6b7280" />
                      <Text style={{ fontSize: 9, color: "#6b7280" }}>{flight.duration}</Text>
                      <ArrowRight size={12} color="#6b7280" />
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>{flight.arrivalTime}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.arrival}</Text>
                    </View>
                  </View>

                  {selectedOutboundFlight?.id === flight.id && (
                    <View
                      style={{
                        backgroundColor: "#3b82f6",
                        paddingVertical: 5,
                        borderRadius: 4,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <CheckCircle2 size={12} color="white" />
                      <Text style={{ fontSize: 11, color: "white", fontWeight: "600" }}>เลือกแล้ว</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Return Flights Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Plane size={20} color="#3b82f6" style={{ transform: [{ scaleX: -1 }] }} />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>เที่ยวบินขากลับ</Text>
          </View>
          <View style={{ gap: 10 }}>
            {recommendations.returnFlights.map((flight) => (
              <TouchableOpacity
                key={flight.id}
                onPress={() => setSelectedReturnFlight(flight)}
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                  borderWidth: selectedReturnFlight?.id === flight.id ? 2 : 1,
                  borderColor: selectedReturnFlight?.id === flight.id ? "#3b82f6" : "#e5e7eb",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              >
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: "bold" }}>{flight.airline}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.flightNumber}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#3b82f6" }}>฿{flight.price.toLocaleString()}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>{flight.departureTime}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.departure}</Text>
                    </View>

                    <View style={{ alignItems: "center", gap: 3 }}>
                      <Clock size={12} color="#6b7280" />
                      <Text style={{ fontSize: 9, color: "#6b7280" }}>{flight.duration}</Text>
                      <ArrowRight size={12} color="#6b7280" />
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>{flight.arrivalTime}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{flight.arrival}</Text>
                    </View>
                  </View>

                  {selectedReturnFlight?.id === flight.id && (
                    <View
                      style={{
                        backgroundColor: "#3b82f6",
                        paddingVertical: 5,
                        borderRadius: 4,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <CheckCircle2 size={12} color="white" />
                      <Text style={{ fontSize: 11, color: "white", fontWeight: "600" }}>เลือกแล้ว</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Activities Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <CheckCircle2 size={20} color="#3b82f6" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>กิจกรรมแต่ละวัน</Text>
          </View>
          <View style={{ gap: 10 }}>
            {recommendations.dailyActivities.map((day) => (
              <View key={day.day} style={{ backgroundColor: "white", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 10, paddingVertical: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#3b82f6", marginBottom: 6 }}>
                  วันที่ {day.day} - {day.date}
                </Text>
                <View style={{ gap: 5 }}>
                  {day.activities.map((activity: string, index: number) => (
                    <View key={index} style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}>
                      <CheckCircle2 size={14} color="#3b82f6" style={{ marginTop: 1 }} />
                      <Text style={{ fontSize: 12, color: "#374151", flex: 1 }}>{activity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Todo List Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <CheckCircle2 size={20} color="#3b82f6" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>สรุปกิจกรรมแนะนำ</Text>
          </View>
          <View style={{ backgroundColor: "white", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 10, paddingVertical: 10, gap: 6 }}>
            {recommendations.todoList.map((item, index) => (
              <View key={index} style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}>
                <CheckCircle2 size={14} color="#3b82f6" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 12, color: "#374151", flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary and Confirm */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#bfdbfe",
            paddingHorizontal: 14,
            paddingVertical: 14,
            marginBottom: 24,
          }}
        >
          <View style={{ marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>ราคารวมทั้งหมด</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6" }}>฿{totalAmount.toLocaleString()}</Text>
              {remainingBudget < 0 && (
                <Text style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>
                  เกินงบประมาณ ฿{Math.abs(remainingBudget).toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isConfirming}
            activeOpacity={isConfirming ? 1 : 0.7}
            style={{
              backgroundColor: isConfirming ? "#9ca3af" : "#3b82f6",
              paddingVertical: 14,
              borderRadius: 6,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              opacity: isConfirming ? 0.7 : 1,
            }}
          >
            {isConfirming ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>กำลังดำเนินการ...</Text>
              </>
            ) : (
              <>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>ยืนยันและชำระเงิน</Text>
                <ArrowRight size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}