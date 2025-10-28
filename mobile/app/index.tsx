"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "expo-router"
import { Link } from "expo-router"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Plane, Hotel, MapPin, Sparkles } from "lucide-react-native"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <View style={{ backgroundColor: "white", padding: 24, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" }}>
    <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
      {icon}
    </View>
    <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 8 }}>{title}</Text>
    <Text style={{ color: "#6b7280", fontSize: 16, lineHeight: 24 }}>{description}</Text>
  </View>
)

export default function HomePage(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/plan")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 16, paddingHorizontal: 16 , paddingTop: 75}}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MapPin size={24} color="#3b82f6" />
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>TrailTeller</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            {user ? (
              <>
                <Link href="../profile" asChild>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 16, color: "#3b82f6" }}>โปรไฟล์</Text>
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6 }}>
                  <Text style={{ fontSize: 14 }}>ออกจากระบบ</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 16, color: "#3b82f6" }}>เข้าสู่ระบบ</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="./register" asChild>
                  <TouchableOpacity style={{ backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}>
                    <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>สมัครสมาชิก</Text>
                  </TouchableOpacity>
                </Link>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Hero Section */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 64, alignItems: "center" }}>
        {/* Hero Text */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 42, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
            วางแผนการเดินทางของคุณ{"\n"}ด้วย AI
          </Text>
          <Text style={{ fontSize: 18, color: "#6b7280", textAlign: "center", marginBottom: 16, maxWidth: 500 }}>
            ให้ TrailTeller ช่วยคุณค้นหาโรงแรมและไฟล์ทบินที่ดีที่สุด พร้อมแผนการเดินทางที่ปรับแต่งเฉพาะสำหรับคุณ
          </Text>
        </View>

        {/* CTA Button */}
        <Link href="./register" asChild>
          <TouchableOpacity style={{ backgroundColor: "#3b82f6", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 64 }}>
            <Text style={{ fontSize: 18, color: "white", fontWeight: "600" }}>เริ่มต้นใช้งาน</Text>
            <Sparkles size={20} color="white" />
          </TouchableOpacity>
        </Link>

        {/* Features */}
        <View style={{ gap: 24, width: "100%" }}>
          <FeatureCard
            icon={<Hotel size={24} color="#3b82f6" />}
            title="แนะนำโรงแรม"
            description="ค้นหาโรงแรมที่เหมาะสมกับงบประมาณและความต้องการของคุณ"
          />

          <FeatureCard
            icon={<Plane size={24} color="#3b82f6" />}
            title="จองไฟล์ทบิน"
            description="เปรียบเทียบและเลือกไฟล์ทบินที่ดีที่สุดสำหรับการเดินทางของคุณ"
          />

          <FeatureCard
            icon={<Sparkles size={24} color="#3b82f6" />}
            title="แผนการเดินทาง AI"
            description="รับแผนการเดินทางที่ปรับแต่งเฉพาะจาก AI ของเรา"
          />
        </View>
      </View>
    </ScrollView>
  )
}