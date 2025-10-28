"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, Link, useFocusEffect } from "expo-router"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native"
import { MapPin, HotelIcon, Plane, CheckCircle2, User, Calendar, Wallet, Eye, Trash2 } from "lucide-react-native"
import React from "react"

const BACKEND_URL = "http://192.168.1.7:3000"

interface Payment {
  payment_id: number
  userId: string
  amount: number
  paymentMethod: string
  hotelName: string
  destination: string
  checkIn: string
  checkOut: string
  nights: number
  hotelPrice: number
  flightPrice: number
  outboundFlight: string
  returnFlight: string
  todoList: string[]
  dailyActivities: any[]
  paymentStatus: string
  paymentDate: string
  createdAt: string
  updatedAt: string
  bookingId?: number
}

export default function ProfilePage(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(true)

  // Fetch payments whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchPayments()
      }
    }, [user])
  )

  const fetchPayments = async (): Promise<void> => {
    try {
      if (!user) {
        console.log("❌ No user found")
        return
      }

      setIsLoadingPayments(true)
      const userIdString = String(user.id) // แปลงเป็น string
      console.log(`👤 Current User ID: ${userIdString}`)
      console.log(`🔗 API URL: ${BACKEND_URL}/payments`)

      const response = await fetch(`${BACKEND_URL}/payments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`📊 Response status: ${response.status}`)

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch payments: ${response.status}`)
        setPayments([])
        return
      }

      const data = await response.json()
      console.log(`📥 All payments from API:`, data)

      // Filter payments by current user (แปลง userId เป็น string)
      const userPayments = data?.filter(
        (p: Payment) => String(p.userId) === userIdString
      ) || []

      console.log(`✅ Filtered ${userPayments.length} payments for user ${userIdString}`)
      console.log(`📋 User Payments:`, userPayments)

      setPayments(userPayments)
    } catch (error) {
      console.error("❌ Error fetching payments:", error)
      setPayments([])
    } finally {
      setIsLoadingPayments(false)
    }
  }

  if (isLoading) {
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

  const handleViewDetails = (payment: Payment): void => {
    setSelectedPayment(payment)
    setIsDetailModalOpen(true)
  }

  const handleDeletePayment = async (paymentId: number): Promise<void> => {
    try {
      console.log(`🗑️ Deleting payment: ${paymentId}`)

      const response = await fetch(`${BACKEND_URL}/payments/${paymentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log(`✅ Payment deleted: ${paymentId}`)
        setPayments(payments.filter((p) => p.payment_id !== paymentId))
        setIsDetailModalOpen(false)
        Alert.alert("สำเร็จ", "ลบประวัติการจองเรียบร้อยแล้ว")
      } else {
        throw new Error("Failed to delete payment")
      }
    } catch (error) {
      console.error("❌ Error deleting payment:", error)
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถลบประวัติการจองได้")
    }
  }

  const handleDeleteConfirm = (paymentId: number): void => {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการจองนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      [
        {
          text: "ยกเลิก",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "ลบ",
          onPress: () => handleDeletePayment(paymentId),
          style: "destructive",
        },
      ]
    )
  }

  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const uniqueDestinations = new Set(
    payments.map((p) => p.destination)
  ).size

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          paddingVertical: 32,
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
            <Link href="./plan" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: "#3b82f6" }}>
                  วางแผนการเดินทาง
                </Text>
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
              <Text style={{ fontSize: 14 }}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
        {/* Profile Header */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#eff6ff",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <User size={40} color="#3b82f6" />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {user.name || "ผู้ใช้"}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 16 }}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {/* Payments Count */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              paddingHorizontal: 24,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              {payments.length}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              การเดินทางทั้งหมด
            </Text>
          </View>

          {/* Total Spent */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              paddingHorizontal: 24,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              ฿{totalSpent.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              ยอดใช้จ่ายทั้งหมด
            </Text>
          </View>

          {/* Unique Destinations */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              paddingHorizontal: 24,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              {uniqueDestinations}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              จุดหมายปลายทาง
            </Text>
          </View>
        </View>

        {/* Payments History */}
        <View style={{ gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              ประวัติการจอง
            </Text>
            <Link href="./plan" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3b82f6",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MapPin size={16} color="white" />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                  วางแผนใหม่
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {isLoadingPayments ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                paddingVertical: 40,
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text
                style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}
              >
                กำลังโหลดข้อมูล...
              </Text>
            </View>
          ) : payments.length === 0 ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                paddingHorizontal: 48,
                paddingVertical: 48,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#e5e7eb",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MapPin size={32} color="#6b7280" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                ยังไม่มีการจอง
              </Text>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 16,
                  textAlign: "center",
                  lineHeight: 24,
                  marginBottom: 16,
                }}
              >
                เริ่มวางแผนการเดินทางของคุณและสร้างความทรงจำที่ยอดเยี่ยม
              </Text>
              <Link href="./plan" asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#3b82f6",
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    เริ่มวางแผนเลย
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {payments.map((payment) => (
                <View
                  key={payment.payment_id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    padding: 16,
                  }}
                >
                  {/* Destination Header */}
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <MapPin size={20} color="#3b82f6" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          flex: 1,
                        }}
                      >
                        {payment.destination}
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#dbeafe",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={14} color="#3b82f6" />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#3b82f6",
                            fontWeight: "600",
                          }}
                        >
                          {payment.paymentStatus || "ชำระแล้ว"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Calendar size={16} color="#6b7280" />
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        {new Date(payment.checkIn).toLocaleDateString(
                          "th-TH"
                        )}{" "}
                        -{" "}
                        {new Date(payment.checkOut).toLocaleDateString(
                          "th-TH"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e5e7eb",
                      marginVertical: 12,
                    }}
                  />

                  {/* Hotel and Flight Info */}
                  <View style={{ gap: 12, marginBottom: 12 }}>
                    {/* Hotel */}
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <HotelIcon size={16} color="#3b82f6" />
                        <Text style={{ fontSize: 14, fontWeight: "600" }}>
                          โรงแรม
                        </Text>
                      </View>
                      <View style={{ paddingLeft: 22 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          {payment.hotelName}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                          ฿{payment.hotelPrice.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {/* Flight */}
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Plane size={16} color="#3b82f6" />
                        <Text style={{ fontSize: 14, fontWeight: "600" }}>
                          เที่ยวบิน
                        </Text>
                      </View>
                      <View style={{ paddingLeft: 22 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          {payment.outboundFlight}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                          ฿{payment.flightPrice.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e5e7eb",
                      marginVertical: 12,
                    }}
                  />

                  {/* Total and Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Wallet size={16} color="#6b7280" />
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        ชำระเมื่อ{" "}
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(
                          "th-TH"
                        )}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#3b82f6",
                      }}
                    >
                      ฿{payment.amount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleViewDetails(payment)}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#d1d5db",
                        paddingVertical: 8,
                        borderRadius: 6,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Eye size={16} color="#3b82f6" />
                      <Text
                        style={{
                          color: "#3b82f6",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        ดูรายละเอียด
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteConfirm(payment.payment_id)
                      }
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#fecaca",
                        paddingVertical: 8,
                        borderRadius: 6,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Trash2 size={16} color="#dc2626" />
                      <Text
                        style={{
                          color: "#dc2626",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        ลบ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Payment Details Modal */}
      <Modal
        visible={isDetailModalOpen}
        animationType="slide"
        onRequestClose={() => setIsDetailModalOpen(false)}
      >
        <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
          {/* Modal Header */}
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <MapPin size={20} color="#3b82f6" />
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {selectedPayment?.destination}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsDetailModalOpen(false)}>
              <Text style={{ fontSize: 16, color: "#3b82f6", fontWeight: "600" }}>
                ปิด
              </Text>
            </TouchableOpacity>
          </View>

          {selectedPayment && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 24,
                gap: 24,
              }}
            >
              {/* Hotel Details */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <HotelIcon size={20} color="#3b82f6" />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>โรงแรม</Text>
                </View>
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    {selectedPayment.hotelName}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6b7280" }}>
                    เช็คอิน:{" "}
                    {new Date(selectedPayment.checkIn).toLocaleDateString(
                      "th-TH"
                    )}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6b7280" }}>
                    เช็คเอาท์:{" "}
                    {new Date(selectedPayment.checkOut).toLocaleDateString(
                      "th-TH"
                    )}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6b7280" }}>
                    จำนวนคืน: {selectedPayment.nights} คืน
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#3b82f6",
                    }}
                  >
                    ฿{selectedPayment.hotelPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Flight Details */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Plane size={20} color="#3b82f6" />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    เที่ยวบิน
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                >
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      ขาไป
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      {selectedPayment.outboundFlight}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      ขากลับ
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      {selectedPayment.returnFlight}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#3b82f6",
                    }}
                  >
                    ฿{selectedPayment.flightPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Daily Activities */}
              {selectedPayment.dailyActivities &&
                Array.isArray(selectedPayment.dailyActivities) &&
                selectedPayment.dailyActivities.length > 0 && (
                  <View style={{ gap: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CheckCircle2 size={20} color="#3b82f6" />
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        กิจกรรมแต่ละวัน
                      </Text>
                    </View>
                    <View style={{ gap: 12 }}>
                      {selectedPayment.dailyActivities.map((day: any) => (
                        <View
                          key={day.day}
                          style={{
                            backgroundColor: "white",
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#e5e7eb",
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "bold",
                              color: "#3b82f6",
                            }}
                          >
                            วันที่ {day.day} - {day.date}
                          </Text>
                          <View style={{ gap: 6 }}>
                            {day.activities.map(
                              (activity: string, index: number) => (
                                <View
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <CheckCircle2
                                    size={16}
                                    color="#3b82f6"
                                    style={{ marginTop: 2 }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "#374151",
                                      flex: 1,
                                    }}
                                  >
                                    {activity}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* Todo List */}
              {selectedPayment.todoList &&
                Array.isArray(selectedPayment.todoList) &&
                selectedPayment.todoList.length > 0 && (
                  <View style={{ gap: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CheckCircle2 size={20} color="#3b82f6" />
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        สรุปกิจกรรม
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        gap: 8,
                      }}
                    >
                      {selectedPayment.todoList.map((item: string, index: number) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <CheckCircle2
                            size={16}
                            color="#3b82f6"
                            style={{ marginTop: 2 }}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#374151",
                              flex: 1,
                            }}
                          >
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* Payment Information */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Wallet size={20} color="#3b82f6" />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    ข้อมูลการชำระเงิน
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#eff6ff",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#bfdbfe",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      วิธีการชำระเงิน
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      {selectedPayment.paymentMethod === "qr_code" ? "QR Code" : selectedPayment.paymentMethod}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#bfdbfe" }} />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      วันที่ชำระเงิน
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      {new Date(
                        selectedPayment.paymentDate || selectedPayment.createdAt
                      ).toLocaleDateString("th-TH")}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#bfdbfe" }} />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      สถานะการชำระเงิน
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#3b82f6",
                      }}
                    >
                      {selectedPayment.paymentStatus || "ชำระแล้ว"}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#bfdbfe" }} />

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
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#3b82f6",
                      }}
                    >
                      ฿{selectedPayment.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Breakdown */}
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  รายละเอียดการคิดอากร
                </Text>
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      ค่าโรงแรม ({selectedPayment.nights} คืน)
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      ฿{selectedPayment.hotelPrice.toLocaleString()}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>
                      ค่าเที่ยวบิน
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                      ฿{selectedPayment.flightPrice.toLocaleString()}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      ยอดรวม
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#3b82f6",
                      }}
                    >
                      ฿{selectedPayment.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <View style={{ marginTop: 12, marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={() => {
                    handleDeleteConfirm(selectedPayment.payment_id)
                  }}
                  style={{
                    backgroundColor: "#fee2e2",
                    paddingVertical: 12,
                    borderRadius: 6,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Trash2 size={18} color="#dc2626" />
                  <Text
                    style={{
                      color: "#dc2626",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    ลบประวัติการจอง
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Modal>
    </ScrollView>
  )
}