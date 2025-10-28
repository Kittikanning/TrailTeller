"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "expo-router"
import { Link } from "expo-router"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native"
import { MapPin, HotelIcon, Plane, CheckCircle2, QrCode, ArrowRight } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

const BACKEND_URL = "http://192.168.1.7:3000"

interface HotelData {
  name: string
  pricePerNight: number
}

interface FlightData {
  airline: string
  departure: string
  arrival: string
  departureTime: string
  price: number
}

interface TravelPlan {
  destination: string
  startDate: string
  endDate: string
}

interface BookingData {
  bookingId: any
  travelPlan: TravelPlan
  selectedHotel: HotelData
  selectedOutboundFlight: FlightData
  selectedReturnFlight: FlightData
  totalAmount: number
  todoList: any[]
  dailyActivities: any[]
}

interface PaymentResponse {
  success?: boolean
  message?: string
  data?: {
    payment_id: number
    booking_id: number
    amount: number
    payment_status: string
  }
  error?: string
  payment_id?: number
  booking_id?: number
}

export default function PaymentPage(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isPaying, setIsPaying] = useState<boolean>(false)
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false)

  useEffect(() => {
    const loadBookingData = async (): Promise<void> => {
      try {
        const dataStr = await AsyncStorage.getItem("bookingData")
        if (!dataStr) {
          router.push("../plan")
          return
        }
        setBookingData(JSON.parse(dataStr))
      } catch (error) {
        console.error("Error loading booking data:", error)
        router.push("./plan")
      }
    }

    loadBookingData()
  }, [router])

  if (
    isLoading ||
    !bookingData ||
    !bookingData.selectedHotel ||
    !bookingData.selectedOutboundFlight ||
    !bookingData.selectedReturnFlight
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (!user) {
    router.push("./login")
    return null
  }

  const nights = Math.ceil(
    (new Date(bookingData.travelPlan.endDate).getTime() -
      new Date(bookingData.travelPlan.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const handlePayment = async (): Promise<void> => {
    setIsPaying(true)

    try {
      console.log("💳 Processing payment...")
      console.log("Amount:", bookingData.totalAmount)
      console.log("User ID:", user.id)

      // เตรียมข้อมูล
      const paymentPayload = {
        bookingId: bookingData.bookingId, // ✅ เปลี่ยนชื่อให้ตรง backend
        userId: user.id,
        amount: bookingData.totalAmount ?? 0,
        paymentMethod: "qr_code",
        hotelName: bookingData.selectedHotel?.name ?? "",
        destination: bookingData.travelPlan?.destination ?? "",
        checkIn: bookingData.travelPlan?.startDate ?? "",
        checkOut: bookingData.travelPlan?.endDate ?? "",
        nights: nights,
        hotelPrice: (bookingData.selectedHotel?.pricePerNight ?? 0) * nights,
        flightPrice:
          (bookingData.selectedOutboundFlight?.price ?? 0) +
          (bookingData.selectedReturnFlight?.price ?? 0),
        outboundFlight: `${bookingData.selectedOutboundFlight?.departure ?? ""} → ${
          bookingData.selectedOutboundFlight?.arrival ?? ""
        }`,
        returnFlight: `${bookingData.selectedReturnFlight?.departure ?? ""} → ${
          bookingData.selectedReturnFlight?.arrival ?? ""
        }`,
        todoList: bookingData.todoList ?? [],
        dailyActivities: bookingData.dailyActivities ?? [],
      }


      console.log("📮 Sending payment request to:", `${BACKEND_URL}/payments`)

      // ลองส่งด้วย token ถ้ามี
      const authToken = await AsyncStorage.getItem("authToken")
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
        console.log("✅ Token found, adding to request")
      } else {
        console.log("⚠️ No token found, sending without Authorization")
      }

      const paymentResponse = await fetch(`${BACKEND_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentPayload),
      })

      console.log("✅ Payment response status:", paymentResponse.status)

      let data: PaymentResponse
      try {
        data = await paymentResponse.json()
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("ไม่สามารถแปลง response จาก server")
      }

      console.log("Response data:", JSON.stringify(data, null, 2))

      if (!paymentResponse.ok) {
        const errorMsg = data?.error || data?.message || `Server error: ${paymentResponse.status}`
        throw new Error(errorMsg)
      }

      if (!data?.success && !data?.payment_id && !data?.data?.payment_id) {
        throw new Error(data?.message || "การชำระเงินล้มเหลว")
      }

      // Payment successful
      console.log(
        "✅ Payment successful, payment_id:",
        data?.payment_id || data?.data?.payment_id
      )

      setPaymentComplete(true)

      // Clear booking data
      await AsyncStorage.removeItem("travelPlan")
      await AsyncStorage.removeItem("bookingData")

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("./profile")
      }, 2000)
    } catch (err) {
      setIsPaying(false)
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      console.error("❌ Payment error:", err)
      Alert.alert("ข้อผิดพลาด", errorMessage, [
        {
          text: "ตกลง",
          onPress: () => {
            setIsPaying(false)
          },
        },
      ])
    }
  }

  if (paymentComplete) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingHorizontal: 32,
            paddingVertical: 48,
            alignItems: "center",
            maxWidth: 400,
            width: "100%",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#eff6ff",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <CheckCircle2 size={40} color="#3b82f6" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            ชำระเงินสำเร็จ!
          </Text>
          <Text
            style={{
              color: "#6b7280",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            การจองของคุณเสร็จสมบูรณ์แล้ว กำลังนำคุณไปยังโปรไฟล์...
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" asChild>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MapPin size={24} color="#3b82f6" />
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                TrailTeller
              </Text>
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
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 12 }}>ออก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Page Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            ชำระเงิน
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            ตรวจสอบรายละเอียดและชำระเงินเพื่อยืนยันการจอง
          </Text>
        </View>

        {/* Booking Summary Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Card Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 3 }}>
              สรุปการจอง
            </Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              {bookingData.travelPlan?.destination ?? "-"} •{" "}
              {bookingData.travelPlan?.startDate
                ? new Date(bookingData.travelPlan.startDate).toLocaleDateString(
                    "th-TH"
                  )
                : "-"}{" "}
              -{" "}
              {bookingData.travelPlan?.endDate
                ? new Date(bookingData.travelPlan.endDate).toLocaleDateString(
                    "th-TH"
                  )
                : "-"}
            </Text>
          </View>

          {/* Card Content */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              gap: 16,
            }}
          >
            {/* Hotel */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <HotelIcon size={18} color="#3b82f6" />
                <Text style={{ fontWeight: "bold", fontSize: 14 }}>โรงแรม</Text>
              </View>
              <View style={{ paddingLeft: 24, gap: 3 }}>
                <Text style={{ fontWeight: "600", fontSize: 13 }}>
                  {bookingData.selectedHotel?.name ?? "-"}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {nights} คืน × ฿
                  {bookingData.selectedHotel?.pricePerNight?.toLocaleString() ??
                    "-"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#3b82f6",
                  }}
                >
                  ฿
                  {(
                    (bookingData.selectedHotel?.pricePerNight ?? 0) * nights
                  ).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Separator */}
            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
              }}
            />

            {/* Flights */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Plane size={18} color="#3b82f6" />
                <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                  เที่ยวบิน
                </Text>
              </View>
              <View style={{ paddingLeft: 24, gap: 10 }}>
                <View style={{ gap: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>
                    ขาไป: {bookingData.selectedOutboundFlight?.airline ?? "-"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {bookingData.selectedOutboundFlight?.departure ?? "-"} →{" "}
                    {bookingData.selectedOutboundFlight?.arrival ?? "-"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#3b82f6",
                    }}
                  >
                    ฿
                    {bookingData.selectedOutboundFlight?.price?.toLocaleString() ??
                      "-"}
                  </Text>
                </View>

                <View style={{ gap: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>
                    ขากลับ: {bookingData.selectedReturnFlight?.airline ?? "-"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {bookingData.selectedReturnFlight?.departure ?? "-"} →{" "}
                    {bookingData.selectedReturnFlight?.arrival ?? "-"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#3b82f6",
                    }}
                  >
                    ฿
                    {bookingData.selectedReturnFlight?.price?.toLocaleString() ??
                      "-"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Separator */}
            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
              }}
            />

            {/* Total */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                ยอดรวมทั้งหมด
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                ฿{bookingData.totalAmount?.toLocaleString() ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Activities Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              กิจกรรมที่วางแผนไว้
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
            {bookingData.dailyActivities?.slice(0, 2).map((day: any) => (
              <View key={day.day} style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#3b82f6" }}>
                  วันที่ {day.day}
                </Text>
                {day.activities?.slice(0, 2).map((activity: string, index: number) => (
                  <View
                    key={index}
                    style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}
                  >
                    <CheckCircle2 size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: 12, flex: 1, color: "#374151" }}>
                      {activity}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            {bookingData.dailyActivities?.length > 2 && (
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                และอีก {bookingData.dailyActivities.length - 2} วัน...
              </Text>
            )}
          </View>
        </View>

        {/* QR Code Payment Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <QrCode size={18} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                ชำระเงินด้วย QR Code
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              สแกน QR Code เพื่อชำระเงิน
            </Text>
          </View>

          {/* Card Content */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: 18,
              alignItems: "center",
            }}
          >
            {/* QR Code Image */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 24,
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Payment ${
                    bookingData.totalAmount ?? 0
                  } baht from ${user?.email ?? ""}`,
                }}
                style={{ width: 220, height: 220, borderRadius: 8 }}
              />
            </View>

            {/* Amount */}
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                จำนวนเงินที่ต้องชำระ
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                ฿{bookingData.totalAmount?.toLocaleString() ?? "-"}
              </Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              onPress={handlePayment}
              disabled={isPaying}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: isPaying ? "#93c5fd" : "#3b82f6",
                paddingVertical: 12,
                borderRadius: 6,
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {isPaying ? "กำลังชำระ..." : "ชำระเงิน"}
              </Text>
              {!isPaying && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}