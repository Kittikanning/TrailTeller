"use client"

import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, Link } from "expo-router"
import { MapPin, Calendar, Users, Wallet, Sparkles } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BACKEND_URL = "http://192.168.1.7:3000"

interface FormData {
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: string
  budget: string
  preferences: string
}

interface LabelWithIconProps {
  icon: React.ReactNode
  label: string
}

interface BookingResponse {
  success?: boolean
  message?: string
  data?: {
    booking_id: number
    trip_id: number
    status: string
  }
  error?: string
  booking_id?: number
}

const LabelWithIcon: React.FC<LabelWithIconProps> = ({ icon, label }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    {icon}
    <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>{label}</Text>
  </View>
)

export default function PlanPage(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "1",
    budget: "",
    preferences: "",
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Redirect ไปหน้า login ถ้า user ไม่มี
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("./login")
    }
  }, [user, isLoading])

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  const validateForm = (): boolean => {
    if (!formData.origin.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจุดเริ่มต้น")
      return false
    }
    if (!formData.destination.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจุดหมายปลายทาง")
      return false
    }
    if (!formData.startDate.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกวันที่เริ่มต้น")
      return false
    }
    if (!formData.endDate.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกวันที่สิ้นสุด")
      return false
    }
    if (!formData.budget.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกงบประมาณ")
      return false
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (startDate >= endDate) {
      Alert.alert("ข้อผิดพลาด", "วันที่สิ้นสุดต้องหลังจากวันที่เริ่มต้น")
      return false
    }

    return true
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get auth token - make it optional
      const authToken = await AsyncStorage.getItem("authToken")
      
      console.log("Auth token found:", authToken ? "Yes" : "No")
      console.log("Creating booking with data:", formData)

      // Call booking API
      const response = await fetch(`${BACKEND_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }), // Add token if exists
        },
        body: JSON.stringify({
          user_id: user.id,
          trip_id: Date.now(), // Generate unique trip ID
          service_type: "flight", // Could be flight, hotel, activity
          origin: formData.origin.trim(),
          destination: formData.destination.trim(),
          service_start: formData.startDate,
          service_end: formData.endDate,
          travelers: parseInt(formData.travelers) || 1,
          budget: parseInt(formData.budget) || 0,
          preferences: formData.preferences.trim(),
          status: "pending",
          payment_method: null,
        }),
      })

      console.log("Booking response status:", response.status)

      let data: BookingResponse
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("ไม่สามารถแปลง response จาก server")
      }

      console.log("Booking response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server error: ${response.status}`
        console.warn("⚠️ Booking API error (non-critical):", errorMsg)
        // Continue anyway - save locally and navigate
      }

      const bookingId = data?.booking_id || data?.data?.booking_id || Date.now().toString()
      console.log("Booking ID:", bookingId)

      // Save travel plan locally
      const travelPlanData = {
        ...formData,
        booking_id: bookingId,
      }
      await AsyncStorage.setItem("travelPlan", JSON.stringify(travelPlanData))
      console.log("✅ Travel plan saved to AsyncStorage")
      console.log("Saved data:", travelPlanData)

      // Navigate immediately
      console.log("🚀 Navigating to recommendations...")
      setIsSubmitting(false)
      
      // Navigate ไปหน้า recommendations
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log("Navigation triggered")
      router.replace("./recommendations")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      console.error("Booking error:", err)
      Alert.alert("ข้อผิดพลาด", errorMessage, [
        {
          text: "ตกลง",
          onPress: () => {
            setIsSubmitting(false)
          },
        },
      ])
    }
  }

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
            <Text style={{ fontSize: 12, color: "#6b7280" }}>สวัสดี, {user.name}</Text>
            <Link href="./profile" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: "#3b82f6" }}>โปรไฟล์</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={logout}
              style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 4 }}
            >
              <Text style={{ fontSize: 12 }}>ออก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 48 }}>
        {/* Page Header */}
        <View style={{ marginBottom: 32, alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>วางแผนการเดินทางของคุณ</Text>
          <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center", lineHeight: 24 }}>
            บอกเราเกี่ยวกับการเดินทางที่คุณฝันถึง แล้วให้ AI ช่วยสร้างแผนที่สมบูรณ์แบบ
          </Text>
        </View>

        {/* Card */}
        <View style={{ backgroundColor: "white", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" }}>
          {/* Card Header */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Sparkles size={18} color="#3b82f6" />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>รายละเอียดการเดินทาง</Text>
            </View>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>กรอกข้อมูลเพื่อให้เราแนะนำแผนการเดินทางที่เหมาะกับคุณ</Text>
          </View>

          {/* Card Content */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 20, gap: 20 }}>
            {/* Origin */}
            <View style={{ gap: 8 }}>
              <LabelWithIcon icon={<MapPin size={14} color="#374151" />} label="จุดเริ่มต้น" />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                }}
                placeholder="เช่น กรุงเทพ, เชียงใหม่, ภูเก็ต"
                value={formData.origin}
                onChangeText={(text: string) => setFormData({ ...formData, origin: text })}
                editable={!isSubmitting}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Destination */}
            <View style={{ gap: 8 }}>
              <LabelWithIcon icon={<MapPin size={14} color="#374151" />} label="จุดหมายปลายทาง" />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                }}
                placeholder="เช่น กรุงเทพ, ภูเก็ต, เชียงใหม่"
                value={formData.destination}
                onChangeText={(text: string) => setFormData({ ...formData, destination: text })}
                editable={!isSubmitting}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Dates */}
            <View style={{ gap: 14 }}>
              <View style={{ gap: 8 }}>
                <LabelWithIcon icon={<Calendar size={14} color="#374151" />} label="วันที่เริ่มต้น" />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                  }}
                  placeholder="YYYY-MM-DD"
                  value={formData.startDate}
                  onChangeText={(text: string) => setFormData({ ...formData, startDate: text })}
                  editable={!isSubmitting}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={{ gap: 8 }}>
                <LabelWithIcon icon={<Calendar size={14} color="#374151" />} label="วันที่สิ้นสุด" />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                  }}
                  placeholder="YYYY-MM-DD"
                  value={formData.endDate}
                  onChangeText={(text: string) => setFormData({ ...formData, endDate: text })}
                  editable={!isSubmitting}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Travelers and Budget */}
            <View style={{ gap: 14 }}>
              <View style={{ gap: 8 }}>
                <LabelWithIcon icon={<Users size={14} color="#374151" />} label="จำนวนผู้เดินทาง" />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                  }}
                  placeholder="1"
                  value={formData.travelers}
                  onChangeText={(text: string) => setFormData({ ...formData, travelers: text })}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={{ gap: 8 }}>
                <LabelWithIcon icon={<Wallet size={14} color="#374151" />} label="งบประมาณ (บาท)" />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                  }}
                  placeholder="เช่น 20000"
                  value={formData.budget}
                  onChangeText={(text: string) => setFormData({ ...formData, budget: text })}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Preferences */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>ความต้องการพิเศษ (ถ้ามี)</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  height: 90,
                  textAlignVertical: "top",
                }}
                placeholder="เช่น ต้องการโรงแรมใกล้ชายหาด, ชอบอาหารทะเล, ต้องการห้องวิวทะเล"
                value={formData.preferences}
                onChangeText={(text: string) => setFormData({ ...formData, preferences: text })}
                multiline
                editable={!isSubmitting}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={isSubmitting ? 1 : 0.7}
              style={{
                backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6",
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 6,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>กำลังสร้างแผน...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={18} color="white" />
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>สร้างแผนการเดินทางด้วย AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}