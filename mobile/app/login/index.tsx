"use client"

import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "expo-router"
import { Link } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BACKEND_URL = "http://192.168.1.7:3000"

interface LoginResponse {
  user: any
  success?: boolean
  message?: string
  id?: string
  userId?: string
  name?: string
  email?: string
  token?: string
  data?: {
    user?: {
      id: string
      name: string
      email: string
    }
    token?: string
  }
  error?: string
}

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { login: contextLogin } = useAuth()
  const router = useRouter()

  const handleSubmit = async (): Promise<void> => {
    setError("")

    // Validation
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล")
      return
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน")
      return
    }

    setIsLoading(true)

    try {
      const endpoint = `${BACKEND_URL}/users`

      console.log("Sending login request to:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      console.log("Response status:", response.status)

      let data: LoginResponse
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("ไม่สามารถแปลง response จาก server")
      }

      console.log("Response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server error: ${response.status}`
        throw new Error(errorMsg)
      }

      // Handle both response formats
      let user = null
      let token = null

      // Format 1: { success: true, data: { user, token } }
      if (data?.success && data?.data?.user) {
        user = data.data.user
        token = data.data.token
      }
      // Format 2: Direct user object { id, name, email, token }
      else if (data?.id || data?.userId) {
        user = { id: data.id || data.userId, name: data.name, email: data.email }
        token = data.token
      }
      // Format 3: { user: {...}, token: "..." }
      else if (data?.user) {
        user = data.user
        token = data.token
      }

      if (!user) {
        console.error("Cannot find user in response:", data)
        throw new Error("ไม่พบข้อมูลผู้ใช้ในการตอบสนอง")
      }

      // Save token to AsyncStorage
      if (token) {
        await AsyncStorage.setItem("authToken", token)
        console.log("Token saved successfully")
      }
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user))
        console.log("User saved successfully")
      }

      // Call context login if needed
      if (contextLogin && typeof contextLogin === "function") {
        try {
          await contextLogin(email, password)
        } catch (contextErr) {
          console.warn("Context login error:", contextErr)
          // Continue anyway as backend login succeeded
        }
      }

      // Show success message
      Alert.alert("สำเร็จ", "เข้าสู่ระบบเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => {
            router.push("/plan")
          },
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      setError(errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16, minHeight: "100%" }}>
        {/* Card Container */}
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
            {/* Logo Section */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 32 }} role="img" aria-label="map-pin">
                📍
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>TrailTeller</Text>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>เข้าสู่ระบบ</Text>

            {/* Description */}
            <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center" }}>
              กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
            </Text>
          </View>

          {/* Card Content */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
            {/* Email Field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#374151" }}>อีเมล</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                }}
                placeholder="your@email.com"
                value={email}
                onChangeText={(text: string) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#374151" }}>รหัสผ่าน</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                }}
                placeholder="••••••••"
                value={password}
                onChangeText={(text: string) => setPassword(text)}
                secureTextEntry
                editable={!isLoading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 6,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#dc2626",
                }}
              >
                <Text style={{ color: "#dc2626", fontSize: 14, fontWeight: "500" }}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                paddingVertical: 12,
                borderRadius: 6,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>กำลังเข้าสู่ระบบ...</Text>
                </>
              ) : (
                <Link href="/plan" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
              </Link>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>ยังไม่มีบัญชี? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: "600", textDecorationLine: "underline", color: "#3b82f6" }}>
                    สมัครสมาชิก
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}